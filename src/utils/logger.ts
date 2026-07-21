/**
 * Logger utility for production-ready logging
 * Supports different log levels and structured output
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: string;
}

class Logger {
  private logLevel: LogLevel;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(level: LogLevel = 'info') {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  private formatEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
    };
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.log(JSON.stringify(this.formatEntry('debug', message, data)));
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.log(JSON.stringify(this.formatEntry('info', message, data)));
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(JSON.stringify(this.formatEntry('warn', message, data)));
    }
  }

  error(message: string, error?: Error | any) {
    if (this.shouldLog('error')) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        ...(error && { error: error instanceof Error ? error.message : String(error) }),
      };
      console.error(JSON.stringify(entry));
    }
  }
}

export const logger = new Logger(process.env.LOG_LEVEL as LogLevel || 'info');
export default Logger;
