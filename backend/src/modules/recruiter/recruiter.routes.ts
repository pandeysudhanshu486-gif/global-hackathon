import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { RecruiterController } from './recruiter.controller.js';

export const recruiterRouter = Router();

// Protect all recruiter endpoints: Authenticated Recruiter role ONLY
recruiterRouter.use(authenticate);
recruiterRouter.use(requireRole('recruiter'));

// Recruiter Profile
recruiterRouter.get('/profile', RecruiterController.getProfile);
recruiterRouter.put('/profile', RecruiterController.updateProfile);

// Recruiter Candidate Search & Evidence Inspection
recruiterRouter.get('/candidates', RecruiterController.searchCandidates);
recruiterRouter.get('/candidates/:studentId', RecruiterController.getCandidateSummary);

// Health/Status check
recruiterRouter.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Recruiter module authenticated & ready' });
});
