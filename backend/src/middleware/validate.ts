import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { HttpError } from '../errors/HttpError';

type RequestPart = 'body' | 'query';

/**
 * Validates (and coerces) one part of the request against a Zod schema.
 * The parsed result is stored on `res.locals[part]` so handlers get typed, clean data.
 */
export function validate(schema: ZodSchema, part: RequestPart = 'body'): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[part] ?? {});
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(HttpError.badRequest('Validation failed', errors));
    }
    res.locals[part] = result.data;
    next();
  };
}
