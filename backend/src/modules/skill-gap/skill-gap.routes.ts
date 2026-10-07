import { Router } from 'express';
import { SkillGapController } from './skill-gap.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { getSkillGapQuerySchema } from './skill-gap.validation.js';

const router = Router();

// GET /api/student/skill-gap
router.get(
  '/skill-gap',
  authenticate,
  requireRole('student'),
  validateRequest(getSkillGapQuerySchema),
  SkillGapController.getStudentSkillGap
);

export const skillGapRouter = router;
