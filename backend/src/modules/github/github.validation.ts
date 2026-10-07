import { z } from 'zod';

const githubUsernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export const analyzeGitHubSchema = {
  body: z
    .object({
      username: z
        .string()
        .min(1, 'GitHub username is required')
        .max(39, 'GitHub username cannot exceed 39 characters')
        .regex(
          githubUsernameRegex,
          'Invalid GitHub username format. Alphanumeric with single hyphens only.'
        )
        .trim(),
    })
    .strict(),
};

export type AnalyzeGitHubInput = z.infer<typeof analyzeGitHubSchema.body>;
