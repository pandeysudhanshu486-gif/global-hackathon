import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z.string().default('5002').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/workproof-ai'),
  // In production, secrets MUST be explicitly provided by the hosting environment.
  // In development/test, fallback defaults are permitted for local developer convenience.
  JWT_ACCESS_SECRET: isProduction
    ? z.string().min(16, 'JWT_ACCESS_SECRET must be configured with at least 16 characters in production')
    : z.string().min(16).default('workproof_jwt_access_secret_2026_dev_key_min16'),
  JWT_REFRESH_SECRET: isProduction
    ? z.string().min(16, 'JWT_REFRESH_SECRET must be configured with at least 16 characters in production')
    : z.string().min(16).default('workproof_jwt_refresh_secret_2026_dev_key_min16'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  EXECUTION_SECRET: isProduction
    ? z.string().min(16, 'EXECUTION_SECRET must be configured with at least 16 characters in production')
    : z.string().min(16).default('workproof_execution_boundary_secret_key_2026'),
  EXECUTION_SERVICE_URL: z.string().default('http://localhost:5003'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GITHUB_TOKEN: z.string().optional().default(''),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    console.error('Invalid environment variables:\n', issues.join('\n'));
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
