import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { PassportController } from './passport.controller.js';

// Public Passport Router (No authentication required)
export const publicPassportRouter = Router();
publicPassportRouter.get('/:slug', PassportController.getPublicPassport);

// Student Passport Router (Authenticated student only)
export const studentPassportRouter = Router();
studentPassportRouter.use(authenticate);
studentPassportRouter.use(requireRole('student'));

studentPassportRouter.get('/', PassportController.getStudentPassport);
studentPassportRouter.put('/', PassportController.updateStudentPassport);
studentPassportRouter.put('/settings', PassportController.updateStudentPassport);
