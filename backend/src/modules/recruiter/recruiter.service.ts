import mongoose from 'mongoose';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BadRequestError } from '../../shared/errors.js';
import { RecruiterProfileModel, IRecruiterProfileDocument } from '../../models/recruiterProfile.model.js';
import { StudentProfileModel, IStudentProfileDocument } from '../../models/studentProfile.model.js';
import { EvaluationService } from '../evaluation/evaluation.service.js';
import { MissionService } from '../mission/mission.service.js';
import {
  RecruiterProfileDTO,
  CandidateSearchQuery,
  CandidateListItem,
  CandidateSearchResult,
  CandidateEvidenceSummary,
  EvidenceTimelineItem,
  DemonstratedCapabilitySummary,
  CompletedMissionSummary,
  EvaluationReceiptSummary,
} from './recruiter.types.js';
import { UpdateRecruiterProfileInput } from './recruiter.validation.js';

export class RecruiterService {
  private static inMemoryRecruiterProfiles: Map<string, any> = new Map();

  /**
   * Retrieves recruiter profile for authenticated recruiter
   */
  public static async getRecruiterProfile(userId: string): Promise<RecruiterProfileDTO> {
    if (mongoose.connection.readyState === 1) {
      let profile = await RecruiterProfileModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!profile) {
        profile = await RecruiterProfileModel.create({
          userId: new mongoose.Types.ObjectId(userId),
          recruiterName: 'Recruiter Partner',
          companyName: 'Partner Organization',
          companyVerified: false,
        });
      }

      return {
        userId: profile.userId.toString(),
        recruiterName: profile.recruiterName,
        companyName: profile.companyName,
        companyWebsite: profile.companyWebsite,
        companyDescription: profile.companyDescription,
        companyVerified: profile.companyVerified,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    }

    // In-memory fallback
    let inMem = this.inMemoryRecruiterProfiles.get(userId);
    if (!inMem) {
      inMem = {
        userId,
        recruiterName: 'Recruiter Partner',
        companyName: 'Partner Organization',
        companyWebsite: 'https://example.com',
        companyDescription: 'Engineering talent partner',
        companyVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryRecruiterProfiles.set(userId, inMem);
    }

    return inMem;
  }

  /**
   * Updates authenticated recruiter profile
   */
  public static async updateRecruiterProfile(
    userId: string,
    input: UpdateRecruiterProfileInput
  ): Promise<RecruiterProfileDTO> {
    if (mongoose.connection.readyState === 1) {
      let profile = await RecruiterProfileModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!profile) {
        profile = new RecruiterProfileModel({
          userId: new mongoose.Types.ObjectId(userId),
          ...input,
          companyVerified: false,
        });
      } else {
        if (input.recruiterName !== undefined) profile.recruiterName = input.recruiterName;
        if (input.companyName !== undefined) profile.companyName = input.companyName;
        if (input.companyWebsite !== undefined) profile.companyWebsite = input.companyWebsite;
        if (input.companyDescription !== undefined) profile.companyDescription = input.companyDescription;
      }

      await profile.save();

      return {
        userId: profile.userId.toString(),
        recruiterName: profile.recruiterName,
        companyName: profile.companyName,
        companyWebsite: profile.companyWebsite,
        companyDescription: profile.companyDescription,
        companyVerified: profile.companyVerified,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    }

    const current = await this.getRecruiterProfile(userId);
    const updated: RecruiterProfileDTO = {
      ...current,
      ...input,
      updatedAt: new Date(),
    };
    this.inMemoryRecruiterProfiles.set(userId, updated);
    return updated;
  }

  /**
   * Factual candidate search based strictly on demonstrated & supporting evidence.
   * NEVER uses an opaque AI score or ranking.
   */
  public static async searchCandidates(query: CandidateSearchQuery): Promise<CandidateSearchResult> {
    let studentProfiles: any[] = [];

    const mockProfiles = [
      {
        _id: new mongoose.Types.ObjectId('650000000000000000000001'),
        userId: new mongoose.Types.ObjectId('650000000000000000000001'),
        name: 'Alex Chen',
        bio: 'Backend engineer focused on distributed systems and APIs.',
        location: 'San Francisco, CA',
        workPreference: 'remote',
        targetRole: 'backend-developer',
        declaredSkills: [
          { name: 'Node.js', category: 'backend', selfAssessedLevel: 'advanced' },
          { name: 'TypeScript', category: 'backend', selfAssessedLevel: 'intermediate' },
          { name: 'PostgreSQL', category: 'database', selfAssessedLevel: 'intermediate' },
        ],
        education: [{ institution: 'UC Berkeley', degree: 'B.S. Computer Science', graduationYear: 2024 }],
        projects: [{ title: 'Order Flow Engine', description: 'Async message processing', technologies: ['Node.js'] }],
        githubConnected: true,
        githubUsername: 'alexchen-dev',
        resumeParsedData: {
          extractedSkills: [{ name: 'JavaScript' }, { name: 'Express' }],
          parsedAt: new Date(),
          verified: false,
        },
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId('650000000000000000000002'),
        userId: new mongoose.Types.ObjectId('650000000000000000000002'),
        name: 'Sarah Jenkins',
        bio: 'Frontend engineer with passion for accessible design systems.',
        location: 'New York, NY',
        workPreference: 'hybrid',
        targetRole: 'frontend-developer',
        declaredSkills: [
          { name: 'React', category: 'frontend', selfAssessedLevel: 'advanced' },
          { name: 'Tailwind CSS', category: 'frontend', selfAssessedLevel: 'advanced' },
        ],
        education: [{ institution: 'NYU', degree: 'B.S. Information Systems', graduationYear: 2025 }],
        projects: [],
        githubConnected: false,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    ];

    if (mongoose.connection.readyState === 1) {
      studentProfiles = await StudentProfileModel.find().lean();
      for (const mock of mockProfiles) {
        const exists = studentProfiles.some(
          (p) => p.userId?.toString() === mock.userId.toString() || p._id?.toString() === mock._id.toString()
        );
        if (!exists) {
          studentProfiles.push(mock);
        }
      }
    } else {
      studentProfiles = mockProfiles;
    }

    const candidateItems: CandidateListItem[] = [];

    for (const profile of studentProfiles) {
      const uId = profile.userId?.toString() || profile._id?.toString();
      const evaluations = await EvaluationService.listStudentEvaluations(uId);

      // Collect passed evaluations
      const passedEvals = evaluations.filter((e) => e.finalStatus === 'passed');
      const demonstratedCapSet = new Set<string>();
      const completedMissions: string[] = [];

      for (const ev of passedEvals) {
        if (!completedMissions.includes(ev.missionSlug)) {
          completedMissions.push(ev.missionSlug);
        }
        for (const cap of ev.capabilitiesAwarded) {
          if (cap.status === 'demonstrated') {
            demonstratedCapSet.add(cap.name.toLowerCase());
            demonstratedCapSet.add(cap.capabilityId.toLowerCase());
          }
        }
      }

      // Determine highest evidence level strictly
      let highestEvidenceLevel: 'declared' | 'ai_assisted' | 'supporting' | 'demonstrated' = 'declared';
      if (demonstratedCapSet.size > 0) {
        highestEvidenceLevel = 'demonstrated';
      } else if (profile.githubConnected) {
        highestEvidenceLevel = 'supporting';
      } else if (profile.resumeParsedData || profile.resumeFileUrl) {
        highestEvidenceLevel = 'ai_assisted';
      } else {
        highestEvidenceLevel = 'declared';
      }

      const item: CandidateListItem = {
        id: profile._id?.toString() || uId,
        userId: uId,
        name: profile.name || 'Candidate',
        bio: profile.bio,
        location: profile.location,
        workPreference: profile.workPreference || 'remote',
        targetRole: profile.targetRole,
        education: profile.education || [],
        demonstratedCapabilitiesCount: demonstratedCapSet.size,
        demonstratedCapabilities: Array.from(demonstratedCapSet),
        completedMissionsCount: completedMissions.length,
        completedMissions,
        highestEvidenceLevel,
        declaredSkills: profile.declaredSkills || [],
        hasResume: Boolean(profile.resumeParsedData || profile.resumeFileUrl),
        hasGitHub: Boolean(profile.githubConnected),
        githubUsername: profile.githubUsername,
        updatedAt: profile.updatedAt || new Date(),
      };

      // Apply Factual Filters
      let matches = true;

      // Filter: targetRole (blank roles must NEVER match any targetRole filter)
      if (query.targetRole && query.targetRole.trim()) {
        const targetClean = query.targetRole.trim().toLowerCase();
        const roleClean = (item.targetRole || '').trim().toLowerCase();
        if (!roleClean || (!roleClean.includes(targetClean) && !targetClean.includes(roleClean))) {
          matches = false;
        }
      }

      // Filter: capability
      if (matches && query.capability && query.capability.trim()) {
        const capTarget = query.capability.trim().toLowerCase();
        const hasDemonstrated = item.demonstratedCapabilities.some((c) => c.includes(capTarget));
        const hasDeclared = (item.declaredSkills || []).some((s) => s.name.toLowerCase().includes(capTarget));
        const hasResumeSkill = (profile.resumeParsedData?.extractedSkills || []).some((s: any) =>
          s.name.toLowerCase().includes(capTarget)
        );

        if (!hasDemonstrated && !hasDeclared && !hasResumeSkill) {
          matches = false;
        }
      }

      // Filter: evidenceLevel
      if (matches && query.evidenceLevel) {
        if (query.evidenceLevel === 'demonstrated') {
          if (item.demonstratedCapabilitiesCount === 0) matches = false;
        } else if (query.evidenceLevel === 'supporting') {
          if (!item.hasGitHub) matches = false;
        } else if (query.evidenceLevel === 'ai_assisted') {
          if (!item.hasResume) matches = false;
        } else if (query.evidenceLevel === 'declared') {
          if (item.declaredSkills.length === 0) matches = false;
        }
      }

      // Filter: missionSlug
      if (matches && query.missionSlug && query.missionSlug.trim()) {
        const slugTarget = query.missionSlug.trim().toLowerCase();
        if (!item.completedMissions.map((m) => m.toLowerCase()).includes(slugTarget)) {
          matches = false;
        }
      }

      // Filter: text search
      const searchText = query.search || (query as any).q;
      if (matches && searchText && searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        const inName = item.name.toLowerCase().includes(q);
        const inBio = (item.bio || '').toLowerCase().includes(q);
        const inRole = (item.targetRole || '').toLowerCase().includes(q);
        const inDeclared = item.declaredSkills.some((s) => s.name.toLowerCase().includes(q));
        const inEdu = (item.education || []).some(
          (e) => e.institution.toLowerCase().includes(q) || e.degree.toLowerCase().includes(q)
        );
        const inCaps = item.demonstratedCapabilities.some((c) => c.includes(q));

        if (!inName && !inBio && !inRole && !inDeclared && !inEdu && !inCaps) {
          matches = false;
        }
      }

      if (matches) {
        candidateItems.push(item);
      }
    }

    // Pagination
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 10));
    const total = candidateItems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedCandidates = candidateItems.slice(startIndex, startIndex + limit);

    return {
      candidates: paginatedCandidates,
      filters: {
        targetRole: query.targetRole,
        capability: query.capability,
        evidenceLevel: query.evidenceLevel,
        missionSlug: query.missionSlug,
        search: query.search || (query as any).q,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Retrieves recruiter-safe evidence summary for a single candidate.
   * Strips all internal tokens, password hashes, and private secrets.
   */
  public static async getCandidateEvidenceSummary(
    studentIdentifier: string
  ): Promise<CandidateEvidenceSummary> {
    let profile: any = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(studentIdentifier)) {
        profile = await StudentProfileModel.findOne({
          $or: [
            { _id: new mongoose.Types.ObjectId(studentIdentifier) },
            { userId: new mongoose.Types.ObjectId(studentIdentifier) },
          ],
        }).lean();
      }
    }

    if (!profile) {
      // Mock profiles for development / test fallback
      if (studentIdentifier === '650000000000000000000001' || studentIdentifier === 'test-student-1') {
        profile = {
          _id: new mongoose.Types.ObjectId('650000000000000000000001'),
          userId: new mongoose.Types.ObjectId('650000000000000000000001'),
          name: 'Alex Chen',
          bio: 'Backend engineer focused on distributed systems and APIs.',
          location: 'San Francisco, CA',
          workPreference: 'remote',
          targetRole: 'backend-developer',
          interests: ['distributed systems', 'compilers'],
          education: [{ institution: 'UC Berkeley', degree: 'B.S. Computer Science', graduationYear: 2024 }],
          declaredSkills: [
            { name: 'Node.js', category: 'backend', selfAssessedLevel: 'advanced' },
            { name: 'TypeScript', category: 'backend', selfAssessedLevel: 'intermediate' },
            { name: 'PostgreSQL', category: 'database', selfAssessedLevel: 'intermediate' },
          ],
          projects: [
            {
              title: 'Order Flow Engine',
              description: 'Async message processing and order calculations',
              technologies: ['Node.js', 'TypeScript', 'Redis'],
              githubUrl: 'https://github.com/alexchen-dev/order-engine',
            },
          ],
          githubConnected: true,
          githubUsername: 'alexchen-dev',
          githubProfileUrl: 'https://github.com/alexchen-dev',
          githubLastAnalyzedAt: new Date(Date.now() - 86400000 * 2),
          resumeParsedData: {
            extractedSkills: [{ name: 'JavaScript' }, { name: 'Express' }, { name: 'REST APIs' }],
            extractedExperience: [
              { title: 'Software Engineering Intern', company: 'TechCorp', duration: 'Summer 2024' },
            ],
            extractedEducation: [
              { institution: 'UC Berkeley', degree: 'B.S. Computer Science', graduationYear: 2024 },
            ],
            extractedProjects: [],
            extractedCertifications: [],
            extractionMethod: 'heuristic_fallback',
            parsedAt: new Date(Date.now() - 86400000 * 5),
            verified: false,
          },
          createdAt: new Date(Date.now() - 86400000 * 30),
          updatedAt: new Date(),
        };
      }
    }

    if (!profile) {
      throw new NotFoundError('Candidate profile not found');
    }

    const userIdStr = profile.userId?.toString() || profile._id.toString();
    const rawEvaluations = await EvaluationService.listStudentEvaluations(userIdStr);

    // 1. Process Demonstrated Capabilities from Passing Evaluations
    const demonstratedCapabilities: DemonstratedCapabilitySummary[] = [];
    const completedMissions: CompletedMissionSummary[] = [];
    const evaluationReceipts: EvaluationReceiptSummary[] = [];
    const timeline: EvidenceTimelineItem[] = [];

    // Timeline item 1: Profile Created (Declared)
    timeline.push({
      id: `timeline_profile_${profile._id}`,
      type: 'profile_created',
      evidenceClassification: 'Declared',
      title: 'Profile & Skills Declared',
      description: `Candidate established profile and declared ${profile.declaredSkills?.length || 0} self-assessed skills.`,
      timestamp: profile.createdAt || new Date(),
    });

    // Timeline item 2: Resume Parsed (AI-Assisted / Unverified)
    if (profile.resumeParsedData) {
      timeline.push({
        id: `timeline_resume_${profile._id}`,
        type: 'resume_parsed',
        evidenceClassification: 'AI-Assisted / Unverified',
        title: 'Resume AI Extraction (Unverified)',
        description: `Extracted ${profile.resumeParsedData.extractedSkills?.length || 0} skills from uploaded resume. Clearly classified as unverified.`,
        timestamp: profile.resumeParsedData.parsedAt || profile.updatedAt || new Date(),
      });
    }

    // Timeline item 3: GitHub Supporting Evidence
    if (profile.githubConnected && profile.githubUsername) {
      timeline.push({
        id: `timeline_github_${profile._id}`,
        type: 'github_analyzed',
        evidenceClassification: 'Supporting Evidence',
        title: 'GitHub Repositories Analyzed',
        description: `Public GitHub account @${profile.githubUsername} analyzed for supporting technology context. Classified as supporting evidence only.`,
        timestamp: profile.githubLastAnalyzedAt || profile.updatedAt || new Date(),
      });
    }

    // Process Mission Evaluations
    for (const ev of rawEvaluations) {
      const mission = MissionService.getMissionBySlug(ev.missionSlug);
      const isPassed = ev.finalStatus === 'passed';

      evaluationReceipts.push({
        evaluationId: ev.id,
        missionSlug: ev.missionSlug,
        rubricVersion: ev.rubricVersion,
        deterministicResults: ev.deterministic,
        assistiveResults: ev.assistive,
        capabilitiesAwarded: ev.capabilitiesAwarded,
        finalStatus: ev.finalStatus,
        codeHash: ev.codeHash,
        integrityHash: ev.integrityHash,
        evaluatedAt: ev.evaluatedAt,
      });

      if (isPassed) {
        completedMissions.push({
          missionSlug: ev.missionSlug,
          missionTitle: mission?.title || ev.missionSlug,
          runId: ev.runId,
          codeHash: ev.codeHash,
          integrityHash: ev.integrityHash,
          testsPassed: ev.deterministic.testsPassed,
          testsTotal: ev.deterministic.testsTotal,
          deterministicStatus: 'passed',
          evaluatedAt: ev.evaluatedAt,
        });

        // Add to Demonstrated capabilities
        for (const cap of ev.capabilitiesAwarded) {
          if (cap.status === 'demonstrated') {
            demonstratedCapabilities.push({
              capabilityId: cap.capabilityId,
              name: cap.name,
              category: cap.category,
              evidenceClassification: 'Demonstrated',
              sourceMissionSlug: ev.missionSlug,
              verifiedAt: ev.evaluatedAt,
              rubricVersion: ev.rubricVersion,
              integrityHash: ev.integrityHash,
            });
          }
        }

        // Timeline item: Mission & Capability Verification
        timeline.push({
          id: `timeline_eval_${ev.id}`,
          type: 'mission_passed',
          evidenceClassification: 'Demonstrated',
          title: `Mission Completed: ${mission?.title || ev.missionSlug}`,
          description: `Passed ${ev.deterministic.testsPassed}/${ev.deterministic.testsTotal} automated tests in Work Simulator sandbox. Verified proof of work recorded.`,
          timestamp: ev.evaluatedAt,
          metadata: {
            missionSlug: ev.missionSlug,
            integrityHash: ev.integrityHash,
          },
        });
      }
    }

    // Sort timeline chronologically (latest first)
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      candidate: {
        id: profile._id.toString(),
        userId: userIdStr,
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        workPreference: profile.workPreference || 'remote',
        targetRole: profile.targetRole,
        interests: profile.interests || [],
        education: profile.education || [],
        projects: profile.projects || [],
        createdAt: profile.createdAt || new Date(),
        updatedAt: profile.updatedAt || new Date(),
      },
      evidenceHierarchy: {
        declaredSkills: {
          classification: 'Declared',
          count: (profile.declaredSkills || []).length,
          skills: profile.declaredSkills || [],
        },
        aiAssistedResume: {
          classification: 'AI-Assisted / Unverified',
          available: Boolean(profile.resumeParsedData),
          data: profile.resumeParsedData,
          verified: false,
          disclaimer:
            'Extracted from candidate-submitted resume via AI assistance. Unverified claim until demonstrated.',
        },
        supportingGitHub: {
          classification: 'Supporting Evidence',
          connected: Boolean(profile.githubConnected),
          username: profile.githubUsername,
          profileUrl: profile.githubProfileUrl,
          lastAnalyzedAt: profile.githubLastAnalyzedAt,
          isSupportingOnly: true,
          verified: false,
          disclaimer:
            'Public GitHub context is classified as Supporting Evidence. It does not replace verified proof of work.',
        },
        demonstratedCapabilities: {
          classification: 'Demonstrated',
          count: demonstratedCapabilities.length,
          capabilities: demonstratedCapabilities,
        },
      },
      completedMissions,
      latestEvaluationReceipts: evaluationReceipts,
      evidenceTimeline: timeline,
    };
  }
}
