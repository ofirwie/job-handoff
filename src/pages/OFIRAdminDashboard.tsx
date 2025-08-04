import React, { useState, useEffect } from 'react';
import { Settings, FileText, Users, Database } from 'lucide-react';
import MondayLayout from '@/components/monday/MondayLayout';
import MondayHeader from '@/components/monday/MondayHeader';
import StatsGrid, { StatItem } from '@/components/monday/StatsGrid';
import MondayTable, { StatusBadge, ColumnDef } from '@/components/monday/MondayTable';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface Template {
  id: string;
  name: string;
  usage: number;
  lastModified: string;
  status: string;
  category: string;
}

const OFIRAdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [templateData, setTemplateData] = useState<Template[]>([]);
  const { toast } = useToast();

  const adminName = "מנהל המערכת";

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for demonstration
      setStatsData({
        totalHandovers: 247,
        activeUsers: 89,
        activeTemplates: 40,
        uptime: 99.9
      });

      setTemplateData([
        {
          id: '1',
          name: 'מפתח תוכנה',
          usage: 23,
          lastModified: '2 ימים',
          status: 'done',
          category: 'פיתוח'
        },
        {
          id: '2',
          name: 'מנהל משאבי אנוש',
          usage: 18,
          lastModified: 'שבוע',
          status: 'done',
          category: 'HR'
        },
        {
          id: '3',
          name: 'מעצב UI/UX',
          usage: 15,
          lastModified: '3 ימים',
          status: 'working',
          category: 'עיצוב'
        },
        {
          id: '4',
          name: 'מנהל מוצר',
          usage: 12,
          lastModified: '5 ימים',
          status: 'done',
          category: 'מוצר'
        }
      ]);
    } catch (error) {
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אירעה שגיאה בטעינת נתוני המערכת",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const adminStats: StatItem[] = [
    {
      icon: <FileText />,
      value: statsData?.totalHandovers || '0',
      label: 'סה״כ חפיפות',
      change: 12,
      iconBg: '#E3F2FD',
      iconColor: '#1976D2'
    },
    {
      icon: <Users />,
      value: statsData?.activeUsers || '0',
      label: 'משתמשים פעילים',
      change: 5,
      iconBg: '#E8F5E8',
      iconColor: '#2E7D32'
    },
    {
      icon: <Database />,
      value: statsData?.activeTemplates || '0',
      label: 'טמפלייטים פעילים',
      change: 3,
      iconBg: '#F3E5F5',
      iconColor: '#7B1FA2'
    },
    {
      icon: <Settings />,
      value: `${statsData?.uptime || '0'}%`,
      label: 'זמן פעילות',
      change: 0,
      iconBg: '#FFF3E0',
      iconColor: '#F57C00'
    }
  ];

  const columns: ColumnDef<Template>[] = [
    {
      key: 'name',
      header: 'שם טמפלייט',
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#323338' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#676879' }}>{row.category}</div>
        </div>
      )
    },
    {
      key: 'usage',
      header: 'שימושים',
      render: (value) => (
        <span style={{ fontWeight: 500 }}>{value} פעמים</span>
      )
    },
    {
      key: 'lastModified',
      header: 'עדכון אחרון',
      render: (value) => (
        <span style={{ color: '#676879' }}>{value} קודם</span>
      )
    },
    {
      key: 'status',
      header: 'סטטוס',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'actions',
      header: 'פעולות',
      render: () => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="monday-btn monday-btn-secondary" 
            style={{ fontSize: '12px', padding: '4px 8px' }}
            onClick={(e) => {
              e.stopPropagation();
              toast({
                title: "עריכת טמפלייט",
                description: "פתיחת עורך הטמפלייטים",
              });
            }}
          >
            ערוך
          </button>
          <button 
            className="monday-btn monday-btn-secondary" 
            style={{ fontSize: '12px', padding: '4px 8px' }}
            onClick={(e) => {
              e.stopPropagation();
              toast({
                title: "שכפול טמפלייט",
                description: "יצירת עותק של הטמפלייט",
              });
            }}
          >
            שכפל
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <MondayLayout activeTab="admin">
        <div style={{ padding: '32px', textAlign: 'center' }}>טוען...</div>
      </MondayLayout>
    );
  }

  return (
    <MondayLayout activeTab="admin">
      <MondayHeader
        title="ניהול מערכת"
        subtitle="OFIR AI System Administration"
        userName={adminName}
        userInitials="אד"
      />
      
      <StatsGrid stats={adminStats} />
      
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
            ניהול טמפלייטים
          </h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="monday-btn monday-btn-secondary"
              onClick={() => {
                toast({
                  title: "סנכרון Google Sheets",
                  description: "מסנכרן את הטמפלייטים מ-Google Sheets",
                });
              }}
            >
              🔄 סנכרון Google Sheets
            </button>
            <button 
              className="monday-btn monday-btn-primary"
              onClick={() => {
                toast({
                  title: "יצירת טמפלייט חדש",
                  description: "פתיחת אשף יצירת טמפלייט עם AI",
                });
              }}
            >
              🤖 טמפלייט חדש עם AI
            </button>
          </div>
        </div>
      </div>
      
      <MondayTable 
        data={templateData} 
        columns={columns}
        onRowClick={(row) => {
          toast({
            title: "פתיחת טמפלייט",
            description: `פתיחת פרטי הטמפלייט: ${row.name}`,
          });
        }}
      />
    </MondayLayout>
  );
};

export default OFIRAdminDashboard;