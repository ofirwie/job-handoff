const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const managerRoutes = require('./routes/manager');
const templateRoutes = require('./routes/templates');
const handoverRoutes = require('./routes/handovers');
const complexRoutes = require('./routes/complex-queries');
const existingRoutes = require('./routes/existing-api');

const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/handovers', handoverRoutes);
app.use('/api/complex', complexRoutes);
app.use('/api/existing', existingRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server - listen on all interfaces
const HOST = '0.0.0.0'; // Listen on all network interfaces
app.listen(PORT, HOST, () => {
  logger.info(`Handover System API server running on:`);
  logger.info(`  - http://localhost:${PORT}`);
  logger.info(`  - http://127.0.0.1:${PORT}`);
  logger.info(`  - http://YOUR_IP_ADDRESS:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`CORS Origin: ${process.env.CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;