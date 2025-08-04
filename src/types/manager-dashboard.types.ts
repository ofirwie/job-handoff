// Manager Dashboard specific types

export type HandoverStatus = 'created' | 'in_progress' | 'completed' | 'cancelled' | 'overdue' | 'pending_review' | 'approved' | 'rejected';

export type TimeCategory = 'overdue' | 'today' | 'this_week' | 'next_week' | 'future' | 'completed';

export interface ManagerDashboardHandover {
  id: string;
  leaving_employee_name: string;
  leaving_employee_email: string;
  incoming_employee_name: string | null;
  incoming_employee_email: string | null;
  job_title: string;
  job_level: 'junior' | 'senior' | 'manager' | 'director';
  department_name: string;
  department_code: string;
  plant_name: string;
  country: string;
  start_date: string | null;
  due_date: string;
  completed_date: string | null;
  status: HandoverStatus;
  is_overdue: boolean;
  time_category: TimeCategory;
  priority: number;
  completion_percentage: number;
  total_items: number;
  completed_items: number;
  days_until_due: number;
  days_overdue: number;
  template_name: string;
  notes: string | null;
  created_at: string;
}

export interface ManagerDashboardKPIs {
  total_handovers: number;
  overdue_count: number;
  today_count: number;
  this_week_count: number;
  next_week_count: number;
  pending_review_count: number;
  completed_count: number;
  average_completion_percentage: number;
  total_departments: number;
  active_employees: number;
}

export interface ManagerDashboardStats {
  total_handovers: number;
  by_status: Record<HandoverStatus, number>;
  by_time_category: Record<TimeCategory, number>;
  by_department: Record<string, number>;
  average_completion: number;
}

export interface ManagerDashboardGrouped {
  overdue: ManagerDashboardHandover[];
  today: ManagerDashboardHandover[];
  this_week: ManagerDashboardHandover[];
  next_week: ManagerDashboardHandover[];
  future: ManagerDashboardHandover[];
  completed: ManagerDashboardHandover[];
}

export interface ManagerDashboardFilterOptions {
  departments: string[];
  roles: string[];
  statuses: string[];
  plants: string[];
  countries: string[];
}

export interface ManagerDashboardFilters {
  department_filter?: string;
  role_filter?: string;
  status_filter?: string;
  time_category_filter?: string;
  hide_completed?: boolean;
}

export interface ManagerDashboardMetadata {
  manager_email: string;
  total_records: number;
  generated_at: string;
  filters_applied: ManagerDashboardFilters;
}

export interface ManagerDashboardData {
  handovers: ManagerDashboardHandover[];
  grouped: ManagerDashboardGrouped;
  kpis: ManagerDashboardKPIs | null;
  stats: ManagerDashboardStats;
  filterOptions: ManagerDashboardFilterOptions;
  metadata: ManagerDashboardMetadata;
}

export interface ManagerDashboardResponse {
  success: boolean;
  data: ManagerDashboardData;
  error?: string;
}

// Status update types
export interface StatusUpdateRequest {
  handover_id: string;
  status: HandoverStatus;
  notes?: string;
}

export interface StatusUpdateResponse {
  success: boolean;
  data: any;
  message: string;
  error?: string;
}

// Team member types
export interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  role: 'hr' | 'manager' | 'employee' | 'admin';
  department_id: string | null;
  departments: {
    name: string;
    manager_email: string;
  };
}

export interface TeamMembersResponse {
  success: boolean;
  data: TeamMember[];
  metadata: {
    manager_email: string;
    team_size: number;
    generated_at: string;
  };
}

// Color mapping for status indicators
export const STATUS_COLORS: Record<HandoverStatus, string> = {
  created: '#6b7280',        // gray
  in_progress: '#2d7ef8',    // blue
  completed: '#22c55e',      // green
  cancelled: '#9ca3af',      // light gray
  overdue: '#d42e2e',        // red
  pending_review: '#f59e0b', // amber
  approved: '#22c55e',       // green
  rejected: '#ef4444'        // red
};

// Priority levels
export const PRIORITY_LEVELS = {
  1: { label: 'Critical', color: '#dc2626' },
  2: { label: 'High', color: '#ea580c' },
  3: { label: 'Medium', color: '#d97706' },
  4: { label: 'Low', color: '#65a30d' },
  5: { label: 'Minimal', color: '#16a34a' }
} as const;

// Time category labels
export const TIME_CATEGORY_LABELS: Record<TimeCategory, string> = {
  overdue: 'Overdue',
  today: 'Due Today',
  this_week: 'This Week',
  next_week: 'Next Week',
  future: 'Future',
  completed: 'Completed'
};

// Status workflow transitions
export const STATUS_TRANSITIONS: Record<HandoverStatus, HandoverStatus[]> = {
  created: ['in_progress', 'cancelled'],
  in_progress: ['pending_review', 'completed', 'cancelled', 'overdue'],
  pending_review: ['approved', 'rejected', 'in_progress'],
  approved: ['completed'],
  rejected: ['in_progress'],
  completed: [],
  cancelled: ['created'],
  overdue: ['in_progress', 'pending_review', 'cancelled']
};