/**
 * Request validation middleware
 * Validates incoming request data
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationError as CustomValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export function validateRequest<T>(
  validationFn: (data: any) => T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validationFn(req.body);
      (req as any).validatedData = validatedData;
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation failed';
      logger.warn('Validation error', { path: req.path, message });
      throw new CustomValidationError(message);
    }
  };
}

export function validateQuery<T>(
  validationFn: (data: any) => T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validationFn(req.query);
      (req as any).validatedQuery = validatedData;
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Query validation failed';
      logger.warn('Query validation error', { path: req.path, message });
      throw new CustomValidationError(message);
    }
  };
}

export function validateParams<T>(
  validationFn: (data: any) => T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = validationFn(req.params);
      (req as any).validatedParams = validatedData;
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Params validation failed';
      logger.warn('Params validation error', { path: req.path, message });
      throw new CustomValidationError(message);
    }
  };
}
