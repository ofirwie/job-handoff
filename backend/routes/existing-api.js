const express = require('express');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/existing/handovers - Get handovers from your existing database
router.get('/handovers', async (req, res) => {
  try {
    const handovers = await db.getHandovers();
    
    res.json({
      success: true,
      data: handovers
    });
  } catch (error) {
    logger.error('Error fetching handovers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch handovers'
    });
  }
});

// GET /api/existing/templates - Get templates from your existing database
router.get('/templates', async (req, res) => {
  try {
    const { job_id } = req.query;
    const templates = await db.getTemplates(job_id);
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

// GET /api/existing/jobs - Get jobs from your existing database
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await db.getJobs();
    
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
});

// GET /api/existing/organizations - Get organizations
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await db.getOrganizations();
    
    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    logger.error('Error fetching organizations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organizations'
    });
  }
});

// POST /api/existing/handovers - Create new handover in your existing format
router.post('/handovers', async (req, res) => {
  try {
    const handoverData = {
      template_id: req.body.template_id,
      job_id: req.body.job_id,
      leaving_employee_name: req.body.leaving_employee_name,
      leaving_employee_email: req.body.leaving_employee_email,
      incoming_employee_name: req.body.incoming_employee_name,
      incoming_employee_email: req.body.incoming_employee_email,
      manager_name: req.body.manager_name,
      manager_email: req.body.manager_email,
      start_date: req.body.start_date,
      due_date: req.body.due_date,
      status: req.body.status || 'in_progress',
      notes: req.body.notes || '',
      manager_edits: [],
      learning_feedback: {}
    };

    const newHandover = await db.createHandover(handoverData);
    
    res.status(201).json({
      success: true,
      data: newHandover
    });
  } catch (error) {
    logger.error('Error creating handover:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create handover'
    });
  }
});

// PUT /api/existing/handovers/:id - Update handover
router.put('/handovers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove id from update data if present
    delete updateData.id;
    delete updateData.created_at;
    
    const updatedHandover = await db.updateHandover(id, updateData);
    
    res.json({
      success: true,
      data: updatedHandover
    });
  } catch (error) {
    logger.error('Error updating handover:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update handover'
    });
  }
});

// GET /api/existing/handovers/:id - Get specific handover
router.get('/handovers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: handover, error } = await db.supabase
      .from('handovers')
      .select(`
        *,
        templates (
          name,
          description,
          status,
          confidence_score,
          ai_metadata
        ),
        jobs (
          title,
          level,
          description,
          departments (
            name,
            code
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Handover not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: handover
    });
  } catch (error) {
    logger.error('Error fetching handover:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch handover'
    });
  }
});

// GET /api/existing/user/:email - Get user info by email (from handovers)
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await db.findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

module.exports = router;