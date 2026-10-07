import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type MissionSessionStatus = 'not_started' | 'in_progress' | 'submitted' | 'evaluated';

export interface IStagedFile {
  path: string;
  content: string;
}

export interface ITestResultSummary {
  passed: boolean;
  passedCount: number;
  failedCount: number;
  totalCount: number;
  tests: Array<{
    name: string;
    status: 'passed' | 'failed' | 'error';
    durationMs?: number;
    message?: string;
  }>;
  runAt: Date;
  stdout?: string;
  stderr?: string;
}

export interface IMissionSession {
  userId: Types.ObjectId;
  missionSlug: string;
  status: MissionSessionStatus;
  startedAt: Date;
  lastActivityAt: Date;
  submittedAt?: Date;
  runCount: number;
  failedRunCount: number;
  stagedFiles: IStagedFile[];
  latestRunId?: string;
  latestTestResult?: ITestResultSummary;
  technicalExplanation?: string;
  submissionEvidenceId?: Types.ObjectId;
  integrityHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMissionSessionDocument extends IMissionSession, Document {}

const missionSessionSchema = new Schema<IMissionSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    missionSlug: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'submitted', 'evaluated'],
      default: 'in_progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    runCount: {
      type: Number,
      default: 0,
    },
    failedRunCount: {
      type: Number,
      default: 0,
    },
    stagedFiles: [
      {
        path: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
    latestRunId: {
      type: String,
    },
    latestTestResult: {
      passed: { type: Boolean },
      passedCount: { type: Number },
      failedCount: { type: Number },
      totalCount: { type: Number },
      tests: [
        {
          name: { type: String },
          status: { type: String, enum: ['passed', 'failed', 'error'] },
          durationMs: { type: Number },
          message: { type: String },
        },
      ],
      runAt: { type: Date },
      stdout: { type: String },
      stderr: { type: String },
    },
    technicalExplanation: {
      type: String,
    },
    submissionEvidenceId: {
      type: Schema.Types.ObjectId,
      ref: 'EvidenceRecord',
    },
    integrityHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

missionSessionSchema.index({ userId: 1, missionSlug: 1 }, { unique: true });

export const MissionSessionModel: Model<IMissionSessionDocument> =
  mongoose.model<IMissionSessionDocument>('MissionSession', missionSessionSchema);
