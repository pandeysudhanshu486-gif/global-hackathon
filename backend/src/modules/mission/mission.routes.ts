import { Router } from 'express';
import { MissionController } from './mission.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import {
  getMissionParamsSchema,
  runMissionSchema,
  submitMissionSchema,
} from './mission.validation.js';

// Public Catalog Router (/api/missions)
export const missionCatalogRouter = Router();
missionCatalogRouter.get('/', MissionController.getAllMissions);
missionCatalogRouter.get('/:slug', MissionController.getMissionBySlug);

// Student Authenticated Router (/api/student/missions)
export const studentMissionRouter = Router();

studentMissionRouter.use(authenticate);
studentMissionRouter.use(requireRole('student'));

studentMissionRouter.get(
  '/:slug',
  validateRequest(getMissionParamsSchema),
  MissionController.getStudentMission
);

studentMissionRouter.post(
  '/:slug/run',
  validateRequest(runMissionSchema),
  MissionController.runStudentMission
);

studentMissionRouter.post(
  '/:slug/submit',
  validateRequest(submitMissionSchema),
  MissionController.submitStudentMission
);

studentMissionRouter.get(
  '/:slug/status',
  validateRequest(getMissionParamsSchema),
  MissionController.getStudentMissionStatus
);
