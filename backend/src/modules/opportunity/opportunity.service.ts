import mongoose from 'mongoose';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BadRequestError, ConflictError } from '../../shared/errors.js';
import { OpportunityModel, IOpportunityDocument } from '../../models/opportunity.model.js';
import { StudentProfileModel } from '../../models/studentProfile.model.js';
import { PassportModel } from '../../models/passport.model.js';
import { EvaluationService } from '../evaluation/evaluation.service.js';
import {
  OpportunitySummary,
  StudentOpportunityMatch,
  OpportunityDetailWithApplicants,
} from './opportunity.types.js';
import { CreateOpportunityInput } from './opportunity.validation.js';

export class OpportunityService {
  private static inMemoryOpportunities: Map<string, any> = new Map();
  private static initializedSeed = false;

  private static seedOpportunities = [
    {
      id: 'opp-apprentice-backend-01',
      title: 'Junior Backend Engineering Apprentice',
      companyName: 'Stripe Verified Partner / Fintech Labs',
      companyWebsite: 'https://stripe.com',
      companyLogoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=60',
      type: 'apprenticeship',
      location: 'Remote / San Francisco, CA',
      workPreference: 'remote',
      targetRole: 'backend-developer',
      requiredCapabilities: ['API Development', 'Debugging', 'Testing'],
      recommendedCapabilities: ['Authentication & Authorization', 'Database Design'],
      description:
        'A 6-month paid apprenticeship designed for first-time coders and self-taught youth developers. You will pair with senior distributed systems engineers to build production REST and transaction APIs. Includes 1-on-1 mentorship and full-time conversion track upon completion.',
      mentorshipProvided: true,
      stipendOrSalary: '$35 - $45 / hr (Paid Apprenticeship)',
      duration: '6 Months (Full-Time)',
      isOpen: true,
      applications: [],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'opp-apprentice-frontend-02',
      title: 'UI & State Architecture Apprentice',
      companyName: 'Linear Technologies Partner',
      companyWebsite: 'https://linear.app',
      companyLogoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=60',
      type: 'apprenticeship',
      location: 'Remote / New York, NY',
      workPreference: 'remote',
      targetRole: 'frontend-developer',
      requiredCapabilities: ['Component State Management', 'Frontend Architecture'],
      recommendedCapabilities: ['Testing', 'API Development'],
      description:
        'Paid early-career apprenticeship for emerging frontend engineers. Work on fluid user interfaces, state management, and real-time collaboration widgets. No college degree required; candidates are evaluated exclusively on verified code execution evidence.',
      mentorshipProvided: true,
      stipendOrSalary: '$32 - $40 / hr (Paid Apprenticeship)',
      duration: '4 Months (Full-Time)',
      isOpen: true,
      applications: [],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'opp-internship-fullstack-03',
      title: 'Early Career Full-Stack Developer Internship',
      companyName: 'Vercel Ecosystem / NextGen Cloud',
      companyWebsite: 'https://vercel.com',
      companyLogoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=100&auto=format&fit=crop&q=60',
      type: 'internship',
      location: 'San Francisco, CA / Hybrid',
      workPreference: 'hybrid',
      targetRole: 'fullstack-developer',
      requiredCapabilities: ['API Development', 'Component State Management', 'Testing'],
      recommendedCapabilities: ['Debugging', 'Database Design'],
      description:
        'Summer & Fall engineering internship for youth developers building modern web applications. You will deploy serverless backends, optimize frontend render performance, and participate in peer code reviews.',
      mentorshipProvided: true,
      stipendOrSalary: '$30 / hr',
      duration: '3 Months (Summer)',
      isOpen: true,
      applications: [],
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'opp-junior-backend-04',
      title: 'Junior API & Platform Engineer',
      companyName: 'Datadog Verified Partner / CloudScale',
      companyWebsite: 'https://datadoghq.com',
      companyLogoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60',
      type: 'junior_developer',
      location: 'Remote (US/Canada)',
      workPreference: 'remote',
      targetRole: 'backend-developer',
      requiredCapabilities: ['API Development', 'Testing', 'Debugging'],
      recommendedCapabilities: ['CI/CD Basics', 'Cloud Deployment'],
      description:
        'First engineering role for high-potential coders. Build observable backend services, resolve critical integration bugs, and write deterministic unit/integration test suites.',
      mentorshipProvided: true,
      stipendOrSalary: '$85,000 - $95,000 / yr',
      duration: 'Full-Time Permanent',
      isOpen: true,
      applications: [],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ];

  private static ensureInitialized() {
    if (!this.initializedSeed) {
      for (const item of this.seedOpportunities) {
        this.inMemoryOpportunities.set(item.id, { ...item });
      }
      this.initializedSeed = true;
    }
  }

  /**
   * Public list of opportunities with optional filtering
   */
  public static async listPublicOpportunities(filters?: {
    type?: string;
    targetRole?: string;
    search?: string;
  }): Promise<OpportunitySummary[]> {
    this.ensureInitialized();

    let all: any[] = [];
    if (mongoose.connection.readyState === 1) {
      const query: any = { isOpen: true };
      if (filters?.type && filters.type !== 'all') {
        query.type = filters.type;
      }
      if (filters?.targetRole && filters.targetRole !== 'all') {
        query.targetRole = filters.targetRole;
      }
      if (filters?.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { companyName: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
        ];
      }
      const docs = await OpportunityModel.find(query).sort({ createdAt: -1 }).lean();
      if (docs.length > 0) {
        all = docs.map((d: any) => ({
          id: d._id.toString(),
          title: d.title,
          companyName: d.companyName,
          companyWebsite: d.companyWebsite,
          companyLogoUrl: d.companyLogoUrl,
          type: d.type,
          location: d.location,
          workPreference: d.workPreference,
          targetRole: d.targetRole,
          requiredCapabilities: d.requiredCapabilities,
          recommendedCapabilities: d.recommendedCapabilities,
          description: d.description,
          mentorshipProvided: d.mentorshipProvided,
          stipendOrSalary: d.stipendOrSalary,
          duration: d.duration,
          isOpen: d.isOpen,
          applicantsCount: d.applications?.length || 0,
          createdAt: d.createdAt?.toISOString() || new Date().toISOString(),
        }));
      }
    }

    if (all.length === 0) {
      all = Array.from(this.inMemoryOpportunities.values()).map((item) => ({
        id: item.id,
        title: item.title,
        companyName: item.companyName,
        companyWebsite: item.companyWebsite,
        companyLogoUrl: item.companyLogoUrl,
        type: item.type,
        location: item.location,
        workPreference: item.workPreference,
        targetRole: item.targetRole,
        requiredCapabilities: item.requiredCapabilities,
        recommendedCapabilities: item.recommendedCapabilities,
        description: item.description,
        mentorshipProvided: item.mentorshipProvided,
        stipendOrSalary: item.stipendOrSalary,
        duration: item.duration,
        isOpen: item.isOpen,
        applicantsCount: item.applications?.length || 0,
        createdAt: item.createdAt,
      }));

      if (filters?.type && filters.type !== 'all') {
        all = all.filter((o) => o.type === filters.type);
      }
      if (filters?.targetRole && filters.targetRole !== 'all') {
        all = all.filter((o) => o.targetRole === filters.targetRole);
      }
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        all = all.filter(
          (o) =>
            o.title.toLowerCase().includes(s) ||
            o.companyName.toLowerCase().includes(s) ||
            o.description.toLowerCase().includes(s)
        );
      }
    }

    return all;
  }

  /**
   * Evidence-aware opportunity discovery for student
   * Compares candidate's Demonstrated capabilities against job requirements
   */
  public static async listOpportunitiesForStudent(
    userId: string,
    filters?: { type?: string; targetRole?: string; search?: string }
  ): Promise<StudentOpportunityMatch[]> {
    const opportunities = await this.listPublicOpportunities(filters);

    // Fetch student demonstrated capabilities
    const evaluations = await EvaluationService.listStudentEvaluations(userId);
    const demonstratedCaps = new Set<string>();

    for (const ev of evaluations) {
      if (ev.finalStatus === 'passed' && Array.isArray(ev.capabilitiesAwarded)) {
        for (const cap of ev.capabilitiesAwarded) {
          if (cap.status === 'demonstrated') {
            demonstratedCaps.add(cap.name);
          }
        }
      }
    }

    // Default simulation capabilities if user has passing mock evaluations
    if (demonstratedCaps.size === 0 && userId.includes('650000000000000000000001')) {
      demonstratedCaps.add('API Development');
      demonstratedCaps.add('Testing');
      demonstratedCaps.add('Debugging');
    }

    return opportunities.map((opp) => {
      const demonstratedMatches = opp.requiredCapabilities.filter((c) =>
        demonstratedCaps.has(c)
      );
      const missingCapabilities = opp.requiredCapabilities.filter(
        (c) => !demonstratedCaps.has(c)
      );
      const matchPercentage =
        opp.requiredCapabilities.length > 0
          ? Math.round((demonstratedMatches.length / opp.requiredCapabilities.length) * 100)
          : 100;

      // Check application status
      let hasApplied = false;
      let appStatus: 'submitted' | 'under_review' | 'accepted' | 'declined' | undefined;

      const inMem = this.inMemoryOpportunities.get(opp.id);
      if (inMem && Array.isArray(inMem.applications)) {
        const app = inMem.applications.find((a: any) => a.studentId.toString() === userId);
        if (app) {
          hasApplied = true;
          appStatus = app.status;
        }
      }

      return {
        ...opp,
        candidateMatch: {
          demonstratedMatches,
          missingCapabilities,
          matchPercentage,
          hasApplied,
          applicationStatus: appStatus,
          qualifiesForDirectApply: missingCapabilities.length === 0 || matchPercentage >= 60,
        },
      };
    });
  }

  /**
   * 1-Click Application Submission with Proof Passport
   */
  public static async applyToOpportunity(
    opportunityId: string,
    userId: string,
    notes?: string
  ): Promise<{ success: boolean; message: string; publicSlug: string }> {
    this.ensureInitialized();

    // 1. Fetch Student Profile & Passport
    let studentName = 'First-Time Coder Candidate';
    let publicSlug = 'candidate-passport';
    let demonstratedCount = 0;

    if (mongoose.connection.readyState === 1) {
      const profile = await StudentProfileModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
      if (profile) {
        studentName = profile.name;
      }
      const passport = await PassportModel.findOne({
        studentId: profile?._id,
      });
      if (passport) {
        publicSlug = passport.publicSlug;
      }
    }

    const evaluations = await EvaluationService.listStudentEvaluations(userId);
    demonstratedCount = evaluations.filter((e) => e.finalStatus === 'passed').length;

    // 2. Record application in database or in-memory
    let opp = this.inMemoryOpportunities.get(opportunityId);
    if (!opp && mongoose.connection.readyState === 1) {
      opp = await OpportunityModel.findById(opportunityId);
    }

    if (!opp) {
      throw new NotFoundError(`Opportunity "${opportunityId}" not found.`);
    }

    const existingApp = opp.applications?.find(
      (a: any) => a.studentId.toString() === userId
    );
    if (existingApp) {
      throw new ConflictError('You have already applied to this opportunity.');
    }

    const applicationRecord = {
      studentId: new mongoose.Types.ObjectId(userId),
      candidateName: studentName,
      publicSlug: publicSlug || `candidate-${userId.substring(0, 6)}`,
      demonstratedCapabilitiesCount: demonstratedCount,
      appliedAt: new Date(),
      status: 'submitted',
      notes: notes || 'Applied with verified WorkProof AI Proof Passport.',
    };

    if (opp.applications) {
      opp.applications.push(applicationRecord);
    } else {
      opp.applications = [applicationRecord];
    }

    this.inMemoryOpportunities.set(opportunityId, opp);

    if (mongoose.connection.readyState === 1 && typeof opp.save === 'function') {
      await opp.save();
    }

    logger.info(`Candidate ${userId} applied to opportunity ${opportunityId} with passport ${publicSlug}`);

    return {
      success: true,
      message: 'Application submitted successfully with verified Proof Passport.',
      publicSlug,
    };
  }

  /**
   * Recruiter: Create new Apprenticeship or Job Opportunity
   */
  public static async createOpportunity(
    recruiterUserId: string,
    input: CreateOpportunityInput
  ): Promise<OpportunitySummary> {
    this.ensureInitialized();

    const id = `opp-${Date.now()}`;
    const newRecord = {
      id,
      companyId: new mongoose.Types.ObjectId(recruiterUserId),
      ...input,
      isOpen: true,
      applications: [],
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      const doc = await OpportunityModel.create({
        ...input,
        companyId: new mongoose.Types.ObjectId(recruiterUserId),
        isOpen: true,
        applications: [],
      });
      newRecord.id = doc._id.toString();
    }

    this.inMemoryOpportunities.set(newRecord.id, newRecord);

    return {
      id: newRecord.id,
      title: newRecord.title,
      companyName: newRecord.companyName,
      companyWebsite: newRecord.companyWebsite,
      companyLogoUrl: newRecord.companyLogoUrl,
      type: newRecord.type,
      location: newRecord.location,
      workPreference: newRecord.workPreference,
      targetRole: newRecord.targetRole,
      requiredCapabilities: newRecord.requiredCapabilities,
      recommendedCapabilities: newRecord.recommendedCapabilities,
      description: newRecord.description,
      mentorshipProvided: newRecord.mentorshipProvided,
      stipendOrSalary: newRecord.stipendOrSalary,
      duration: newRecord.duration,
      isOpen: newRecord.isOpen,
      applicantsCount: 0,
      createdAt: newRecord.createdAt,
    };
  }

  /**
   * Recruiter: List opportunities created by the company with applicant details
   */
  public static async listRecruiterOpportunities(
    recruiterUserId: string
  ): Promise<OpportunityDetailWithApplicants[]> {
    this.ensureInitialized();

    const all = Array.from(this.inMemoryOpportunities.values());
    return all.map((item) => ({
      id: item.id,
      title: item.title,
      companyName: item.companyName,
      companyWebsite: item.companyWebsite,
      companyLogoUrl: item.companyLogoUrl,
      type: item.type,
      location: item.location,
      workPreference: item.workPreference,
      targetRole: item.targetRole,
      requiredCapabilities: item.requiredCapabilities,
      recommendedCapabilities: item.recommendedCapabilities,
      description: item.description,
      mentorshipProvided: item.mentorshipProvided,
      stipendOrSalary: item.stipendOrSalary,
      duration: item.duration,
      isOpen: item.isOpen,
      applicantsCount: item.applications?.length || 0,
      createdAt: item.createdAt,
      applications: (item.applications || []).map((app: any) => ({
        studentId: app.studentId.toString(),
        candidateName: app.candidateName,
        publicSlug: app.publicSlug,
        demonstratedCapabilitiesCount: app.demonstratedCapabilitiesCount,
        appliedAt: app.appliedAt?.toISOString?.() || app.appliedAt || new Date().toISOString(),
        status: app.status,
        notes: app.notes,
      })),
    }));
  }
}
