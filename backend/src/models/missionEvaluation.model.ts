import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type EvaluationFinalStatus = 'passed' | 'failed' | 'pending_review';
export type ExplanationQuality = 'strong' | 'adequate' | 'insufficient' | 'not_provided';

export interface IDeterministicEvaluationResult {
  testsPassed: number;
  testsTotal: number;
  functionalCorrectness: boolean;
  requiredCriteriaPassed: boolean;
  details: Array<{
    criteriaId: string;
    name: string;
    passed: boolean;
    message?: string;
  }>;
}

export interface IAssistiveEvaluationResult {
  explanationQuality: ExplanationQuality;
  strengths: string[];
  improvementAreas: string[];
  reasoning: string;
  evaluationMethod: 'gemini' | 'deterministic_only';
}

export interface IAwardedCapability {
  capabilityId: string;
  name: string;
  category: string;
  status: 'demonstrated' | 'supporting' | 'evidence_gap';
  evidenceRecordId?: Types.ObjectId;
}

export interface IMissionEvaluation {
  userId: Types.ObjectId;
  missionSlug: string;
  sessionId?: Types.ObjectId;
  runId: string;
  rubricVersion: string;
  deterministicResults: IDeterministicEvaluationResult;
  assistiveResults: IAssistiveEvaluationResult;
  capabilitiesAwarded: IAwardedCapability[];
  finalStatus: EvaluationFinalStatus;
  codeHash: string;
  integrityHash: string;
  evaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMissionEvaluationDocument extends IMissionEvaluation, Document {}

const missionEvaluationSchema = new Schema<IMissionEvaluationDocument>(
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
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'MissionSession',
      index: true,
    },
    runId: {
      type: String,
      required: true,
    },
    rubricVersion: {
      type: String,
      required: true,
      default: 'v1.0',
    },
    deterministicResults: {
      testsPassed: { type: Number, required: true },
      testsTotal: { type: Number, required: true },
      functionalCorrectness: { type: Boolean, required: true },
      requiredCriteriaPassed: { type: Boolean, required: true },
      details: [
        {
          criteriaId: { type: String, required: true },
          name: { type: String, required: true },
          passed: { type: Boolean, required: true },
          message: { type: String },
        },
      ],
    },
    assistiveResults: {
      explanationQuality: {
        type: String,
        enum: ['strong', 'adequate', 'insufficient', 'not_provided'],
        default: 'adequate',
      },
      strengths: [{ type: String }],
      improvementAreas: [{ type: String }],
      reasoning: { type: String },
      evaluationMethod: {
        type: String,
        enum: ['gemini', 'deterministic_only'],
        default: 'deterministic_only',
      },
    },
    capabilitiesAwarded: [
      {
        capabilityId: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, required: true },
        status: { type: String, enum: ['demonstrated', 'supporting', 'evidence_gap'], default: 'demonstrated' },
        evidenceRecordId: { type: Schema.Types.ObjectId, ref: 'EvidenceRecord' },
      },
    ],
    finalStatus: {
      type: String,
      enum: ['passed', 'failed', 'pending_review'],
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    integrityHash: {
      type: String,
      required: true,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

missionEvaluationSchema.index({ userId: 1, missionSlug: 1, evaluatedAt: -1 });

export const MissionEvaluationModel: Model<IMissionEvaluationDocument> =
  mongoose.model<IMissionEvaluationDocument>('MissionEvaluation', missionEvaluationSchema);
