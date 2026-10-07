import { IDeclaredSkill, IEducation, IProject } from '../../models/studentProfile.model.js';
import { IPassportPrivacySettings } from '../../models/passport.model.js';

export interface PassportPrivacySettingsDTO extends IPassportPrivacySettings {}

export interface StudentPassportConfigResponse {
  id: string;
  studentId: string;
  publicSlug: string;
  publicUrl: string;
  visibility: 'public' | 'recruiter' | 'private';
  privacySettings: PassportPrivacySettingsDTO;
  stats: {
    missionsCompleted: number;
    totalEvidenceRecords: number;
    skillsWithEvidence: number;
  };
  lastUpdatedAt: Date;
}

export interface PublicDemonstratedCapability {
  capabilityId: string;
  name: string;
  category: string;
  evidenceClassification: 'Demonstrated';
  sourceMissionSlug: string;
  sourceMissionTitle: string;
  verifiedAt: Date;
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
  evaluatedAt: Date;
}

export interface PublicProofReceipt {
  missionTitle: string;
  missionSlug: string;
  testResult: string;
  verificationTimestamp: Date;
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
  timestamp: Date;
}

export interface PublicPassportResponse {
  candidate: {
    displayName: string;
    targetRole?: string;
    bio?: string;
    education?: IEducation[];
    projects?: IProject[];
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
      skills: IDeclaredSkill[];
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
    lastVerifiedDate?: Date;
    verificationStatement: string;
  };
}
