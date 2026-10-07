import mongoose from 'mongoose';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../shared/errors.js';
import { PassportModel, IPassportDocument, IPassportPrivacySettings } from '../../models/passport.model.js';
import { StudentProfileModel, IStudentProfileDocument } from '../../models/studentProfile.model.js';
import { EvaluationService } from '../evaluation/evaluation.service.js';
import { MissionService } from '../mission/mission.service.js';
import {
  StudentPassportConfigResponse,
  PublicPassportResponse,
  PublicDemonstratedCapability,
  PublicVerifiedMission,
  PublicProofReceipt,
  PublicTimelineItem,
} from './passport.types.js';
import { UpdatePassportSettingsInput } from './passport.validation.js';

export class PassportService {
  private static inMemoryPassports: Map<string, any> = new Map();

  private static defaultPrivacySettings: IPassportPrivacySettings = {
    passportEnabled: true,
    showEducation: true,
    showProjects: true,
    showDeclaredSkills: true,
    showGithubEvidence: true,
    showResumeEvidence: true,
    showDemonstratedEvidence: true,
    showBio: true,
    showTimeline: true,
  };

  /**
   * Retrieves authenticated student's passport configuration & privacy settings
   */
  public static async getStudentPassport(userId: string): Promise<StudentPassportConfigResponse> {
    if (mongoose.connection.readyState === 1) {
      let profile = await StudentProfileModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!profile) {
        profile = await StudentProfileModel.create({
          userId: new mongoose.Types.ObjectId(userId),
          name: 'Student Candidate',
          declaredSkills: [],
          education: [],
          projects: [],
          interests: [],
        });
      }

      let passport = await PassportModel.findOne({ studentId: profile._id });
      if (!passport) {
        const slug = `${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
        passport = await PassportModel.create({
          studentId: profile._id,
          publicSlug: slug,
          capabilities: [],
          visibility: 'public',
          privacySettings: this.defaultPrivacySettings,
          stats: {
            missionsCompleted: 0,
            totalEvidenceRecords: 0,
            skillsWithEvidence: 0,
          },
        });
      }

      const evaluations = await EvaluationService.listStudentEvaluations(userId);
      const passedEvals = evaluations.filter((e) => e.finalStatus === 'passed');

      return {
        id: passport._id.toString(),
        studentId: profile._id.toString(),
        publicSlug: passport.publicSlug,
        publicUrl: `/passport/${passport.publicSlug}`,
        visibility: passport.visibility,
        privacySettings: passport.privacySettings || this.defaultPrivacySettings,
        stats: {
          missionsCompleted: passedEvals.length,
          totalEvidenceRecords: passedEvals.reduce((acc, e) => acc + (e.capabilitiesAwarded?.length || 0), 0),
          skillsWithEvidence: new Set(
            passedEvals.flatMap((e) => e.capabilitiesAwarded?.map((c) => c.capabilityId) || [])
          ).size,
        },
        lastUpdatedAt: (passport as any).updatedAt || passport.lastUpdatedAt || new Date(),
      };
    }

    // In-memory fallback
    let inMem = this.inMemoryPassports.get(userId);
    if (!inMem) {
      inMem = {
        id: `pass_${userId}`,
        studentId: `student_${userId}`,
        publicSlug: `alex-chen-wk7a`,
        publicUrl: `/passport/alex-chen-wk7a`,
        visibility: 'public',
        privacySettings: { ...this.defaultPrivacySettings },
        stats: {
          missionsCompleted: 1,
          totalEvidenceRecords: 3,
          skillsWithEvidence: 3,
        },
        lastUpdatedAt: new Date(),
      };
      this.inMemoryPassports.set(userId, inMem);
    }

    return inMem;
  }

  /**
   * Updates student's passport privacy settings and visibility controls
   */
  public static async updateStudentPassportSettings(
    userId: string,
    input: UpdatePassportSettingsInput
  ): Promise<StudentPassportConfigResponse> {
    if (mongoose.connection.readyState === 1) {
      const profile = await StudentProfileModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!profile) {
        throw new NotFoundError('Student profile not found');
      }

      let passport = await PassportModel.findOne({ studentId: profile._id });
      if (!passport) {
        const slug = `${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
        passport = new PassportModel({
          studentId: profile._id,
          publicSlug: slug,
          capabilities: [],
          visibility: 'public',
          privacySettings: this.defaultPrivacySettings,
        });
      }

      if (input.visibility) {
        passport.visibility = input.visibility;
      }

      passport.privacySettings = {
        ...passport.privacySettings,
        ...(input.passportEnabled !== undefined && { passportEnabled: input.passportEnabled }),
        ...(input.showEducation !== undefined && { showEducation: input.showEducation }),
        ...(input.showProjects !== undefined && { showProjects: input.showProjects }),
        ...(input.showDeclaredSkills !== undefined && { showDeclaredSkills: input.showDeclaredSkills }),
        ...(input.showGithubEvidence !== undefined && { showGithubEvidence: input.showGithubEvidence }),
        ...(input.showResumeEvidence !== undefined && { showResumeEvidence: input.showResumeEvidence }),
        ...(input.showDemonstratedEvidence !== undefined && { showDemonstratedEvidence: input.showDemonstratedEvidence }),
        ...(input.showBio !== undefined && { showBio: input.showBio }),
        ...(input.showTimeline !== undefined && { showTimeline: input.showTimeline }),
      };

      passport.lastUpdatedAt = new Date();
      await passport.save();

      return this.getStudentPassport(userId);
    }

    const current = await this.getStudentPassport(userId);
    const updated: StudentPassportConfigResponse = {
      ...current,
      visibility: input.visibility || current.visibility,
      privacySettings: {
        ...current.privacySettings,
        ...(input.passportEnabled !== undefined && { passportEnabled: input.passportEnabled }),
        ...(input.showEducation !== undefined && { showEducation: input.showEducation }),
        ...(input.showProjects !== undefined && { showProjects: input.showProjects }),
        ...(input.showDeclaredSkills !== undefined && { showDeclaredSkills: input.showDeclaredSkills }),
        ...(input.showGithubEvidence !== undefined && { showGithubEvidence: input.showGithubEvidence }),
        ...(input.showResumeEvidence !== undefined && { showResumeEvidence: input.showResumeEvidence }),
        ...(input.showDemonstratedEvidence !== undefined && { showDemonstratedEvidence: input.showDemonstratedEvidence }),
        ...(input.showBio !== undefined && { showBio: input.showBio }),
        ...(input.showTimeline !== undefined && { showTimeline: input.showTimeline }),
      },
      lastUpdatedAt: new Date(),
    };
    this.inMemoryPassports.set(userId, updated);
    return updated;
  }

  /**
   * Public Proof Passport endpoint — NO authentication required.
   * Strips all private fields, emails, tokens, and internal paths.
   */
  public static async getPublicPassport(slug: string): Promise<PublicPassportResponse> {
    if (!slug || !slug.trim()) {
      throw new BadRequestError('Passport slug is required');
    }

    const cleanSlug = slug.trim().toLowerCase();
    let passportDoc: any = null;
    let profileDoc: any = null;

    if (mongoose.connection.readyState === 1) {
      passportDoc = await PassportModel.findOne({ publicSlug: cleanSlug }).lean();
      if (passportDoc) {
        profileDoc = await StudentProfileModel.findById(passportDoc.studentId).lean();
      }
    }

    // In-memory fallback lookup for testing/development
    if (!passportDoc) {
      if (cleanSlug === 'alex-chen-wk7a' || cleanSlug === 'alex-chen') {
        const storedAlex = Array.from(this.inMemoryPassports.values()).find(
          (p) => p.publicSlug === cleanSlug || p.publicSlug === 'alex-chen-wk7a'
        );

        passportDoc = storedAlex || {
          studentId: new mongoose.Types.ObjectId('650000000000000000000001'),
          publicSlug: cleanSlug,
          visibility: 'public',
          privacySettings: this.defaultPrivacySettings,
          stats: { missionsCompleted: 1, totalEvidenceRecords: 3, skillsWithEvidence: 3 },
          lastUpdatedAt: new Date(),
        };

        profileDoc = {
          _id: new mongoose.Types.ObjectId('650000000000000000000001'),
          userId: new mongoose.Types.ObjectId('650000000000000000000001'),
          name: 'Alex Chen',
          targetRole: 'backend-developer',
          bio: 'Backend engineer focused on distributed systems and APIs.',
          education: [{ institution: 'UC Berkeley', degree: 'B.S. Computer Science', graduationYear: 2024 }],
          projects: [
            {
              title: 'Order Flow Engine',
              description: 'High-throughput async transaction processing',
              technologies: ['Node.js', 'TypeScript'],
              githubUrl: 'https://github.com/alexchen-dev/order-engine',
            },
          ],
          declaredSkills: [
            { name: 'Node.js', category: 'backend', selfAssessedLevel: 'advanced' },
            { name: 'TypeScript', category: 'backend', selfAssessedLevel: 'intermediate' },
          ],
          githubConnected: true,
          githubUsername: 'alexchen-dev',
          githubProfileUrl: 'https://github.com/alexchen-dev',
          resumeParsedData: {
            extractedSkills: [{ name: 'JavaScript' }, { name: 'Express' }],
            extractionMethod: 'heuristic_fallback',
            parsedAt: new Date(),
            verified: false,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    if (!passportDoc || !profileDoc) {
      throw new NotFoundError(`Proof Passport "${cleanSlug}" not found.`);
    }

    const privacy = passportDoc.privacySettings || this.defaultPrivacySettings;

    // Verify passport publication status
    if (privacy.passportEnabled === false || passportDoc.visibility === 'private') {
      throw new NotFoundError('This Proof Passport is currently set to private by the candidate.');
    }

    const userIdStr = profileDoc.userId?.toString() || profileDoc._id.toString();
    const rawEvaluations = await EvaluationService.listStudentEvaluations(userIdStr);
    const passedEvaluations = rawEvaluations.filter((e) => e.finalStatus === 'passed');

    // 1. Process Demonstrated Capabilities
    const demonstratedCapabilities: PublicDemonstratedCapability[] = [];
    const verifiedMissions: PublicVerifiedMission[] = [];
    const proofReceipts: PublicProofReceipt[] = [];
    const timeline: PublicTimelineItem[] = [];

    // Build timeline if permitted
    if (privacy.showTimeline) {
      timeline.push({
        id: `timeline_created_${profileDoc._id}`,
        type: 'profile_created',
        evidenceClassification: 'Declared',
        title: 'WorkProof Passport Established',
        description: 'Candidate verified identity and declared core technical capabilities.',
        timestamp: profileDoc.createdAt || new Date(),
      });

      if (privacy.showGithubEvidence && profileDoc.githubConnected) {
        timeline.push({
          id: `timeline_github_${profileDoc._id}`,
          type: 'github_analyzed',
          evidenceClassification: 'Supporting Evidence',
          title: 'GitHub Public Context Connected',
          description: `Supporting repository context linked for @${profileDoc.githubUsername}.`,
          timestamp: profileDoc.githubLastAnalyzedAt || profileDoc.updatedAt || new Date(),
        });
      }
    }

    // Process Verified Missions & Receipts
    for (const ev of passedEvaluations) {
      const mission = MissionService.getMissionBySlug(ev.missionSlug);

      verifiedMissions.push({
        missionSlug: ev.missionSlug,
        missionTitle: mission?.title || ev.missionSlug,
        runId: ev.runId,
        testsPassed: ev.deterministic.testsPassed,
        testsTotal: ev.deterministic.testsTotal,
        deterministicStatus: 'passed',
        codeHash: ev.codeHash,
        integrityHash: ev.integrityHash,
        evaluatedAt: ev.evaluatedAt,
      });

      proofReceipts.push({
        missionTitle: mission?.title || ev.missionSlug,
        missionSlug: ev.missionSlug,
        testResult: `${ev.deterministic.testsPassed}/${ev.deterministic.testsTotal} Assertions Passed (100%)`,
        verificationTimestamp: ev.evaluatedAt,
        rubricVersion: ev.rubricVersion,
        codeHash: ev.codeHash,
        integrityHash: ev.integrityHash,
      });

      if (privacy.showDemonstratedEvidence) {
        for (const cap of ev.capabilitiesAwarded) {
          if (cap.status === 'demonstrated') {
            demonstratedCapabilities.push({
              capabilityId: cap.capabilityId,
              name: cap.name,
              category: cap.category,
              evidenceClassification: 'Demonstrated',
              sourceMissionSlug: ev.missionSlug,
              sourceMissionTitle: mission?.title || ev.missionSlug,
              verifiedAt: ev.evaluatedAt,
              rubricVersion: ev.rubricVersion,
              integrityHash: ev.integrityHash,
            });
          }
        }
      }

      if (privacy.showTimeline) {
        timeline.push({
          id: `timeline_eval_${ev.id}`,
          type: 'mission_passed',
          evidenceClassification: 'Demonstrated',
          title: `Mission Verified: ${mission?.title || ev.missionSlug}`,
          description: `Passed all ${ev.deterministic.testsPassed} test assertions. Cryptographic proof recorded.`,
          timestamp: ev.evaluatedAt,
        });
      }
    }

    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Assemble Privacy-Enforced Public Response (Stripping all sensitive tokens/paths)
    return {
      candidate: {
        displayName: profileDoc.name,
        targetRole: profileDoc.targetRole,
        bio: privacy.showBio ? profileDoc.bio : undefined,
        education: privacy.showEducation ? profileDoc.education || [] : undefined,
        projects: privacy.showProjects ? profileDoc.projects || [] : undefined,
        avatarUrl: profileDoc.avatarUrl,
      },
      evidenceHierarchy: {
        demonstratedCapabilities: {
          classification: 'Demonstrated',
          count: demonstratedCapabilities.length,
          capabilities: demonstratedCapabilities,
        },
        supportingGitHub:
          privacy.showGithubEvidence && profileDoc.githubConnected
            ? {
                classification: 'Supporting Evidence',
                connected: true,
                username: profileDoc.githubUsername,
                profileUrl: profileDoc.githubProfileUrl,
                disclaimer:
                  'GitHub activity is supporting evidence and does not independently grant Demonstrated capability.',
              }
            : undefined,
        declaredSkills: privacy.showDeclaredSkills
          ? {
              classification: 'Declared',
              count: (profileDoc.declaredSkills || []).length,
              skills: profileDoc.declaredSkills || [],
            }
          : undefined,
        aiAssistedResume:
          privacy.showResumeEvidence && profileDoc.resumeParsedData
            ? {
                classification: 'AI-Assisted / Unverified',
                extractedSkills: profileDoc.resumeParsedData.extractedSkills || [],
                extractionMethod: profileDoc.resumeParsedData.extractionMethod,
                disclaimer:
                  'Resume extraction is assistive information and has not independently verified the candidate\'s capability.',
              }
            : undefined,
      },
      verifiedMissions,
      proofReceipts,
      evidenceTimeline: privacy.showTimeline ? timeline : undefined,
      passportMetadata: {
        publicSlug: cleanSlug,
        verifiedProofCount: demonstratedCapabilities.length,
        missionsCompletedCount: verifiedMissions.length,
        lastVerifiedDate: verifiedMissions[0]?.evaluatedAt || passportDoc.lastUpdatedAt || new Date(),
        verificationStatement:
          'This passport presents immutable evidence of work completed and verified through WorkProof AI sandbox test suites.',
      },
    };
  }
}
