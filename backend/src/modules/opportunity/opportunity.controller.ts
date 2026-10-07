import { Request, Response, NextFunction } from 'express';
import { OpportunityService } from './opportunity.service.js';

export class OpportunityController {
  /**
   * GET /api/opportunities
   * Public list of youth jobs and apprenticeships
   */
  public static async listPublicOpportunities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, targetRole, search } = req.query as {
        type?: string;
        targetRole?: string;
        search?: string;
      };

      const opportunities = await OpportunityService.listPublicOpportunities({
        type,
        targetRole,
        search,
      });

      res.status(200).json({
        success: true,
        data: opportunities,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/student/opportunities
   * Evidence-aware matching for student
   */
  public static async listStudentOpportunities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { type, targetRole, search } = req.query as {
        type?: string;
        targetRole?: string;
        search?: string;
      };

      const matchedOpportunities = await OpportunityService.listOpportunitiesForStudent(userId, {
        type,
        targetRole,
        search,
      });

      res.status(200).json({
        success: true,
        data: matchedOpportunities,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/student/opportunities/:id/apply
   * 1-Click apply with Proof Passport
   */
  public static async applyToOpportunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params as { id: string };
      const { notes } = (req.body || {}) as { notes?: string };

      const result = await OpportunityService.applyToOpportunity(id, userId, notes);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/recruiter/opportunities
   * Recruiter posts new apprenticeship or entry-level role
   */
  public static async createOpportunity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const opportunity = await OpportunityService.createOpportunity(userId, req.body);

      res.status(201).json({
        success: true,
        data: opportunity,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/recruiter/opportunities
   * Recruiter lists company's posted opportunities with applicant details
   */
  public static async listRecruiterOpportunities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const opportunities = await OpportunityService.listRecruiterOpportunities(userId);

      res.status(200).json({
        success: true,
        data: opportunities,
      });
    } catch (error) {
      next(error);
    }
  }
}
