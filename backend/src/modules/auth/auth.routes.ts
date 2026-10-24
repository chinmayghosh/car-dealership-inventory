import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { AuthController } from './auth.controller';
import { loginSchema, registerSchema } from './auth.schemas';

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post('/register', validate(registerSchema), controller.register);
  router.post('/login', validate(loginSchema), controller.login);
  return router;
}
