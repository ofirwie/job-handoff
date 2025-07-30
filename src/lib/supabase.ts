// Supabase client configuration for flexible handover system
import { createClient } from '@supabase/supabase-js';

// Fallback to hardcoded values if environment variables are not available (Loveable deployment)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pjiqcpusjxfjuulojzhc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjMyNDIsImV4cCI6MjA2OTM5OTI0Mn0.ruZKcHHKCVmpERhanLNPtGE7RMgex6IjtXZ1MHTcMAs';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration missing!', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'smart-handover-system@1.0.0'
    }
  }
});

// Export types for better TypeScript support
export type { Database } from './database.types';

// Utility function to handle Supabase errors consistently
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.message) {
    throw new Error(error.message);
  }
  
  throw new Error('An unexpected database error occurred');
};

// Helper function to check if user is authenticated
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    handleSupabaseError(error);
  }
  
  return user;
};

// Helper function to get user profile with extended information
export const getUserProfile = async (userId?: string) => {
  const user = userId || (await getCurrentUser())?.id;
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      plant:plants(*),
      department:departments(*)
    `)
    .eq('id', user)
    .single();
  
  if (error) {
    handleSupabaseError(error);
  }
  
  return data;
};