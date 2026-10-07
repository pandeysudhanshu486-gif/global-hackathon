import { z } from 'zod';

export const getEvaluationParamsSchema = {
  params: z
    .object({
      slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Invalid mission slug format'),
    })
    .strict(),
};

export const evaluateMissionSchema = {
  params: z
    .object({
      slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Invalid mission slug format'),
    })
    .strict(),
  body: z
    .object({
      technicalExplanation: z.string().trim().max(5000).optional(),
    })
    .strict()
    .optional()
    .default({}),
};

export type EvaluateMissionInput = z.infer<typeof evaluateMissionSchema.body>;
