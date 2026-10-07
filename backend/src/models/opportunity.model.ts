import mongoose, { Schema, Document } from 'mongoose';

export type OpportunityType = 'apprenticeship' | 'internship' | 'entry_level' | 'junior_developer';
export type WorkPreference = 'remote' | 'onsite' | 'hybrid';

export interface IOpportunityApplication {
  studentId: mongoose.Types.ObjectId;
  publicSlug: string;
  candidateName: string;
  demonstratedCapabilitiesCount: number;
  appliedAt: Date;
  status: 'submitted' | 'under_review' | 'accepted' | 'declined';
  notes?: string;
}

export interface IOpportunityDocument extends Document {
  title: string;
  companyName: string;
  companyId?: mongoose.Types.ObjectId;
  companyWebsite?: string;
  companyLogoUrl?: string;
  type: OpportunityType;
  location: string;
  workPreference: WorkPreference;
  targetRole: string;
  requiredCapabilities: string[];
  recommendedCapabilities?: string[];
  description: string;
  mentorshipProvided: boolean;
  stipendOrSalary?: string;
  duration?: string;
  isOpen: boolean;
  applications: IOpportunityApplication[];
  createdAt: Date;
  updatedAt: Date;
}

const OpportunityApplicationSchema = new Schema<IOpportunityApplication>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publicSlug: { type: String, required: true },
    candidateName: { type: String, required: true },
    demonstratedCapabilitiesCount: { type: Number, default: 0 },
    appliedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'accepted', 'declined'],
      default: 'submitted',
    },
    notes: { type: String },
  },
  { _id: false }
);

const OpportunitySchema = new Schema<IOpportunityDocument>(
  {
    title: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'User' },
    companyWebsite: { type: String },
    companyLogoUrl: { type: String },
    type: {
      type: String,
      enum: ['apprenticeship', 'internship', 'entry_level', 'junior_developer'],
      required: true,
      default: 'apprenticeship',
    },
    location: { type: String, required: true },
    workPreference: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'remote',
    },
    targetRole: { type: String, required: true },
    requiredCapabilities: [{ type: String, required: true }],
    recommendedCapabilities: [{ type: String }],
    description: { type: String, required: true },
    mentorshipProvided: { type: Boolean, default: true },
    stipendOrSalary: { type: String },
    duration: { type: String },
    isOpen: { type: Boolean, default: true },
    applications: [OpportunityApplicationSchema],
  },
  {
    timestamps: true,
  }
);

OpportunitySchema.index({ type: 1, isOpen: 1 });
OpportunitySchema.index({ targetRole: 1 });
OpportunitySchema.index({ requiredCapabilities: 1 });

export const OpportunityModel =
  mongoose.models.Opportunity ||
  mongoose.model<IOpportunityDocument>('Opportunity', OpportunitySchema);
