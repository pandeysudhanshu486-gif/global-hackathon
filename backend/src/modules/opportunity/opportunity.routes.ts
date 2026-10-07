import { Router } from 'express';
import { OpportunityController } from './opportunity.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { createOpportunitySchema, applyOpportunitySchema } from './opportunity.validation.js';

// Public Opportunities Router
export const publicOpportunityRouter = Router();
publicOpportunityRouter.get('/', OpportunityController.listPublicOpportunities);

// Student Opportunities Router
export const studentOpportunityRouter = Router();
studentOpportunityRouter.use(authenticate);
studentOpportunityRouter.use(requireRole('student'));

studentOpportunityRouter.get('/', OpportunityController.listStudentOpportunities);
studentOpportunityRouter.post(
  '/:id/apply',
  validateRequest(applyOpportunitySchema),
  OpportunityController.applyToOpportunity
);

// Recruiter Opportunities Router
export const recruiterOpportunityRouter = Router();
recruiterOpportunityRouter.use(authenticate);
recruiterOpportunityRouter.use(requireRole('recruiter'));

recruiterOpportunityRouter.get('/', OpportunityController.listRecruiterOpportunities);
recruiterOpportunityRouter.post(
  '/',
  validateRequest(createOpportunitySchema),
  OpportunityController.createOpportunity
);
