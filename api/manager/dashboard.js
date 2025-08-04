import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      manager_email,
      department_filter,
      role_filter,
      status_filter,
      time_category_filter,
      hide_completed = false,
      include_kpis = true
    } = req.query;

    if (!manager_email) {
      return res.status(400).json({ error: 'manager_email is required' });
    }

    // Fetch dashboard data using our database function
    const { data: dashboardData, error: dashboardError } = await supabase
      .rpc('get_manager_dashboard_data', {
        p_manager_email: manager_email,
        p_department_filter: department_filter || null,
        p_role_filter: role_filter || null,
        p_status_filter: status_filter || null,
        p_time_category_filter: time_category_filter || null,
        p_hide_completed: hide_completed === 'true'
      });

    if (dashboardError) {
      console.error('Dashboard data error:', dashboardError);
      return res.status(500).json({ error: 'Failed to fetch dashboard data', details: dashboardError });
    }

    let kpisData = null;
    if (include_kpis === 'true') {
      // Fetch KPIs using our database function
      const { data: kpis, error: kpisError } = await supabase
        .rpc('get_manager_dashboard_kpis', {
          p_manager_email: manager_email
        });

      if (kpisError) {
        console.error('KPIs error:', kpisError);
        // Don't fail the entire request if KPIs fail
        kpisData = null;
      } else {
        kpisData = kpis[0] || null;
      }
    }

    // Group data by time categories for easier frontend consumption
    const groupedData = {
      overdue: dashboardData.filter(item => item.time_category === 'overdue'),
      today: dashboardData.filter(item => item.time_category === 'today'),
      this_week: dashboardData.filter(item => item.time_category === 'this_week'),
      next_week: dashboardData.filter(item => item.time_category === 'next_week'),
      future: dashboardData.filter(item => item.time_category === 'future'),
      completed: dashboardData.filter(item => item.time_category === 'completed')
    };

    // Get unique filter options for dropdowns
    const filterOptions = {
      departments: [...new Set(dashboardData.map(item => item.department_name).filter(Boolean))],
      roles: [...new Set(dashboardData.map(item => item.job_level).filter(Boolean))],
      statuses: [...new Set(dashboardData.map(item => item.status).filter(Boolean))],
      plants: [...new Set(dashboardData.map(item => item.plant_name).filter(Boolean))],
      countries: [...new Set(dashboardData.map(item => item.country).filter(Boolean))]
    };

    // Calculate additional stats
    const stats = {
      total_handovers: dashboardData.length,
      by_status: dashboardData.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}),
      by_time_category: {
        overdue: groupedData.overdue.length,
        today: groupedData.today.length,
        this_week: groupedData.this_week.length,
        next_week: groupedData.next_week.length,
        future: groupedData.future.length,
        completed: groupedData.completed.length
      },
      by_department: dashboardData.reduce((acc, item) => {
        if (item.department_name) {
          acc[item.department_name] = (acc[item.department_name] || 0) + 1;
        }
        return acc;
      }, {}),
      average_completion: dashboardData.length > 0 
        ? Math.round(dashboardData.reduce((sum, item) => sum + (item.completion_percentage || 0), 0) / dashboardData.length)
        : 0
    };

    const response = {
      success: true,
      data: {
        handovers: dashboardData,
        grouped: groupedData,
        kpis: kpisData,
        stats,
        filterOptions,
        metadata: {
          manager_email,
          total_records: dashboardData.length,
          generated_at: new Date().toISOString(),
          filters_applied: {
            department_filter,
            role_filter,
            status_filter,
            time_category_filter,
            hide_completed: hide_completed === 'true'
          }
        }
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Manager dashboard API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Helper function to validate manager access
async function validateManagerAccess(manager_email) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role, department_id, plant_id')
    .eq('email', manager_email)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Manager not found' };
  }

  if (!['manager', 'admin', 'hr'].includes(data.role)) {
    return { valid: false, error: 'Insufficient permissions' };
  }

  return { valid: true, profile: data };
}

// Helper function to get team members under a manager
async function getTeamMembers(manager_email) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      email,
      full_name,
      role,
      department_id,
      departments!inner(
        name,
        manager_email
      )
    `)
    .eq('departments.manager_email', manager_email);

  return { data: data || [], error };
}