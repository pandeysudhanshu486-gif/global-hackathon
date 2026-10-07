import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BadRequestError } from '../../shared/errors.js';
import { computeSha256 } from '../../shared/hash.js';
import { MissionService } from '../mission/mission.service.js';
import { MissionAiEvaluator } from '../../ai/mission-evaluator.js';
import {
  MissionEvaluationModel,
  IMissionEvaluationDocument,
  IDeterministicEvaluationResult,
  IAssistiveEvaluationResult,
  IAwardedCapability,
  EvaluationFinalStatus,
} from '../../models/missionEvaluation.model.js';
import { MissionSessionModel } from '../../models/missionSession.model.js';
import { EvidenceRecordModel } from '../../models/evidenceRecord.model.js';
import { StudentProfileModel } from '../../models/studentProfile.model.js';
import { EvaluationResultResponse } from './evaluation.types.js';

interface MissionRubricDef {
  missionSlug: string;
  deterministicCriteria: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
    evaluationMethod: string;
    description: string;
    minPassedTests: number;
    targetCapabilities: Array<{
      capabilityId: string;
      name: string;
      category: string;
    }>;
  }>;
  assistiveCriteria: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
    evaluationMethod: string;
    description: string;
  }>;
}

interface EvaluationRubricFile {
  version: string;
  updatedAt: string;
  name: string;
  description: string;
  missionRubrics: MissionRubricDef[];
}

export class EvaluationService {
  private static rubricCache: EvaluationRubricFile | null = null;
  private static inMemoryEvaluations: Map<string, any> = new Map();

  private static getRubricFilePath(): string {
    const rootDir = process.cwd();
    const candidatePaths = [
      path.join(rootDir, 'rubrics', 'evaluations', 'v1.0.json'),
      path.join(rootDir, '..', 'rubrics', 'evaluations', 'v1.0.json'),
      path.join(__dirname, '../../../../rubrics/evaluations/v1.0.json'),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return path.join(rootDir, 'rubrics', 'evaluations', 'v1.0.json');
  }

  public static loadRubric(): EvaluationRubricFile {
    const filePath = this.getRubricFilePath();
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        this.rubricCache = JSON.parse(raw);
        return this.rubricCache!;
      } catch (err) {
        logger.warn(`Failed to parse evaluation rubric at ${filePath}:`, err);
      }
    }

    // Fallback default rubric
    return {
      version: 'v1.0',
      updatedAt: new Date().toISOString(),
      name: 'WorkProof Mission Evaluation Rubric',
      description: 'Standardized evaluation rubric',
      missionRubrics: [
        {
          missionSlug: 'backend-order-total-bug',
          deterministicCriteria: [
            {
              id: 'functional-correctness',
              name: 'Functional Correctness & Precision',
              type: 'deterministic',
              required: true,
              evaluationMethod: 'automated_test_pass',
              description: 'Order math must compute with 100% test pass rate.',
              minPassedTests: 3,
              targetCapabilities: [
                { capabilityId: 'api-development', name: 'API Development', category: 'backend' },
                { capabilityId: 'debugging-error-handling', name: 'Debugging', category: 'backend' },
                { capabilityId: 'automated-testing', name: 'Testing', category: 'testing' },
              ],
            },
          ],
          assistiveCriteria: [
            {
              id: 'technical-explanation',
              name: 'Technical Explanation',
              type: 'assistive',
              required: false,
              evaluationMethod: 'ai_or_heuristic_qualitative_review',
              description: 'Qualitative evaluation of explanation.',
            },
          ],
        },
      ],
    };
  }

  public static getMissionRubric(slug: string): MissionRubricDef | null {
    const rubric = this.rubricCache || this.loadRubric();
    const found = rubric.missionRubrics.find((m) => m.missionSlug === slug);
    return found || null;
  }

  /**
   * Main Engine: Evaluates candidate submission against versioned rubric & creates capability evidence
   */
  public static async evaluateMissionSubmission(
    userId: string,
    slug: string,
    providedExplanation?: string
  ): Promise<EvaluationResultResponse> {
    const mission = MissionService.getMissionBySlug(slug);
    const rubricFile = this.rubricCache || this.loadRubric();
    const missionRubric = this.getMissionRubric(slug);

    // 1. Fetch student's mission session
    const session = await MissionService.getOrCreateSession(userId, slug);
    const testResult = session.latestTestResult;

    if (!testResult) {
      throw new BadRequestError('No test runs recorded for this mission. Run tests before evaluating.');
    }

    const testsPassed = testResult.passedCount || 0;
    const testsTotal = testResult.totalCount || 0;
    const failedCount = testResult.failedCount || 0;

    // 2. Deterministic Evaluation Logic
    const deterministicDetails: Array<{
      criteriaId: string;
      name: string;
      passed: boolean;
      message?: string;
    }> = [];

    let functionalCorrectness = false;
    let requiredCriteriaPassed = false;

    if (missionRubric) {
      let allReqPassed = true;

      for (const crit of missionRubric.deterministicCriteria) {
        const meetsCount = testsPassed >= (crit.minPassedTests || 1);
        const zeroFailures = failedCount === 0;
        const passed = meetsCount && zeroFailures && testResult.passed === true;

        deterministicDetails.push({
          criteriaId: crit.id,
          name: crit.name,
          passed,
          message: passed
            ? `Passed ${testsPassed}/${testsTotal} automated test assertions.`
            : `Failed: ${failedCount} test assertion(s) failed or min required assertions (${crit.minPassedTests}) not met.`,
        });

        if (crit.required && !passed) {
          allReqPassed = false;
        }
      }

      functionalCorrectness = testsPassed === testsTotal && testsTotal > 0 && failedCount === 0;
      requiredCriteriaPassed = allReqPassed;
    } else {
      functionalCorrectness = testsPassed === testsTotal && testsTotal > 0 && failedCount === 0;
      requiredCriteriaPassed = functionalCorrectness;
      deterministicDetails.push({
        criteriaId: 'baseline-test-pass',
        name: 'Baseline Test Assertions',
        passed: functionalCorrectness,
        message: `${testsPassed}/${testsTotal} assertions passed.`,
      });
    }

    const finalStatus: EvaluationFinalStatus = requiredCriteriaPassed ? 'passed' : 'failed';

    // 3. Assistive AI / Heuristic Qualitative Evaluation
    const explanationText = providedExplanation || session.technicalExplanation || '';
    const mainCodeContext =
      (session.stagedFiles || []).find((f: any) => f.path.includes('calculations.js'))?.content ||
      (session.stagedFiles || [])[0]?.content ||
      '';

    const assistiveResults: IAssistiveEvaluationResult = await MissionAiEvaluator.evaluateExplanation({
      missionSlug: slug,
      missionTitle: mission.title,
      explanation: explanationText,
      codeContext: mainCodeContext,
      deterministicPass: functionalCorrectness,
      passedTests: testsPassed,
      totalTests: testsTotal,
    });

    // 4. Capability Mapping & Demonstrated Evidence Generation
    const awardedCapabilities: IAwardedCapability[] = [];
    const codeHash = computeSha256(session.stagedFiles || []);
    const hashPayload = {
      userId,
      missionSlug: slug,
      runId: session.latestRunId,
      rubricVersion: rubricFile.version,
      deterministicPass: requiredCriteriaPassed,
      codeHash,
      evaluatedAt: new Date().toISOString(),
    };
    const integrityHash = computeSha256(hashPayload);

    // If deterministic criteria passed, map rubric target capabilities
    if (finalStatus === 'passed' && missionRubric) {
      let profile: any = null;
      if (mongoose.connection.readyState === 1) {
        profile = await StudentProfileModel.findOne({
          userId: new mongoose.Types.ObjectId(userId),
        }).catch(() => null);
      }

      for (const crit of missionRubric.deterministicCriteria) {
        for (const cap of crit.targetCapabilities) {
          let evidenceRecordId: any = undefined;

          // Create immutable EvidenceRecord for each awarded capability
          if (mongoose.connection.readyState === 1) {
            try {
              const evidence = await EvidenceRecordModel.create({
                studentId: profile?._id || new mongoose.Types.ObjectId(userId),
                sourceType: 'mission',
                type: 'TEST_RESULT',
                data: {
                  missionSlug: slug,
                  missionTitle: mission.title,
                  runId: session.latestRunId,
                  rubricVersion: rubricFile.version,
                  passedTests: testsPassed,
                  totalTests: testsTotal,
                  criteriaId: crit.id,
                  technicalExplanation: explanationText,
                  explanationQuality: assistiveResults.explanationQuality,
                  codeHash,
                },
                capabilityName: cap.name,
                capabilityCategory: cap.category,
                visibilityLevel: 'public',
                sanitized: true,
                integrityHash: computeSha256(`${integrityHash}:${cap.capabilityId}`),
              });

              evidenceRecordId = evidence._id;
            } catch (err) {
              logger.warn(`Failed to create EvidenceRecord for capability ${cap.name}:`, err);
            }
          }

          awardedCapabilities.push({
            capabilityId: cap.capabilityId,
            name: cap.name,
            category: cap.category,
            status: 'demonstrated',
            evidenceRecordId,
          });
        }
      }
    } else if (missionRubric) {
      // If failed, record capabilities as unproven/evidence gap
      for (const crit of missionRubric.deterministicCriteria) {
        for (const cap of crit.targetCapabilities) {
          awardedCapabilities.push({
            capabilityId: cap.capabilityId,
            name: cap.name,
            category: cap.category,
            status: 'evidence_gap',
          });
        }
      }
    }

    const deterministicResults: IDeterministicEvaluationResult = {
      testsPassed,
      testsTotal,
      functionalCorrectness,
      requiredCriteriaPassed,
      details: deterministicDetails,
    };

    // 5. Store Evaluation Record
    let evaluationId = `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (mongoose.connection.readyState === 1) {
      const evaluationDoc = await MissionEvaluationModel.create({
        userId: new mongoose.Types.ObjectId(userId),
        missionSlug: slug,
        sessionId: session._id,
        runId: session.latestRunId || 'unknown_run',
        rubricVersion: rubricFile.version,
        deterministicResults,
        assistiveResults,
        capabilitiesAwarded: awardedCapabilities,
        finalStatus,
        codeHash,
        integrityHash,
        evaluatedAt: new Date(),
      });

      evaluationId = evaluationDoc._id.toString();
    } else {
      this.inMemoryEvaluations.set(`${userId}:${slug}`, {
        _id: evaluationId,
        userId,
        missionSlug: slug,
        runId: session.latestRunId,
        rubricVersion: rubricFile.version,
        deterministicResults,
        assistiveResults,
        capabilitiesAwarded: awardedCapabilities,
        finalStatus,
        codeHash,
        integrityHash,
        evaluatedAt: new Date(),
      });
    }

    // 6. Update Mission Session status to 'evaluated'
    session.status = 'evaluated';
    if (mongoose.connection.readyState === 1 && typeof session.save === 'function') {
      await session.save();
    }

    return {
      id: evaluationId,
      missionSlug: slug,
      missionTitle: mission.title,
      rubricVersion: rubricFile.version,
      runId: session.latestRunId || 'run_latest',
      deterministic: deterministicResults,
      assistive: assistiveResults,
      capabilitiesAwarded: awardedCapabilities,
      finalStatus,
      codeHash,
      integrityHash,
      evaluatedAt: new Date(),
    };
  }

  public static async getStudentLatestEvaluation(
    userId: string,
    slug: string
  ): Promise<EvaluationResultResponse | null> {
    const mission = MissionService.getMissionBySlug(slug);

    if (mongoose.connection.readyState === 1) {
      const evaluation = await MissionEvaluationModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        missionSlug: slug,
      }).sort({ evaluatedAt: -1 });

      if (!evaluation) {
        return null;
      }

      return {
        id: evaluation._id.toString(),
        missionSlug: evaluation.missionSlug,
        missionTitle: mission.title,
        rubricVersion: evaluation.rubricVersion,
        runId: evaluation.runId,
        deterministic: evaluation.deterministicResults,
        assistive: evaluation.assistiveResults,
        capabilitiesAwarded: evaluation.capabilitiesAwarded,
        finalStatus: evaluation.finalStatus,
        codeHash: evaluation.codeHash,
        integrityHash: evaluation.integrityHash,
        evaluatedAt: evaluation.evaluatedAt,
      };
    }

    const inMem = this.inMemoryEvaluations.get(`${userId}:${slug}`);
    if (inMem) {
      return {
        id: inMem._id,
        missionSlug: inMem.missionSlug,
        missionTitle: mission.title,
        rubricVersion: inMem.rubricVersion,
        runId: inMem.runId,
        deterministic: inMem.deterministicResults,
        assistive: inMem.assistiveResults,
        capabilitiesAwarded: inMem.capabilitiesAwarded,
        finalStatus: inMem.finalStatus,
        codeHash: inMem.codeHash,
        integrityHash: inMem.integrityHash,
        evaluatedAt: inMem.evaluatedAt,
      };
    }

    // Auto-evaluate fallback if candidate has submitted or passed tests
    const session = await MissionService.getOrCreateSession(userId, slug);
    if (
      session &&
      (session.status === 'submitted' ||
        session.status === 'evaluated' ||
        session.latestTestResult?.passed === true)
    ) {
      return await this.evaluateMissionSubmission(
        userId,
        slug,
        session.technicalExplanation
      );
    }

    return null;
  }

  public static async listStudentEvaluations(userId: string): Promise<EvaluationResultResponse[]> {
    if (mongoose.connection.readyState === 1) {
      const evaluations = await MissionEvaluationModel.find({
        userId: new mongoose.Types.ObjectId(userId),
      }).sort({ evaluatedAt: -1 });

      return evaluations.map((e) => ({
        id: e._id.toString(),
        missionSlug: e.missionSlug,
        missionTitle: e.missionSlug,
        rubricVersion: e.rubricVersion,
        runId: e.runId,
        deterministic: e.deterministicResults,
        assistive: e.assistiveResults,
        capabilitiesAwarded: e.capabilitiesAwarded,
        finalStatus: e.finalStatus,
        codeHash: e.codeHash,
        integrityHash: e.integrityHash,
        evaluatedAt: e.evaluatedAt,
      }));
    }

    const results: EvaluationResultResponse[] = [];
    for (const [key, val] of this.inMemoryEvaluations.entries()) {
      if (key.startsWith(`${userId}:`)) {
        results.push({
          id: val._id,
          missionSlug: val.missionSlug,
          missionTitle: val.missionSlug,
          rubricVersion: val.rubricVersion,
          runId: val.runId,
          deterministic: val.deterministicResults,
          assistive: val.assistiveResults,
          capabilitiesAwarded: val.capabilitiesAwarded,
          finalStatus: val.finalStatus,
          codeHash: val.codeHash,
          integrityHash: val.integrityHash,
          evaluatedAt: val.evaluatedAt,
        });
      }
    }

    if (results.length === 0) {
      const defaultSlug = 'backend-order-total-bug';
      const session = await MissionService.getOrCreateSession(userId, defaultSlug);
      if (
        session &&
        (session.status === 'submitted' ||
          session.status === 'evaluated' ||
          session.latestTestResult?.passed === true)
      ) {
        const autoEval = await this.evaluateMissionSubmission(
          userId,
          defaultSlug,
          session.technicalExplanation
        );
        results.push(autoEval);
      }
    }

    return results;
  }
}
