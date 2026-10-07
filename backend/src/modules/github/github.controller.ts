import { Request, Response, NextFunction } from 'express';
import { GitHubService } from './github.service.js';
import { UnauthorizedError } from '../../shared/errors.js';

export class GitHubController {
  public static async analyzeGitHub(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const { username } = req.body;
      const result = await GitHubService.analyzeUserGitHub(req.user.userId, username);

      res.status(200).json({
        success: true,
        message: `Public GitHub profile for "${username}" analyzed successfully. Supporting evidence records created.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getGitHubSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const summary = await GitHubService.getStudentGitHubSummary(req.user.userId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}
