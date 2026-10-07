import { Router, Request, Response } from 'express';
import { getDatabaseHealth } from '../../config/database.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const dbHealth = getDatabaseHealth();
  const isHealthy = dbHealth.status === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    success: true,
    status: isHealthy ? 'operational' : 'degraded',
    service: 'WorkProof AI Core API',
    tagline: 'From Skills to Proof to Opportunity',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbHealth,
    version: '1.0.0 (Milestone 1: Foundation)',
  });
});

export const healthRouter = router;
