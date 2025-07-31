import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Plus,
  Settings,
  BarChart3,
  Award,
  Building,
  Calendar
} from 'lucide-react';
import { TemplateService, Template } from '@/services/templateService';
import { supabase } from '@/lib/supabase';

interface ManagerDashboardProps {
  managerEmail: string;
  managerName?: string;
  department?: string;
}

interface HandoverSummary {
  id: string;
  employee_name: string;
  employee_email: string;
  job_title: string;
  departure_date: string;
  status: string;
  progress: number;
  template_name: string;
  created_at: string;
  total_tasks: number;
  completed_tasks: number;
}

interface DepartmentStats {
  total_handovers: number;
  active_handovers: number;
  completed_handovers: number;
  avg_completion_time: number;
  success_rate: number;
  pending_approvals: number;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  managerEmail,
  managerName = "Manager",
  department
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [handovers, setHandovers] = useState<HandoverSummary[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<DepartmentStats>({
    total_handovers: 0,
    active_handovers: 0,
    completed_handovers: 0,
    avg_completion_time: 0,
    success_rate: 0,
    pending_approvals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [managerEmail]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadHandovers(),
        loadManagerTemplates(),
        loadDepartmentStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHandovers = async () => {
    try {
      const { data, error } = await supabase
        .from('handovers')
        .select(`
          *,
          templates (name),
          handover_tasks (id, is_completed, is_required)
        `)
        .eq('manager_email', managerEmail)
        .in('status', ['created', 'in_progress', 'completed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading handovers:', error);
        return;
      }

      const processedHandovers = data?.map(handover => {
        const totalTasks = handover.handover_tasks?.length || 0;
        const completedTasks = handover.handover_tasks?.filter((task: any) => task.is_completed).length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          id: handover.id,
          employee_name: handover.employee_name,
          employee_email: handover.employee_email,
          job_title: handover.job_title,
          departure_date: handover.departure_date,
          status: handover.status,
          progress,
          template_name: handover.templates?.name || 'Unknown Template',
          created_at: handover.created_at,
          total_tasks: totalTasks,
          completed_tasks: completedTasks
        };
      }) || [];

      setHandovers(processedHandovers);
    } catch (error) {
      console.error('Error processing handovers:', error);
    }
  };

  const loadManagerTemplates = async () => {
    try {
      const { data, error } = await TemplateService.getManagerTemplates(managerEmail);
      if (!error && data) {
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading manager templates:', error);
    }
  };

  const loadDepartmentStats = async () => {
    try {
      // Calculate stats from handovers
      const totalHandovers = handovers.length;
      const activeHandovers = handovers.filter(h => ['created', 'in_progress'].includes(h.status)).length;
      const completedHandovers = handovers.filter(h => h.status === 'completed').length;
      const pendingApprovals = handovers.filter(h => h.status === 'completed').length;

      // Calculate average completion time (simplified)
      const avgCompletionTime = completedHandovers > 0 ? 
        handovers
          .filter(h => h.status === 'completed')
          .reduce((sum, h) => {
            const created = new Date(h.created_at);
            const days = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / completedHandovers 
        : 0;

      const successRate = totalHandovers > 0 ? (completedHandovers / totalHandovers) * 100 : 0;

      setStats({
        total_handovers: totalHandovers,
        active_handovers: activeHandovers,
        completed_handovers: completedHandovers,
        avg_completion_time: avgCompletionTime,
        success_rate: successRate,
        pending_approvals: pendingApprovals
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {managerName}
            {department && (
              <>
                {' • '}
                <Badge variant="outline" className="ml-1">
                  <Building className="h-3 w-3 mr-1" />
                  {department}
                </Badge>
              </>
            )}
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Handover</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active Handovers</p>
              <p className="text-2xl font-bold">{stats.active_handovers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed_handovers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
              <p className="text-2xl font-bold">{Math.round(stats.avg_completion_time)} days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{Math.round(stats.success_rate)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="handovers">Team Handovers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Handovers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Handovers</span>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {handovers.slice(0, 5).map((handover) => (
                  <div key={handover.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(handover.status)}
                      <div>
                        <p className="font-medium">{handover.employee_name}</p>
                        <p className="text-sm text-muted-foreground">{handover.job_title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(handover.status)}>
                        {handover.status}
                      </Badge>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={handover.progress} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">{handover.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                {handovers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">No handovers found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Template Performance</span>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.slice(0, 5).map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {template.job_codes.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {template.avg_success_rating 
                            ? Math.round(template.avg_success_rating * 100) + '%'
                            : 'No data'
                          }
                        </span>
                        {template.avg_success_rating && template.avg_success_rating > 0.8 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used {template.usage_count || 0} times
                      </p>
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">No templates assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="handovers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team Handovers ({handovers.length})</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {handovers.map((handover) => (
              <Card key={handover.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold">{handover.employee_name}</h4>
                        <Badge className={getStatusColor(handover.status)}>
                          {handover.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{handover.job_title}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Template: {handover.template_name}</span>
                        <span>•</span>
                        <span>Departure: {new Date(handover.departure_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Progress value={handover.progress} className="w-24 h-2" />
                        <span className="text-sm font-medium">{handover.progress}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {handover.completed_tasks} / {handover.total_tasks} tasks
                      </p>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Department Templates ({templates.length})</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Manage Permissions
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Template
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          {template.job_codes.map((code) => (
                            <Badge key={code} variant="outline" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Usage:</span>
                        <p className="text-muted-foreground">{template.usage_count || 0} times</p>
                      </div>
                      <div>
                        <span className="font-medium">Success:</span>
                        <p className="text-muted-foreground">
                          {template.avg_success_rating 
                            ? Math.round(template.avg_success_rating * 100) + '%'
                            : 'No data'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Version:</span>
                        <p className="text-muted-foreground">v{template.template_version}</p>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="text-muted-foreground">
                          {template.is_department_standard ? 'Standard' : 'Custom'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Handover Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground mt-4">Analytics charts coming soon</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Department Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground mt-4">Comparison metrics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerDashboard;