import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type EvidenceType =
  | 'TEST_RESULT'
  | 'CODE_DIFF'
  | 'CODE_METRICS'
  | 'TECHNICAL_EXPLANATION'
  | 'AI_CODE_REVIEW'
  | 'TASK_COMPLETION'
  | 'GITHUB_REPO'
  | 'GITHUB_ACTIVITY';

export interface IEvidenceRecord {
  studentId: Types.ObjectId;
  sourceType: 'mission' | 'github';
  missionId?: Types.ObjectId;
  submissionId?: Types.ObjectId;
  evaluationId?: Types.ObjectId;
  type: EvidenceType;
  data: Record<string, unknown>;
  capabilityName: string;
  capabilityCategory: string;
  visibilityLevel: 'public' | 'recruiter' | 'private';
  sanitized: boolean;
  integrityHash: string; // SHA-256
  createdAt: Date;
}

export interface IEvidenceRecordDocument extends IEvidenceRecord, Document {}

const evidenceRecordSchema = new Schema<IEvaluationRecordDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['mission', 'github'],
      required: true,
    },
    missionId: { type: Schema.Types.ObjectId, ref: 'Mission' },
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission' },
    evaluationId: { type: Schema.Types.ObjectId, ref: 'Evaluation' },
    type: {
      type: String,
      enum: [
        'TEST_RESULT',
        'CODE_DIFF',
        'CODE_METRICS',
        'TECHNICAL_EXPLANATION',
        'AI_CODE_REVIEW',
        'TASK_COMPLETION',
        'GITHUB_REPO',
        'GITHUB_ACTIVITY',
      ],
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    capabilityName: {
      type: String,
      required: true,
      index: true,
    },
    capabilityCategory: {
      type: String,
      required: true,
    },
    visibilityLevel: {
      type: String,
      enum: ['public', 'recruiter', 'private'],
      default: 'public',
    },
    sanitized: {
      type: Boolean,
      default: true,
    },
    integrityHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only
  }
);

evidenceRecordSchema.index({ studentId: 1, capabilityName: 1 });
evidenceRecordSchema.index({ studentId: 1, visibilityLevel: 1 });

type IEvaluationRecordDocument = IEvidenceRecordDocument;

export const EvidenceRecordModel: Model<IEvidenceRecordDocument> =
  mongoose.model<IEvidenceRecordDocument>('EvidenceRecord', evidenceRecordSchema);
