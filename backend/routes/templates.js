const express = require('express');
const { body, validationResult } = require('express-validator');

const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { asyncHandler, formatValidationErrors } = require('../middleware/errorMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// All template routes require authentication
router.use(authenticateToken);

// GET /api/templates - Get all templates (managers and admins can see all, employees see their role)
router.get('/', asyncHandler(async (req, res) => {
  const userRole = req.user.role.toLowerCase();
  const { role, active_only = 'true' } = req.query;

  let conditions = '';
  let params = [];

  // Non-admin users can only see templates for their role
  if (userRole !== 'admin' && !role) {
    conditions = 'target_role = $1';
    params.push(req.user.role);
  } else if (role) {
    conditions = 'target_role = $1';
    params.push(role);
  }

  // Filter by active status
  if (active_only === 'true') {
    if (conditions) {
      conditions += ' AND is_active = true';
    } else {
      conditions = 'is_active = true';
    }
  }

  const templates = await db.findMany(
    'templates',
    conditions,
    params,
    'target_role ASC, created_at DESC'
  );

  res.json({
    success: true,
    data: {
      templates: templates.map(template => ({
        id: template.id,
        target_role: template.target_role,
        description: template.description,
        sections: template.sections,
        tasks: template.tasks,
        is_active: template.is_active,
        created_at: template.created_at,
        updated_at: template.updated_at
      }))
    }
  });
}));

// GET /api/templates/:id - Get specific template
router.get('/:id', asyncHandler(async (req, res) => {
  const templateId = req.params.id;
  const userRole = req.user.role.toLowerCase();

  const template = await db.findOne('templates', 'id = $1', [templateId]);

  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template not found'
    });
  }

  // Non-admin users can only see templates for their role
  if (userRole !== 'admin' && template.target_role !== req.user.role) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to view this template'
    });
  }

  res.json({
    success: true,
    data: {
      template: {
        id: template.id,
        target_role: template.target_role,
        description: template.description,
        sections: template.sections,
        tasks: template.tasks,
        is_active: template.is_active,
        created_at: template.created_at,
        updated_at: template.updated_at,
        created_by: template.created_by
      }
    }
  });
}));

// POST /api/templates - Create new template (admin only)
router.post('/', requireRole(['admin']), [
  body('target_role')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Target role must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('sections')
    .isArray()
    .withMessage('Sections must be an array'),
  body('tasks')
    .isArray()
    .withMessage('Tasks must be an array'),
  body('tasks.*.description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Task description is required and must be less than 500 characters'),
  body('tasks.*.is_required')
    .optional()
    .isBoolean()
    .withMessage('Task is_required must be a boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const { target_role, description, sections, tasks } = req.body;
  const userId = req.user.id;

  // Check if template already exists for this role
  const existingTemplate = await db.findOne(
    'templates',
    'target_role = $1 AND is_active = true',
    [target_role]
  );

  if (existingTemplate) {
    return res.status(409).json({
      success: false,
      error: `Active template already exists for role: ${target_role}`
    });
  }

  // Validate sections structure
  for (const section of sections) {
    if (!section.name || !section.fields || !Array.isArray(section.fields)) {
      return res.status(400).json({
        success: false,
        error: 'Each section must have a name and fields array'
      });
    }
  }

  // Create template
  const newTemplate = await db.insert('templates', {
    target_role,
    description: description || null,
    sections: JSON.stringify(sections),
    tasks: JSON.stringify(tasks),
    created_by: userId,
    is_active: true
  });

  logger.info('Template created', {
    template_id: newTemplate.id,
    target_role,
    created_by: userId,
    sections_count: sections.length,
    tasks_count: tasks.length
  });

  res.status(201).json({
    success: true,
    data: {
      template: {
        id: newTemplate.id,
        target_role: newTemplate.target_role,
        description: newTemplate.description,
        sections: JSON.parse(newTemplate.sections),
        tasks: JSON.parse(newTemplate.tasks),
        is_active: newTemplate.is_active,
        created_at: newTemplate.created_at
      }
    }
  });
}));

// PUT /api/templates/:id - Update template (admin only)
router.put('/:id', requireRole(['admin']), [
  body('target_role')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Target role must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('sections')
    .optional()
    .isArray()
    .withMessage('Sections must be an array'),
  body('tasks')
    .optional()
    .isArray()
    .withMessage('Tasks must be an array'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const templateId = req.params.id;
  const { target_role, description, sections, tasks, is_active } = req.body;
  const userId = req.user.id;

  // Check if template exists
  const existingTemplate = await db.findOne('templates', 'id = $1', [templateId]);

  if (!existingTemplate) {
    return res.status(404).json({
      success: false,
      error: 'Template not found'
    });
  }

  // If changing target_role, check for conflicts
  if (target_role && target_role !== existingTemplate.target_role) {
    const conflictingTemplate = await db.findOne(
      'templates',
      'target_role = $1 AND is_active = true AND id != $2',
      [target_role, templateId]
    );

    if (conflictingTemplate) {
      return res.status(409).json({
        success: false,
        error: `Active template already exists for role: ${target_role}`
      });
    }
  }

  // Prepare update data
  const updateData = {};
  if (target_role !== undefined) updateData.target_role = target_role;
  if (description !== undefined) updateData.description = description;
  if (sections !== undefined) updateData.sections = JSON.stringify(sections);
  if (tasks !== undefined) updateData.tasks = JSON.stringify(tasks);
  if (is_active !== undefined) updateData.is_active = is_active;

  // Update template
  const updatedTemplate = await db.update(
    'templates',
    updateData,
    'id = $1',
    [templateId]
  );

  logger.info('Template updated', {
    template_id: templateId,
    updated_by: userId,
    changes: Object.keys(updateData)
  });

  res.json({
    success: true,
    data: {
      template: {
        id: updatedTemplate.id,
        target_role: updatedTemplate.target_role,
        description: updatedTemplate.description,
        sections: JSON.parse(updatedTemplate.sections),
        tasks: JSON.parse(updatedTemplate.tasks),
        is_active: updatedTemplate.is_active,
        created_at: updatedTemplate.created_at,
        updated_at: updatedTemplate.updated_at
      }
    }
  });
}));

// DELETE /api/templates/:id - Delete template (admin only)
router.delete('/:id', requireRole(['admin']), asyncHandler(async (req, res) => {
  const templateId = req.params.id;
  const userId = req.user.id;

  // Check if template exists
  const template = await db.findOne('templates', 'id = $1', [templateId]);

  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template not found'
    });
  }

  // Check if template is being used by any handovers
  const handoversUsingTemplate = await db.count(
    'handovers',
    'template_id = $1',
    [templateId]
  );

  if (handoversUsingTemplate > 0) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete template that is being used by existing handovers',
      handoversCount: handoversUsingTemplate
    });
  }

  // Delete template
  await db.delete('templates', 'id = $1', [templateId]);

  logger.info('Template deleted', {
    template_id: templateId,
    target_role: template.target_role,
    deleted_by: userId
  });

  res.json({
    success: true,
    message: 'Template deleted successfully'
  });
}));

// POST /api/templates/:id/duplicate - Duplicate template (admin only)
router.post('/:id/duplicate', requireRole(['admin']), [
  body('target_role')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Target role must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formatValidationErrors(errors)
    });
  }

  const templateId = req.params.id;
  const { target_role, description } = req.body;
  const userId = req.user.id;

  // Get source template
  const sourceTemplate = await db.findOne('templates', 'id = $1', [templateId]);

  if (!sourceTemplate) {
    return res.status(404).json({
      success: false,
      error: 'Source template not found'
    });
  }

  // Check if template already exists for target role
  const existingTemplate = await db.findOne(
    'templates',
    'target_role = $1 AND is_active = true',
    [target_role]
  );

  if (existingTemplate) {
    return res.status(409).json({
      success: false,
      error: `Active template already exists for role: ${target_role}`
    });
  }

  // Create duplicate template
  const newTemplate = await db.insert('templates', {
    target_role,
    description: description || `Duplicate of ${sourceTemplate.target_role} template`,
    sections: sourceTemplate.sections,
    tasks: sourceTemplate.tasks,
    created_by: userId,
    is_active: true
  });

  logger.info('Template duplicated', {
    source_template_id: templateId,
    new_template_id: newTemplate.id,
    target_role,
    created_by: userId
  });

  res.status(201).json({
    success: true,
    data: {
      template: {
        id: newTemplate.id,
        target_role: newTemplate.target_role,
        description: newTemplate.description,
        sections: JSON.parse(newTemplate.sections),
        tasks: JSON.parse(newTemplate.tasks),
        is_active: newTemplate.is_active,
        created_at: newTemplate.created_at
      }
    }
  });
}));

// GET /api/templates/roles/available - Get list of roles that don't have templates
router.get('/roles/available', requireRole(['admin']), asyncHandler(async (req, res) => {
  // Get all unique roles from users table
  const userRoles = await db.query(
    'SELECT DISTINCT role FROM users WHERE is_active = true ORDER BY role'
  );

  // Get roles that already have active templates
  const templatedRoles = await db.query(
    'SELECT DISTINCT target_role FROM templates WHERE is_active = true'
  );

  const templatedRoleSet = new Set(templatedRoles.rows.map(r => r.target_role));
  const availableRoles = userRoles.rows
    .map(r => r.role)
    .filter(role => !templatedRoleSet.has(role));

  res.json({
    success: true,
    data: {
      availableRoles,
      userRoles: userRoles.rows.map(r => r.role),
      templatedRoles: templatedRoles.rows.map(r => r.target_role)
    }
  });
}));

module.exports = router;