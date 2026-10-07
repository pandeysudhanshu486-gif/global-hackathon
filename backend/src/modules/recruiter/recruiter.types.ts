import { IDeclaredSkill, IEducation, IProject, IResumeParsedData } from '../../models/studentProfile.model.js';
import { IDeterministicEvaluationResult, IAssistiveEvaluationResult } from '../../models/missionEvaluation.model.js';

export interface RecruiterProfileDTO {
  userId: string;
  recruiterName: string;
  companyName: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateSearchQuery {
  targetRole?: string;
  capability?: string;
  evidenceLevel?: 'declared' | 'ai_assisted' | 'supporting' | 'demonstrated';
  missionSlug?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CandidateListItem {
  id: string; // studentProfile ID or userId
  userId: string;
  name: string;
  bio?: string;
  location?: string;
  workPreference: 'remote' | 'onsite' | 'hybrid';
  targetRole?: string;
  education?: IEducation[];
  demonstratedCapabilitiesCount: number;
  demonstratedCapabilities: string[];
  completedMissionsCount: number;
  completedMissions: string[];
  highestEvidenceLevel: 'declared' | 'ai_assisted' | 'supporting' | 'demonstrated';
  declaredSkills: IDeclaredSkill[];
  hasResume: boolean;
  hasGitHub: boolean;
  githubUsername?: string;
  updatedAt: Date;
}

export interface CandidateSearchResult {
  candidates: CandidateListItem[];
  filters: {
    targetRole?: string;
    capability?: string;
    evidenceLevel?: string;
    missionSlug?: string;
    search?: string;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EvidenceTimelineItem {
  id: string;
  type: 'profile_created' | 'resume_parsed' | 'github_analyzed' | 'mission_passed' | 'evaluation_verified';
  evidenceClassification: 'Declared' | 'AI-Assisted / Unverified' | 'Supporting Evidence' | 'Demonstrated';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface DemonstratedCapabilitySummary {
  capabilityId: string;
  name: string;
  category: string;
  evidenceClassification: 'Demonstrated';
  sourceMissionSlug: string;
  verifiedAt: Date;
  rubricVersion: string;
  integrityHash: string;
}

export interface CompletedMissionSummary {
  missionSlug: string;
  missionTitle: string;
  runId: string;
  codeHash: string;
  integrityHash: string;
  testsPassed: number;
  testsTotal: number;
  deterministicStatus: 'passed' | 'failed';
  evaluatedAt: Date;
}

export interface EvaluationReceiptSummary {
  evaluationId: string;
  missionSlug: string;
  rubricVersion: string;
  deterministicResults: IDeterministicEvaluationResult;
  assistiveResults: IAssistiveEvaluationResult;
  capabilitiesAwarded: Array<{
    capabilityId: string;
    name: string;
    category: string;
    status: string;
  }>;
  finalStatus: string;
  codeHash: string;
  integrityHash: string;
  evaluatedAt: Date;
}

export interface CandidateEvidenceSummary {
  candidate: {
    id: string;
    userId: string;
    name: string;
    bio?: string;
    location?: string;
    workPreference: 'remote' | 'onsite' | 'hybrid';
    targetRole?: string;
    interests: string[];
    education: IEducation[];
    projects: IProject[];
    createdAt: Date;
    updatedAt: Date;
  };
  evidenceHierarchy: {
    declaredSkills: {
      classification: 'Declared';
      count: number;
      skills: IDeclaredSkill[];
    };
    aiAssistedResume: {
      classification: 'AI-Assisted / Unverified';
      available: boolean;
      data?: IResumeParsedData;
      verified: false;
      disclaimer: string;
    };
    supportingGitHub: {
      classification: 'Supporting Evidence';
      connected: boolean;
      username?: string;
      profileUrl?: string;
      lastAnalyzedAt?: Date;
      isSupportingOnly: true;
      verified: false;
      disclaimer: string;
    };
    demonstratedCapabilities: {
      classification: 'Demonstrated';
      count: number;
      capabilities: DemonstratedCapabilitySummary[];
    };
  };
  completedMissions: CompletedMissionSummary[];
  latestEvaluationReceipts: EvaluationReceiptSummary[];
  evidenceTimeline: EvidenceTimelineItem[];
}
