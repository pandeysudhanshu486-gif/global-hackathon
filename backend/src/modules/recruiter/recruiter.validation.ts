import { z } from 'zod';

export const updateRecruiterProfileSchema = z.object({
  recruiterName: z.string().trim().min(2, 'Recruiter name must be at least 2 characters').max(100),
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(150),
  companyWebsite: z
    .string()
    .trim()
    .url('Company website must be a valid URL')
    .optional()
    .or(z.literal('')),
  companyDescription: z
    .string()
    .trim()
    .max(1000, 'Company description must not exceed 1000 characters')
    .optional(),
});

export const candidateSearchQuerySchema = z.object({
  targetRole: z.string().trim().optional(),
  capability: z.string().trim().optional(),
  evidenceLevel: z.enum(['declared', 'ai_assisted', 'supporting', 'demonstrated']).optional(),
  missionSlug: z.string().trim().optional(),
  search: z.string().trim().max(100).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type UpdateRecruiterProfileInput = z.infer<typeof updateRecruiterProfileSchema>;
export type CandidateSearchQueryInput = z.infer<typeof candidateSearchQuerySchema>;
