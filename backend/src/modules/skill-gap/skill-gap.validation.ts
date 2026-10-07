import { z } from 'zod';

export const getSkillGapQuerySchema = {
  query: z
    .object({
      roleId: z.string().trim().optional(),
      targetRole: z.string().trim().optional(),
    })
    .strict(),
};

export type GetSkillGapQueryInput = z.infer<typeof getSkillGapQuerySchema.query>;
