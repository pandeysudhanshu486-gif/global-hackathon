import { z } from 'zod';

const educationItemSchema = z
  .object({
    institution: z.string().min(1, 'Institution name is required').trim(),
    degree: z.string().min(1, 'Degree is required').trim(),
    field: z.string().trim().optional(),
    graduationYear: z
      .number()
      .int()
      .min(1950, 'Invalid graduation year')
      .max(2040, 'Invalid graduation year')
      .optional(),
  })
  .strict();

const declaredSkillItemSchema = z
  .object({
    name: z.string().min(1, 'Skill name is required').trim(),
    category: z.enum(
      ['frontend', 'backend', 'database', 'testing', 'devops', 'architecture', 'general'],
      { message: 'Invalid skill category' }
    ),
    selfAssessedLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
      message: 'Invalid self-assessed level',
    }),
  })
  .strict();

const projectItemSchema = z
  .object({
    title: z.string().min(1, 'Project title is required').trim(),
    description: z.string().min(1, 'Project description is required').trim(),
    technologies: z.array(z.string().trim()).default([]),
    url: z.string().url('Invalid project URL').optional().or(z.literal('')),
    githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  })
  .strict();

export const updateProfileSchema = {
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
      bio: z.string().max(500, 'Bio cannot exceed 500 characters').trim().optional(),
      location: z.string().trim().optional(),
      workPreference: z.enum(['remote', 'onsite', 'hybrid']).optional(),
      targetRole: z.string().trim().optional(),
      interests: z.array(z.string().trim()).optional(),
      education: z.array(educationItemSchema).optional(),
      declaredSkills: z.array(declaredSkillItemSchema).optional(),
      projects: z.array(projectItemSchema).optional(),
    })
    .strict(),
};

export type UpdateProfileInput = z.infer<typeof updateProfileSchema.body>;
