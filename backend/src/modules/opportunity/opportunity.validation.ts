import { z } from 'zod';

const createOpportunityBody = z.object({
  title: z.string().min(3).max(120),
  companyName: z.string().min(2).max(100),
  companyWebsite: z.string().url().optional(),
  companyLogoUrl: z.string().url().optional(),
  type: z.enum(['apprenticeship', 'internship', 'entry_level', 'junior_developer']),
  location: z.string().min(2).max(100),
  workPreference: z.enum(['remote', 'onsite', 'hybrid']),
  targetRole: z.string().min(2).max(100),
  requiredCapabilities: z.array(z.string().min(1)).min(1),
  recommendedCapabilities: z.array(z.string().min(1)).optional(),
  description: z.string().min(20).max(5000),
  mentorshipProvided: z.boolean().default(true),
  stipendOrSalary: z.string().max(100).optional(),
  duration: z.string().max(100).optional(),
}).strict();

const applyOpportunityParams = z.object({
  id: z.string().min(1),
});

const applyOpportunityBody = z.object({
  notes: z.string().max(1000).optional(),
  note: z.string().max(1000).optional(),
}).strict().optional();

export const createOpportunitySchema = {
  body: createOpportunityBody,
};

export const applyOpportunitySchema = {
  params: applyOpportunityParams,
  body: applyOpportunityBody,
};

export const updateApplicationStatusSchema = {
  params: z.object({
    id: z.string().min(1),
    studentId: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['submitted', 'under_review', 'accepted', 'declined']),
  }).strict(),
};

export type CreateOpportunityInput = z.infer<typeof createOpportunityBody>;
export type ApplyOpportunityInput = z.infer<typeof applyOpportunityBody>;
