const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Initialize Supabase client with your existing database
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://pjiqcpusjxfjuulojzhc.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMzI0MiwiZXhwIjoyMDY5Mzk5MjQyfQ.hH8KZ9S6eJSUoUU4LbWefyeaO9Vr5HyQk8_TK-rfbMY'
);

// Adapter that maps the generic backend API to your existing database schema
const dbAdapter = {
  // Raw Supabase client for direct access
  supabase,

  // Test connection
  testConnection: async () => {
    try {
      const { data, error } = await supabase.from('organizations').select('count').limit(1);
      if (error) throw error;
      logger.info('Successfully connected to your existing Supabase database');
    } catch (error) {
      logger.error('Failed to connect to Supabase:', error);
      throw error;
    }
  },

  // Generic query - not implemented, use specific methods
  query: async (text, params = []) => {
    throw new Error('Generic SQL query not supported. Use specific adapter methods.');
  },

  // Find user by email - adapts to your handovers table
  findUserByEmail: async (email) => {
    try {
      // Try to find user info from handovers table
      const { data: handover, error } = await supabase
        .from('handovers')
        .select('*')
        .or(`leaving_employee_email.eq.${email},incoming_employee_email.eq.${email},manager_email.eq.${email}`)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!handover) return null;

      // Determine user role and info based on email
      let userInfo = {};
      if (handover.leaving_employee_email === email) {
        userInfo = {
          id: handover.id + '_leaving',
          email: handover.leaving_employee_email,
          name: handover.leaving_employee_name,
          role: 'employee'
        };
      } else if (handover.incoming_employee_email === email) {
        userInfo = {
          id: handover.id + '_incoming',
          email: handover.incoming_employee_email,
          name: handover.incoming_employee_name,
          role: 'employee'
        };
      } else if (handover.manager_email === email) {
        userInfo = {
          id: handover.id + '_manager',
          email: handover.manager_email,
          name: handover.manager_name,
          role: 'manager'
        };
      }

      return userInfo;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  },

  // Get handovers (maps to your existing handovers table)
  getHandovers: async (userEmail = null, status = null) => {
    try {
      let query = supabase.from('handovers').select(`
        *,
        templates (
          name,
          description,
          status
        ),
        jobs (
          title,
          level,
          description
        )
      `);

      if (userEmail) {
        query = query.or(`leaving_employee_email.eq.${userEmail},incoming_employee_email.eq.${userEmail},manager_email.eq.${userEmail}`);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting handovers:', error);
      throw error;
    }
  },

  // Get templates (maps to your existing templates table)
  getTemplates: async (jobId = null) => {
    try {
      let query = supabase.from('templates').select(`
        *,
        jobs (
          title,
          level,
          description
        )
      `);

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      query = query.eq('is_active', true);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting templates:', error);
      throw error;
    }
  },

  // Get jobs (your existing jobs table)
  getJobs: async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          departments (
            name,
            code
          )
        `)
        .eq('is_active', true)
        .order('title');

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting jobs:', error);
      throw error;
    }
  },

  // Get organizations (your existing organizations table)
  getOrganizations: async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Error getting organizations:', error);
      throw error;
    }
  },

  // Create handover (maps to your schema)
  createHandover: async (handoverData) => {
    try {
      const { data, error } = await supabase
        .from('handovers')
        .insert(handoverData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating handover:', error);
      throw error;
    }
  },

  // Update handover
  updateHandover: async (id, updateData) => {
    try {
      const { data, error } = await supabase
        .from('handovers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating handover:', error);
      throw error;
    }
  },

  // Generic fallback methods for compatibility
  findOne: async (table, conditions, params = []) => {
    if (table === 'users' && conditions.includes('email')) {
      return await dbAdapter.findUserByEmail(params[0]);
    }
    
    // For other tables, use direct Supabase queries
    const { data, error } = await supabase.from(table).select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  findMany: async (table, conditions = '', params = [], orderBy = '') => {
    let query = supabase.from(table).select('*');
    
    if (orderBy) {
      const [field, direction] = orderBy.split(' ');
      const ascending = !direction || direction.toUpperCase() === 'ASC';
      query = query.order(field, { ascending });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  insert: async (table, data) => {
    const { data: result, error } = await supabase.from(table).insert(data).select().single();
    if (error) throw error;
    return result;
  },

  update: async (table, data, conditions, conditionParams = []) => {
    const { data: result, error } = await supabase.from(table).update(data).select().single();
    if (error) throw error;
    return result;
  },

  delete: async (table, conditions, params = []) => {
    const { data, error } = await supabase.from(table).delete().select();
    if (error) throw error;
    return data || [];
  },

  count: async (table, conditions = '', params = []) => {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  },

  transaction: async (callback) => {
    // Supabase handles transactions automatically
    return await callback(supabase);
  }
};

module.exports = dbAdapter;