import path from 'path';
import mongoose from 'mongoose';
import { StudentProfileModel, IStudentProfileDocument, IResumeParsedData } from '../../models/studentProfile.model.js';
import { UserModel } from '../../models/user.model.js';
import { PassportModel } from '../../models/passport.model.js';
import { NotFoundError, BadRequestError } from '../../shared/errors.js';
import { UpdateProfileInput } from './profile.validation.js';
import { ResumeAnalyzer } from '../../ai/resume-analyzer.js';
import { cleanupUploadedFile } from '../../middleware/upload.middleware.js';

export interface StudentProfileResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  workPreference: 'remote' | 'onsite' | 'hybrid';
  avatarUrl?: string;
  targetRole?: string;
  interests: string[];
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    graduationYear?: number;
  }>;
  declaredSkills: Array<{
    name: string;
    category: 'frontend' | 'backend' | 'database' | 'testing' | 'devops' | 'architecture' | 'general';
    selfAssessedLevel: 'beginner' | 'intermediate' | 'advanced';
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    url?: string;
    githubUrl?: string;
  }>;
  resumeMetadata?: {
    fileUrl?: string;
    fileName?: string;
    parsedAt?: Date;
    extractedSkillsCount: number;
    extractionMethod?: 'gemini' | 'heuristic_fallback';
    verified: false;
  };
  resumeParsedData?: IResumeParsedData;
  github?: {
    username?: string;
    profileUrl?: string;
    connected: boolean;
    lastAnalyzedAt?: Date;
  };
  publicSlug?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProfileService {
  private static formatProfileResponse(
    profile: IStudentProfileDocument,
    email: string,
    publicSlug?: string
  ): StudentProfileResponse {
    return {
      id: profile._id.toString(),
      userId: profile.userId.toString(),
      name: profile.name,
      email,
      bio: profile.bio,
      location: profile.location,
      workPreference: profile.workPreference,
      avatarUrl: profile.avatarUrl,
      targetRole: profile.targetRole,
      interests: profile.interests || [],
      education: profile.education || [],
      declaredSkills: profile.declaredSkills || [],
      projects: profile.projects || [],
      resumeMetadata: profile.resumeFileUrl
        ? {
            fileUrl: profile.resumeFileUrl,
            fileName: profile.resumeFileName,
            parsedAt: profile.resumeParsedData?.parsedAt,
            extractedSkillsCount: profile.resumeParsedData?.extractedSkills?.length || 0,
            extractionMethod: profile.resumeParsedData?.extractionMethod,
            verified: false,
          }
        : undefined,
      resumeParsedData: profile.resumeParsedData,
      github: {
        username: profile.githubUsername,
        profileUrl: profile.githubProfileUrl,
        connected: profile.githubConnected || false,
        lastAnalyzedAt: profile.githubLastAnalyzedAt,
      },
      publicSlug,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private static inMemoryProfiles: Map<string, any> = new Map();

  public static async getCurrentStudentProfile(userId: string): Promise<StudentProfileResponse> {
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findById(userId).select('email role');
      if (user) {
        let profile = await StudentProfileModel.findOne({ userId });
        if (!profile) {
          profile = await StudentProfileModel.create({
            userId,
            name: 'Student Candidate',
            declaredSkills: [],
            education: [],
            projects: [],
            interests: [],
          });
        }

        const passport = await PassportModel.findOne({ studentId: profile._id }).select('publicSlug');
        return this.formatProfileResponse(profile, user.email, passport?.publicSlug);
      }
    }

    // In-memory fallback for standalone/test/demo mode
    let mem = this.inMemoryProfiles.get(userId);
    if (!mem) {
      mem = {
        _id: userId,
        userId: userId,
        name: 'Alex Chen',
        email: 'alex.chen@berkeley.edu',
        bio: 'Backend & distributed systems engineer building reliable, verifiable APIs.',
        location: 'Berkeley, CA',
        workPreference: 'remote',
        targetRole: 'backend-developer',
        interests: ['Distributed Systems', 'API Reliability', 'Automated Testing'],
        education: [
          {
            institution: 'UC Berkeley',
            degree: 'B.S. Computer Science',
            graduationYear: 2024,
          },
        ],
        declaredSkills: [
          { name: 'Node.js', category: 'backend', selfAssessedLevel: 'advanced' },
          { name: 'TypeScript', category: 'backend', selfAssessedLevel: 'intermediate' },
          { name: 'PostgreSQL', category: 'database', selfAssessedLevel: 'intermediate' },
        ],
        projects: [
          {
            title: 'Order Flow Engine',
            description: 'High-throughput async transaction processing system with idempotency guarantees.',
            technologies: ['Node.js', 'TypeScript', 'Jest'],
            githubUrl: 'https://github.com/alexchen-dev/order-engine',
          },
        ],
        githubUsername: 'alexchen-dev',
        githubConnected: true,
        publicSlug: 'alex-chen-wk7a',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryProfiles.set(userId, mem);
    }

    return {
      id: mem._id,
      userId: mem.userId,
      name: mem.name,
      email: mem.email,
      bio: mem.bio,
      location: mem.location,
      workPreference: mem.workPreference,
      targetRole: mem.targetRole,
      interests: mem.interests || [],
      education: mem.education || [],
      declaredSkills: mem.declaredSkills || [],
      projects: mem.projects || [],
      github: {
        username: mem.githubUsername,
        connected: mem.githubConnected || false,
      },
      publicSlug: mem.publicSlug,
      createdAt: mem.createdAt,
      updatedAt: mem.updatedAt,
    };
  }

  public static async updateCurrentStudentProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<StudentProfileResponse> {
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findById(userId).select('email');
      if (user) {
        let profile = await StudentProfileModel.findOne({ userId });
        if (profile) {
          // Apply allowed validated updates without modifying resume or system fields
          if (data.name !== undefined) profile.name = data.name;
          if (data.bio !== undefined) profile.bio = data.bio;
          if (data.location !== undefined) profile.location = data.location;
          if (data.workPreference !== undefined) profile.workPreference = data.workPreference;
          if (data.targetRole !== undefined) profile.targetRole = data.targetRole;
          if (data.interests !== undefined) profile.interests = data.interests;
          if (data.education !== undefined) profile.education = data.education as any;
          if (data.declaredSkills !== undefined) profile.declaredSkills = data.declaredSkills as any;
          if (data.projects !== undefined) profile.projects = data.projects as any;

          await profile.save();

          const passport = await PassportModel.findOne({ studentId: profile._id }).select('publicSlug');
          return this.formatProfileResponse(profile, user.email, passport?.publicSlug);
        }
      }
    }

    // In-memory update
    const current = await this.getCurrentStudentProfile(userId);
    const updated = {
      ...current,
      ...data,
      updatedAt: new Date(),
    };
    this.inMemoryProfiles.set(userId, updated);
    return updated as any;
  }

  /**
   * Processes uploaded resume PDF, executes assistive extraction, stores metadata, and cleans up temp file
   */
  public static async uploadAndAnalyzeResume(
    userId: string,
    file: Express.Multer.File
  ): Promise<{ profile: StudentProfileResponse; resumeParsedData: IResumeParsedData }> {
    try {
      const user = await UserModel.findById(userId).select('email');
      if (!user) {
        throw new NotFoundError('User account not found');
      }

      let profile = await StudentProfileModel.findOne({ userId });
      if (!profile) {
        throw new NotFoundError('Student profile not found');
      }

      // Execute AI / heuristic assistive analysis
      const parsedData = await ResumeAnalyzer.analyzeResume(file.path);

      // Store resume metadata and parsed assistive data
      profile.resumeFileName = file.originalname;
      profile.resumeFileUrl = `/uploads/resumes/${path.basename(file.path)}`;
      profile.resumeParsedData = parsedData;

      // Note: Declared skills are intentionally NOT overwritten automatically
      await profile.save();

      const passport = await PassportModel.findOne({ studentId: profile._id }).select('publicSlug');
      const formattedProfile = this.formatProfileResponse(profile, user.email, passport?.publicSlug);

      return {
        profile: formattedProfile,
        resumeParsedData: parsedData,
      };
    } finally {
      // Ensure uploaded temporary file is always deleted after analysis
      cleanupUploadedFile(file.path);
    }
  }
}
