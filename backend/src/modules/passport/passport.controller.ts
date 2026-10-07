import { Request, Response, NextFunction } from 'express';
import { PassportService } from './passport.service.js';
import { updatePassportSettingsSchema } from './passport.validation.js';
import { BadRequestError } from '../../shared/errors.js';

export class PassportController {
  /**
   * GET /api/student/passport
   */
  public static async getStudentPassport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const passport = await PassportService.getStudentPassport(userId);

      res.status(200).json({
        success: true,
        data: passport,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/student/passport
   */
  public static async updateStudentPassport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const validatedInput = updatePassportSettingsSchema.parse(req.body);
      const updated = await PassportService.updateStudentPassportSettings(userId, validatedInput);

      res.status(200).json({
        success: true,
        message: 'Passport privacy settings updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/passport/:slug
   * Public endpoint — NO authentication required
   */
  public static async getPublicPassport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawSlug = req.params.slug;
      const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
      if (!slug || typeof slug !== 'string' || !slug.trim()) {
        throw new BadRequestError('Passport slug is required');
      }

      const publicPassport = await PassportService.getPublicPassport(slug.trim());

      res.status(200).json({
        success: true,
        data: publicPassport,
      });
    } catch (error) {
      next(error);
    }
  }
}
