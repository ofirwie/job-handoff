const express = require('express');
const { body, validationResult } = require('express-validator');

const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { asyncHandler, formatValidationErrors } = require('../middleware/errorMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// All manager routes require authentication and manager role
router.use(authenticateToken);
router.use(requireRole(['manager', 'admin']));

// GET /api/manager/dashboard - Get manager dashboard data
router.get('/dashboard', asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  // Get pending handovers for review
  const pendingHandovers = await db.query(
    `SELECT h.*, u.name as employee_name, u.role as employee_role, u.department,
            COUNT(ht.id) as total_tasks,
            COUNT(CASE WHEN ht.is_completed = true THEN 1 END) as completed_tasks
     FROM handovers h
     JOIN users u ON h.employee_id = u.id
     LEFT JOIN handover_tasks ht ON h.id = ht.handover_id
     WHERE h.manager_id = $1 AND h.status = $2
     GROUP BY h.id, u.name, u.role, u.department
     ORDER BY h.submitted_at DESC`,
    [managerId, 'pending_review']
  );

  // Get recent completed handovers
  const recentCompleted = await db.query(
    `SELECT h.*, u.name as employee_name, u.role as employee_role
     FROM handovers h
     JOIN users u ON h.employee_id = u.id
     WHERE h.manager_id = $1 AND h.status IN ($2, $3)
     ORDER BY h.updated_at DESC
     LIMIT 10`,
    [managerId, 'approved', 'rejected']
  );

  // Get team statistics
  const teamStats = await db.query(
    `SELECT 
       COUNT(*) as total_handovers,
       COUNT(CASE WHEN status = 'pending_review' THEN 1 END) as pending_count,
       COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
       COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
       COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count
     FROM handovers 
     WHERE manager_id = $1`,
    [managerId]
  );

  res.json({
    success: true,
    data: {
      manager: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        department: req.user.department
      },
      pendingHandovers: pendingHandovers.rows.map(handover => ({
        id: handover.id,
        employee_name: handover.employee_name,
        employee_role: handover.employee_role,
        department: handover.department,
        status: handover.status,
        submitted_at: handover.submitted_at,
        created_at: handover.created_at,
        progress: {
          total: parseInt(handover.total_tasks),
          completed: parseInt(handover.completed_tasks),
          percentage: handover.total_tasks > 0 ? 
            Math.round((handover.completed_tasks / handover.total_tasks) * 100) : 0
        }
      })),
      recentCompleted: recentCompleted.rows.map(handover => ({
        id: handover.id,
        employee_name: handover.employee_name,
        employee_role: handover.employee_role,
        status: handover.status,
        updated_at: handover.updated_at,
        approved_at: handover.approved_at,
        rejected_at: handover.rejected_at
      })),
      statistics: teamStats.rows[0] ? {
        total: parseInt(teamStats.rows[0].total_handovers),
        pending: parseInt(teamStats.rows[0].pending_count),
        approved: parseInt(teamStats.rows[0].approved_count),
        rejected: parseInt(teamStats.rows[0].rejected_count),
        draft: parseInt(teamStats.rows[0].draft_count)
      } : {
        total: 0, pending: 0, approved: 0, rejected: 0, draft: 0
      }
    }
  });
}));

// GET /api/manager/handovers/:handoverId - Get handover details for review
router.get('/handovers/:handoverId', asyncHandler(async (req, res) => {
  const handoverId = req.params.handoverId;
  const managerId = req.user.id;

  // Get handover with employee details
  const handover = await db.query(
    `SELECT h.*, u.name as employee_name, u.email as employee_email, 
            u.role as employee_role, u.department as employee_department,
            t.target_role as template_role, t.sections as template_sections
     FROM handovers h
     JOIN users u ON h.employee_id = u.id
     LEFT JOIN templates t ON h.template_id = t.id
     WHERE h.id = $1 AND h.manager_id = $2`,
    [handoverId, managerId]
  );

  if (handover.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Handover not found or access denied'
    });
  }

  const handoverData = handover.rows[0];

  // Get tasks
  const tasks = await db.findMany(
    'handover_tasks',
    'handover_id = $1',
    [handoverId],
    'task_order ASC'
  );

  // Get approval history if exists
  const approvalHistory = await db.findMany(
    'handover_approvals',
    'handover_id = $1',
    [handoverId],
    'created_at DESC'
  );

  // Calculate task progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.is_completed).length;
  const requiredTasks = tasks.filter(task => task.is_required);
  const completedRequiredTasks = requiredTasks.filter(task => task.is_completed).length;

  res.json({
    success: true,
    data: {
      handover: {
        id: handoverData.id,
        status: handoverData.status,
        role: handoverData.role,
        created_at: handoverData.created_at,
        submitted_at: handoverData.submitted_at,
        approved_at: handoverData.approved_at,
        rejected_at: handoverData.rejected_at,
        manager_notes: handoverData.manager_notes,
        form_data: JSON.parse(handoverData.form_data || '{}'),
        employee: {
          id: handoverData.employee_id,
          name: handoverData.employee_name,
          email: handoverData.employee_email,
          role: handoverData.employee_role,
          department: handoverData.employee_department
        },
        template: {
          role: handoverData.template_role,
          sections: handoverData.template_sections
        }
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
        created_at: approval.created_at
      }))
    }
  });
}));

// POST /api/manager/handovers/:handoverId/approve - Approve handover
router.post('/handovers/:handoverId/approve', [
  body('notes').optional().isString().withMessage('Notes must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const handoverId = req.params.handoverId;
  const { notes } = req.body;
  const managerId = req.user.id;

  // Get handover and verify it's pending review
  const handover = await db.findOne(
    'handovers',
    'id = $1 AND manager_id = $2 AND status = $3',
    [handoverId, managerId, 'pending_review']
  );

  if (!handover) {
    return res.status(404).json({
      success: false,
      error: 'Handover not found or not available for approval'
    });
  }

  // Update handover in transaction
  const result = await db.transaction(async (client) => {
    // Update handover status
    const updatedHandover = await client.query(
      `UPDATE handovers 
       SET status = $1, approved_at = NOW(), manager_notes = $2, updated_at = NOW()
       WHERE id = $3 
       RETURNING *`,
      ['approved', notes || null, handoverId]
    );

    // Create approval record
    await client.query(
      `INSERT INTO handover_approvals (handover_id, manager_id, action, notes)
       VALUES ($1, $2, $3, $4)`,
      [handoverId, managerId, 'approved', notes || null]
    );

    return updatedHandover.rows[0];
  });

  logger.logHandover('handover_approved', handoverId, managerId, { 
    employee_id: handover.employee_id,
    has_notes: !!notes 
  });

  res.json({
    success: true,
    data: {
      handover: {
        id: result.id,
        status: result.status,
        approved_at: result.approved_at,
        manager_notes: result.manager_notes
      }
    }
  });
}));

// POST /api/manager/handovers/:handoverId/reject - Reject handover
router.post('/handovers/:handoverId/reject', [
  body('notes').notEmpty().withMessage('Rejection reason is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const handoverId = req.params.handoverId;
  const { notes } = req.body;
  const managerId = req.user.id;

  // Get handover and verify it's pending review
  const handover = await db.findOne(
    'handovers',
    'id = $1 AND manager_id = $2 AND status = $3',
    [handoverId, managerId, 'pending_review']
  );

  if (!handover) {
    return res.status(404).json({
      success: false,
      error: 'Handover not found or not available for rejection'
    });
  }

  // Update handover in transaction
  const result = await db.transaction(async (client) => {
    // Update handover status (return to draft for revision)
    const updatedHandover = await client.query(
      `UPDATE handovers 
       SET status = $1, rejected_at = NOW(), manager_notes = $2, updated_at = NOW()
       WHERE id = $3 
       RETURNING *`,
      ['draft', notes, handoverId] // Return to draft for employee to revise
    );

    // Create approval record
    await client.query(
      `INSERT INTO handover_approvals (handover_id, manager_id, action, notes)
       VALUES ($1, $2, $3, $4)`,
      [handoverId, managerId, 'rejected', notes]
    );

    return updatedHandover.rows[0];
  });

  logger.logHandover('handover_rejected', handoverId, managerId, { 
    employee_id: handover.employee_id,
    reason: notes 
  });

  res.json({
    success: true,
    data: {
      handover: {
        id: result.id,
        status: result.status,
        rejected_at: result.rejected_at,
        manager_notes: result.manager_notes
      }
    }
  });
}));

// GET /api/manager/team - Get team members and their handover status
router.get('/team', asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  // Get team members with their latest handover status
  const teamMembers = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.department, u.created_at,
            h.id as handover_id, h.status as handover_status, 
            h.created_at as handover_created_at, h.submitted_at,
            COUNT(ht.id) as total_tasks,
            COUNT(CASE WHEN ht.is_completed = true THEN 1 END) as completed_tasks
     FROM users u
     LEFT JOIN handovers h ON u.id = h.employee_id 
       AND h.id = (SELECT id FROM handovers WHERE employee_id = u.id ORDER BY created_at DESC LIMIT 1)
     LEFT JOIN handover_tasks ht ON h.id = ht.handover_id
     WHERE u.manager_id = $1 AND u.is_active = true
     GROUP BY u.id, u.name, u.email, u.role, u.department, u.created_at,
              h.id, h.status, h.created_at, h.submitted_at
     ORDER BY u.name ASC`,
    [managerId]
  );

  res.json({
    success: true,
    data: {
      teamMembers: teamMembers.rows.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department,
        created_at: member.created_at,
        handover: member.handover_id ? {
          id: member.handover_id,
          status: member.handover_status,
          created_at: member.handover_created_at,
          submitted_at: member.submitted_at,
          progress: {
            total: parseInt(member.total_tasks) || 0,
            completed: parseInt(member.completed_tasks) || 0,
            percentage: member.total_tasks > 0 ? 
              Math.round((member.completed_tasks / member.total_tasks) * 100) : 0
          }
        } : null
      })),
      summary: {
        totalMembers: teamMembers.rows.length,
        withHandovers: teamMembers.rows.filter(m => m.handover_id).length,
        pendingReview: teamMembers.rows.filter(m => m.handover_status === 'pending_review').length,
        inProgress: teamMembers.rows.filter(m => m.handover_status === 'draft').length
      }
    }
  });
}));

// GET /api/manager/handovers - Get all handovers managed by this manager
router.get('/handovers', asyncHandler(async (req, res) => {
  const managerId = req.user.id;
  const { status, limit = 50, offset = 0 } = req.query;

  let conditions = 'manager_id = $1';
  let params = [managerId];

  if (status) {
    conditions += ' AND status = $2';
    params.push(status);
  }

  // Get handovers with employee details
  const handovers = await db.query(
    `SELECT h.*, u.name as employee_name, u.email as employee_email, 
            u.role as employee_role, u.department as employee_department,
            COUNT(ht.id) as total_tasks,
            COUNT(CASE WHEN ht.is_completed = true THEN 1 END) as completed_tasks
     FROM handovers h
     JOIN users u ON h.employee_id = u.id
     LEFT JOIN handover_tasks ht ON h.id = ht.handover_id
     WHERE ${conditions}
     GROUP BY h.id, u.name, u.email, u.role, u.department
     ORDER BY h.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, parseInt(limit), parseInt(offset)]
  );

  // Get total count for pagination
  const totalCount = await db.count('handovers', conditions, params);

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
          role: handover.employee_role,
          department: handover.employee_department
        },
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

// PUT /api/manager/handovers/:handoverId/notes - Update manager notes
router.put('/handovers/:handoverId/notes', [
  body('notes').isString().withMessage('Notes must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const handoverId = req.params.handoverId;
  const { notes } = req.body;
  const managerId = req.user.id;

  // Verify handover ownership
  const handover = await db.findOne(
    'handovers',
    'id = $1 AND manager_id = $2',
    [handoverId, managerId]
  );

  if (!handover) {
    return res.status(404).json({
      success: false,
      error: 'Handover not found or access denied'
    });
  }

  // Update notes
  const updatedHandover = await db.update(
    'handovers',
    { manager_notes: notes },
    'id = $1',
    [handoverId]
  );

  logger.logHandover('manager_notes_updated', handoverId, managerId);

  res.json({
    success: true,
    data: {
      handover: {
        id: updatedHandover.id,
        manager_notes: updatedHandover.manager_notes,
        updated_at: updatedHandover.updated_at
      }
    }
  });
}));

module.exports = router;