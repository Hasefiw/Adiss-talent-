/**
 * Environment variable validation
 * Ensures all required environment variables are set at startup
 */

import { logger } from './logger';

interface EnvConfig {
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
  DATABASE_URL: string;
  GEMINI_API_KEY: string;
  APP_URL: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  ALLOWED_ORIGINS: string[];
}

function validateEnv(): EnvConfig {
  const required = [
    'DATABASE_URL',
    'GEMINI_API_KEY',
    'APP_URL',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const config: EnvConfig = {
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    DATABASE_URL: process.env.DATABASE_URL!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    APP_URL: process.env.APP_URL!,
    LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d',
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  };

  // Validate PORT is a valid number
  if (isNaN(config.PORT) || config.PORT <= 0 || config.PORT > 65535) {
    logger.error('PORT must be a valid number between 1 and 65535');
    process.exit(1);
  }

  logger.info('Environment configuration validated', {
    env: config.NODE_ENV,
    port: config.PORT,
  });

  return config;
}

export const env = validateEnv();
export default env;
