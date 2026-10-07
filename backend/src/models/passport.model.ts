import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type EvidenceLevel = 0 | 1 | 2 | 3 | 4; // 0=No Evidence, 1=Attempted, 2=Limited, 3=Demonstrated, 4=Strong

export interface ICapabilityRecord {
  name: string;
  category: string;
  evidenceLevel: EvidenceLevel;
  evidenceCount: number;
  evidenceIds: Types.ObjectId[];
  lastEvidenceDate?: Date;
  sources: ('mission' | 'github')[];
}

export interface IPassportPrivacySettings {
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

export interface IPassport {
  studentId: Types.ObjectId;
  publicSlug: string;
  capabilities: ICapabilityRecord[];
  visibility: 'public' | 'recruiter' | 'private';
  privacySettings: IPassportPrivacySettings;
  stats: {
    missionsCompleted: number;
    totalEvidenceRecords: number;
    skillsWithEvidence: number;
    strongestCategory?: string;
  };
  lastUpdatedAt: Date;
}

export interface IPassportDocument extends IPassport, Document {}

const capabilityRecordSchema = new Schema<ICapabilityRecord>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    evidenceLevel: {
      type: Number,
      enum: [0, 1, 2, 3, 4],
      default: 0,
      required: true,
    },
    evidenceCount: { type: Number, default: 0 },
    evidenceIds: [{ type: Schema.Types.ObjectId, ref: 'EvidenceRecord' }],
    lastEvidenceDate: { type: Date },
    sources: [{ type: String, enum: ['mission', 'github'] }],
  },
  { _id: false }
);

const privacySettingsSchema = new Schema<IPassportPrivacySettings>(
  {
    passportEnabled: { type: Boolean, default: true },
    showEducation: { type: Boolean, default: true },
    showProjects: { type: Boolean, default: true },
    showDeclaredSkills: { type: Boolean, default: true },
    showGithubEvidence: { type: Boolean, default: true },
    showResumeEvidence: { type: Boolean, default: true },
    showDemonstratedEvidence: { type: Boolean, default: true },
    showBio: { type: Boolean, default: true },
    showTimeline: { type: Boolean, default: true },
  },
  { _id: false }
);

const passportSchema = new Schema<IPassportDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      unique: true,
      index: true,
    },
    publicSlug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    capabilities: [capabilityRecordSchema],
    visibility: {
      type: String,
      enum: ['public', 'recruiter', 'private'],
      default: 'public',
    },
    privacySettings: {
      type: privacySettingsSchema,
      default: () => ({
        passportEnabled: true,
        showEducation: true,
        showProjects: true,
        showDeclaredSkills: true,
        showGithubEvidence: true,
        showResumeEvidence: true,
        showDemonstratedEvidence: true,
        showBio: true,
        showTimeline: true,
      }),
    },
    stats: {
      missionsCompleted: { type: Number, default: 0 },
      totalEvidenceRecords: { type: Number, default: 0 },
      skillsWithEvidence: { type: Number, default: 0 },
      strongestCategory: { type: String },
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const PassportModel: Model<IPassportDocument> = mongoose.model<IPassportDocument>('Passport', passportSchema);
