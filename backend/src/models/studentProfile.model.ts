import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IEducation {
  institution: string;
  degree: string;
  field?: string;
  graduationYear?: number;
}

export interface IDeclaredSkill {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'testing' | 'devops' | 'architecture' | 'general';
  selfAssessedLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface IProject {
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
}

export interface IResumeParsedData {
  extractedSkills: { name: string; category?: string }[];
  extractedExperience: { title: string; company: string; duration?: string; description?: string }[];
  extractedEducation: { institution: string; degree: string; field?: string; graduationYear?: number }[];
  extractedProjects: { title: string; description: string; technologies: string[] }[];
  extractedCertifications: string[];
  extractionMethod: 'gemini' | 'heuristic_fallback';
  parsedAt: Date;
  verified: boolean; // Always false — AI extraction is assistive and unverified
}

export interface IStudentProfile {
  userId: Types.ObjectId;
  name: string;
  bio?: string;
  location?: string;
  workPreference: 'remote' | 'onsite' | 'hybrid';
  avatarUrl?: string;
  targetRole?: string;
  interests: string[];
  education: IEducation[];
  declaredSkills: IDeclaredSkill[];
  projects: IProject[];
  
  // Resume Parsing Metadata (assistive, not standalone proof)
  resumeFileUrl?: string;
  resumeFileName?: string;
  resumeParsedData?: IResumeParsedData;

  // GitHub Context (public analysis, supporting context only)
  githubUsername?: string;
  githubProfileUrl?: string;
  githubConnected: boolean;
  githubLastAnalyzedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentProfileDocument extends IStudentProfile, Document {}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    technologies: [{ type: String, trim: true }],
    url: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
  },
  { _id: false }
);

const educationSchema = new Schema<IEducation>(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    field: { type: String, trim: true },
    graduationYear: { type: Number },
  },
  { _id: false }
);

const declaredSkillSchema = new Schema<IDeclaredSkill>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'database', 'testing', 'devops', 'architecture', 'general'],
      default: 'general',
    },
    selfAssessedLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
  },
  { _id: false }
);

const resumeParsedDataSchema = new Schema<IResumeParsedData>(
  {
    extractedSkills: [
      {
        name: { type: String, required: true },
        category: { type: String },
      },
    ],
    extractedExperience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        duration: { type: String },
        description: { type: String },
      },
    ],
    extractedEducation: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        field: { type: String },
        graduationYear: { type: Number },
      },
    ],
    extractedProjects: [
      {
        title: { type: String, required: true },
        description: { type: String },
        technologies: [{ type: String }],
      },
    ],
    extractedCertifications: [{ type: String }],
    extractionMethod: {
      type: String,
      enum: ['gemini', 'heuristic_fallback'],
      default: 'heuristic_fallback',
    },
    parsedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }, // Enforced false
  },
  { _id: false }
);

const studentProfileSchema = new Schema<IStudentProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    location: {
      type: String,
      trim: true,
    },
    workPreference: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'remote',
    },
    avatarUrl: {
      type: String,
    },
    targetRole: {
      type: String,
      trim: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    declaredSkills: {
      type: [declaredSkillSchema],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    resumeFileUrl: { type: String },
    resumeFileName: { type: String },
    resumeParsedData: {
      type: resumeParsedDataSchema,
    },
    githubUsername: { type: String, trim: true },
    githubProfileUrl: { type: String, trim: true },
    githubConnected: { type: Boolean, default: false },
    githubLastAnalyzedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const StudentProfileModel: Model<IStudentProfileDocument> =
  mongoose.model<IStudentProfileDocument>('StudentProfile', studentProfileSchema);
