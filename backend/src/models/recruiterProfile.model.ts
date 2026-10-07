import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IRecruiterProfile {
  userId: Types.ObjectId;
  recruiterName: string;
  name?: string;
  companyName: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecruiterProfileDocument extends IRecruiterProfile, Document {}

const recruiterProfileSchema = new Schema<IRecruiterProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    recruiterName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    companyWebsite: {
      type: String,
      trim: true,
    },
    companyDescription: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    companyVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const RecruiterProfileModel: Model<IRecruiterProfileDocument> =
  mongoose.model<IRecruiterProfileDocument>('RecruiterProfile', recruiterProfileSchema);
