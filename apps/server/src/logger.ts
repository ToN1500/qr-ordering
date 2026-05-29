import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom format to redact sensitive information
const redactFormat = winston.format((info) => {
  const sensitiveKeys = ['token', 'password', 'secret'];
  
  const redactObject = (obj: any): void => {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.keys(obj).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        redactObject(obj[key]);
      }
    });
  };

  // Redact metadata and top-level fields
  redactObject(info);

  // Redact within the message string
  const infoAny = info as any;
  if (typeof infoAny.message === 'string') {
    sensitiveKeys.forEach(sk => {
      // Regex to find sensitive words followed by potential values
      // Matches "token: value", "token = value", "token value"
      const regex = new RegExp(`(${sk})([:\\s=]+)([^\\s,.]+)`, 'gi');
      infoAny.message = infoAny.message.replace(regex, `$1$2[REDACTED]`);
    });
  }

  return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    redactFormat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest })`
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      redactFormat(),
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export default logger;
