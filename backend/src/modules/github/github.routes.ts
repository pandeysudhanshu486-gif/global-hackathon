import { Router } from 'express';
import { GitHubController } from './github.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { analyzeGitHubSchema } from './github.validation.js';

const router = Router();

// POST /api/student/profile/github
router.post(
  '/profile/github',
  authenticate,
  requireRole('student'),
  validateRequest(analyzeGitHubSchema),
  GitHubController.analyzeGitHub
);

// GET /api/student/profile/github
router.get(
  '/profile/github',
  authenticate,
  requireRole('student'),
  GitHubController.getGitHubSummary
);

export const githubRouter = router;
