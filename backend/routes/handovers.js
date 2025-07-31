const express = require('express');
const { body, validationResult } = require('express-validator');

const db = require('../config/database');
const { authenticateToken, authorizeHandoverAccess } = require('../middleware/auth');
const { asyncHandler, formatValidationErrors } = require('../middleware/errorMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// All handover routes require authentication
router.use(authenticateToken);

// GET /api/handovers - Get handovers (filtered by user role)
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role.toLowerCase();
  const { status, limit = 20, offset = 0 } = req.query;

  let baseQuery = '';
  let params = [];
  let paramIndex = 1;

  // Build query based on user role
  if (userRole === 'admin') {
    // Admins can see all handovers
    baseQuery = `
      SELECT h.*, 
             emp.name as employee_name, emp.email as employee_email, emp.role as employee_role,
             mgr.name as manager_name, mgr.email as manager_email,
             COUNT(ht.id) as total_tasks,
             COUNT(CASE WHEN ht.is_completed = true THEN 1 END) as completed_tasks
      FROM handovers h
      JOIN users emp ON h.employee_id = emp.id
      LEFT JOIN users mgr ON h.manager_id = mgr.id
      LEFT JOIN handover_tasks ht ON h.id = ht.handover_id
    `;
  } else {
    // Regular users can only see their own handovers (as employee or manager)
    baseQuery = `
      SELECT h.*, 
             emp.name as employee_name, emp.email as employee_email, emp.role as employee_role,
             mgr.name as manager_name, mgr.email as manager_email,
             COUNT(ht.id) as total_tasks,
             COUNT(CASE WHEN ht.is_completed = true THEN 1 END) as completed_tasks
      FROM handovers h
      JOIN users emp ON h.employee_id = emp.id
      LEFT JOIN users mgr ON h.manager_id = mgr.id
      LEFT JOIN handover_tasks ht ON h.id = ht.handover_id
      WHERE (h.employee_id = $${paramIndex} OR h.manager_id = $${paramIndex})
    `;
    params.push(userId);
    paramIndex++;
  }

  // Add status filter if provided
  if (status) {
    if (userRole === 'admin') {
      baseQuery += ` WHERE h.status = $${paramIndex}`;
    } else {
      baseQuery += ` AND h.status = $${paramIndex}`;
    }
    params.push(status);
    paramIndex++;
  }

  // Complete the query
  baseQuery += `
    GROUP BY h.id, emp.name, emp.email, emp.role, mgr.name, mgr.email
    ORDER BY h.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(parseInt(limit), parseInt(offset));

  const handovers = await db.query(baseQuery, params);

  // Get total count for pagination
  let countQuery = '';
  let countParams = [];
  
  if (userRole === 'admin') {
    countQuery = 'SELECT COUNT(*) as count FROM handovers h';
    if (status) {
      countQuery += ' WHERE status = $1';
      countParams.push(status);
    }
  } else {
    countQuery = 'SELECT COUNT(*) as count FROM handovers h WHERE (employee_id = $1 OR manager_id = $1)';
    countParams.push(userId);
    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }
  }

  const countResult = await db.query(countQuery, countParams);
  const totalCount = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: {
      handovers: handovers.rows.map(handover => ({
        id: handover.id,
        status: handover.status,
        role: handover.role,
        created_at: handover.created_at,
        submitted_at: handover.submitted_at,
        approved_at: handover.approved_at,
        rejected_at: handover.rejected_at,
        employee: {
          id: handover.employee_id,
          name: handover.employee_name,
          email: handover.employee_email,
          role: handover.employee_role
        },
        manager: handover.manager_id ? {
          id: handover.manager_id,
          name: handover.manager_name,
          email: handover.manager_email
        } : null,
        progress: {
          total: parseInt(handover.total_tasks) || 0,
          completed: parseInt(handover.completed_tasks) || 0,
          percentage: handover.total_tasks > 0 ? 
            Math.round((handover.completed_tasks / handover.total_tasks) * 100) : 0
        }
      })),
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    }
  });
}));

// GET /api/handovers/:id - Get specific handover (with authorization check)
router.get('/:id', authorizeHandoverAccess, asyncHandler(async (req, res) => {
  const handoverId = req.params.id;
  
  // handover is already loaded by authorizeHandoverAccess middleware
  const handover = req.handover;

  // Get employee and manager details
  const employee = await db.findOne('users', 'id = $1', [handover.employee_id]);
  const manager = handover.manager_id ? 
    await db.findOne('users', 'id = $1', [handover.manager_id]) : null;

  // Get template details
  const template = await db.findOne('templates', 'id = $1', [handover.template_id]);

  // Get tasks
  const tasks = await db.findMany(
    'handover_tasks',
    'handover_id = $1',
    [handoverId],
    'task_order ASC'
  );

  // Get approval history
  const approvalHistory = await db.findMany(
    'handover_approvals',
    'handover_id = $1',
    [handoverId],
    'created_at DESC'
  );

  // Calculate progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.is_completed).length;
  const requiredTasks = tasks.filter(task => task.is_required);
  const completedRequiredTasks = requiredTasks.filter(task => task.is_completed).length;

  res.json({
    success: true,
    data: {
      handover: {
        id: handover.id,
        status: handover.status,
        role: handover.role,
        created_at: handover.created_at,
        submitted_at: handover.submitted_at,
        approved_at: handover.approved_at,
        rejected_at: handover.rejected_at,
        manager_notes: handover.manager_notes,
        form_data: JSON.parse(handover.form_data || '{}'),
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          department: employee.department
        },
        manager: manager ? {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          role: manager.role,
          department: manager.department
        } : null,
        template: template ? {
          id: template.id,
          target_role: template.target_role,
          sections: template.sections ? JSON.parse(template.sections) : []
        } : null
      },
      tasks: tasks.map(task => ({
        id: task.id,
        description: task.description,
        is_required: task.is_required,
        is_completed: task.is_completed,
        file_path: task.file_path,
        notes: task.notes,
        completed_at: task.completed_at,
        task_order: task.task_order
      })),
      progress: {
        total: totalTasks,
        completed: completedTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        required: {
          total: requiredTasks.length,
          completed: completedRequiredTasks,
          percentage: requiredTasks.length > 0 ? 
            Math.round((completedRequiredTasks / requiredTasks.length) * 100) : 0
        }
      },
      approvalHistory: approvalHistory.map(approval => ({
        id: approval.id,
        action: approval.action,
        notes: approval.notes,
        created_at: approval.created_at,
        manager_id: approval.manager_id
      }))
    }
  });
}));

// POST /api/handovers/:id/tasks - Add custom task to handover
router.post('/:id/tasks', authorizeHandoverAccess, [
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Task description is required and must be less than 500 characters'),
  body('is_required')
    .optional()
    .isBoolean()
    .withMessage('is_required must be a boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const handoverId = req.params.id;
  const { description, is_required = false } = req.body;
  const userId = req.user.id;
  const handover = req.handover;

  // Only allow adding tasks to draft handovers
  if (handover.status !== 'draft') {
    return res.status(400).json({
      success: false,
      error: 'Can only add tasks to draft handovers'
    });
  }

  // Only employee or admin can add tasks
  const userRole = req.user.role.toLowerCase();
  if (userRole !== 'admin' && handover.employee_id !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Only the employee can add custom tasks'
    });
  }

  // Get next task order
  const maxOrderResult = await db.query(
    'SELECT MAX(task_order) as max_order FROM handover_tasks WHERE handover_id = $1',
    [handoverId]
  );
  const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

  // Create task
  const newTask = await db.insert('handover_tasks', {
    handover_id: handoverId,
    description,
    is_required,
    task_order: nextOrder,
    is_completed: false
  });

  logger.logHandover('custom_task_added', handoverId, userId, { 
    task_id: newTask.id,
    is_required 
  });

  res.status(201).json({
    success: true,
    data: {
      task: {
        id: newTask.id,
        description: newTask.description,
        is_required: newTask.is_required,
        is_completed: newTask.is_completed,
        file_path: newTask.file_path,
        notes: newTask.notes,
        completed_at: newTask.completed_at,
        task_order: newTask.task_order
      }
    }
  });
}));

// PUT /api/handovers/:id/tasks/:taskId - Update task
router.put('/:id/tasks/:taskId', authorizeHandoverAccess, [
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Task description must be less than 500 characters'),
  body('is_required')
    .optional()
    .isBoolean()
    .withMessage('is_required must be a boolean'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  body('file_path')
    .optional()
    .isString()
    .withMessage('File path must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const handoverId = req.params.id;
  const taskId = req.params.taskId;
  const { description, is_required, notes, file_path } = req.body;
  const userId = req.user.id;
  const handover = req.handover;

  // Get task and verify it belongs to this handover
  const task = await db.findOne(
    'handover_tasks',
    'id = $1 AND handover_id = $2',
    [taskId, handoverId]
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  // Only allow updating tasks in draft handovers
  if (handover.status !== 'draft') {
    return res.status(400).json({
      success: false,
      error: 'Can only update tasks in draft handovers'
    });
  }

  // Only employee or admin can update tasks
  const userRole = req.user.role.toLowerCase();
  if (userRole !== 'admin' && handover.employee_id !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Only the employee can update tasks'
    });
  }

  // Prepare update data
  const updateData = {};
  if (description !== undefined) updateData.description = description;
  if (is_required !== undefined) updateData.is_required = is_required;
  if (notes !== undefined) updateData.notes = notes;
  if (file_path !== undefined) updateData.file_path = file_path;

  // Update task
  const updatedTask = await db.update(
    'handover_tasks',
    updateData,
    'id = $1',
    [taskId]
  );

  logger.logHandover('task_updated', handoverId, userId, { 
    task_id: taskId,
    changes: Object.keys(updateData) 
  });

  res.json({
    success: true,
    data: {
      task: {
        id: updatedTask.id,
        description: updatedTask.description,
        is_required: updatedTask.is_required,
        is_completed: updatedTask.is_completed,
        file_path: updatedTask.file_path,
        notes: updatedTask.notes,
        completed_at: updatedTask.completed_at,
        task_order: updatedTask.task_order
      }
    }
  });
}));

// DELETE /api/handovers/:id/tasks/:taskId - Delete custom task
router.delete('/:id/tasks/:taskId', authorizeHandoverAccess, asyncHandler(async (req, res) => {
  const handoverId = req.params.id;
  const taskId = req.params.taskId;
  const userId = req.user.id;
  const handover = req.handover;

  // Get task and verify it belongs to this handover
  const task = await db.findOne(
    'handover_tasks',
    'id = $1 AND handover_id = $2',
    [taskId, handoverId]
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  // Only allow deleting tasks from draft handovers
  if (handover.status !== 'draft') {
    return res.status(400).json({
      success: false,
      error: 'Can only delete tasks from draft handovers'
    });
  }

  // Only employee or admin can delete tasks
  const userRole = req.user.role.toLowerCase();
  if (userRole !== 'admin' && handover.employee_id !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Only the employee can delete tasks'
    });
  }

  // Delete task
  await db.delete('handover_tasks', 'id = $1', [taskId]);

  logger.logHandover('task_deleted', handoverId, userId, { 
    task_id: taskId,
    description: task.description 
  });

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// GET /api/handovers/statistics - Get handover statistics (admin only or own stats)
router.get('/statistics', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role.toLowerCase();

  let conditions = '';
  let params = [];

  // Non-admin users can only see their own statistics
  if (userRole !== 'admin') {
    conditions = 'WHERE (employee_id = $1 OR manager_id = $1)';
    params.push(userId);
  }

  // Get overall statistics
  const overallStats = await db.query(
    `SELECT 
       COUNT(*) as total_handovers,
       COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
       COUNT(CASE WHEN status = 'pending_review' THEN 1 END) as pending_count,
       COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
       COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
       AVG(CASE WHEN approved_at IS NOT NULL THEN 
         EXTRACT(EPOCH FROM (approved_at - created_at))/86400 
       END) as avg_approval_days
     FROM handovers ${conditions}`,
    params
  );

  // Get statistics by role
  const roleStats = await db.query(
    `SELECT 
       role,
       COUNT(*) as handover_count,
       COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
       AVG(CASE WHEN approved_at IS NOT NULL THEN 
         EXTRACT(EPOCH FROM (approved_at - created_at))/86400 
       END) as avg_approval_days
     FROM handovers 
     ${conditions}
     GROUP BY role
     ORDER BY handover_count DESC`,
    params
  );

  // Get monthly statistics for the last 12 months
  const monthlyStats = await db.query(
    `SELECT 
       DATE_TRUNC('month', created_at) as month,
       COUNT(*) as handovers_created,
       COUNT(CASE WHEN status = 'approved' THEN 1 END) as handovers_approved
     FROM handovers 
     ${conditions}
     ${conditions ? 'AND' : 'WHERE'} created_at >= NOW() - INTERVAL '12 months'
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY month DESC`,
    params
  );

  res.json({
    success: true,
    data: {
      overall: overallStats.rows[0] ? {
        total: parseInt(overallStats.rows[0].total_handovers),
        draft: parseInt(overallStats.rows[0].draft_count),
        pending: parseInt(overallStats.rows[0].pending_count),
        approved: parseInt(overallStats.rows[0].approved_count),
        rejected: parseInt(overallStats.rows[0].rejected_count),
        avgApprovalDays: overallStats.rows[0].avg_approval_days ? 
          parseFloat(overallStats.rows[0].avg_approval_days).toFixed(1) : null
      } : { total: 0, draft: 0, pending: 0, approved: 0, rejected: 0, avgApprovalDays: null },
      byRole: roleStats.rows.map(stat => ({
        role: stat.role,
        handoverCount: parseInt(stat.handover_count),
        approvedCount: parseInt(stat.approved_count),
        approvalRate: stat.handover_count > 0 ? 
          Math.round((stat.approved_count / stat.handover_count) * 100) : 0,
        avgApprovalDays: stat.avg_approval_days ? 
          parseFloat(stat.avg_approval_days).toFixed(1) : null
      })),
      monthly: monthlyStats.rows.map(stat => ({
        month: stat.month,
        created: parseInt(stat.handovers_created),
        approved: parseInt(stat.handovers_approved)
      }))
    }
  });
}));

module.exports = router;