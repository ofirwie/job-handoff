const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorMiddleware');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Complex query handlers for operations that need raw Supabase queries
// These handle the more complex SQL operations that don't fit the simple db helper methods

// GET /api/complex/manager/dashboard - Manager dashboard with complex joins
router.get('/manager/dashboard', asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  try {
    // Get pending handovers with employee details and task counts
    const { data: pendingHandovers, error: pendingError } = await db.supabase
      .from('handovers')
      .select(`
        id,
        status,
        role,
        submitted_at,
        created_at,
        employee:users!employee_id (
          id,
          name,
          role,
          department
        ),
        handover_tasks (
          id,
          is_completed
        )
      `)
      .eq('manager_id', managerId)
      .eq('status', 'pending_review')
      .order('submitted_at', { ascending: false });

    if (pendingError) throw pendingError;

    // Get recent completed handovers
    const { data: recentCompleted, error: completedError } = await db.supabase
      .from('handovers')
      .select(`
        id,
        status,
        updated_at,
        approved_at,
        rejected_at,
        employee:users!employee_id (
          id,
          name,
          role
        )
      `)
      .eq('manager_id', managerId)
      .in('status', ['approved', 'rejected'])
      .order('updated_at', { ascending: false })
      .limit(10);

    if (completedError) throw completedError;

    // Get team statistics
    const { data: teamStats, error: statsError } = await db.supabase
      .from('handovers')
      .select('status')
      .eq('manager_id', managerId);

    if (statsError) throw statsError;

    // Process the data
    const processedPending = pendingHandovers.map(handover => ({
      id: handover.id,
      employee_name: handover.employee?.name,
      employee_role: handover.employee?.role,
      department: handover.employee?.department,
      status: handover.status,
      submitted_at: handover.submitted_at,
      created_at: handover.created_at,
      progress: {
        total: handover.handover_tasks?.length || 0,
        completed: handover.handover_tasks?.filter(task => task.is_completed).length || 0,
        percentage: handover.handover_tasks?.length > 0 ? 
          Math.round((handover.handover_tasks.filter(task => task.is_completed).length / handover.handover_tasks.length) * 100) : 0
      }
    }));

    const processedCompleted = recentCompleted.map(handover => ({
      id: handover.id,
      employee_name: handover.employee?.name,
      employee_role: handover.employee?.role,
      status: handover.status,
      updated_at: handover.updated_at,
      approved_at: handover.approved_at,
      rejected_at: handover.rejected_at
    }));

    const statistics = {
      total: teamStats.length,
      pending: teamStats.filter(h => h.status === 'pending_review').length,
      approved: teamStats.filter(h => h.status === 'approved').length,
      rejected: teamStats.filter(h => h.status === 'rejected').length,
      draft: teamStats.filter(h => h.status === 'draft').length
    };

    res.json({
      success: true,
      data: {
        manager: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role,
          department: req.user.department
        },
        pendingHandovers: processedPending,
        recentCompleted: processedCompleted,
        statistics
      }
    });

  } catch (error) {
    logger.error('Manager dashboard query error:', error);
    throw error;
  }
}));

// GET /api/complex/handovers/statistics - Get handover statistics
router.get('/handovers/statistics', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role.toLowerCase();

  try {
    let handoversQuery = db.supabase.from('handovers').select('status, role, created_at, approved_at');

    // Non-admin users can only see their own statistics
    if (userRole !== 'admin') {
      handoversQuery = handoversQuery.or(`employee_id.eq.${userId},manager_id.eq.${userId}`);
    }

    const { data: handovers, error } = await handoversQuery;

    if (error) throw error;

    // Calculate overall statistics
    const total = handovers.length;
    const draft = handovers.filter(h => h.status === 'draft').length;
    const pending = handovers.filter(h => h.status === 'pending_review').length;
    const approved = handovers.filter(h => h.status === 'approved').length;
    const rejected = handovers.filter(h => h.status === 'rejected').length;

    // Calculate average approval days
    const approvedHandovers = handovers.filter(h => h.approved_at);
    const avgApprovalDays = approvedHandovers.length > 0 
      ? approvedHandovers.reduce((sum, h) => {
          const created = new Date(h.created_at);
          const approved = new Date(h.approved_at);
          const days = (approved - created) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / approvedHandovers.length
      : null;

    // Statistics by role
    const roleGroups = {};
    handovers.forEach(h => {
      if (!roleGroups[h.role]) {
        roleGroups[h.role] = { total: 0, approved: 0, approvalDays: [] };
      }
      roleGroups[h.role].total++;
      if (h.status === 'approved') {
        roleGroups[h.role].approved++;
        if (h.approved_at) {
          const days = (new Date(h.approved_at) - new Date(h.created_at)) / (1000 * 60 * 60 * 24);
          roleGroups[h.role].approvalDays.push(days);
        }
      }
    });

    const byRole = Object.entries(roleGroups).map(([role, stats]) => ({
      role,
      handoverCount: stats.total,
      approvedCount: stats.approved,
      approvalRate: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0,
      avgApprovalDays: stats.approvalDays.length > 0 
        ? (stats.approvalDays.reduce((sum, days) => sum + days, 0) / stats.approvalDays.length).toFixed(1)
        : null
    }));

    // Monthly statistics for the last 12 months
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    
    const monthlyHandovers = handovers.filter(h => new Date(h.created_at) >= twelveMonthsAgo);
    const monthlyGroups = {};
    
    monthlyHandovers.forEach(h => {
      const date = new Date(h.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = { created: 0, approved: 0 };
      }
      monthlyGroups[monthKey].created++;
      if (h.status === 'approved') {
        monthlyGroups[monthKey].approved++;
      }
    });

    const monthly = Object.entries(monthlyGroups)
      .map(([month, stats]) => ({
        month: `${month}-01`, // Format as date string
        created: stats.created,
        approved: stats.approved
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    res.json({
      success: true,
      data: {
        overall: {
          total,
          draft,
          pending,
          approved,
          rejected,
          avgApprovalDays: avgApprovalDays ? avgApprovalDays.toFixed(1) : null
        },
        byRole,
        monthly
      }
    });

  } catch (error) {
    logger.error('Statistics query error:', error);
    throw error;
  }
}));

// GET /api/complex/manager/team - Get team members with handover status
router.get('/manager/team', asyncHandler(async (req, res) => {
  const managerId = req.user.id;

  try {
    // Get team members with their latest handover
    const { data: teamMembers, error } = await db.supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        department,
        created_at,
        handovers (
          id,
          status,
          created_at,
          submitted_at
        )
      `)
      .eq('manager_id', managerId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    // Get task counts for each handover
    const handoverIds = teamMembers
      .flatMap(member => member.handovers)
      .map(handover => handover.id);

    let taskCounts = {};
    if (handoverIds.length > 0) {
      const { data: tasks, error: tasksError } = await db.supabase
        .from('handover_tasks')
        .select('handover_id, is_completed')
        .in('handover_id', handoverIds);

      if (tasksError) throw tasksError;

      tasks.forEach(task => {
        if (!taskCounts[task.handover_id]) {
          taskCounts[task.handover_id] = { total: 0, completed: 0 };
        }
        taskCounts[task.handover_id].total++;
        if (task.is_completed) {
          taskCounts[task.handover_id].completed++;
        }
      });
    }

    // Process the data
    const processedMembers = teamMembers.map(member => {
      // Get the most recent handover
      const latestHandover = member.handovers && member.handovers.length > 0 
        ? member.handovers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        : null;

      let handoverData = null;
      if (latestHandover) {
        const tasks = taskCounts[latestHandover.id] || { total: 0, completed: 0 };
        handoverData = {
          id: latestHandover.id,
          status: latestHandover.status,
          created_at: latestHandover.created_at,
          submitted_at: latestHandover.submitted_at,
          progress: {
            total: tasks.total,
            completed: tasks.completed,
            percentage: tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0
          }
        };
      }

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department,
        created_at: member.created_at,
        handover: handoverData
      };
    });

    const summary = {
      totalMembers: processedMembers.length,
      withHandovers: processedMembers.filter(m => m.handover).length,
      pendingReview: processedMembers.filter(m => m.handover?.status === 'pending_review').length,
      inProgress: processedMembers.filter(m => m.handover?.status === 'draft').length
    };

    res.json({
      success: true,
      data: {
        teamMembers: processedMembers,
        summary
      }
    });

  } catch (error) {
    logger.error('Team query error:', error);
    throw error;
  }
}));

module.exports = router;