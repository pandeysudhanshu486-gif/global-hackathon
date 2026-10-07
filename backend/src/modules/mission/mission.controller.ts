import { Request, Response, NextFunction } from 'express';
import { MissionService } from './mission.service.js';
import { UnauthorizedError } from '../../shared/errors.js';

export class MissionController {
  // Public Catalog Endpoints
  public static async getAllMissions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const missions = MissionService.getAllMissions();
      res.status(200).json({
        success: true,
        data: missions,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMissionBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const mission = MissionService.getMissionBySlug(slug as string);
      res.status(200).json({
        success: true,
        data: mission,
      });
    } catch (error) {
      next(error);
    }
  }

  // Student Authenticated Endpoints
  public static async getStudentMission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { slug } = req.params;
      const workspace = await MissionService.getStudentMissionWorkspace(req.user.userId, slug as string);

      res.status(200).json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async runStudentMission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { slug } = req.params;
      const { files } = req.body;

      const result = await MissionService.runStudentMission(req.user.userId, slug as string, files);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async submitStudentMission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { slug } = req.params;
      const { technicalExplanation } = req.body;

      const result = await MissionService.submitStudentMission(
        req.user.userId,
        slug as string,
        technicalExplanation
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getStudentMissionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { slug } = req.params;
      const status = await MissionService.getStudentMissionStatus(req.user.userId, slug as string);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}
