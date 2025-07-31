const logger = require('../utils/logger');

// 404 handler - must be placed after all routes
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Global error handler - must be placed after notFound
const errorHandler = (err, req, res, next) => {
  // Default to 500 server error
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log the error
  logger.logError(err, req);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Referenced resource does not exist';
  }

  if (err.code === '23502') { // PostgreSQL not null violation
    statusCode = 400;
    message = 'Required field missing';
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    success: false,
    error: message,
    ...(isDevelopment && {
      stack: err.stack,
      details: err
    })
  };

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper - wrap async route handlers to catch errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  return errors.array().map(error => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value
  }));
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  formatValidationErrors
};