import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long').trim(),
    role: z.enum(['student', 'recruiter']),
    companyName: z.string().optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
};
