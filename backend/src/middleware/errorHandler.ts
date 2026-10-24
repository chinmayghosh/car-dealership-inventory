import { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from '../errors/HttpError';

/** Responds 404 for any route that no router handled. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(HttpError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

/** Converts thrown errors into consistent JSON responses: { message, errors? }. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      message: err.message,
      ...(err.details !== undefined && { errors: err.details }),
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ message: 'Malformed JSON body' });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
