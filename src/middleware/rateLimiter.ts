/**
 * Rate limiting middleware to prevent API abuse
 * Especially important for expensive AI endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '../utils/errors';
import { logger } from '../utils/logger';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  private getKey(req: Request): string {
    return `${req.ip || req.socket.remoteAddress}:${req.path}`;
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      this.cleanup();

      const key = this.getKey(req);
      const now = Date.now();

      if (!this.store[key]) {
        this.store[key] = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        return next();
      }

      const record = this.store[key];

      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + this.windowMs;
        return next();
      }

      record.count++;

      if (record.count > this.maxRequests) {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          count: record.count,
        });
        const error = new Error('Too many requests');
        (error as any).statusCode = 429;
        return next(error);
      }

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', this.maxRequests - record.count);
      res.setHeader('X-RateLimit-Reset', record.resetTime);

      next();
    };
  }
}

// Create rate limiters for different endpoints
export const generalLimiter = new RateLimiter(60000, 100); // 100 requests per minute
export const aiLimiter = new RateLimiter(60000, 10); // 10 AI requests per minute
export const authLimiter = new RateLimiter(60000, 5); // 5 auth attempts per minute

class TooManyRequestsError extends Error {
  statusCode = 429;
  code = 'TOO_MANY_REQUESTS';
  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'TooManyRequestsError';
  }
}
