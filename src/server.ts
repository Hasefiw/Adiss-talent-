/**
 * Main application server
 * Production-ready Express setup with all routes, middleware, and error handling
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './utils/env';
import { logger } from './utils/logger';
import { errorHandler, asyncHandler } from './middleware/errorHandler';
import { corsMiddleware, securityHeaders, requestLogger } from './middleware/cors';
import { generalLimiter } from './middleware/rateLimiter';
import { checkHealth } from './db/health';

// Import routes
import actorsRouter from './routes/actors';
import castingCallsRouter from './routes/castingCalls';
import applicationsRouter from './routes/applications';
import aiRouter from './routes/ai';
import paymentsRouter from './routes/payments';

const app: Express = express();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Request parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging
app.use(requestLogger);

// Security Headers
app.use(securityHeaders);

// CORS
app.use(corsMiddleware);

// General Rate Limiting
app.use(generalLimiter.middleware());

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get(
  '/health',
  asyncHandler(async (req: Request, res: Response) => {
    const health = await checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  })
);

// ============================================================================
// API ROUTES
// ============================================================================

app.use('/api/actors', actorsRouter);
app.use('/api/casting-calls', castingCallsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/payments', paymentsRouter);

// ============================================================================
// ROOT ENDPOINT
// ============================================================================

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Addis Talent API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    status: 'running',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      actors: '/api/actors',
      castingCalls: '/api/casting-calls',
      applications: '/api/applications',
      ai: '/api/ai',
      payments: '/api/payments',
    },
  });
});

// ============================================================================
// 404 HANDLER
// ============================================================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE (MUST BE LAST)
// ============================================================================

app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = env.PORT;
const server = app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: env.NODE_ENV,
    url: `http://localhost:${PORT}`,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
