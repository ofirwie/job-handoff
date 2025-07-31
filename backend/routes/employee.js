const express = require('express');
const { body, validationResult } = require('express-validator');

const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, formatValidationErrors } = require('../middleware/errorMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// All employee routes require authentication
router.use(authenticateToken);

// GET /api/employee/welcome - Load template for user's role
router.get('/welcome', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Get active template for user's role
  const template = await db.findOne(
    'templates', 
    'target_role = $1 AND is_active = true', 
    [userRole]
  );

  if (!template) {
    return res.status(404).json({
      success: false,
      error: `No handover template found for role: ${userRole}`
    });
  }

  // Check if user has any pending handovers
  const existingHandover = await db.findOne(
    'handovers',
    'employee_id = $1 AND status IN ($2, $3)',
    [userId, 'draft', 'pending_review']
  );

  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        department: req.user.department
      },
      template: {
        id: template.id,
        role: template.target_role,
        sections: template.sections,
        tasks: template.tasks
      },
      existingHandover: existingHandover ? {
        id: existingHandover.id,
        status: existingHandover.status,
        created_at: existingHandover.created_at
      } : null
    }
  });
}));

// POST /api/employee/handovers/start - Create new handover from template
router.post('/handovers/start', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const managerId = req.user.manager_id;

  if (!managerId) {
    return res.status(400).json({
      success: false,
      error: 'No manager assigned. Please contact HR to assign a manager before starting handover.'
    });
  }

  // Check for existing active handover
  const existingHandover = await db.findOne(
    'handovers',
    'employee_id = $1 AND status IN ($2, $3)',
    [userId, 'draft', 'pending_review']
  );

  if (existingHandover) {
    return res.status(409).json({
      success: false,
      error: 'You already have an active handover in progress',
      handoverId: existingHandover.id
    });
  }

  // Get template for user's role
  const template = await db.findOne(
    'templates',
    'target_role = $1 AND is_active = true',
    [userRole]
  );

  if (!template) {
    return res.status(404).json({
      success: false,
      error: `No handover template found for role: ${userRole}`
    });
  }

  // Create handover in transaction
  const result = await db.transaction(async (client) => {
    // Create handover record
    const handoverResult = await client.query(
      `INSERT INTO handovers (employee_id, manager_id, template_id, role, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, managerId, template.id, userRole, 'draft']
    );
    
    const handover = handoverResult.rows[0];

    // Create tasks from template
    if (template.tasks && template.tasks.length > 0) {
      const taskInserts = template.tasks.map((task, index) => {
        return client.query(
          `INSERT INTO handover_tasks (handover_id, description, is_required, task_order) 
           VALUES ($1, $2, $3, $4)`,
          [handover.id, task.description, task.is_required || false, index + 1]
        );
      });
      
      await Promise.all(taskInserts);
    }

    return handover;
  });

  logger.logHandover('handover_started', result.id, userId, { 
    role: userRole, 
    template_id: template.id 
  });

  res.status(201).json({
    success: true,
    data: {
      handover: {
        id: result.id,
        status: result.status,
        role: result.role,
        created_at: result.created_at
      },
      template: {
        id: template.id,
        sections: template.sections,
        tasks: template.tasks
      }
    }
  });
}));

// GET /api/employee/handovers/:handoverId - Get handover details
router.get('/handovers/:handoverId', asyncHandler(async (req, res) => {
  const handoverId = req.params.handoverId;
  const userId = req.user.id;

  // Get handover (only if user owns it)
  const handover = await db.findOne(
    'handovers',
    'id = $1 AND employee_id = $2',
    [handoverId, userId]
  );

  if (!handover) {
    return res.status(404).json({
      success: false,
      error: 'Handover not found or access denied'
    });
  }

  // Get template
  const template = await db.findOne('templates', 'id = $1', [handover.template_id]);

  // Get tasks
  const tasks = await db.findMany(
    'handover_tasks',
    'handover_id = $1',
    [handoverId],
    'task_order ASC'
  );

  // Get manager info
  const manager = await db.findOne(
    'users',
    'id = $1',
    [handover.manager_id]
  );

  res.json({
    success: true,
    data: {
      handover: {
        ...handover,
        manager_name: manager ? manager.name : 'Unknown'
      },
      template: template ? {
        id: template.id,
        sections: template.sections
      } : null,
      tasks: tasks.map(task => ({
        id: task.id,
        description: task.description,
        is_required: task.is_required,
        is_completed: task.is_completed,
        file_path: task.file_path,
        notes: task.notes,
        completed_at: task.completed_at,
        task_order: task.task_order
      }))
    }
  });
}));

// PUT /api/employee/handovers/:handoverId/step/:stepName - Save form data for a step
router.put('/handovers/:handoverId/step/:stepName', [
  body('data').notEmpty().withMessage('Form data is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const { handoverId, stepName } = req.params;
  const { data } = req.body;
  const userId = req.user.id;

  // Verify handover ownership
  const handover = await db.findOne(
    'handovers',
    'id = $1 AND employee_id = $2 AND status = $3',
    [handoverId, userId, 'draft']
  );

  if (!handover) {
    return res.status(404).json({
      success: false,
      error: 'Handover not found or cannot be modified'
    });
  }

  // Update form data
  const currentFormData = handover.form_data || {};
  currentFormData[stepName] = {
    ...data,
    updated_at: new Date().toISOString()
  };

  const updatedHandover = await db.update(
    'handovers',
    { form_data: JSON.stringify(currentFormData) },
    'id = $1',
    [handoverId]
  );

  logger.logHandover('form_step_saved', handoverId, userId, { 
    step: stepName, 
    data_keys: Object.keys(data) 
  });

  res.json({
    success: true,
    data: {
      handover: {
        id: updatedHandover.id,
        form_data: JSON.parse(updatedHandover.form_data || '{}'),
        updated_at: updatedHandover.updated_at
      }
    }
  });
}));

// GET /api/employee/handovers/:handoverId/tasks - Get handover tasks
router.get('/handovers/:handoverId/tasks', asyncHandler(async (req, res) => {
  const handoverId = req.params.handoverId;
  const userId = req.user.id;

  // Verify handover ownership
  const handover = await db.findOne(
    'handovers',
    'id = $1 AND employee_id = $2',
    [handoverId, userId]
  );

  if (!handover) {
    return res.status(404).json({
      success: false,
      error: 'Handover not found or access denied'
    });
  }

  // Get tasks
  const tasks = await db.findMany(
    'handover_tasks',
    'handover_id = $1',
    [handoverId],
    'task_order ASC'
  );

  // Calculate progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.is_completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.json({
    success: true,
    data: {
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
        percentage: progress
      }
    }
  });
}));

// PUT /api/employee/tasks/:taskId/complete - Mark task as complete
router.put('/tasks/:taskId/complete', [
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('file_path').optional().isString().withMessage('File path must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const taskId = req.params.taskId;
  const { notes, file_path } = req.body;
  const userId = req.user.id;

  // Get task and verify ownership through handover
  const task = await db.query(
    `SELECT ht.*, h.employee_id, h.status as handover_status
     FROM handover_tasks ht
     JOIN handovers h ON ht.handover_id = h.id
     WHERE ht.id = $1`,
    [taskId]
  );

  if (task.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  const taskData = task.rows[0];

  if (taskData.employee_id !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to modify this task'
    });
  }

  if (taskData.handover_status !== 'draft') {
    return res.status(400).json({
      success: false,
      error: 'Cannot modify tasks after handover submission'
    });
  }

  // Update task
  const updatedTask = await db.update(
    'handover_tasks',
    {
      is_completed: true,
      notes: notes || null,
      file_path: file_path || null,
      completed_at: new Date()
    },
    'id = $1',
    [taskId]
  );

  logger.logHandover('task_completed', taskData.handover_id, userId, { 
    task_id: taskId,
    has_file: !!file_path 
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

// PUT /api/employee/tasks/:taskId/uncomplete - Mark task as incomplete
router.put('/tasks/:taskId/uncomplete', asyncHandler(async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user.id;

  // Get task and verify ownership through handover
  const task = await db.query(
    `SELECT ht.*, h.employee_id, h.status as handover_status
     FROM handover_tasks ht
     JOIN handovers h ON ht.handover_id = h.id
     WHERE ht.id = $1`,
    [taskId]
  );

  if (task.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  const taskData = task.rows[0];

  if (taskData.employee_id !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to modify this task'
    });
  }

  if (taskData.handover_status !== 'draft') {
    return res.status(400).json({
      success: false,
      error: 'Cannot modify tasks after handover submission'
    });
  }

  // Update task
  const updatedTask = await db.update(
    'handover_tasks',
    {
      is_completed: false,
      completed_at: null
    },
    'id = $1',
    [taskId]
  );

  logger.logHandover('task_uncompleted', taskData.handover_id, userId, { 
    task_id: taskId 
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

// POST /api/employee/handovers/:handoverId/submit - Submit handover for review
router.post('/handovers/:handoverId/submit', asyncHandler(async (req, res) => {
  const handoverId = req.params.handoverId;
  const userId = req.user.id;

  // Get handover and verify ownership
  const handover = await db.findOne(
    'handovers',
    'id = $1 AND employee_id = $2 AND status = $3',
    [handoverId, userId, 'draft']
  );

  if (!handover) {
    return res.status(404).json({
      success: false,
      error: 'Handover not found or already submitted'
    });
  }

  // Check required tasks
  const requiredTasks = await db.findMany(
    'handover_tasks',
    'handover_id = $1 AND is_required = true AND is_completed = false',
    [handoverId]
  );

  if (requiredTasks.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'All required tasks must be completed before submission',
      incompleteRequiredTasks: requiredTasks.map(task => ({
        id: task.id,
        description: task.description
      }))
    });
  }

  // Update handover status
  const updatedHandover = await db.update(
    'handovers',
    { 
      status: 'pending_review',
      submitted_at: new Date()
    },
    'id = $1',
    [handoverId]
  );

  logger.logHandover('handover_submitted', handoverId, userId);

  res.json({
    success: true,
    data: {
      handover: {
        id: updatedHandover.id,
        status: updatedHandover.status,
        submitted_at: updatedHandover.submitted_at
      }
    }
  });
}));

module.exports = router;