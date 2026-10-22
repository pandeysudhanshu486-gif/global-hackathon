import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './shared/logger.js';
import { globalRateLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

// Route Imports
import { healthRouter } from './modules/health/health.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { profileRouter } from './modules/profile/profile.routes.js';
import { skillGapRouter } from './modules/skill-gap/skill-gap.routes.js';
import { missionCatalogRouter, studentMissionRouter } from './modules/mission/mission.routes.js';
import { evaluationRouter } from './modules/evaluation/evaluation.routes.js';
import { recruiterRouter } from './modules/recruiter/recruiter.routes.js';
import { publicPassportRouter, studentPassportRouter } from './modules/passport/passport.routes.js';
import {
  publicOpportunityRouter,
  studentOpportunityRouter,
  recruiterOpportunityRouter,
} from './modules/opportunity/opportunity.routes.js';
import { SkillGapController } from './modules/skill-gap/skill-gap.controller.js';
import {
  simulatorRouter,
  evidenceRouter,
  githubRouter,
} from './modules/stubs.routes.js';

export const createApp = (): Express => {
  const app = express();

  // Security headers & CORS
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        const allowed = [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];
        if (allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(null, true); // Dev-friendly fallback
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Global Rate Limiting
  app.use('/api', globalRateLimiter);

  // Request Logging
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // API Route Registration
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/student/missions', studentMissionRouter);
  app.use('/api/student/evaluations', evaluationRouter);
  app.use('/api/student/passport', studentPassportRouter);
  app.use('/api/student/opportunities', studentOpportunityRouter);
  app.use('/api/student', profileRouter);
  app.use('/api/student', skillGapRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/skills/roles', SkillGapController.getRoles);
  app.use('/api/missions', missionCatalogRouter);
  app.use('/api/opportunities', publicOpportunityRouter);
  app.use('/api/evaluation', evaluationRouter);
  app.use('/api/simulator', simulatorRouter);
  app.use('/api/evidence', evidenceRouter);
  app.use('/api/passport', publicPassportRouter);
  app.use('/api/discovery', publicOpportunityRouter);
  app.use('/api/recruiter/opportunities', recruiterOpportunityRouter);
  app.use('/api/recruiter', recruiterRouter);
  app.use('/api/github', githubRouter);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
      },
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};

const startServer = async () => {
  const app = createApp();

  // Connect to Database
  await connectDatabase();

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`WorkProof AI Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`Health check available at: http://localhost:${env.PORT}/api/health`);
  });

  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDatabase();
      logger.info('Graceful shutdown completed.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
