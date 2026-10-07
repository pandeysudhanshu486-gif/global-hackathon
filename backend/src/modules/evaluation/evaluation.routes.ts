import { Router } from 'express';
import { EvaluationController } from './evaluation.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import {
  getEvaluationParamsSchema,
  evaluateMissionSchema,
} from './evaluation.validation.js';

export const evaluationRouter = Router();

evaluationRouter.use(authenticate);
evaluationRouter.use(requireRole('student'));

evaluationRouter.post(
  '/missions/:slug/evaluate',
  validateRequest(evaluateMissionSchema),
  EvaluationController.evaluateMission
);

evaluationRouter.get(
  '/missions/:slug',
  validateRequest(getEvaluationParamsSchema),
  EvaluationController.getLatestEvaluation
);

evaluationRouter.get(
  '/',
  EvaluationController.listEvaluations
);
