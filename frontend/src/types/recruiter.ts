export interface RecruiterProfile {
  userId: string;
  recruiterName: string;
  companyName: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateSearchFilterParams {
  targetRole?: string;
  capability?: string;
  evidenceLevel?: 'declared' | 'ai_assisted' | 'supporting' | 'demonstrated';
  missionSlug?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CandidateDeclaredSkill {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'testing' | 'devops' | 'architecture' | 'general';
  selfAssessedLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface CandidateEducation {
  institution: string;
  degree: string;
  field?: string;
  graduationYear?: number;
}

export interface CandidateProject {
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
}

export interface CandidateListItem {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  location?: string;
  workPreference: 'remote' | 'onsite' | 'hybrid';
  targetRole?: string;
  education?: CandidateEducation[];
  demonstratedCapabilitiesCount: number;
  demonstratedCapabilities: string[];
  completedMissionsCount: number;
  completedMissions: string[];
  highestEvidenceLevel: 'declared' | 'ai_assisted' | 'supporting' | 'demonstrated';
  declaredSkills: CandidateDeclaredSkill[];
  hasResume: boolean;
  hasGitHub: boolean;
  githubUsername?: string;
  updatedAt: string;
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

export interface DemonstratedCapabilityItem {
  capabilityId: string;
  name: string;
  category: string;
  evidenceClassification: 'Demonstrated';
  sourceMissionSlug: string;
  verifiedAt: string;
  rubricVersion: string;
  integrityHash: string;
}

export interface CompletedMissionItem {
  missionSlug: string;
  missionTitle: string;
  runId: string;
  codeHash: string;
  integrityHash: string;
  testsPassed: number;
  testsTotal: number;
  deterministicStatus: 'passed' | 'failed';
  evaluatedAt: string;
}

export interface EvaluationReceiptItem {
  evaluationId: string;
  missionSlug: string;
  rubricVersion: string;
  deterministicResults: {
    testsPassed: number;
    testsTotal: number;
    functionalCorrectness: boolean;
    requiredCriteriaPassed: boolean;
    details: Array<{
      criteriaId: string;
      name: string;
      passed: boolean;
      message?: string;
    }>;
  };
  assistiveResults: {
    explanationQuality: 'strong' | 'adequate' | 'insufficient' | 'not_provided';
    strengths: string[];
    improvementAreas: string[];
    reasoning: string;
    evaluationMethod: 'gemini' | 'deterministic_only';
  };
  capabilitiesAwarded: Array<{
    capabilityId: string;
    name: string;
    category: string;
    status: string;
  }>;
  finalStatus: string;
  codeHash: string;
  integrityHash: string;
  evaluatedAt: string;
}

export interface EvidenceTimelineItem {
  id: string;
  type: 'profile_created' | 'resume_parsed' | 'github_analyzed' | 'mission_passed' | 'evaluation_verified';
  evidenceClassification: 'Declared' | 'AI-Assisted / Unverified' | 'Supporting Evidence' | 'Demonstrated';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
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
    publicSlug?: string;
    interests: string[];
    education: CandidateEducation[];
    projects: CandidateProject[];
    createdAt: string;
    updatedAt: string;
  };
  evidenceHierarchy: {
    declaredSkills: {
      classification: 'Declared';
      count: number;
      skills: CandidateDeclaredSkill[];
    };
    aiAssistedResume: {
      classification: 'AI-Assisted / Unverified';
      available: boolean;
      data?: {
        extractedSkills: Array<{ name: string; category?: string }>;
        extractedExperience: Array<{ title: string; company: string; duration?: string; description?: string }>;
        extractedEducation: Array<{ institution: string; degree: string; field?: string; graduationYear?: number }>;
        extractedProjects: Array<{ title: string; description: string; technologies: string[] }>;
        extractedCertifications: string[];
        extractionMethod: 'gemini' | 'heuristic_fallback';
        parsedAt: string;
        verified: boolean;
      };
      verified: false;
      disclaimer: string;
    };
    supportingGitHub: {
      classification: 'Supporting Evidence';
      connected: boolean;
      username?: string;
      profileUrl?: string;
      lastAnalyzedAt?: string;
      isSupportingOnly: true;
      verified: false;
      disclaimer: string;
    };
    demonstratedCapabilities: {
      classification: 'Demonstrated';
      count: number;
      capabilities: DemonstratedCapabilityItem[];
    };
  };
  completedMissions: CompletedMissionItem[];
  latestEvaluationReceipts: EvaluationReceiptItem[];
  evidenceTimeline: EvidenceTimelineItem[];
}
