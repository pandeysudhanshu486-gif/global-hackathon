import {
  IDeterministicEvaluationResult,
  IAssistiveEvaluationResult,
  IAwardedCapability,
  EvaluationFinalStatus,
} from '../../models/missionEvaluation.model.js';

export interface EvaluationResultResponse {
  id: string;
  missionSlug: string;
  missionTitle: string;
  rubricVersion: string;
  runId: string;
  deterministic: IDeterministicEvaluationResult;
  assistive: IAssistiveEvaluationResult;
  capabilitiesAwarded: IAwardedCapability[];
  finalStatus: EvaluationFinalStatus;
  codeHash: string;
  integrityHash: string;
  evaluatedAt: Date;
}
