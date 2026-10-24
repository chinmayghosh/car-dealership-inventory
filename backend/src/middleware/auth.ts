import { RequestHandler } from 'express';
import { HttpError } from '../errors/HttpError';
import { Role, verifyToken } from '../utils/jwt';

export interface AuthUser {
  id: string;
  role: Role;
}

/**
 * Requires a valid `Authorization: Bearer <jwt>` header and exposes the
 * caller as `res.locals.user`.
 */
export const authenticate: RequestHandler = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(HttpError.unauthorized());
  }

  try {
    const payload = verifyToken(token);
    const user: AuthUser = { id: payload.sub, role: payload.role };
    res.locals.user = user;
    next();
  } catch {
    next(HttpError.unauthorized('Invalid or expired token'));
  }
};

/** Must run after `authenticate`. Allows only users with the ADMIN role. */
export const requireAdmin: RequestHandler = (_req, res, next) => {
  const user = res.locals.user as AuthUser | undefined;
  if (user?.role !== 'ADMIN') {
    return next(HttpError.forbidden('Admin access required'));
  }
  next();
};
