const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ' ' + JSON.stringify(meta);
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'handover-system' },
  transports: [
    // Write all logs to file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Helper functions for structured logging
logger.logRequest = (req, res, duration) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    statusCode: res.statusCode,
    duration: duration
  });
};

logger.logError = (error, req = null) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    url: req?.originalUrl,
    method: req?.method,
    userId: req?.user?.id,
    ip: req?.ip
  });
};

logger.logAuth = (action, userId, success, details = {}) => {
  logger.info('Authentication Event', {
    action,
    userId,
    success,
    ...details
  });
};

logger.logHandover = (action, handoverId, userId, details = {}) => {
  logger.info('Handover Event', {
    action,
    handoverId,
    userId,
    ...details
  });
};

module.exports = logger;