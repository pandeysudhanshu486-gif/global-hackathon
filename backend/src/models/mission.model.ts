import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type MissionType = 'bug_fix' | 'feature_build' | 'test_writing' | 'refactor' | 'api_design' | 'debugging';

export interface IMission {
  slug: string;
  version: number;
  title: string;
  description: string;
  category: 'backend' | 'frontend' | 'fullstack' | 'api' | 'debugging' | 'testing' | 'database';
  type: MissionType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  timeEstimateMinutes: number;
  skillsTested: {
    skillName: string;
    category: string;
    isPrimary: boolean;
  }[];
  starterFiles: { path: string; content: string }[];
  testFiles: { path: string; content: string }[];
  rubricVersion: string;
  runtime: 'node18' | 'node20';
  status: 'active' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface IMissionDocument extends IMission, Document {}

const missionSchema = new Schema<IMissionDocument>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['backend', 'frontend', 'fullstack', 'api', 'debugging', 'testing', 'database'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['bug_fix', 'feature_build', 'test_writing', 'refactor', 'api_design', 'debugging'],
      required: true,
    },
    difficulty: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
    },
    timeEstimateMinutes: {
      type: Number,
      default: 45,
    },
    skillsTested: [
      {
        skillName: { type: String, required: true },
        category: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    starterFiles: [{ path: { type: String, required: true }, content: { type: String, required: true } }],
    testFiles: [{ path: { type: String, required: true }, content: { type: String, required: true } }],
    rubricVersion: { type: String, default: 'v1.0' },
    runtime: { type: String, enum: ['node18', 'node20'], default: 'node20' },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MissionModel: Model<IMissionDocument> = mongoose.model<IMissionDocument>('Mission', missionSchema);
