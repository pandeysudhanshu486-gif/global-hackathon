import { Request, Response, NextFunction } from 'express';
import { SkillGapService } from './skill-gap.service.js';
import { UnauthorizedError } from '../../shared/errors.js';

export class SkillGapController {
  public static async getStudentSkillGap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const roleId =
        typeof req.query.roleId === 'string'
          ? req.query.roleId
          : typeof req.query.targetRole === 'string'
            ? req.query.targetRole
            : undefined;
      const result = await SkillGapService.analyzeStudentSkillGap(req.user.userId, roleId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = SkillGapService.getAvailableRoles();
      res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  }
}
