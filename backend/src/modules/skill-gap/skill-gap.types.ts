export type EvidenceState = 'demonstrated' | 'supporting' | 'declared' | 'ai_assisted' | 'evidence_gap';

export interface CapabilityAnalysisItem {
  capabilityId: string;
  name: string;
  category: string;
  importance: 'core' | 'recommended';
  description: string;
  status: EvidenceState;
  currentEvidenceSummary: string;
  missingEvidence: string;
  whyItMatters: string;
  recommendedAction: string;
  supportingEvidenceRecordsCount: number;
}

export interface RecommendedMission {
  slug: string;
  title: string;
  description: string;
  category: string;
  type: string;
  difficulty: number;
  timeEstimateMinutes: number;
  capabilitiesTested: string[];
  rationale: string;
}

export interface SkillGapAnalysisResult {
  targetRole: {
    roleId: string;
    name: string;
    category: string;
    description: string;
  };
  roleVersion: string;
  summary: {
    totalCapabilities: number;
    demonstratedCount: number;
    supportingCount: number;
    declaredCount: number;
    aiAssistedCount: number;
    gapCount: number;
  };
  capabilities: CapabilityAnalysisItem[];
  recommendedMission: RecommendedMission | null;
  generatedAt: Date;
}
