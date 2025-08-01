import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TemplateService, Template } from '@/services/templateService';
import '../styles/monday-design-system.css';

interface SystemStats {
  total_handovers: number;
  active_handovers: number;
  total_templates: number;
  total_users: number;
  avg_completion_rate: number;
  monthly_handovers: number;
}

interface Department {
  name: string;
  handover_count: number;
  template_count: number;
  completion_rate: number;
  managers: string[];
}

interface AdminDashboardProps {
  adminEmail: string;
  adminName?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  adminName = "Admin"
}) => {
  const [stats, setStats] = useState<SystemStats>({
    total_handovers: 0,
    active_handovers: 0,
    total_templates: 0,
    total_users: 0,
    avg_completion_rate: 0,
    monthly_handovers: 0
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTemplateWizard, setShowTemplateWizard] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, [adminEmail]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSystemStats(),
        loadDepartmentStats(),
        loadTemplates()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemStats = async () => {
    try {
      // Load handovers statistics
      const { data: handoversData, error: handoversError } = await supabase
        .from('handovers')
        .select('status, created_at');

      if (!handoversError && handoversData) {
        const totalHandovers = handoversData.length;
        const activeHandovers = handoversData.filter(h => ['created', 'in_progress'].includes(h.status)).length;
        
        // Monthly handovers (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyHandovers = handoversData.filter(h => 
          new Date(h.created_at) >= thirtyDaysAgo
        ).length;

        // Load templates count
        const { data: templatesData } = await supabase
          .from('templates')
          .select('id')
          .eq('status', 'active');

        // Load unique users (employees + managers)
        const { data: usersData } = await supabase
          .from('handovers')
          .select('employee_email, manager_email');

        const uniqueUsers = new Set();
        usersData?.forEach(u => {
          uniqueUsers.add(u.employee_email);
          uniqueUsers.add(u.manager_email);
        });

        setStats({
          total_handovers: totalHandovers,
          active_handovers: activeHandovers,
          total_templates: templatesData?.length || 0,
          total_users: uniqueUsers.size,
          avg_completion_rate: 75, // This would be calculated from actual completion data
          monthly_handovers: monthlyHandovers
        });
      }
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const loadDepartmentStats = async () => {
    try {
      const { data: departmentData } = await TemplateService.getTemplatesByDepartment();
      
      if (departmentData) {
        // Get handover data by department
        const { data: handoversData } = await supabase
          .from('handovers')
          .select('department, status, manager_email');

        const departmentStats = departmentData.map(dept => {
          const deptHandovers = handoversData?.filter(h => h.department === dept.department) || [];
          const managers = [...new Set(deptHandovers.map(h => h.manager_email))];
          const completedHandovers = deptHandovers.filter(h => h.status === 'completed').length;
          
          return {
            name: dept.department,
            handover_count: deptHandovers.length,
            template_count: dept.total_templates,
            completion_rate: deptHandovers.length > 0 ? (completedHandovers / deptHandovers.length) * 100 : 0,
            managers: managers.filter(Boolean)
          };
        });

        setDepartments(departmentStats);
      }
    } catch (error) {
      console.error('Error loading department stats:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await TemplateService.getTemplates();
      if (!error && data) {
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return '#22c55e';
    if (rate >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="loading-spinner mx-auto"></div>
            <p className="text-muted-foreground">טוען נתוני מערכת...</p>
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
          <h1 className="text-3xl font-bold">ממשק מנהל מערכת</h1>
          <p className="text-muted-foreground mt-1">
            שלום {adminName} • מערכת חפיפות אלבעד
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-monday btn-monday-secondary">
            📊 ייצוא דוחות
          </button>
          <button className="btn-monday btn-monday-secondary">
            ⚙️ הגדרות מערכת
          </button>
          <button 
            className="btn-monday btn-monday-primary"
            onClick={() => setShowTemplateWizard(true)}
          >
            + תבנית חדשה
          </button>
        </div>
      </div>

      {/* System KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ backgroundColor: '#0073ea20', color: '#0073ea' }}>
            <span style={{ fontSize: '18px' }}>📋</span>
          </div>
          <div className="kpi-card-value">{stats.total_handovers}</div>
          <div className="kpi-card-label">סה"כ חפיפות</div>
          <div className="kpi-card-trend kpi-trend-up">
            <span>↗ +{stats.monthly_handovers}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
            <span style={{ fontSize: '18px' }}>🔄</span>
          </div>
          <div className="kpi-card-value">{stats.active_handovers}</div>
          <div className="kpi-card-label">חפיפות פעילות</div>
          <div className="kpi-card-trend kpi-trend-neutral">
            <span>→ +2</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
            <span style={{ fontSize: '18px' }}>📄</span>
          </div>
          <div className="kpi-card-value">{stats.total_templates}</div>
          <div className="kpi-card-label">תבניות פעילות</div>
          <div className="kpi-card-trend kpi-trend-up">
            <span>↗ +5</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
            <span style={{ fontSize: '18px' }}>👥</span>
          </div>
          <div className="kpi-card-value">{stats.total_users}</div>
          <div className="kpi-card-label">משתמשים</div>
          <div className="kpi-card-trend kpi-trend-up">
            <span>↗ +{Math.round(stats.total_users * 0.1)}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
            <span style={{ fontSize: '18px' }}>📈</span>
          </div>
          <div className="kpi-card-value">{stats.avg_completion_rate}%</div>
          <div className="kpi-card-label">שיעור השלמה</div>
          <div className={`kpi-card-trend ${stats.avg_completion_rate > 70 ? 'kpi-trend-up' : 'kpi-trend-down'}`}>
            <span>{stats.avg_completion_rate > 70 ? '↗' : '↘'} +3%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon" style={{ backgroundColor: '#06b6d420', color: '#06b6d4' }}>
            <span style={{ fontSize: '18px' }}>📅</span>
          </div>
          <div className="kpi-card-value">{stats.monthly_handovers}</div>
          <div className="kpi-card-label">החודש</div>
          <div className="kpi-card-trend kpi-trend-up">
            <span>↗ +12%</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="monday-card">
        <div className="monday-card-content p-0">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview' 
                  ? 'border-var(--monday-primary-color) text-var(--monday-primary-color)' 
                  : 'border-transparent text-var(--monday-text-secondary) hover:text-var(--monday-text-primary)'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              סקירה כללית
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'departments' 
                  ? 'border-var(--monday-primary-color) text-var(--monday-primary-color)' 
                  : 'border-transparent text-var(--monday-text-secondary) hover:text-var(--monday-text-primary)'
              }`}
              onClick={() => setActiveTab('departments')}
            >
              מחלקות
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'templates' 
                  ? 'border-var(--monday-primary-color) text-var(--monday-primary-color)' 
                  : 'border-transparent text-var(--monday-text-secondary) hover:text-var(--monday-text-primary)'
              }`}
              onClick={() => setActiveTab('templates')}
            >
              ניהול תבניות
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="monday-card">
            <div className="monday-card-header">
              <h3 className="monday-card-title">פעילות אחרונה</h3>
            </div>
            <div className="monday-card-content space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">חפיפה חדשה נוצרה</p>
                  <p className="text-xs text-muted-foreground">מהנדס תוכנה - מחלקת הנדסה • לפני 2 שעות</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">תבנית עודכנה</p>
                  <p className="text-xs text-muted-foreground">תבנית מנהל פרויקטים - מחלקת IT • לפני 4 שעות</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">חפיפה אושרה</p>
                  <p className="text-xs text-muted-foreground">מנהל איכות - מחלקת QA • לפני 6 שעות</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="monday-card">
            <div className="monday-card-header">
              <h3 className="monday-card-title">בריאות המערכת</h3>
            </div>
            <div className="monday-card-content space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">שירותי בסיס נתונים</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">פעיל</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">אחסון קבצים</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">פעיל</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">שירותי אימייל</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-yellow-600">איטי</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">גיבויים</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">עדכני</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="space-y-4">
          {departments.map((dept, index) => (
            <div key={index} className="monday-card">
              <div className="monday-card-content">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full mt-2" style={{ backgroundColor: getCompletionRateColor(dept.completion_rate) }}></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{dept.name}</h4>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="font-medium">חפיפות:</span>
                          <p className="text-muted-foreground">{dept.handover_count}</p>
                        </div>
                        <div>
                          <span className="font-medium">תבניות:</span>
                          <p className="text-muted-foreground">{dept.template_count}</p>
                        </div>
                        <div>
                          <span className="font-medium">מנהלים:</span>
                          <p className="text-muted-foreground">{dept.managers.length}</p>
                        </div>
                      </div>
                      {dept.managers.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-medium">מנהלים: </span>
                          <span className="text-xs text-muted-foreground">
                            {dept.managers.slice(0, 3).join(', ')}
                            {dept.managers.length > 3 && ` +${dept.managers.length - 3} נוספים`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-left space-y-2">
                    <div className="text-right">
                      <span className="text-2xl font-bold" style={{ color: getCompletionRateColor(dept.completion_rate) }}>
                        {Math.round(dept.completion_rate)}%
                      </span>
                      <p className="text-xs text-muted-foreground">שיעור השלמה</p>
                    </div>
                    <div className="progress-container" style={{ width: '100px' }}>
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${dept.completion_rate}%`,
                          backgroundColor: getCompletionRateColor(dept.completion_rate)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Templates List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">תבניות ({templates.length})</h3>
              <button 
                className="btn-monday btn-monday-primary btn-monday-sm"
                onClick={() => setShowTemplateWizard(true)}
              >
                + תבנית חדשה
              </button>
            </div>
            
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="monday-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="monday-card-content">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        {template.is_department_standard && (
                          <span className="status-badge status-done">תקני</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        <span>מחלקה: {template.department}</span>
                        <span>•</span>
                        <span>קודי תפקיד: {template.job_codes.join(', ')}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">שימושים:</span>
                          <p className="text-muted-foreground">{template.usage_count || 0}</p>
                        </div>
                        <div>
                          <span className="font-medium">הצלחה:</span>
                          <p className="text-muted-foreground">
                            {template.avg_success_rating 
                              ? Math.round(template.avg_success_rating * 100) + '%'
                              : 'אין נתונים'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">גרסה:</span>
                          <p className="text-muted-foreground">v{template.template_version}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button className="btn-monday btn-monday-ghost btn-monday-sm">
                        👁 צפה
                      </button>
                      <button className="btn-monday btn-monday-ghost btn-monday-sm">
                        ✏️ ערוך
                      </button>
                      <button className="btn-monday btn-monday-ghost btn-monday-sm">
                        📋 שכפל
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Template Details */}
          <div className="lg:col-span-1">
            {selectedTemplate ? (
              <div className="monday-card sticky top-6">
                <div className="monday-card-header">
                  <div className="flex items-center justify-between">
                    <h3 className="monday-card-title">{selectedTemplate.name}</h3>
                    <button 
                      className="btn-monday btn-monday-ghost btn-monday-sm"
                      onClick={() => setSelectedTemplate(null)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="monday-card-content space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">מחלקה</label>
                    <p>{selectedTemplate.department}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">קודי תפקיד</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.job_codes.map((code) => (
                        <span key={code} className="status-badge status-pending">{code}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">סטטיסטיקות</label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">שימושים:</span>
                        <p className="text-muted-foreground">{selectedTemplate.usage_count || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium">הצלחה:</span>
                        <p className="text-muted-foreground">
                          {selectedTemplate.avg_success_rating 
                            ? Math.round(selectedTemplate.avg_success_rating * 100) + '%'
                            : 'אין נתונים'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <button className="btn-monday btn-monday-primary w-full">
                      ערוך תבנית
                    </button>
                    <button className="btn-monday btn-monday-secondary w-full">
                      צפה בפרטים
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="btn-monday btn-monday-ghost btn-monday-sm">
                        שכפל
                      </button>
                      <button className="btn-monday btn-monday-ghost btn-monday-sm text-red-600">
                        ארכב
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="monday-card sticky top-6">
                <div className="monday-card-content">
                  <div className="text-center py-12">
                    <span style={{ fontSize: '48px' }}>📄</span>
                    <p className="text-muted-foreground mt-4">בחר תבנית לצפייה בפרטים</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      לחץ על כל תבנית לראות את המידע המלא
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;