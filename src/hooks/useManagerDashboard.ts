import { useState, useEffect, useCallback } from 'react';
import { 
  ManagerDashboardData, 
  ManagerDashboardFilters, 
  ManagerDashboardResponse,
  StatusUpdateRequest,
  StatusUpdateResponse,
  TeamMembersResponse,
  HandoverStatus
} from '@/types/manager-dashboard.types';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : '';

export interface UseManagerDashboardOptions {
  manager_email?: string;
  auto_refresh?: boolean;
  refresh_interval?: number;
}

export function useManagerDashboard(options: UseManagerDashboardOptions = {}) {
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

      const params = new URLSearchParams();
      
      if (manager_email) {
        params.append('manager_email', manager_email);
      }
      
      if (appliedFilters.department_filter) {
        params.append('department_filter', appliedFilters.department_filter);
      }
      
      if (appliedFilters.role_filter) {
        params.append('role_filter', appliedFilters.role_filter);
      }
      
      if (appliedFilters.status_filter) {
        params.append('status_filter', appliedFilters.status_filter);
      }
      
      if (appliedFilters.time_category_filter) {
        params.append('time_category_filter', appliedFilters.time_category_filter);
      }
      
      if (appliedFilters.hide_completed) {
        params.append('hide_completed', 'true');
      }

      params.append('include_kpis', 'true');

      const response = await fetch(`${API_BASE_URL}/api/manager/dashboard?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if available
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ManagerDashboardResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      setData(result.data);
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

export function useManagerDashboardKPIs(manager_email?: string) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (manager_email) {
        params.append('manager_email', manager_email);
      }

      const response = await fetch(`${API_BASE_URL}/api/manager/dashboard/kpis?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch KPIs');
      }

      setKpis(result.data);

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

export function useHandoverStatusUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (request: StatusUpdateRequest): Promise<StatusUpdateResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/manager/dashboard/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: StatusUpdateResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update status');
      }

      return result;

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

export function useTeamMembers(manager_email?: string) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/manager/dashboard/team-members`, {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') && {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: TeamMembersResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch team members');
      }

      setTeamMembers(result.data);

    } catch (err) {
      console.error('Team members fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [manager_email]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return {
    teamMembers,
    loading,
    error,
    refetch: fetchTeamMembers
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