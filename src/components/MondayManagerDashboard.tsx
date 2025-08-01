import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import '../styles/monday-design-system.css';

interface TeamMember {
  id: string;
  employee_name: string;
  employee_email: string;
  job_title: string;
  departure_date: string;
  status: string;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  template_name: string;
  days_remaining: number;
  priority: 'high' | 'medium' | 'low';
}

interface KPIData {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: string;
  color: string;
}

interface MondayManagerDashboardProps {
  managerEmail: string;
  managerName?: string;
  department?: string;
}

export const MondayManagerDashboard: React.FC<MondayManagerDashboardProps> = ({
  managerEmail,
  managerName = "Manager",
  department = "Department"
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [managerEmail]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load team handovers
      const { data: handoversData, error: handoversError } = await supabase
        .from('handovers')
        .select(`
          *,
          templates (name),
          handover_tasks (id, is_completed, is_required, status)
        `)
        .eq('manager_email', managerEmail)
        .in('status', ['created', 'in_progress', 'completed', 'approved'])
        .order('departure_date', { ascending: true });

      if (handoversError) {
        console.error('Error loading handovers:', handoversError);
        return;
      }

      // Process team members data
      const processedMembers = handoversData?.map(handover => {
        const totalTasks = handover.handover_tasks?.length || 0;
        const completedTasks = handover.handover_tasks?.filter((task: any) => task.is_completed).length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const departureDate = new Date(handover.departure_date);
        const today = new Date();
        const daysRemaining = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Determine priority based on days remaining and completion status
        let priority: 'high' | 'medium' | 'low' = 'medium';
        if (daysRemaining <= 3 && progress < 80) priority = 'high';
        else if (daysRemaining <= 7 && progress < 60) priority = 'high';
        else if (progress >= 90) priority = 'low';

        return {
          id: handover.id,
          employee_name: handover.employee_name,
          employee_email: handover.employee_email,
          job_title: handover.job_title,
          departure_date: handover.departure_date,
          status: handover.status,
          progress,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          template_name: handover.templates?.name || 'Unknown Template',
          days_remaining: Math.max(0, daysRemaining),
          priority
        };
      }) || [];

      setTeamMembers(processedMembers);

      // Calculate KPIs
      const totalHandovers = processedMembers.length;
      const activeHandovers = processedMembers.filter(m => ['created', 'in_progress'].includes(m.status)).length;
      const completedHandovers = processedMembers.filter(m => m.status === 'completed').length;
      const urgentHandovers = processedMembers.filter(m => m.priority === 'high').length;
      const avgProgress = totalHandovers > 0 ? Math.round(processedMembers.reduce((sum, m) => sum + m.progress, 0) / totalHandovers) : 0;

      const kpis: KPIData[] = [
        {
          title: 'חפיפות פעילות',
          value: activeHandovers,
          trend: activeHandovers > 5 ? 'up' : 'neutral',
          trendValue: '↗ +2',
          icon: '👥',
          color: '#0073ea'
        },
        {
          title: 'הושלמו השבוע',
          value: completedHandovers,
          trend: 'up',
          trendValue: '↗ +3',
          icon: '✅',
          color: '#22c55e'
        },
        {
          title: 'דורש תשומת לב',
          value: urgentHandovers,
          trend: urgentHandovers > 2 ? 'up' : 'down',
          trendValue: urgentHandovers > 2 ? '↗ +1' : '↘ -1',
          icon: '⚠️',
          color: '#ef4444'
        },
        {
          title: 'התקדמות ממוצעת',
          value: `${avgProgress}%`,
          trend: avgProgress > 70 ? 'up' : avgProgress > 50 ? 'neutral' : 'down',
          trendValue: `↗ +${avgProgress > 70 ? '5' : '2'}%`,
          icon: '📊',
          color: '#f59e0b'
        }
      ];

      setKpiData(kpis);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  const filteredMembers = teamMembers.filter(member => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return member.priority === 'high';
    if (filter === 'active') return ['created', 'in_progress'].includes(member.status);
    if (filter === 'completed') return member.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="loading-spinner mx-auto"></div>
            <p className="text-muted-foreground">טוען נתוני צוות...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ממשק מנהל</h1>
          <p className="text-muted-foreground mt-1">
            שלום {managerName} • {department}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-monday btn-monday-secondary">
            📊 דוחות
          </button>
          <button className="btn-monday btn-monday-primary">
            + חפיפה חדשה
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className="kpi-card-icon" style={{ backgroundColor: `${kpi.color}20`, color: kpi.color }}>
              <span style={{ fontSize: '18px' }}>{kpi.icon}</span>
            </div>
            <div className="kpi-card-value">{kpi.value}</div>
            <div className="kpi-card-label">{kpi.title}</div>
            <div className={`kpi-card-trend kpi-trend-${kpi.trend}`}>
              <span>{kpi.trendValue}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="monday-card">
        <div className="monday-card-content">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">צוות החפיפות ({filteredMembers.length})</h3>
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
        </div>
      </div>

      {/* Team Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team Members List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className="monday-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedMember(member)}
              >
                <div className="monday-card-content">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getPriorityIndicator(member.priority)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{member.employee_name}</h4>
                          {getStatusBadge(member.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{member.job_title}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>תבנית: {member.template_name}</span>
                          <span>•</span>
                          <span>יציאה: {new Date(member.departure_date).toLocaleDateString('he-IL')}</span>
                          <span>•</span>
                          <span>נותרו {member.days_remaining} ימים</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-left space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="progress-container" style={{ width: '80px' }}>
                          <div 
                            className="progress-fill" 
                            style={{ width: `${member.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{member.progress}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.completed_tasks} / {member.total_tasks} מטלות
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
                  <span style={{ fontSize: '48px' }}>👥</span>
                  <p className="text-muted-foreground mt-4">אין חברי צוות התואמים לפילטר</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Team Member Details */}
        <div className="lg:col-span-1">
          {selectedMember ? (
            <div className="monday-card sticky top-6">
              <div className="monday-card-header">
                <div className="flex items-center justify-between">
                  <h3 className="monday-card-title">{selectedMember.employee_name}</h3>
                  <button 
                    className="btn-monday btn-monday-ghost btn-monday-sm"
                    onClick={() => setSelectedMember(null)}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="monday-card-content space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">תפקיד</label>
                  <p>{selectedMember.job_title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">סטטוס</label>
                  {getStatusBadge(selectedMember.status)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">התקדמות</label>
                  <div className="space-y-2">
                    <div className="progress-container">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${selectedMember.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{selectedMember.completed_tasks} / {selectedMember.total_tasks} מטלות</span>
                      <span>{selectedMember.progress}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">עדיפות</label>
                  <div className="flex items-center space-x-2">
                    {getPriorityIndicator(selectedMember.priority)}
                    <span className="capitalize">
                      {selectedMember.priority === 'high' ? 'גבוה' : 
                       selectedMember.priority === 'medium' ? 'בינוני' : 'נמוך'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">תאריך יציאה</label>
                  <p>{new Date(selectedMember.departure_date).toLocaleDateString('he-IL')}</p>
                  <p className="text-sm text-muted-foreground">
                    נותרו {selectedMember.days_remaining} ימים
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">תבנית</label>
                  <p className="text-sm">{selectedMember.template_name}</p>
                </div>
                
                <div className="space-y-2 pt-4">
                  <button className="btn-monday btn-monday-primary w-full">
                    צפה בפרטים
                  </button>
                  <button className="btn-monday btn-monday-secondary w-full">
                    שלח הודעה
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="btn-monday btn-monday-ghost btn-monday-sm">
                      ערוך
                    </button>
                    <button className="btn-monday btn-monday-ghost btn-monday-sm">
                      אשר
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="monday-card sticky top-6">
              <div className="monday-card-content">
                <div className="text-center py-12">
                  <span style={{ fontSize: '48px' }}>👤</span>
                  <p className="text-muted-foreground mt-4">בחר חבר צוות לצפייה בפרטים</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    לחץ על כל חבר צוות לראות את המידע המלא
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View (Cards) */}
      <div className="mobile-card-view space-y-4">
        {filteredMembers.map((member) => (
          <div key={member.id} className="monday-card">
            <div className="monday-card-content">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{member.employee_name}</h4>
                      {getPriorityIndicator(member.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.job_title}</p>
                  </div>
                  {getStatusBadge(member.status)}
                </div>
                
                <div className="progress-container">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${member.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>{member.progress}% ({member.completed_tasks}/{member.total_tasks})</span>
                  <span>נותרו {member.days_remaining} ימים</span>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="btn-monday btn-monday-primary btn-monday-sm flex-1"
                    onClick={() => setSelectedMember(member)}
                  >
                    פרטים
                  </button>
                  <button className="btn-monday btn-monday-secondary btn-monday-sm flex-1">
                    הודעה
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MondayManagerDashboard;