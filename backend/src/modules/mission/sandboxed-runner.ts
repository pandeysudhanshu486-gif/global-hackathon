import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { logger } from '../../shared/logger.js';
import { BadRequestError, NotFoundError } from '../../shared/errors.js';

export interface SandboxedFile {
  path: string;
  content: string;
}

export interface SandboxedJobRequest {
  attemptId: string;
  missionSlug: string;
  files: SandboxedFile[];
  command?: 'run' | 'test';
  timeoutMs?: number;
}

export interface SandboxedJobResponse {
  jobId: string;
  status: 'completed' | 'failed' | 'timeout' | 'error';
  exitCode: number;
  passed: number;
  failed: number;
  total: number;
  stdout: string;
  stderr: string;
  executionDurationMs: number;
  tests: Array<{
    name: string;
    status: 'passed' | 'failed';
    message?: string;
    durationMs?: number;
  }>;
  metrics: {
    filesChecked: number;
    linesModified: number;
  };
}

export class SandboxedRunner {
  private static getMissionsDir(): string {
    const rootDir = process.cwd();
    const candidates = [
      path.join(rootDir, 'missions'),
      path.join(rootDir, '..', 'missions'),
      path.join(__dirname, '../../../../missions'),
      path.join(__dirname, '../../../missions'),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    return path.join(rootDir, 'missions');
  }

  public static async execute(job: SandboxedJobRequest): Promise<SandboxedJobResponse> {
    const startTime = Date.now();
    const missionsDir = this.getMissionsDir();
    const missionPath = path.join(missionsDir, job.missionSlug);

    if (!fs.existsSync(missionPath)) {
      throw new NotFoundError(`Mission "${job.missionSlug}" not found in catalog`);
    }

    // Verify path traversal prevention
    for (const file of job.files) {
      const normalized = path.normalize(file.path);
      if (
        normalized.startsWith('..') ||
        path.isAbsolute(file.path) ||
        file.path.includes('../') ||
        file.path.includes('..\\')
      ) {
        throw new BadRequestError(`Security violation: Path traversal detected in filename "${file.path}"`);
      }
    }

    // Create isolated ephemeral temporary workspace
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
        const allTests = fs
          .readdirSync(tempTestsDir)
          .filter((f) => f.endsWith('.test.js') || f.endsWith('.test.ts'));
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
      const testResults: Array<{
        name: string;
        status: 'passed' | 'failed';
        message?: string;
        durationMs?: number;
      }> = [];
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

      return {
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
    } finally {
      // 6. Safe cleanup of temporary sandbox workspace
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      } catch (cleanupErr) {
        logger.warn(`Sandbox workspace cleanup warning: ${cleanupErr}`);
      }
    }
  }
}
