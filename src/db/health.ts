/**
 * Health check endpoint utilities
 */

import { db } from './index';
import { actors } from './schema';
import { logger } from '../utils/logger';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: {
    connected: boolean;
    responseTime?: number;
  };
  environment: {
    node_env: string;
    port: number;
  };
}

const startTime = Date.now();

export async function checkHealth(): Promise<HealthStatus> {
  const dbStartTime = Date.now();
  let dbConnected = false;
  let dbResponseTime = 0;

  try {
    // Simple query to check DB connectivity
    await db.select().from(actors).limit(1);
    dbConnected = true;
    dbResponseTime = Date.now() - dbStartTime;
  } catch (error) {
    logger.error('Health check: Database connection failed', error);
  }

  const status: HealthStatus = {
    status: dbConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    database: {
      connected: dbConnected,
      ...(dbConnected && { responseTime: dbResponseTime }),
    },
    environment: {
      node_env: process.env.NODE_ENV || 'development',
      port: parseInt(process.env.PORT || '3000', 10),
    },
  };

  return status;
}
