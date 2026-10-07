import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors.js';
import { logger } from '../shared/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError || err.name === 'ZodError') {
    res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: (err as any).errors || (err as any).issues || [],
      },
    });
    return;
  }

  // Unhandled / Unexpected error
  logger.error('Unhandled server error:', err);

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal Server Error',
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
