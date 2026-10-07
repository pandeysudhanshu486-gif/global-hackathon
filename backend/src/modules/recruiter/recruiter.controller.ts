import { Request, Response, NextFunction } from 'express';
import { RecruiterService } from './recruiter.service.js';
import { updateRecruiterProfileSchema, candidateSearchQuerySchema } from './recruiter.validation.js';
import { BadRequestError } from '../../shared/errors.js';

export class RecruiterController {
  /**
   * GET /api/recruiter/profile
   */
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await RecruiterService.getRecruiterProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/recruiter/profile
   */
  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const validatedInput = updateRecruiterProfileSchema.parse(req.body);
      const updated = await RecruiterService.updateRecruiterProfile(userId, validatedInput);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/recruiter/candidates
   */
  public static async searchCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = candidateSearchQuerySchema.parse(req.query);
      const searchResult = await RecruiterService.searchCandidates(validatedQuery);

      res.status(200).json({
        success: true,
        data: searchResult,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/recruiter/candidates/:studentId
   */
  public static async getCandidateSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawId = req.params.studentId;
      const studentId = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
        throw new BadRequestError('Candidate ID is required');
      }

      const summary = await RecruiterService.getCandidateEvidenceSummary(studentId.trim());

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}
