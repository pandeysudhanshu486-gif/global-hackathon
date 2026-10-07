import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { UnprocessableEntityError } from '../shared/errors.js';

export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        const parsedQuery = await schema.query.parseAsync(req.query);
        try {
          req.query = parsedQuery as any;
        } catch {
          Object.defineProperty(req, 'query', {
            value: parsedQuery,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        }
      }
      if (schema.params) {
        const parsedParams = await schema.params.parseAsync(req.params);
        try {
          req.params = parsedParams as any;
        } catch {
          Object.defineProperty(req, 'params', {
            value: parsedParams,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        }
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        next(new UnprocessableEntityError('Request validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
