const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const db = require('../config/database');
const { generateToken, hashPassword, comparePassword, authenticateToken } = require('../middleware/auth');
const { asyncHandler, formatValidationErrors } = require('../middleware/errorMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Role is required'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters')
];

// POST /api/auth/login
router.post('/login', authLimiter, loginValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await db.findOne('users', 'email = $1 AND is_active = true', [email]);
  
  if (!user) {
    logger.logAuth('login_failed', null, false, { email, reason: 'user_not_found' });
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  // Check password
  const isValidPassword = await comparePassword(password, user.password_hash);
  
  if (!isValidPassword) {
    logger.logAuth('login_failed', user.id, false, { reason: 'invalid_password' });
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  // Generate JWT token
  const token = generateToken(user);

  // Log successful login
  logger.logAuth('login_success', user.id, true);

  // Return user data and token
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        manager_id: user.manager_id
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  });
}));

// POST /api/auth/register
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const { email, password, name, role, department, manager_id } = req.body;

  // Check if user already exists
  const existingUser = await db.findOne('users', 'email = $1', [email]);
  
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'User with this email already exists'
    });
  }

  // Validate manager_id if provided
  if (manager_id) {
    const manager = await db.findOne('users', 'id = $1 AND is_active = true', [manager_id]);
    if (!manager) {
      return res.status(400).json({
        success: false,
        error: 'Invalid manager ID'
      });
    }
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Create user
  const newUser = await db.insert('users', {
    email,
    password_hash,
    name,
    role,
    department: department || null,
    manager_id: manager_id || null
  });

  // Generate JWT token
  const token = generateToken(newUser);

  // Log successful registration
  logger.logAuth('register_success', newUser.id, true);

  // Return user data and token (without password hash)
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        manager_id: newUser.manager_id
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  });
}));

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  // Get fresh user data from database
  const user = await db.findOne('users', 'id = $1 AND is_active = true', [req.user.id]);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        manager_id: user.manager_id,
        created_at: user.created_at
      }
    }
  });
}));

// POST /api/auth/logout
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // Note: With JWT, we can't truly "logout" server-side without a blacklist
  // The client should delete the token from storage
  
  logger.logAuth('logout', req.user.id, true);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .isLength({ min: 1 })
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Get user with password hash
  const user = await db.findOne('users', 'id = $1', [userId]);
  
  // Verify current password
  const isValidPassword = await comparePassword(currentPassword, user.password_hash);
  
  if (!isValidPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  await db.update('users', 
    { password_hash: newPasswordHash }, 
    'id = $1', 
    [userId]
  );

  logger.logAuth('password_changed', userId, true);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

module.exports = router;