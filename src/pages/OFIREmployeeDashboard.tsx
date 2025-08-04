import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import MondayLayout from '@/components/monday/MondayLayout';
import MondayHeader from '@/components/monday/MondayHeader';
import StatsGrid, { StatItem } from '@/components/monday/StatsGrid';
import MondayTable, { StatusBadge, Avatar, ProgressBar, ColumnDef } from '@/components/monday/MondayTable';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Task {
  id: string;
  task: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  progress: number;
}

const OFIREmployeeDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [handoverData, setHandoverData] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  const employeeName = "שרה כהן";
  const employeeRole = "מנהלת משאבי אנוש";

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for demonstration
      setHandoverData({
        totalTasks: 4,
        completedTasks: 3,
        inProgressTasks: 1,
        stuckTasks: 0,
        daysRemaining: 5
      });

      setTasks([
        {
          id: '1',
          task: 'העלאת רשימת אנשי קשר',
          status: 'done',
          priority: 'High',
          assignee: employeeName,
          dueDate: '15 Mar',
          progress: 100
        },
        {
          id: '2',
          task: 'תיעוד נוהלי עבודה',
          status: 'working',
          priority: 'High',
          assignee: employeeName,
          dueDate: '16 Mar',
          progress: 75
        },
        {
          id: '3',
          task: 'מסירת גישות למערכות',
          status: 'stuck',
          priority: 'Medium',
          assignee: employeeName,
          dueDate: '17 Mar',
          progress: 30
        },
        {
          id: '4',
          task: 'פגישת מסירה עם מחליף',
          status: 'planning',
          priority: 'Low',
          assignee: employeeName,
          dueDate: '20 Mar',
          progress: 0
        }
      ]);
    } catch (error) {
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אירעה שגיאה בטעינת נתוני החפיפה",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const employeeStats: StatItem[] = [
    {
      icon: <FileText />,
      value: handoverData?.totalTasks || '0',
      label: 'מטלות כולל',
      change: 0,
      iconBg: '#E3F2FD',
      iconColor: '#1976D2'
    },
    {
      icon: <CheckCircle />,
      value: handoverData?.completedTasks || '0',
      label: 'הושלמו',
      change: 2,
      iconBg: '#E8F5E8',
      iconColor: '#2E7D32'
    },
    {
      icon: <Clock />,
      value: handoverData?.inProgressTasks || '0',
      label: 'בעבודה',
      change: -1,
      iconBg: '#FFF3E0',
      iconColor: '#F57C00'
    },
    {
      icon: <AlertTriangle />,
      value: handoverData?.stuckTasks || '0',
      label: 'תקועות',
      change: -1,
      iconBg: '#FFEBEE',
      iconColor: '#D32F2F'
    }
  ];

  const columns: ColumnDef<Task>[] = [
    {
      key: 'task',
      header: 'מטלה',
      render: (value) => (
        <div style={{ fontWeight: 500, color: '#323338' }}>
          {value}
        </div>
      )
    },
    {
      key: 'status',
      header: 'סטטוס',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'progress',
      header: 'התקדמות',
      render: (value) => <ProgressBar percentage={value} />
    },
    {
      key: 'assignee',
      header: 'אחראי',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar name={value} />
          <span style={{ fontSize: '14px' }}>{value}</span>
        </div>
      )
    },
    {
      key: 'dueDate',
      header: 'תאריך יעד',
      render: (value) => (
        <span style={{
          background: '#323338',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 500
        }}>
          {value}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <MondayLayout activeTab="employee">
        <div style={{ padding: '32px', textAlign: 'center' }}>טוען...</div>
      </MondayLayout>
    );
  }

  return (
<<<<<<< HEAD
    <MondayLayout activeTab="employee">
      <MondayHeader
        title="החפיפה שלי"
        subtitle={`${employeeName} • ${employeeRole} • נותרו ${handoverData?.daysRemaining || 0} ימים`}
        userName={employeeName}
        userInitials="שכ"
      />
      
      <StatsGrid stats={employeeStats} />
      
      <div style={{ padding: '0 32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#323338'
          }}>
            המטלות שלי
          </h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="monday-btn monday-btn-secondary">
              סינון
            </button>
            <button className="monday-btn monday-btn-primary">
              הוסף מטלה
            </button>
          </div>
        </div>
      </div>
      
      <MondayTable data={tasks} columns={columns} />
    </MondayLayout>
=======
    <div className="ofir-dashboard">
      <OFIRHeader userName="יוסי כהן" userRole="employee" />
      <EmployeeDashboard employeeEmail="employee@company.com" />
    </div>
>>>>>>> 47956d2e5208f30974405f487cb58b8cd0707619
  );
};

export default OFIREmployeeDashboard;