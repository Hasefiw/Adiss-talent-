/**
 * Error handling middleware
 * Catches and formats all errors in a consistent way
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, InternalServerError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timestamp = new Date().toISOString();

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      status: 'error',
      code: err.code || 'UNKNOWN_ERROR',
      message: err.message,
      ...(err.details && { details: err.details }),
      timestamp,
    };

    logger.warn(`AppError: ${err.code}`, {
      method: req.method,
      path: req.path,
      statusCode: err.statusCode,
      message: err.message,
    });

    return res.status(err.statusCode).json(response);
  }

  // Handle unexpected errors
  const internalError = new InternalServerError(
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  );

  logger.error('Unexpected error', err);

  const response: ErrorResponse = {
    status: 'error',
    code: internalError.code || 'INTERNAL_SERVER_ERROR',
    message: internalError.message,
    timestamp,
  };

  res.status(internalError.statusCode).json(response);
}

// Wrapper to handle async route errors
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
