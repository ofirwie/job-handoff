import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  Calendar,
  Building2,
  Award,
  Target,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

import { useManagerDashboardSupabase, useHandoverStatusUpdateSupabase, useStatusTransitions } from '@/hooks/useManagerDashboardSupabase';
import { 
  ManagerDashboardHandover, 
  HandoverStatus, 
  TimeCategory,
  STATUS_COLORS,
  PRIORITY_LEVELS,
  TIME_CATEGORY_LABELS
} from '@/types/manager-dashboard.types';

// Import Figma extracted styles
import '../styles/figma-extracted-all.css';

interface EnhancedManagerDashboardProps {
  managerEmail: string;
  managerName?: string;
  department?: string;
}

export default function EnhancedManagerDashboard({ 
  managerEmail, 
  managerName = "Manager",
  department 
}: EnhancedManagerDashboardProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHandover, setSelectedHandover] = useState<ManagerDashboardHandover | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const {
    data,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refresh
  } = useManagerDashboardSupabase({ 
    manager_email: managerEmail,
    auto_refresh: true,
    refresh_interval: 30000 
  });

  const { updateStatus } = useHandoverStatusUpdateSupabase();
  const { getAvailableTransitions } = useStatusTransitions();

  // Filter data based on search query
  const filteredHandovers = data?.handovers.filter(handover =>
    handover.leaving_employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    handover.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    handover.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleStatusUpdate = async (handover: ManagerDashboardHandover, newStatus: HandoverStatus, notes?: string) => {
    try {
      setStatusUpdateLoading(true);
      await updateStatus(handover.id, newStatus, notes, managerEmail);
      
      toast({
        title: "Status Updated",
        description: `Handover status changed to ${newStatus.replace('_', ' ')}`,
      });
      
      refresh();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setStatusUpdateLoading(false);
      setSelectedHandover(null);
    }
  };

  const getStatusBadgeVariant = (status: HandoverStatus) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'default';
      case 'overdue':
      case 'rejected':
        return 'destructive';
      case 'pending_review':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafbfc] p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span>Error loading dashboard: {error}</span>
              </div>
              <Button onClick={refresh} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-[280px] h-full bg-[#42526e] text-white">
        <div className="p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-lg font-bold text-white">OFIR AI</h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="bg-[#2d7ef8] rounded-lg px-4 py-2">
              <span className="font-semibold text-white">Dashboard</span>
            </div>
            <div className="px-4 py-2 text-[#cccccc] hover:bg-[#33334d] rounded-lg cursor-pointer">
              <span>Team</span>
            </div>
            <div className="px-4 py-2 text-[#cccccc] hover:bg-[#33334d] rounded-lg cursor-pointer">
              <span>Assign</span>
            </div>
            <div className="px-4 py-2 text-[#cccccc] hover:bg-[#33334d] rounded-lg cursor-pointer">
              <span>Reports</span>
            </div>
            <div className="px-4 py-2 text-[#cccccc] hover:bg-[#33334d] rounded-lg cursor-pointer">
              <span>Approvals</span>
            </div>
          </nav>

          {/* Profile */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-[#ff6b47] text-white">
                  {getInitials(managerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm text-white">{managerName}</div>
                <div className="text-xs text-[#cccccc]">Manager</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-[280px] p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#42526e] mb-6">Manager Dashboard</h1>
            
            {/* Filters */}
            <div className="bg-[#fafafc] border border-[#ccd1db] rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search handovers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-[200px]"
                    />
                  </div>
                </div>
                
                <Select value={filters.department_filter || 'all'} onValueChange={(value) => 
                  updateFilters({ department_filter: value === 'all' ? undefined : value })
                }>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {data?.filterOptions.departments.filter(dept => dept).map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.role_filter || 'all'} onValueChange={(value) => 
                  updateFilters({ role_filter: value === 'all' ? undefined : value })
                }>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {data?.filterOptions.roles.filter(role => role).map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.status_filter || 'all'} onValueChange={(value) => 
                  updateFilters({ status_filter: value === 'all' ? undefined : value })
                }>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {data?.filterOptions.statuses.filter(status => status).map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hide-completed"
                    checked={filters.hide_completed || false}
                    onCheckedChange={(checked) => 
                      updateFilters({ hide_completed: checked as boolean })
                    }
                  />
                  <label htmlFor="hide-completed" className="text-sm text-[#42526e]">
                    Hide Completed
                  </label>
                </div>

                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>

                <Button variant="outline" onClick={refresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          {data?.kpis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-[#e6e6e6]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#999999] mb-1">Total Handovers</p>
                      <p className="text-2xl font-bold text-[#42526e]">{data.kpis.total_handovers}</p>
                    </div>
                    <FileText className="w-8 h-8 text-[#2d7ef8]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#e6e6e6]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#999999] mb-1">Overdue</p>
                      <p className="text-2xl font-bold text-[#d42e2e]">{data.kpis.overdue_count}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-[#d42e2e]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#e6e6e6]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#999999] mb-1">Pending Review</p>
                      <p className="text-2xl font-bold text-[#f59e0b]">{data.kpis.pending_review_count}</p>
                    </div>
                    <Clock className="w-8 h-8 text-[#f59e0b]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#e6e6e6]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#999999] mb-1">Completed</p>
                      <p className="text-2xl font-bold text-[#22c55e]">{data.kpis.completed_count}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-[#22c55e]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Time-based Categories */}
          <div className="space-y-6">
            {(['overdue', 'today', 'this_week', 'next_week'] as TimeCategory[]).map(category => {
              const categoryData = data?.grouped[category] || [];
              const filteredCategoryData = categoryData.filter(handover =>
                searchQuery === '' || 
                handover.leaving_employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                handover.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                handover.department_name.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (filteredCategoryData.length === 0) return null;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#42526e]">
                      {TIME_CATEGORY_LABELS[category]} ({filteredCategoryData.length})
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {filteredCategoryData.map(handover => (
                      <Card key={handover.id} className="bg-white border-[#e6e6e6] rounded-lg">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-5 gap-4 items-center">
                            {/* Position */}
                            <div>
                              <div className="font-medium text-[#42526e]">{handover.job_title}</div>
                              <div className="text-sm text-[#999999]">{handover.leaving_employee_name}</div>
                            </div>

                            {/* Team */}
                            <div>
                              <div className="font-medium text-[#42526e]">{handover.department_name}</div>
                              <div className="text-sm text-[#999999]">{handover.plant_name}</div>
                            </div>

                            {/* Progress */}
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Progress value={handover.completion_percentage} className="flex-1" />
                                <span className="text-sm text-[#999999]">
                                  {Math.round(handover.completion_percentage)}%
                                </span>
                              </div>
                              <div className="text-xs text-[#999999]">
                                {handover.completed_items}/{handover.total_items} tasks
                              </div>
                            </div>

                            {/* Date */}
                            <div>
                              <div className="font-medium text-[#42526e]">
                                {formatDate(handover.due_date)}
                              </div>
                              {handover.days_overdue > 0 && (
                                <div className="text-sm text-[#d42e2e]">
                                  {handover.days_overdue} days overdue
                                </div>
                              )}
                              {handover.days_until_due > 0 && handover.days_until_due <= 7 && (
                                <div className="text-sm text-[#f59e0b]">
                                  {handover.days_until_due} days left
                                </div>
                              )}
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={getStatusBadgeVariant(handover.status)}
                                style={{ 
                                  backgroundColor: STATUS_COLORS[handover.status],
                                  color: 'white'
                                }}
                              >
                                {handover.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedHandover(handover)}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Update Handover Status</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Change status for {handover.leaving_employee_name}'s handover
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="py-4">
                                    <div className="space-y-2">
                                      {getAvailableTransitions(handover.status).map(status => (
                                        <Button
                                          key={status}
                                          variant="outline"
                                          className="w-full justify-start"
                                          onClick={() => handleStatusUpdate(handover, status)}
                                          disabled={statusUpdateLoading}
                                        >
                                          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredHandovers.length === 0 && (
            <Card className="border-[#e6e6e6]">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-[#999999] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#42526e] mb-2">No handovers found</h3>
                <p className="text-[#999999]">
                  {searchQuery ? 'Try adjusting your search or filters' : 'No handovers match the current filters'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}