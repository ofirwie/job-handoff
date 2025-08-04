import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Settings,
  BarChart3,
  Award,
  Building,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Target,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

interface ManagerDashboardDebugProps {
  managerEmail: string;
  managerName?: string;
  department?: string;
}

// Mock data for testing
const mockHandovers = [
  {
    id: '1',
    employee_name: 'John Smith',
    employee_email: 'john.smith@company.com',
    job_title: 'Senior Developer',
    departure_date: '2024-01-15',
    status: 'in_progress',
    progress: 75,
    template_name: 'Software Developer Template',
    created_at: '2024-01-01',
    total_tasks: 12,
    completed_tasks: 9,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=john.smith@company.com`
  },
  {
    id: '2',
    employee_name: 'Sarah Johnson',
    employee_email: 'sarah.johnson@company.com',
    job_title: 'Product Manager',
    departure_date: '2024-01-20',
    status: 'completed',
    progress: 100,
    template_name: 'Product Manager Template',
    created_at: '2023-12-15',
    total_tasks: 15,
    completed_tasks: 15,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=sarah.johnson@company.com`
  },
  {
    id: '3',
    employee_name: 'Mike Chen',
    employee_email: 'mike.chen@company.com',
    job_title: 'Marketing Specialist',
    departure_date: '2024-02-01',
    status: 'created',
    progress: 25,
    template_name: 'Marketing Template',
    created_at: '2024-01-10',
    total_tasks: 8,
    completed_tasks: 2,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=mike.chen@company.com`
  }
];

const mockTemplates = [
  {
    id: '1',
    name: 'Software Developer Template',
    job_codes: ['DEV', 'SWE', 'SENIOR_DEV'],
    department: 'Engineering',
    is_department_standard: true,
    status: 'active',
    template_version: 2,
    usage_count: 15,
    avg_success_rating: 0.85,
    completion_rate: 0.92,
    feedback_count: 12,
    recommendation_rate: 0.88
  },
  {
    id: '2',
    name: 'Product Manager Template',
    job_codes: ['PM', 'PRODUCT_MANAGER'],
    department: 'Product',
    is_department_standard: true,
    status: 'active',
    template_version: 1,
    usage_count: 8,
    avg_success_rating: 0.92,
    completion_rate: 0.95,
    feedback_count: 7,
    recommendation_rate: 0.95
  }
];

const mockStats = {
  total_handovers: 15,
  active_handovers: 8,
  completed_handovers: 7,
  avg_completion_time: 12,
  success_rate: 87,
  pending_approvals: 3
};

export const ManagerDashboardDebug: React.FC<ManagerDashboardDebugProps> = ({
  managerEmail,
  managerName = "Manager",
  department
}) => {
  console.log('🔍 ManagerDashboardDebug rendering with props:', { managerEmail, managerName, department });
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'in_progress': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'approved': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  console.log('✅ Component about to render UI');

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800">🔍 Debug Mode Active</h3>
          <p className="text-yellow-700 text-sm mt-1">
            Manager: {managerName} | Email: {managerEmail} | Department: {department || 'None'}
          </p>
          <p className="text-yellow-700 text-sm">
            Mock Data: {mockHandovers.length} handovers, {mockTemplates.length} templates
          </p>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {managerName}</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-600">Manage your team's handovers efficiently</p>
                {department && (
                  <Badge variant="outline" className="font-medium">
                    <Building className="h-3 w-3 mr-1" />
                    {department}
                  </Badge>
                )}
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              New Handover
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Handovers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.active_handovers}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">12%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-600/10 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.completed_handovers}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">8%</span>
                    <span className="text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-emerald-600/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.avg_completion_time}<span className="text-lg font-normal text-gray-600 ml-1">days</span></p>
                  <div className="flex items-center mt-2 text-sm">
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-600 font-medium">5%</span>
                    <span className="text-gray-500 ml-1">improvement</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-amber-600/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.success_rate}<span className="text-lg font-normal text-gray-600">%</span></p>
                  <div className="flex items-center mt-2 text-sm">
                    <Target className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-purple-600 font-medium">On track</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-purple-600/10 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search handovers, employees, or templates..."
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm border border-gray-100">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="handovers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Team Handovers
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Handovers */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Handovers</CardTitle>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      View all
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {mockHandovers.map((handover, index) => (
                    <div key={handover.id} className={`p-4 hover:bg-gray-50 transition-colors ${index !== 0 ? 'border-t border-gray-100' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={handover.avatar} alt={handover.employee_name} />
                            <AvatarFallback>{handover.employee_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{handover.employee_name}</p>
                            <p className="text-sm text-gray-600">{handover.job_title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge className={`${getStatusColor(handover.status)} border font-medium`}>
                              {getStatusIcon(handover.status)}
                              <span className="ml-1">{handover.status}</span>
                            </Badge>
                            <div className="flex items-center gap-2 mt-2">
                              <Progress value={handover.progress} className="w-20 h-2" />
                              <span className="text-sm font-medium text-gray-700">{handover.progress}%</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Performance Insights</CardTitle>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Template Efficiency</span>
                        <span className="text-sm font-bold text-gray-900">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Team Productivity</span>
                        <span className="text-sm font-bold text-gray-900">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">On-time Completion</span>
                        <span className="text-sm font-bold text-gray-900">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Quick tip</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Your team's average completion time has improved by 5% this month. Keep up the great work!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="handovers" className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">All Team Handovers ({mockHandovers.length})</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Customize View
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-4 font-medium text-gray-700">Employee</th>
                      <th className="text-left p-4 font-medium text-gray-700">Position</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Progress</th>
                      <th className="text-left p-4 font-medium text-gray-700">Departure</th>
                      <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockHandovers.map((handover) => (
                      <tr key={handover.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={handover.avatar} alt={handover.employee_name} />
                              <AvatarFallback>{handover.employee_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{handover.employee_name}</p>
                              <p className="text-sm text-gray-500">{handover.employee_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-700">{handover.job_title}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(handover.status)} border`}>
                            {handover.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Progress value={handover.progress} className="w-24 h-2" />
                            <span className="text-sm font-medium text-gray-700">{handover.progress}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-700">{new Date(handover.departure_date).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockTemplates.map((template) => (
                <Card key={template.id} className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.job_codes.slice(0, 3).map((code) => (
                        <Badge key={code} variant="secondary" className="text-xs">
                          {code}
                        </Badge>
                      ))}
                      {template.job_codes.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.job_codes.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Usage</span>
                        <span className="font-medium text-gray-900">{template.usage_count} times</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Success Rate</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-900">
                            {Math.round(template.avg_success_rating * 100)}%
                          </span>
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        v{template.template_version}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Handover Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-500 mt-3">Analytics visualization coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Department Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-500 mt-3">Performance metrics coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboardDebug;