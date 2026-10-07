import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../shared/errors.js';
import { UserRole } from '../models/user.model.js';
import { AuthenticatedUser } from '../types/express.js';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication required. Missing Bearer token.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error: any) {
    console.error('Auth verification error:', error?.name, error?.message);
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Access token has expired.'));
    }
    return next(new UnauthorizedError(`Invalid access token: ${error?.message || 'Verification failed'}`));
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Allowed roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
};
