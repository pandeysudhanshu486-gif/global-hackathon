import { z } from 'zod';

export const getMissionParamsSchema = {
  params: z
    .object({
      slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Invalid mission slug format'),
    })
    .strict(),
};

export const runMissionSchema = {
  params: z
    .object({
      slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Invalid mission slug format'),
    })
    .strict(),
  body: z
    .object({
      files: z
        .array(
          z.object({
            path: z.string().min(1).max(255),
            content: z.string().max(500000), // Max 500KB per file
          })
        )
        .min(1, 'At least one file must be provided for execution'),
    })
    .strict(),
};

export const submitMissionSchema = {
  params: z
    .object({
      slug: z.string().trim().regex(/^[a-z0-9-]+$/, 'Invalid mission slug format'),
    })
    .strict(),
  body: z
    .object({
      technicalExplanation: z
        .string()
        .trim()
        .max(5000, 'Technical explanation must not exceed 5000 characters')
        .optional()
        .transform((val) => (val && val.length > 0 ? val : undefined)),
    })
    .strict(),
};

export type RunMissionInput = z.infer<typeof runMissionSchema.body>;
export type SubmitMissionInput = z.infer<typeof submitMissionSchema.body>;
