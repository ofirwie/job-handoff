import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ManagerDashboardHandover,
  ManagerDashboardKPIs,
  ManagerDashboardFilters,
  HandoverStatus
} from '@/types/manager-dashboard.types';

export interface UseManagerDashboardSupabaseOptions {
  manager_email?: string;
  auto_refresh?: boolean;
  refresh_interval?: number;
}

export interface ManagerDashboardData {
  handovers: ManagerDashboardHandover[];
  grouped: {
    overdue: ManagerDashboardHandover[];
    today: ManagerDashboardHandover[];
    this_week: ManagerDashboardHandover[];
    next_week: ManagerDashboardHandover[];
    future: ManagerDashboardHandover[];
    completed: ManagerDashboardHandover[];
  };
  kpis: ManagerDashboardKPIs | null;
  stats: {
    total_handovers: number;
    by_status: Record<HandoverStatus, number>;
    by_time_category: Record<string, number>;
    by_department: Record<string, number>;
    average_completion: number;
  };
  filterOptions: {
    departments: string[];
    roles: string[];
    statuses: string[];
    plants: string[];
    countries: string[];
  };
}

export function useManagerDashboardSupabase(options: UseManagerDashboardSupabaseOptions = {}) {
  const {
    manager_email,
    auto_refresh = false,
    refresh_interval = 30000 // 30 seconds
  } = options;

  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ManagerDashboardFilters>({});

  const fetchDashboardData = useCallback(async (appliedFilters: ManagerDashboardFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Call Supabase RPC function for dashboard data
      const { data: handoversData, error: handoversError } = await supabase
        .rpc('get_manager_dashboard_data', {
          p_manager_email: manager_email || null,
          p_department_filter: appliedFilters.department_filter || null,
          p_role_filter: appliedFilters.role_filter || null,
          p_status_filter: appliedFilters.status_filter || null,
          p_time_category_filter: appliedFilters.time_category_filter || null,
          p_hide_completed: appliedFilters.hide_completed || false
        });

      if (handoversError) {
        throw new Error(`Dashboard data error: ${handoversError.message}`);
      }

      // Call Supabase RPC function for KPIs
      const { data: kpisData, error: kpisError } = await supabase
        .rpc('get_manager_dashboard_kpis', {
          p_manager_email: manager_email || null
        });

      if (kpisError) {
        console.warn('KPIs fetch error:', kpisError);
        // Don't fail the entire request if KPIs fail
      }

      const handovers = handoversData || [];
      const kpis = kpisData?.[0] || null;

      // Group data by time categories
      const grouped = {
        overdue: handovers.filter((item: any) => item.time_category === 'overdue'),
        today: handovers.filter((item: any) => item.time_category === 'today'),
        this_week: handovers.filter((item: any) => item.time_category === 'this_week'),
        next_week: handovers.filter((item: any) => item.time_category === 'next_week'),
        future: handovers.filter((item: any) => item.time_category === 'future'),
        completed: handovers.filter((item: any) => item.time_category === 'completed')
      };

      // Generate filter options
      const filterOptions = {
        departments: [...new Set(handovers.map((item: any) => item.department_name).filter(Boolean))],
        roles: [...new Set(handovers.map((item: any) => item.job_level).filter(Boolean))],
        statuses: [...new Set(handovers.map((item: any) => item.status).filter(Boolean))],
        plants: [...new Set(handovers.map((item: any) => item.plant_name).filter(Boolean))],
        countries: [...new Set(handovers.map((item: any) => item.country).filter(Boolean))]
      };

      // Calculate stats
      const stats = {
        total_handovers: handovers.length,
        by_status: handovers.reduce((acc: any, item: any) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {}),
        by_time_category: {
          overdue: grouped.overdue.length,
          today: grouped.today.length,
          this_week: grouped.this_week.length,
          next_week: grouped.next_week.length,
          future: grouped.future.length,
          completed: grouped.completed.length
        },
        by_department: handovers.reduce((acc: any, item: any) => {
          if (item.department_name) {
            acc[item.department_name] = (acc[item.department_name] || 0) + 1;
          }
          return acc;
        }, {}),
        average_completion: handovers.length > 0 
          ? Math.round(handovers.reduce((sum: number, item: any) => sum + (item.completion_percentage || 0), 0) / handovers.length)
          : 0
      };

      setData({
        handovers,
        grouped,
        kpis,
        stats,
        filterOptions
      });

      setFilters(appliedFilters);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [manager_email]);

  const updateFilters = useCallback((newFilters: ManagerDashboardFilters) => {
    const mergedFilters = { ...filters, ...newFilters };
    fetchDashboardData(mergedFilters);
  }, [filters, fetchDashboardData]);

  const clearFilters = useCallback(() => {
    fetchDashboardData({});
  }, [fetchDashboardData]);

  const refresh = useCallback(() => {
    fetchDashboardData(filters);
  }, [fetchDashboardData, filters]);

  // Initial load
  useEffect(() => {
    fetchDashboardData(filters);
  }, [fetchDashboardData]);

  // Auto-refresh
  useEffect(() => {
    if (!auto_refresh) return;

    const interval = setInterval(() => {
      fetchDashboardData(filters);
    }, refresh_interval);

    return () => clearInterval(interval);
  }, [auto_refresh, refresh_interval, fetchDashboardData, filters]);

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refresh,
    refetch: refresh
  };
}

export function useManagerDashboardKPIsSupabase(manager_email?: string) {
  const [kpis, setKpis] = useState<ManagerDashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('get_manager_dashboard_kpis', {
          p_manager_email: manager_email || null
        });

      if (rpcError) {
        throw new Error(`KPIs error: ${rpcError.message}`);
      }

      setKpis(data?.[0] || null);

    } catch (err) {
      console.error('KPIs fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [manager_email]);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  return {
    kpis,
    loading,
    error,
    refetch: fetchKPIs
  };
}

export function useHandoverStatusUpdateSupabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (
    handover_id: string, 
    new_status: HandoverStatus, 
    notes?: string,
    manager_email?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('update_handover_status', {
          p_handover_id: handover_id,
          p_new_status: new_status,
          p_notes: notes || null,
          p_manager_email: manager_email || null
        });

      if (rpcError) {
        throw new Error(`Status update error: ${rpcError.message}`);
      }

      const result = data?.[0];
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to update status');
      }

      return {
        success: true,
        data: result.updated_handover,
        message: result.message
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateStatus,
    loading,
    error
  };
}

export function useTeamMembersSupabase(manager_email?: string) {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Query user_profiles with department joins
      const { data, error: queryError } = await supabase
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
        .eq('departments.manager_email', manager_email || '');

      if (queryError) {
        throw new Error(`Team members error: ${queryError.message}`);
      }

      setTeamMembers(data || []);

    } catch (err) {
      console.error('Team members fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [manager_email]);

  useEffect(() => {
    if (manager_email) {
      fetchTeamMembers();
    }
  }, [fetchTeamMembers, manager_email]);

  return {
    teamMembers,
    loading,
    error,
    refetch: fetchTeamMembers
  };
}

// Utility hook to get current user profile
export function useCurrentUserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No authenticated user');
        }

        const { data, error: profileError } = await supabase
          .from('user_profiles')
          .select(`
            *,
            departments(name, manager_email),
            plants(name, country)
          `)
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw new Error(`Profile error: ${profileError.message}`);
        }

        setProfile(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error
  };
}

// Utility hook for status transitions
export function useStatusTransitions() {
  const getAvailableTransitions = useCallback((currentStatus: HandoverStatus): HandoverStatus[] => {
    const transitions = {
      created: ['in_progress', 'cancelled'],
      in_progress: ['pending_review', 'completed', 'cancelled', 'overdue'],
      pending_review: ['approved', 'rejected', 'in_progress'],
      approved: ['completed'],
      rejected: ['in_progress'],
      completed: [],
      cancelled: ['created'],
      overdue: ['in_progress', 'pending_review', 'cancelled']
    };

    return transitions[currentStatus] || [];
  }, []);

  const canTransitionTo = useCallback((currentStatus: HandoverStatus, targetStatus: HandoverStatus): boolean => {
    const availableTransitions = getAvailableTransitions(currentStatus);
    return availableTransitions.includes(targetStatus);
  }, [getAvailableTransitions]);

  return {
    getAvailableTransitions,
    canTransitionTo
  };
}