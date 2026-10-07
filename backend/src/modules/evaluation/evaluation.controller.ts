import { Request, Response, NextFunction } from 'express';
import { EvaluationService } from './evaluation.service.js';
import { UnauthorizedError } from '../../shared/errors.js';

export class EvaluationController {
  public static async evaluateMission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { slug } = req.params;
      const { technicalExplanation } = req.body || {};

      const result = await EvaluationService.evaluateMissionSubmission(
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

  public static async getLatestEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { slug } = req.params;
      const result = await EvaluationService.getStudentLatestEvaluation(req.user.userId, slug as string);

      if (!result) {
        res.status(404).json({
          success: false,
          error: { message: `No evaluation found for mission "${slug}"` },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async listEvaluations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const results = await EvaluationService.listStudentEvaluations(req.user.userId);

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}
