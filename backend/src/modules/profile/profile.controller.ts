import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service.js';
import { UnauthorizedError, BadRequestError } from '../../shared/errors.js';

export class ProfileController {
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const profile = await ProfileService.getCurrentStudentProfile(req.user.userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const updatedProfile = await ProfileService.updateCurrentStudentProfile(
        req.user.userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async uploadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!req.file) {
        throw new BadRequestError('Resume file is required. Please attach a PDF under the "resume" field.');
      }

      const result = await ProfileService.uploadAndAnalyzeResume(req.user.userId, req.file);

      res.status(200).json({
        success: true,
        message: 'Resume uploaded and analyzed successfully (marked as assistive / unverified).',
        data: {
          profile: result.profile,
          resumeParsedData: result.resumeParsedData,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
