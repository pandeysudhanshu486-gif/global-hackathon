import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BadRequestError } from '../../shared/errors.js';
import { env } from '../../config/env.js';
import { computeSha256 } from '../../shared/hash.js';
import { SandboxedRunner } from './sandboxed-runner.js';
import { MissionSessionModel, IMissionSessionDocument } from '../../models/missionSession.model.js';
import { EvidenceRecordModel } from '../../models/evidenceRecord.model.js';
import { StudentProfileModel } from '../../models/studentProfile.model.js';

export interface MissionManifest {
  slug: string;
  version: number;
  title: string;
  category: string;
  type: string;
  difficulty: number;
  timeEstimateMinutes: number;
  skillsTested: Array<{
    skillName: string;
    category: string;
    isPrimary: boolean;
  }>;
  rubricVersion: string;
  runtime: string;
  status: string;
  description?: string;
}

export interface MissionFile {
  path: string;
  content: string;
}

export interface MissionWorkspaceResponse {
  mission: MissionManifest;
  session: {
    status: string;
    startedAt: Date;
    lastActivityAt: Date;
    submittedAt?: Date;
    runCount: number;
    failedRunCount: number;
    latestRunId?: string;
    latestTestResult?: any;
    integrityHash?: string;
  };
  files: MissionFile[];
  starterFiles: MissionFile[];
}

export interface RunExecutionResult {
  runId: string;
  status: 'completed' | 'failed' | 'timeout' | 'error';
  passed: number;
  failed: number;
  total: number;
  duration: number;
  tests: Array<{
    name: string;
    status: 'passed' | 'failed' | 'error';
    durationMs?: number;
    message?: string;
  }>;
  stdout: string;
  stderr: string;
}

export class MissionService {
  private static missionsCache: MissionManifest[] | null = null;
  // In-memory fallback session store when MongoDB is not connected (for unit tests / offline)
  private static inMemorySessions: Map<string, any> = new Map();

  private static getMissionsDir(): string {
    const rootDir = process.cwd();
    const candidatePaths = [
      path.join(rootDir, 'missions'),
      path.join(rootDir, '..', 'missions'),
      path.join(__dirname, '../../../../missions'),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return path.join(rootDir, 'missions');
  }

  public static loadMissionsFromDisk(): MissionManifest[] {
    const missionsDir = this.getMissionsDir();
    if (!fs.existsSync(missionsDir)) {
      logger.warn(`Missions directory not found at: ${missionsDir}`);
      return [];
    }

    const missions: MissionManifest[] = [];
    const entries = fs.readdirSync(missionsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = path.join(missionsDir, entry.name, 'manifest.json');
        const descPath = path.join(missionsDir, entry.name, 'description.md');

        if (fs.existsSync(manifestPath)) {
          try {
            const raw = fs.readFileSync(manifestPath, 'utf-8');
            const manifest: MissionManifest = JSON.parse(raw);

            if (fs.existsSync(descPath)) {
              manifest.description = fs.readFileSync(descPath, 'utf-8');
            } else {
              manifest.description = `Curated mission for ${manifest.title}`;
            }

            missions.push(manifest);
          } catch (err) {
            logger.warn(`Failed to parse mission manifest at ${manifestPath}:`, err);
          }
        }
      }
    }

    this.missionsCache = missions;
    return missions;
  }

  public static getAllMissions(): MissionManifest[] {
    if (!this.missionsCache) {
      return this.loadMissionsFromDisk();
    }
    return this.missionsCache;
  }

  public static getMissionBySlug(slug: string): MissionManifest {
    const missions = this.getAllMissions();
    const found = missions.find((m) => m.slug === slug);
    if (!found) {
      throw new NotFoundError(`Work mission with slug "${slug}" not found.`);
    }
    return found;
  }

  public static getStarterFiles(slug: string): MissionFile[] {
    const missionsDir = this.getMissionsDir();
    const starterDir = path.join(missionsDir, slug, 'starter');

    if (!fs.existsSync(starterDir)) {
      return [];
    }

    const files: MissionFile[] = [];

    const walk = (currentDir: string, relativeBase: string = '') => {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const item of items) {
        if (item.name === 'node_modules' || item.name.startsWith('.')) continue;

        const fullPath = path.join(currentDir, item.name);
        const relPath = relativeBase ? path.join(relativeBase, item.name) : item.name;

        if (item.isDirectory()) {
          walk(fullPath, relPath);
        } else if (item.isFile()) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            files.push({ path: relPath, content });
          } catch (err) {
            logger.warn(`Could not read starter file at ${fullPath}:`, err);
          }
        }
      }
    };

    walk(starterDir);
    return files;
  }

  public static async getOrCreateSession(userId: string, slug: string): Promise<any> {
    const sessionKey = `${userId}:${slug}`;

    if (mongoose.connection.readyState === 1) {
      let session = await MissionSessionModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        missionSlug: slug,
      });

      if (!session) {
        const starterFiles = this.getStarterFiles(slug);
        session = await MissionSessionModel.create({
          userId: new mongoose.Types.ObjectId(userId),
          missionSlug: slug,
          status: 'in_progress',
          stagedFiles: starterFiles,
          startedAt: new Date(),
          lastActivityAt: new Date(),
          runCount: 0,
          failedRunCount: 0,
        });
      }
      return session;
    }

    // In-memory fallback
    if (!this.inMemorySessions.has(sessionKey)) {
      const starterFiles = this.getStarterFiles(slug);
      this.inMemorySessions.set(sessionKey, {
        _id: `mem_session_${Date.now()}`,
        userId,
        missionSlug: slug,
        status: 'in_progress',
        stagedFiles: starterFiles,
        startedAt: new Date(),
        lastActivityAt: new Date(),
        runCount: 0,
        failedRunCount: 0,
      });
    }

    return this.inMemorySessions.get(sessionKey);
  }

  public static async getStudentMissionWorkspace(
    userId: string,
    slug: string
  ): Promise<MissionWorkspaceResponse> {
    const mission = this.getMissionBySlug(slug);
    const starterFiles = this.getStarterFiles(slug);
    const session = await this.getOrCreateSession(userId, slug);

    const activeFiles =
      session.stagedFiles && session.stagedFiles.length > 0
        ? session.stagedFiles
        : starterFiles;

    return {
      mission,
      session: {
        status: session.status,
        startedAt: session.startedAt,
        lastActivityAt: session.lastActivityAt,
        submittedAt: session.submittedAt,
        runCount: session.runCount,
        failedRunCount: session.failedRunCount,
        latestRunId: session.latestRunId,
        latestTestResult: session.latestTestResult,
        integrityHash: session.integrityHash,
      },
      files: activeFiles,
      starterFiles,
    };
  }

  public static async runStudentMission(
    userId: string,
    slug: string,
    files: MissionFile[]
  ): Promise<RunExecutionResult> {
    const mission = this.getMissionBySlug(slug);
    const starterFiles = this.getStarterFiles(slug);
    const allowedFilePaths = new Set(starterFiles.map((f) => f.path));

    // Security & Path Traversal Validation
    for (const file of files) {
      if (
        file.path.includes('..') ||
        path.isAbsolute(file.path) ||
        file.path.startsWith('/') ||
        file.path.startsWith('\\')
      ) {
        throw new BadRequestError(`Security violation: Path traversal detected in "${file.path}"`);
      }

      // Check if file is permitted in mission workspace
      if (allowedFilePaths.size > 0 && !allowedFilePaths.has(file.path) && !file.path.endsWith('.js') && !file.path.endsWith('.json')) {
        throw new BadRequestError(`Unexpected file "${file.path}" not allowed for mission "${slug}"`);
      }
    }

    const session = await this.getOrCreateSession(userId, slug);
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Execute via external execution service if available, or fallback to co-located subprocess sandbox
    let execResponse: any;

    try {
      const executionUrl = `${env.EXECUTION_SERVICE_URL}/execute`;
      const resp = await fetch(executionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-execution-secret': env.EXECUTION_SECRET,
        },
        body: JSON.stringify({
          attemptId,
          missionSlug: slug,
          files,
          command: 'test',
          timeoutMs: 5000,
        }),
      });

      if (!resp.ok) {
        const errJson = (await resp.json().catch(() => ({}))) as any;
        throw new Error(errJson.error || `Execution service responded with status ${resp.status}`);
      }

      const body = (await resp.json()) as any;
      if (!body.success || !body.data) {
        throw new Error(body.error || 'Execution service returned invalid response payload');
      }

      execResponse = body.data;
    } catch (remoteErr: any) {
      logger.info(
        `Remote execution service unavailable (${remoteErr.message}); evaluating mission in co-located subprocess sandbox runner`
      );
      try {
        execResponse = await SandboxedRunner.execute({
          attemptId,
          missionSlug: slug,
          files,
          command: 'test',
          timeoutMs: 5000,
        });
      } catch (sandboxErr: any) {
        logger.error('Error executing mission in co-located sandbox:', sandboxErr);
        throw new Error(`Failed to execute mission in isolated sandbox: ${sandboxErr.message}`);
      }
    }

    const isPassed =
      execResponse.status === 'completed' &&
      execResponse.passed === execResponse.total &&
      execResponse.total > 0 &&
      execResponse.failed === 0;

    const testSummary = {
      passed: isPassed,
      passedCount: execResponse.passed || 0,
      failedCount: execResponse.failed || 0,
      totalCount: execResponse.total || 0,
      tests: execResponse.tests || [],
      runAt: new Date(),
      stdout: execResponse.stdout,
      stderr: execResponse.stderr,
    };

    // Update session state
    session.stagedFiles = files;
    session.lastActivityAt = new Date();
    session.runCount = (session.runCount || 0) + 1;
    session.latestRunId = execResponse.jobId;
    session.latestTestResult = testSummary;

    if (!isPassed) {
      session.failedRunCount = (session.failedRunCount || 0) + 1;
    }

    if (mongoose.connection.readyState === 1 && typeof session.save === 'function') {
      await session.save();
    } else {
      this.inMemorySessions.set(`${userId}:${slug}`, session);
    }

    return {
      runId: execResponse.jobId,
      status: execResponse.status,
      passed: execResponse.passed,
      failed: execResponse.failed,
      total: execResponse.total,
      duration: execResponse.executionDurationMs,
      tests: execResponse.tests,
      stdout: execResponse.stdout,
      stderr: execResponse.stderr,
    };
  }

  public static async submitStudentMission(
    userId: string,
    slug: string,
    technicalExplanation?: string
  ): Promise<{
    success: boolean;
    message: string;
    evidenceId: string;
    integrityHash: string;
    status: string;
  }> {
    const mission = this.getMissionBySlug(slug);
    const session = await this.getOrCreateSession(userId, slug);

    // Submission Rule: Candidate may submit ONLY after a verified successful test run
    const testResult = session.latestTestResult;
    if (
      !testResult ||
      testResult.passed !== true ||
      testResult.failedCount > 0 ||
      testResult.totalCount === 0
    ) {
      throw new BadRequestError(
        'Cannot submit mission without passing all required test assertions. Please run tests and fix all failures before submitting.'
      );
    }

    // Compute Cryptographic Proof & Integrity Hash (SHA-256)
    const filesHash = computeSha256(session.stagedFiles);
    const hashPayload = {
      userId,
      missionSlug: slug,
      runId: session.latestRunId,
      filesHash,
      passedTests: testResult.passedCount,
      totalTests: testResult.totalCount,
      submittedAt: new Date().toISOString(),
    };
    const integrityHash = computeSha256(hashPayload);

    let profileId = new mongoose.Types.ObjectId();
    let evidenceId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (mongoose.connection.readyState === 1) {
      try {
        const profile = await StudentProfileModel.findOne({
          userId: new mongoose.Types.ObjectId(userId),
        });
        if (profile) {
          profileId = profile._id;
        }

        const evidence = await EvidenceRecordModel.create({
          studentId: profileId,
          sourceType: 'mission',
          type: 'TEST_RESULT',
          data: {
            missionSlug: slug,
            missionTitle: mission.title,
            runId: session.latestRunId,
            filesHash,
            passedCount: testResult.passedCount,
            totalCount: testResult.totalCount,
            tests: testResult.tests,
            technicalExplanation: technicalExplanation || '',
            runCount: session.runCount,
            failedRunCount: session.failedRunCount,
          },
          capabilityName: mission.skillsTested[0]?.skillName || 'API Development',
          capabilityCategory: mission.skillsTested[0]?.category || 'backend',
          visibilityLevel: 'public',
          sanitized: true,
          integrityHash,
        });

        evidenceId = evidence._id.toString();
        session.submissionEvidenceId = evidence._id;
      } catch (dbErr) {
        logger.warn('Failed to save EvidenceRecord to DB:', dbErr);
      }
    }

    // Update Mission Session state
    session.status = 'submitted';
    session.submittedAt = new Date();
    session.technicalExplanation = technicalExplanation;
    session.integrityHash = integrityHash;

    if (mongoose.connection.readyState === 1 && typeof session.save === 'function') {
      await session.save();
    } else {
      this.inMemorySessions.set(`${userId}:${slug}`, session);
    }

    // Auto-generate formal evaluation and capability proof receipt upon successful submission
    try {
      const { EvaluationService } = await import('../evaluation/evaluation.service.js');
      await EvaluationService.evaluateMissionSubmission(userId, slug, technicalExplanation);
    } catch (evalErr) {
      logger.warn('Failed to auto-evaluate mission on submission:', evalErr);
    }

    return {
      success: true,
      message: 'Mission submitted successfully. Cryptographic evidence record created.',
      evidenceId,
      integrityHash,
      status: 'submitted',
    };
  }

  public static async getStudentMissionStatus(userId: string, slug: string): Promise<any> {
    const session = await this.getOrCreateSession(userId, slug);
    return {
      slug,
      status: session.status,
      startedAt: session.startedAt,
      lastActivityAt: session.lastActivityAt,
      submittedAt: session.submittedAt,
      runCount: session.runCount || 0,
      failedRunCount: session.failedRunCount || 0,
      latestRunId: session.latestRunId,
      hasPassedTests: session.latestTestResult?.passed === true,
      submissionEvidenceId: session.submissionEvidenceId,
      integrityHash: session.integrityHash,
    };
  }
}
