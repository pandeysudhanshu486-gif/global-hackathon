import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5002').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/workproof-ai'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  EXECUTION_SECRET: z.string().min(16, 'EXECUTION_SECRET must be at least 16 characters'),
  EXECUTION_SERVICE_URL: z.string().default('http://localhost:5003'),
  GEMINI_API_KEY: z.string().optional().default(''),
  GITHUB_TOKEN: z.string().optional().default(''),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:\n', result.error.format());
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
export type Env = z.infer<typeof envSchema>;
