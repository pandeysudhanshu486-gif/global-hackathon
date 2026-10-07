import { z } from 'zod';

export const updatePassportSettingsSchema = z
  .object({
    passportEnabled: z.boolean().optional(),
    showEducation: z.boolean().optional(),
    showProjects: z.boolean().optional(),
    showDeclaredSkills: z.boolean().optional(),
    showGithubEvidence: z.boolean().optional(),
    showResumeEvidence: z.boolean().optional(),
    showDemonstratedEvidence: z.boolean().optional(),
    showBio: z.boolean().optional(),
    showTimeline: z.boolean().optional(),
    visibility: z.enum(['public', 'recruiter', 'private']).optional(),
  })
  .strict(); // Rejects attempts to inject arbitrary or restricted fields

export type UpdatePassportSettingsInput = z.infer<typeof updatePassportSettingsSchema>;
