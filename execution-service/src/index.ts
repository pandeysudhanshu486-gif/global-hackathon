import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { ExecutionJobRequest, ExecutionJobResponse, TestResultItem } from './types.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5003', 10);
const EXECUTION_SECRET = process.env.EXECUTION_SECRET || 'dev_execution_service_shared_secret_2026';

const app = express();

app.use(helmet());
app.use(cors({ origin: ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:5002', 'http://127.0.0.1:5002'] }));
app.use(express.json({ limit: '2mb' }));

// Execution Secret Verification Middleware
const verifyExecutionSecret = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['x-execution-secret'];
  if (!authHeader || authHeader !== EXECUTION_SECRET) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid execution secret header.',
    });
    return;
  }
  next();
};

const jobSchema = z.object({
  attemptId: z.string().min(1),
  missionSlug: z.string().regex(/^[a-z0-9-]+$/),
  files: z.array(
    z.object({
      path: z.string().min(1).max(255),
      content: z.string().max(500000), // Max 500KB per file
    })
  ),
  command: z.enum(['run', 'test']).optional().default('test'),
  timeoutMs: z.number().optional().default(5000),
});

// Helper to locate missions directory
const getMissionsDir = (): string => {
  const candidates = [
    path.join(process.cwd(), 'missions'),
    path.join(process.cwd(), '..', 'missions'),
    path.join(__dirname, '..', '..', 'missions'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return path.join(process.cwd(), 'missions');
};

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: 'WorkProof AI Isolated Execution Boundary',
    status: 'operational',
    mode: 'sandboxed-subprocess-runner',
    timestamp: new Date().toISOString(),
  });
});

// Secure Execution Endpoint
app.post('/execute', verifyExecutionSecret, async (req: Request, res: Response) => {
  const parseResult = jobSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(422).json({
      success: false,
      error: 'Invalid execution job payload',
      details: parseResult.error.format(),
    });
    return;
  }

  const job: ExecutionJobRequest = parseResult.data;
  const startTime = Date.now();
  const missionsDir = getMissionsDir();
  const missionPath = path.join(missionsDir, job.missionSlug);

  if (!fs.existsSync(missionPath)) {
    res.status(404).json({
      success: false,
      error: `Mission "${job.missionSlug}" not found in catalog`,
    });
    return;
  }

  // Check for path traversal attacks in candidate files
  for (const file of job.files) {
    const normalized = path.normalize(file.path);
    if (normalized.startsWith('..') || path.isAbsolute(file.path) || file.path.includes('../') || file.path.includes('..\\')) {
      res.status(400).json({
        success: false,
        error: `Security violation: Path traversal detected in filename "${file.path}"`,
      });
      return;
    }
  }

  // Create isolated temp workspace
  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `workproof-sandbox-${runId}-`));

  try {
    // 1. Write candidate starter files into temp workspace
    for (const file of job.files) {
      const fullPath = path.join(tempDir, 'starter', file.path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, file.content, 'utf-8');
    }

    // 2. Copy test files into temp workspace
    const missionTestsDir = path.join(missionPath, 'tests');
    const tempTestsDir = path.join(tempDir, 'tests');
    fs.mkdirSync(tempTestsDir, { recursive: true });

    if (fs.existsSync(missionTestsDir)) {
      const testFiles = fs.readdirSync(missionTestsDir);
      for (const tf of testFiles) {
        fs.copyFileSync(path.join(missionTestsDir, tf), path.join(tempTestsDir, tf));
      }
    }

    // 3. Determine test entry point
    let testEntryPoint = path.join(tempTestsDir, 'order.test.js');
    if (!fs.existsSync(testEntryPoint)) {
      const allTests = fs.readdirSync(tempTestsDir).filter((f) => f.endsWith('.test.js') || f.endsWith('.test.ts'));
      if (allTests.length > 0) {
        testEntryPoint = path.join(tempTestsDir, allTests[0]);
      }
    }

    // 4. Spawn isolated subprocess with stripped environment
    const timeout = Math.min(Math.max(job.timeoutMs || 5000, 1000), 15000);
    const child = spawn('node', [testEntryPoint], {
      cwd: tempDir,
      timeout,
      env: {
        PATH: process.env.PATH,
        NODE_ENV: 'test',
        HOME: tempDir,
      },
    });

    let stdoutData = '';
    let stderrData = '';
    let timedOut = false;

    child.stdout.on('data', (chunk) => {
      if (stdoutData.length < 500000) {
        stdoutData += chunk.toString();
      }
    });

    child.stderr.on('data', (chunk) => {
      if (stderrData.length < 500000) {
        stderrData += chunk.toString();
      }
    });

    const executionPromise = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
      child.on('close', (code, signal) => {
        resolve({ code, signal });
      });
      child.on('error', (err: any) => {
        if (err.code === 'ETIMEDOUT') {
          timedOut = true;
        }
        resolve({ code: -1, signal: null });
      });
    });

    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill('SIGKILL');
      } catch {
        // Process already terminated
      }
    }, timeout);

    const { code, signal } = await executionPromise;
    clearTimeout(timeoutTimer);

    const duration = Date.now() - startTime;

    // Sanitize stdout and stderr (replace full temp paths)
    const sanitizedStdout = stdoutData
      .split(tempDir)
      .join('[workspace]')
      .split(os.tmpdir())
      .join('/tmp');

    const sanitizedStderr = stderrData
      .split(tempDir)
      .join('[workspace]')
      .split(os.tmpdir())
      .join('/tmp');

    // 5. Parse test results from stdout
    const testResults: TestResultItem[] = [];
    let passedCount = 0;
    let failedCount = 0;

    const lines = sanitizedStdout.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('✓ ') || trimmed.startsWith('✔ ')) {
        const testName = trimmed.replace(/^[✓✔]\s*/, '');
        testResults.push({
          name: testName,
          status: 'passed',
          durationMs: Math.round(duration / Math.max(testResults.length + 1, 1)),
        });
        passedCount++;
      } else if (trimmed.startsWith('✗ ') || trimmed.startsWith('✖ ')) {
        const parts = trimmed.replace(/^[✗✖]\s*/, '').split(':');
        const testName = parts[0].trim();
        const errorMsg = parts.slice(1).join(':').trim();
        testResults.push({
          name: testName,
          status: 'failed',
          message: errorMsg || 'Assertion failed',
          durationMs: Math.round(duration / Math.max(testResults.length + 1, 1)),
        });
        failedCount++;
      }
    }

    const totalCount = passedCount + failedCount;
    let status: 'completed' | 'failed' | 'timeout' | 'error' = 'completed';

    if (timedOut || signal === 'SIGKILL' || signal === 'SIGTERM') {
      status = 'timeout';
    } else if (code !== 0 || failedCount > 0) {
      status = 'failed';
    } else if (totalCount === 0 && code === 0) {
      status = 'completed';
    }

    const totalLines = job.files.reduce((acc, f) => acc + f.content.split('\n').length, 0);

    const responseData: ExecutionJobResponse = {
      jobId: runId,
      status,
      exitCode: code ?? (timedOut ? 137 : -1),
      passed: passedCount,
      failed: failedCount,
      total: totalCount,
      stdout: sanitizedStdout,
      stderr: sanitizedStderr,
      executionDurationMs: duration,
      tests: testResults,
      metrics: {
        filesChecked: job.files.length,
        linesModified: totalLines,
      },
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Execution failed due to an internal sandbox error',
      message: err.message,
    });
  } finally {
    // 6. Safe cleanup of temporary sandbox
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.warn('Sandbox cleanup warning:', cleanupErr);
    }
  }
});

app.listen(PORT, () => {
  console.log(`WorkProof Execution Service listening on port ${PORT}`);
  console.log(`Health check at http://localhost:${PORT}/health`);
});
