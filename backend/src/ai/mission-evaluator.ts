import { z } from 'zod';
import { GeminiClient } from './gemini.client.js';
import { logger } from '../shared/logger.js';
import { IAssistiveEvaluationResult, ExplanationQuality } from '../models/missionEvaluation.model.js';

const assistiveOutputSchema = z.object({
  explanationQuality: z.enum(['strong', 'adequate', 'insufficient', 'not_provided']),
  strengths: z.array(z.string()).default([]),
  improvementAreas: z.array(z.string()).default([]),
  reasoning: z.string().default(''),
});

export interface EvaluateExplanationInput {
  missionSlug: string;
  missionTitle: string;
  explanation: string;
  codeContext?: string;
  deterministicPass: boolean;
  passedTests: number;
  totalTests: number;
}

export class MissionAiEvaluator {
  /**
   * Deterministic / Heuristic qualitative evaluation when Gemini is offline/unconfigured
   */
  public static evaluateHeuristically(input: EvaluateExplanationInput): IAssistiveEvaluationResult {
    const text = (input.explanation || '').trim();

    if (!text || text.length === 0) {
      return {
        explanationQuality: 'not_provided',
        strengths: ['Automated test assertions passed in sandbox execution.'],
        improvementAreas: ['No written technical explanation was provided. Providing root cause analysis strengthens recruiter visibility.'],
        reasoning: 'Candidate submitted code without accompanying written rationale.',
        evaluationMethod: 'deterministic_only',
      };
    }

    if (text.length < 25) {
      return {
        explanationQuality: 'insufficient',
        strengths: ['Brief mention of solution.'],
        improvementAreas: ['Elaborate on root cause (e.g. IEEE 754 floating point precision) and why the specific mathematical rounding approach was selected.'],
        reasoning: 'Explanation is concise but lacks in-depth technical analysis of boundary conditions.',
        evaluationMethod: 'deterministic_only',
      };
    }

    const lower = text.toLowerCase();
    const strongKeywords = [
      'precision',
      'float',
      'rounding',
      'tofixed',
      'ieee',
      'decimal',
      'clamp',
      'coupon',
      'boundary',
      'discount',
      'arithmetic',
      'subtotal',
      'regression',
    ];

    const keywordMatches = strongKeywords.filter((k) => lower.includes(k));
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (keywordMatches.length >= 2 || text.length > 120) {
      strengths.push('Clear diagnosis of arithmetic floating-point precision and rounding constraints.');
      if (lower.includes('clamp') || lower.includes('discount') || lower.includes('coupon')) {
        strengths.push('Addressed input validation and boundary condition clamping for coupon percentages.');
      }
      improvements.push('Consider adding explicit unit test assertions for negative zero, null item arrays, or non-numeric discount values.');

      return {
        explanationQuality: 'strong',
        strengths,
        improvementAreas: improvements,
        reasoning: 'Candidate clearly articulated the root cause defect and explained the defensive validation approach.',
        evaluationMethod: 'deterministic_only',
      };
    }

    strengths.push('Identified the primary defect and summarized code changes.');
    improvements.push('Include specific mention of numerical precision edge cases (e.g. multiple decimal multipliers).');

    return {
      explanationQuality: 'adequate',
      strengths,
      improvementAreas: improvements,
      reasoning: 'Explanation provides adequate problem context and describes the bug resolution.',
      evaluationMethod: 'deterministic_only',
    };
  }

  /**
   * Main Evaluator: Uses Gemini if available, otherwise falls back gracefully to heuristic evaluation
   */
  public static async evaluateExplanation(
    input: EvaluateExplanationInput
  ): Promise<IAssistiveEvaluationResult> {
    if (!GeminiClient.isConfigured()) {
      logger.info('Gemini AI not configured — Using deterministic heuristic evaluator for mission review');
      return this.evaluateHeuristically(input);
    }

    try {
      const prompt = `
You are an expert engineering reviewer on the WorkProof AI technical evaluation team.
Your job is to provide structured qualitative feedback on a candidate's submitted engineering work.

MISSION: ${input.missionTitle} (${input.missionSlug})
TESTS STATUS: ${input.passedTests}/${input.totalTests} Passed (Deterministic Ground Truth: ${input.deterministicPass ? 'PASS' : 'FAIL'})

CANDIDATE TECHNICAL EXPLANATION:
"""
${input.explanation || '(No written explanation provided)'}
"""

RELEVANT CODE SUBMISSION:
"""
${(input.codeContext || '').slice(0, 3000)}
"""

EVALUATION RULES:
1. Deterministic tests are the primary source of truth. Do not contradict test results.
2. Evaluate ONLY the clarity, understanding, and technical reasoning of the candidate's explanation.
3. Classify explanationQuality strictly as one of: 'strong', 'adequate', 'insufficient', 'not_provided'.
4. Provide constructive strengths (1-3 bullet points) and improvement areas (1-2 bullet points).
5. DO NOT provide numeric scores, hireability percentages, or candidate rankings.

Respond ONLY with a valid JSON object matching this schema:
{
  "explanationQuality": "strong" | "adequate" | "insufficient" | "not_provided",
  "strengths": ["...", "..."],
  "improvementAreas": ["..."],
  "reasoning": "Concise 1-2 sentence rationale for this feedback."
}
`;

      const parsed = await GeminiClient.generateJson<any>(prompt);
      if (!parsed) {
        return this.evaluateHeuristically(input);
      }
      const validated = assistiveOutputSchema.parse(parsed);

      return {
        explanationQuality: validated.explanationQuality,
        strengths: validated.strengths.length > 0 ? validated.strengths : ['Automated tests executed cleanly.'],
        improvementAreas: validated.improvementAreas,
        reasoning: validated.reasoning || 'Evaluated via AI assistive qualitative review.',
        evaluationMethod: 'gemini',
      };
    } catch (err) {
      logger.warn('Gemini qualitative evaluation failed — falling back to deterministic review:', err);
      return this.evaluateHeuristically(input);
    }
  }
}
