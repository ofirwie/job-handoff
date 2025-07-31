const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data from database
    const user = await db.findOne('users', 'id = $1 AND is_active = true', [decoded.id]);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      manager_id: user.manager_id
    };

    next();
  } catch (error) {
    logger.logAuth('token_verification_failed', null, false, { error: error.message });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    return res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Middleware to check user role
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.role.toLowerCase();
    const allowed = allowedRoles.map(role => role.toLowerCase());

    if (!allowed.includes(userRole) && !allowed.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user can access handover
const authorizeHandoverAccess = async (req, res, next) => {
  try {
    const handoverId = req.params.handoverId || req.params.id;
    const userId = req.user.id;
    
    if (!handoverId) {
      return res.status(400).json({
        success: false,
        error: 'Handover ID required'
      });
    }

    // Get handover details
    const handover = await db.findOne('handovers', 'id = $1', [handoverId]);
    
    if (!handover) {
      return res.status(404).json({
        success: false,
        error: 'Handover not found'
      });
    }

    // Check authorization based on role
    const userRole = req.user.role.toLowerCase();
    let hasAccess = false;

    if (userRole === 'admin') {
      hasAccess = true;
    } else if (handover.employee_id === userId) {
      // Employee can access their own handover
      hasAccess = true;
    } else if (handover.manager_id === userId) {
      // Manager can access their team's handovers
      hasAccess = true;
    } else {
      // Check if user is a manager of the employee
      const employee = await db.findOne('users', 'id = $1', [handover.employee_id]);
      if (employee && employee.manager_id === userId) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this handover'
      });
    }

    // Add handover to request for use in route handler
    req.handover = handover;
    next();
  } catch (error) {
    logger.error('Authorization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization check failed'
    });
  }
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  authenticateToken,
  requireRole,
  authorizeHandoverAccess
};