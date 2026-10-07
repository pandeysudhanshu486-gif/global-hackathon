import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRubricCategory {
  key: string;
  name: string;
  description: string;
  weight: number; // 0.0 - 1.0
  signalType: 'deterministic' | 'ai_assisted' | 'student_authored';
  evaluationMethod: string;
}

export interface IEvaluationRubric {
  version: string; // e.g. "v1.0"
  name: string;
  description: string;
  categories: IRubricCategory[];
  levelThresholds: {
    attempted: number; // Level 1 (e.g. 0.25)
    limitedEvidence: number; // Level 2 (e.g. 0.50)
    demonstrated: number; // Level 3 (e.g. 0.75)
    strongEvidence: number; // Level 4 (e.g. 0.90)
  };
  rules: {
    requireTestPass: boolean;
    requireExplanation: boolean;
    maxAiWeight: number; // Cap on AI-assisted contribution (e.g. 0.30)
    minDeterministicScore: number;
  };
  isActive: boolean;
  createdAt: Date;
}

export interface IEvaluationRubricDocument extends IEvaluationRubric, Document {}

const evaluationRubricSchema = new Schema<IEvaluationRubricDocument>(
  {
    version: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    categories: [
      {
        key: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        weight: { type: Number, required: true, min: 0, max: 1 },
        signalType: {
          type: String,
          enum: ['deterministic', 'ai_assisted', 'student_authored'],
          required: true,
        },
        evaluationMethod: { type: String, required: true },
      },
    ],
    levelThresholds: {
      attempted: { type: Number, default: 0.25 },
      limitedEvidence: { type: Number, default: 0.5 },
      demonstrated: { type: Number, default: 0.75 },
      strongEvidence: { type: Number, default: 0.9 },
    },
    rules: {
      requireTestPass: { type: Boolean, default: true },
      requireExplanation: { type: Boolean, default: true },
      maxAiWeight: { type: Number, default: 0.3 },
      minDeterministicScore: { type: Number, default: 0.6 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const EvaluationRubricModel: Model<IEvaluationRubricDocument> =
  mongoose.model<IEvaluationRubricDocument>('EvaluationRubric', evaluationRubricSchema);
