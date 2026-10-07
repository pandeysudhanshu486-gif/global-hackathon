export interface PassportPrivacySettings {
  passportEnabled: boolean;
  showEducation: boolean;
  showProjects: boolean;
  showDeclaredSkills: boolean;
  showGithubEvidence: boolean;
  showResumeEvidence: boolean;
  showDemonstratedEvidence: boolean;
  showBio: boolean;
  showTimeline: boolean;
}

export interface StudentPassportConfig {
  id: string;
  studentId: string;
  publicSlug: string;
  publicUrl: string;
  visibility: 'public' | 'recruiter' | 'private';
  privacySettings: PassportPrivacySettings;
  stats: {
    missionsCompleted: number;
    totalEvidenceRecords: number;
    skillsWithEvidence: number;
  };
  lastUpdatedAt: string;
}

export interface PublicDemonstratedCapability {
  capabilityId: string;
  name: string;
  category: string;
  evidenceClassification: 'Demonstrated';
  sourceMissionSlug: string;
  sourceMissionTitle: string;
  verifiedAt: string;
  rubricVersion: string;
  integrityHash: string;
}

export interface PublicVerifiedMission {
  missionSlug: string;
  missionTitle: string;
  runId: string;
  testsPassed: number;
  testsTotal: number;
  deterministicStatus: 'passed';
  codeHash: string;
  integrityHash: string;
  evaluatedAt: string;
}

export interface PublicProofReceipt {
  missionTitle: string;
  missionSlug: string;
  testResult: string;
  verificationTimestamp: string;
  rubricVersion: string;
  codeHash: string;
  integrityHash: string;
}

export interface PublicTimelineItem {
  id: string;
  type: string;
  evidenceClassification: 'Declared' | 'AI-Assisted / Unverified' | 'Supporting Evidence' | 'Demonstrated';
  title: string;
  description: string;
  timestamp: string;
}

export interface PublicPassportData {
  candidate: {
    displayName: string;
    targetRole?: string;
    bio?: string;
    education?: Array<{
      institution: string;
      degree: string;
      field?: string;
      graduationYear?: number;
    }>;
    projects?: Array<{
      title: string;
      description: string;
      technologies: string[];
      url?: string;
      githubUrl?: string;
    }>;
    avatarUrl?: string;
  };
  evidenceHierarchy: {
    demonstratedCapabilities: {
      classification: 'Demonstrated';
      count: number;
      capabilities: PublicDemonstratedCapability[];
    };
    supportingGitHub?: {
      classification: 'Supporting Evidence';
      connected: boolean;
      username?: string;
      profileUrl?: string;
      disclaimer: string;
    };
    declaredSkills?: {
      classification: 'Declared';
      count: number;
      skills: Array<{
        name: string;
        category: string;
        selfAssessedLevel: string;
      }>;
    };
    aiAssistedResume?: {
      classification: 'AI-Assisted / Unverified';
      extractedSkills: Array<{ name: string; category?: string }>;
      extractionMethod?: string;
      disclaimer: string;
    };
  };
  verifiedMissions: PublicVerifiedMission[];
  proofReceipts: PublicProofReceipt[];
  evidenceTimeline?: PublicTimelineItem[];
  passportMetadata: {
    publicSlug: string;
    verifiedProofCount: number;
    missionsCompletedCount: number;
    lastVerifiedDate?: string;
    verificationStatement: string;
  };
}
