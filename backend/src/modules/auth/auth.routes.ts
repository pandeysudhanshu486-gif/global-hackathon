import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  AuthController.refresh
);

router.get(
  '/me',
  authenticate,
  AuthController.me
);

export const authRouter = router;
