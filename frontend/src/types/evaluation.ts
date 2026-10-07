export type EvaluationFinalStatus = 'passed' | 'failed' | 'pending_review';
export type ExplanationQuality = 'strong' | 'adequate' | 'insufficient' | 'not_provided';

export interface DeterministicResultItem {
  criteriaId: string;
  name: string;
  passed: boolean;
  message?: string;
}

export interface DeterministicResults {
  testsPassed: number;
  testsTotal: number;
  functionalCorrectness: boolean;
  requiredCriteriaPassed: boolean;
  details: DeterministicResultItem[];
}

export interface AssistiveResults {
  explanationQuality: ExplanationQuality;
  strengths: string[];
  improvementAreas: string[];
  reasoning: string;
  evaluationMethod: 'gemini' | 'deterministic_only';
}

export interface AwardedCapability {
  capabilityId: string;
  name: string;
  category: string;
  status: 'demonstrated' | 'supporting' | 'evidence_gap';
  evidenceRecordId?: string;
}

export interface EvaluationResultData {
  id: string;
  missionSlug: string;
  missionTitle: string;
  rubricVersion: string;
  runId: string;
  deterministic: DeterministicResults;
  assistive: AssistiveResults;
  capabilitiesAwarded: AwardedCapability[];
  finalStatus: EvaluationFinalStatus;
  codeHash: string;
  integrityHash: string;
  evaluatedAt: string;
}
