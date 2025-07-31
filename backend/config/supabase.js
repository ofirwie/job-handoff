const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Service role key for backend operations

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_SERVICE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection on startup
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      logger.error('Supabase connection test failed:', error);
      throw error;
    }
    logger.info('Successfully connected to Supabase');
  } catch (error) {
    logger.error('Failed to connect to Supabase:', error);
    throw error;
  }
};

// Database helper functions that mirror the PostgreSQL interface
const db = {
  // Generic query - Supabase uses different syntax, so this provides compatibility
  query: async (text, params = []) => {
    // This is a simplified adapter - in practice, you'd need to parse SQL and convert to Supabase calls
    // For now, we'll implement the specific operations we need
    throw new Error('Generic query not supported with Supabase. Use specific methods.');
  },

  // Find single record
  findOne: async (table, conditions, params = []) => {
    try {
      // Convert simple conditions to Supabase format
      let query = supabase.from(table).select('*');
      
      // Handle simple WHERE conditions (this is a basic implementation)
      if (conditions && params.length > 0) {
        // For now, handle simple equality conditions
        if (conditions.includes('=') && conditions.includes('$1')) {
          const field = conditions.split('=')[0].trim();
          const value = params[0];
          query = query.eq(field, value);
        }
        
        if (conditions.includes('AND')) {
          // Handle multiple conditions - this would need more sophisticated parsing
          const parts = conditions.split('AND');
          let paramIndex = 0;
          
          parts.forEach(part => {
            part = part.trim();
            if (part.includes('=') && part.includes('$')) {
              const field = part.split('=')[0].trim();
              const value = params[paramIndex];
              query = query.eq(field, value);
              paramIndex++;
            }
          });
        }
      }
      
      const { data, error } = await query.limit(1).single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      logger.error('Database findOne error:', { table, conditions, params, error: error.message });
      throw error;
    }
  },

  // Find multiple records
  findMany: async (table, conditions = '', params = [], orderBy = '') => {
    try {
      let query = supabase.from(table).select('*');
      
      // Handle WHERE conditions (basic implementation)
      if (conditions && params.length > 0) {
        if (conditions.includes('=') && conditions.includes('$1')) {
          const field = conditions.split('=')[0].trim();
          const value = params[0];
          query = query.eq(field, value);
        }
      }
      
      // Handle ORDER BY
      if (orderBy) {
        // Parse "field ASC" or "field DESC"
        const [field, direction] = orderBy.split(' ');
        const ascending = !direction || direction.toUpperCase() === 'ASC';
        query = query.order(field, { ascending });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      logger.error('Database findMany error:', { table, conditions, params, orderBy, error: error.message });
      throw error;
    }
  },

  // Insert record
  insert: async (table, data) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return result;
    } catch (error) {
      logger.error('Database insert error:', { table, data, error: error.message });
      throw error;
    }
  },

  // Update record
  update: async (table, data, conditions, conditionParams = []) => {
    try {
      let query = supabase.from(table).update(data);
      
      // Handle WHERE conditions (basic implementation)
      if (conditions && conditionParams.length > 0) {
        if (conditions.includes('=') && conditions.includes('$1')) {
          const field = conditions.split('=')[0].trim();
          const value = conditionParams[0];
          query = query.eq(field, value);
        }
      }
      
      const { data: result, error } = await query.select().single();
      
      if (error) {
        throw error;
      }
      
      return result;
    } catch (error) {
      logger.error('Database update error:', { table, data, conditions, conditionParams, error: error.message });
      throw error;
    }
  },

  // Delete record
  delete: async (table, conditions, params = []) => {
    try {
      let query = supabase.from(table).delete();
      
      // Handle WHERE conditions (basic implementation)
      if (conditions && params.length > 0) {
        if (conditions.includes('=') && conditions.includes('$1')) {
          const field = conditions.split('=')[0].trim();
          const value = params[0];
          query = query.eq(field, value);
        }
      }
      
      const { data, error } = await query.select();
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      logger.error('Database delete error:', { table, conditions, params, error: error.message });
      throw error;
    }
  },

  // Count records
  count: async (table, conditions = '', params = []) => {
    try {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      
      // Handle WHERE conditions (basic implementation)
      if (conditions && params.length > 0) {
        if (conditions.includes('=') && conditions.includes('$1')) {
          const field = conditions.split('=')[0].trim();
          const value = params[0];
          query = query.eq(field, value);
        }
      }
      
      const { count, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return count || 0;
    } catch (error) {
      logger.error('Database count error:', { table, conditions, params, error: error.message });
      throw error;
    }
  },

  // Execute transaction (Supabase doesn't have explicit transactions, but we can simulate)
  transaction: async (callback) => {
    // Supabase handles transactions automatically for single operations
    // For complex transactions, you'd need to implement rollback logic
    // This is a simplified version
    try {
      return await callback(supabase);
    } catch (error) {
      logger.error('Transaction error:', error);
      throw error;
    }
  },

  // Raw Supabase client for complex operations
  supabase,

  // Test connection
  testConnection
};

module.exports = db;