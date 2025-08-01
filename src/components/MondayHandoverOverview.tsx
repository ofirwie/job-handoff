import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import '../styles/monday-design-system.css';

interface HandoverOverview {
  id: string;
  employee_name: string;
  employee_email: string;
  job_title: string;
  department: string;
  manager_email: string;
  departure_date: string;
  status: string;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  days_remaining: number;
  priority: 'high' | 'medium' | 'low';
  template_name: string;
}

interface UserRole {
  type: 'employee' | 'manager' | 'admin';
  email: string;
  name: string;
  department?: string;
}

interface MondayHandoverOverviewProps {
  userRole?: UserRole;
}

export const MondayHandoverOverview: React.FC<MondayHandoverOverviewProps> = ({
  userRole = { type: 'employee', email: 'demo@albaad.com', name: 'משתמש דמו' }
}) => {
  const navigate = useNavigate();
  const [handovers, setHandovers] = useState<HandoverOverview[]>([]);
  const [filteredHandovers, setFilteredHandovers] = useState<HandoverOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    urgent: 0
  });

  useEffect(() => {
    loadHandovers();
  }, [userRole]);

  useEffect(() => {
    filterHandovers();
  }, [handovers, filter, searchTerm]);

  const loadHandovers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('handovers')
        .select(`
          *,
          templates (name),
          handover_tasks (id, is_completed, is_required)
        `)
        .order('departure_date', { ascending: true });

      // Apply role-based filtering
      if (userRole.type === 'employee') {
        query = query.eq('employee_email', userRole.email);
      } else if (userRole.type === 'manager') {
        query = query.eq('manager_email', userRole.email);
      }
      // Admin sees all handovers

      const { data, error } = await query;

      if (error) {
        console.error('Error loading handovers:', error);
        // If no data exists, create sample data
        if (error.message.includes('does not exist') || error.code === 'PGRST116') {
          createSampleData();
        }
        return;
      }

      if (!data || data.length === 0) {
        createSampleData();
        return;
      }

      // Process handovers data
      const processedHandovers = data.map(handover => {
        const totalTasks = handover.handover_tasks?.length || 0;
        const completedTasks = handover.handover_tasks?.filter((task: any) => task.is_completed).length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const departureDate = new Date(handover.departure_date);
        const today = new Date();
        const daysRemaining = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Determine priority
        let priority: 'high' | 'medium' | 'low' = 'medium';
        if (daysRemaining <= 3 && progress < 80) priority = 'high';
        else if (daysRemaining <= 7 && progress < 60) priority = 'high';
        else if (progress >= 90) priority = 'low';

        return {
          id: handover.id,
          employee_name: handover.employee_name,
          employee_email: handover.employee_email,
          job_title: handover.job_title,
          department: handover.department,
          manager_email: handover.manager_email,
          departure_date: handover.departure_date,
          status: handover.status,
          progress,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          days_remaining: Math.max(0, daysRemaining),
          priority,
          template_name: handover.templates?.name || 'תבנית כללית'
        };
      });

      setHandovers(processedHandovers);
      calculateStats(processedHandovers);

    } catch (error) {
      console.error('Error loading handovers:', error);
      createSampleData();
    } finally {
      setLoading(false);
    }
  };

  const createSampleData = () => {
    // Create sample handovers for demo purposes
    const sampleHandovers: HandoverOverview[] = [
      {
        id: '1',
        employee_name: 'יוסי כהן',
        employee_email: 'yossi@albaad.com',
        job_title: 'מהנדס תוכנה בכיר',
        department: 'הנדסה',
        manager_email: 'manager@albaad.com',
        departure_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        status: 'in_progress',
        progress: 75,
        total_tasks: 12,
        completed_tasks: 9,
        days_remaining: 10,
        priority: 'medium',
        template_name: 'תבנית מהנדס תוכנה'
      },
      {
        id: '2',
        employee_name: 'שרה לוי',
        employee_email: 'sarah@albaad.com',
        job_title: 'מנהלת פרויקטים',
        department: 'ניהול פרויקטים',
        manager_email: 'manager@albaad.com',
        departure_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        status: 'in_progress',
        progress: 45,
        total_tasks: 15,
        completed_tasks: 7,
        days_remaining: 3,
        priority: 'high',
        template_name: 'תבנית מנהל פרויקטים'
      },
      {
        id: '3',
        employee_name: 'דוד רוזן',
        employee_email: 'david@albaad.com',
        job_title: 'אנליסט נתונים',
        department: 'אנליטיקה',
        manager_email: 'manager2@albaad.com',
        departure_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
        status: 'completed',
        progress: 100,
        total_tasks: 8,
        completed_tasks: 8,
        days_remaining: 21,
        priority: 'low',
        template_name: 'תבנית אנליסט נתונים'
      }
    ];

    // Filter based on user role
    let filteredSample = sampleHandovers;
    if (userRole.type === 'employee') {
      filteredSample = sampleHandovers.filter(h => h.employee_email === userRole.email);
    } else if (userRole.type === 'manager') {
      filteredSample = sampleHandovers.filter(h => h.manager_email === userRole.email);
    }

    setHandovers(filteredSample);
    calculateStats(filteredSample);
  };

  const calculateStats = (handoversList: HandoverOverview[]) => {
    const total = handoversList.length;
    const active = handoversList.filter(h => ['created', 'in_progress'].includes(h.status)).length;
    const completed = handoversList.filter(h => h.status === 'completed').length;
    const urgent = handoversList.filter(h => h.priority === 'high').length;

    setStats({ total, active, completed, urgent });
  };

  const filterHandovers = () => {
    let filtered = handovers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(h =>
        h.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      if (filter === 'urgent') {
        filtered = filtered.filter(h => h.priority === 'high');
      } else if (filter === 'active') {
        filtered = filtered.filter(h => ['created', 'in_progress'].includes(h.status));
      } else if (filter === 'completed') {
        filtered = filtered.filter(h => h.status === 'completed');
      }
    }

    setFilteredHandovers(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      created: 'status-badge status-pending',
      in_progress: 'status-badge status-working',
      completed: 'status-badge status-done',
      approved: 'status-badge status-done'
    };
    
    const statusText = {
      created: 'נוצר',
      in_progress: 'בתהליך',
      completed: 'הושלם',
      approved: 'אושר'
    };

    return (
      <span className={statusClasses[status as keyof typeof statusClasses]}>
        {statusText[status as keyof typeof statusText]}
      </span>
    );
  };

  const getPriorityIndicator = (priority: string) => {
    const priorityClasses = {
      high: 'priority-indicator priority-high',
      medium: 'priority-indicator priority-medium',
      low: 'priority-indicator priority-low'
    };

    return <div className={priorityClasses[priority as keyof typeof priorityClasses]}></div>;
  };

  const getRoleTitle = () => {
    switch (userRole.type) {
      case 'employee': return 'החפיפות שלי';
      case 'manager': return 'חפיפות הצוות';
      case 'admin': return 'כל החפיפות';
      default: return 'חפיפות';
    }
  };

  const handleViewHandover = (handoverId: string) => {
    navigate(`/handover/${handoverId}`);
  };

  const handleRoleSwitch = (newRole: UserRole['type']) => {
    switch (newRole) {
      case 'employee':
        navigate('/employee');
        break;
      case 'manager':
        navigate('/manager');
        break;
      case 'admin':
        navigate('/admin');
        break;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="loading-spinner mx-auto"></div>
            <p className="text-muted-foreground">טוען חפיפות...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--monday-background)' }}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{getRoleTitle()}</h1>
            <p className="text-muted-foreground mt-1">
              שלום {userRole.name} • {userRole.department || 'אלבעד אינטרנשיונל'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Role Switcher for Demo */}
            <div className="monday-select">
              <select
                value={userRole.type}
                onChange={(e) => handleRoleSwitch(e.target.value as UserRole['type'])}
                className="monday-select-trigger"
              >
                <option value="employee">עובד</option>
                <option value="manager">מנהל</option>
                <option value="admin">מנהל מערכת</option>
              </select>
            </div>
            <button className="btn-monday btn-monday-secondary">
              ⚙️ הגדרות
            </button>
            <button className="btn-monday btn-monday-primary">
              + חפיפה חדשה
            </button>
          </div>
        </div>

        {/* Stats KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="kpi-card">
            <div className="kpi-card-icon" style={{ backgroundColor: '#0073ea20', color: '#0073ea' }}>
              <span style={{ fontSize: '18px' }}>📋</span>
            </div>
            <div className="kpi-card-value">{stats.total}</div>
            <div className="kpi-card-label">סה"כ חפיפות</div>
            <div className="kpi-card-trend kpi-trend-neutral">
              <span>→ יציב</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
              <span style={{ fontSize: '18px' }}>🔄</span>
            </div>
            <div className="kpi-card-value">{stats.active}</div>
            <div className="kpi-card-label">פעילות</div>
            <div className="kpi-card-trend kpi-trend-up">
              <span>↗ +1</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-icon" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
              <span style={{ fontSize: '18px' }}>✅</span>
            </div>
            <div className="kpi-card-value">{stats.completed}</div>
            <div className="kpi-card-label">הושלמו</div>
            <div className="kpi-card-trend kpi-trend-up">
              <span>↗ +2</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-icon" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
            </div>
            <div className="kpi-card-value">{stats.urgent}</div>
            <div className="kpi-card-label">דחוף</div>
            <div className="kpi-card-trend kpi-trend-down">
              <span>↘ -1</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="monday-card">
          <div className="monday-card-content">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">רשימת חפיפות ({filteredHandovers.length})</h3>
              <div className="flex items-center space-x-2">
                <div className="monday-select">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="monday-select-trigger"
                  >
                    <option value="all">הכל</option>
                    <option value="urgent">דחוף</option>
                    <option value="active">פעיל</option>
                    <option value="completed">הושלם</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="monday-search">
              <input
                type="text"
                placeholder="חיפוש חפיפות..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="monday-input monday-search-input"
              />
              <span className="monday-search-icon">🔍</span>
            </div>
          </div>
        </div>

        {/* Handovers List */}
        <div className="space-y-4">
          {filteredHandovers.length > 0 ? (
            filteredHandovers.map((handover) => (
              <div 
                key={handover.id} 
                className="monday-card"
                style={{ cursor: 'pointer' }}
                onClick={() => handleViewHandover(handover.id)}
              >
                <div className="monday-card-content">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getPriorityIndicator(handover.priority)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{handover.employee_name}</h4>
                          {getStatusBadge(handover.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{handover.job_title}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>מחלקה: {handover.department}</span>
                          <span>•</span>
                          <span>תבנית: {handover.template_name}</span>
                          <span>•</span>
                          <span>יציאה: {new Date(handover.departure_date).toLocaleDateString('he-IL')}</span>
                          <span>•</span>
                          <span>נותרו {handover.days_remaining} ימים</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-left space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="progress-container" style={{ width: '100px' }}>
                          <div 
                            className="progress-fill" 
                            style={{ width: `${handover.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{handover.progress}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {handover.completed_tasks} / {handover.total_tasks} מטלות
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="monday-card">
              <div className="monday-card-content">
                <div className="text-center py-12">
                  <span style={{ fontSize: '48px' }}>📋</span>
                  <p className="text-muted-foreground mt-4">
                    {handovers.length === 0 
                      ? "אין חפיפות במערכת. צור חפיפה חדשה כדי להתחיל"
                      : "לא נמצאו חפיפות התואמות לחיפוש"
                    }
                  </p>
                  {handovers.length === 0 && (
                    <button className="btn-monday btn-monday-primary mt-4">
                      + צור חפיפה ראשונה
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile View (Cards) */}
        <div className="mobile-card-view space-y-4">
          {filteredHandovers.map((handover) => (
            <div key={handover.id} className="monday-card">
              <div className="monday-card-content">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{handover.employee_name}</h4>
                        {getPriorityIndicator(handover.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground">{handover.job_title}</p>
                    </div>
                    {getStatusBadge(handover.status)}
                  </div>
                  
                  <div className="progress-container">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${handover.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>{handover.progress}% ({handover.completed_tasks}/{handover.total_tasks})</span>
                    <span>נותרו {handover.days_remaining} ימים</span>
                  </div>
                  
                  <button 
                    className="btn-monday btn-monday-primary btn-monday-sm w-full"
                    onClick={() => handleViewHandover(handover.id)}
                  >
                    צפה בפרטים
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MondayHandoverOverview;