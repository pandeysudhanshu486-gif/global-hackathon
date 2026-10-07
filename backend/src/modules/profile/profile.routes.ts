import { Router } from 'express';
import { ProfileController } from './profile.controller.js';
import { GitHubController } from '../github/github.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { handleResumeUpload } from '../../middleware/upload.middleware.js';
import { updateProfileSchema } from './profile.validation.js';
import { analyzeGitHubSchema } from '../github/github.validation.js';

const router = Router();

// GET /api/student/profile
router.get(
  '/profile',
  authenticate,
  requireRole('student'),
  ProfileController.getProfile
);

// PUT /api/student/profile
router.put(
  '/profile',
  authenticate,
  requireRole('student'),
  validateRequest(updateProfileSchema),
  ProfileController.updateProfile
);

// POST /api/student/profile/resume
router.post(
  '/profile/resume',
  authenticate,
  requireRole('student'),
  handleResumeUpload,
  ProfileController.uploadResume
);

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

export const profileRouter = router;
