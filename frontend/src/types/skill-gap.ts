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

export interface TargetRoleSummary {
  roleId: string;
  name: string;
  category: string;
  description: string;
}

export interface RoleListItem {
  roleId: string;
  name: string;
  category: string;
  description: string;
  capabilitiesCount: number;
  coreCapabilitiesCount: number;
}

export interface SkillGapSummary {
  totalCapabilities: number;
  demonstratedCount: number;
  supportingCount: number;
  declaredCount: number;
  aiAssistedCount: number;
  gapCount: number;
}

export interface SkillGapAnalysisData {
  targetRole: TargetRoleSummary;
  roleVersion: string;
  summary: SkillGapSummary;
  capabilities: CapabilityAnalysisItem[];
  recommendedMission: RecommendedMission | null;
  generatedAt: string;
}
