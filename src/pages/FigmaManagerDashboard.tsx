import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useManagerDashboardSupabase } from '@/hooks/useManagerDashboardSupabase';
import { 
  ChevronRight, Home, Users, FileText, Settings, LogOut, Search,
  Bell, Calendar, Clock, AlertCircle, CheckCircle, Filter,
  TrendingUp, TrendingDown, Activity, BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Figma Design Colors
const FIGMA_COLORS = {
  background: '#fafbfc',
  sidebar: '#42526e',
  sidebarActive: '#2d7ef8',
  sidebarHover: '#33334d',
  white: '#ffffff',
  text: {
    primary: '#42526e',
    secondary: '#6b7280',
    light: '#999999',
    dark: '#000000'
  },
  status: {
    overdue: '#ff6b47',
    today: '#f59e0b',
    thisWeek: '#22c55e',
    nextWeek: '#6b7280',
    completed: '#22c55e',
    inProgress: '#2d7ef8',
    pending: '#f59e0b',
    cancelled: '#6b7280'
  },
  border: '#ccd1db',
  divider: '#e6e6e6',
  filterBg: '#fafafc'
};

// Status badge styling based on Figma
const getStatusStyle = (status: string) => {
  const colors = {
    'overdue': { bg: FIGMA_COLORS.status.overdue, text: FIGMA_COLORS.white },
    'in_progress': { bg: FIGMA_COLORS.status.inProgress, text: FIGMA_COLORS.white },
    'completed': { bg: FIGMA_COLORS.status.completed, text: FIGMA_COLORS.white },
    'pending_review': { bg: FIGMA_COLORS.status.pending, text: FIGMA_COLORS.white },
    'approved': { bg: FIGMA_COLORS.status.completed, text: FIGMA_COLORS.white },
    'cancelled': { bg: FIGMA_COLORS.status.cancelled, text: FIGMA_COLORS.white },
    'created': { bg: FIGMA_COLORS.border, text: FIGMA_COLORS.text.primary }
  };
  return colors[status] || colors['created'];
};

// Time category styling based on Figma
const getCategoryStyle = (category: string) => {
  const styles = {
    'overdue': { color: FIGMA_COLORS.status.overdue, label: 'Overdue', icon: AlertCircle },
    'today': { color: FIGMA_COLORS.status.today, label: 'Today', icon: Clock },
    'this_week': { color: FIGMA_COLORS.status.thisWeek, label: 'This Week', icon: Calendar },
    'next_week': { color: FIGMA_COLORS.status.nextWeek, label: 'Next Week', icon: Calendar },
    'completed': { color: FIGMA_COLORS.status.completed, label: 'Completed', icon: CheckCircle }
  };
  return styles[category] || { color: FIGMA_COLORS.text.secondary, label: category, icon: Calendar };
};

export default function FigmaManagerDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get dashboard data
  const { data, loading, error, filters, updateFilters, refresh } = useManagerDashboardSupabase({
    auto_refresh: true,
    refresh_interval: 30000
  });

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    } else {
      setCurrentUser(user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Filter handovers by search query
  const filterHandovers = (handovers: any[]) => {
    if (!searchQuery) return handovers;
    const query = searchQuery.toLowerCase();
    return handovers.filter(h => 
      h.leaving_employee_name?.toLowerCase().includes(query) ||
      h.incoming_employee_name?.toLowerCase().includes(query) ||
      h.job_title?.toLowerCase().includes(query) ||
      h.department_name?.toLowerCase().includes(query)
    );
  };

  // Render handover card based on Figma design
  const renderHandoverCard = (handover: any) => {
    const statusStyle = getStatusStyle(handover.status);
    
    return (
      <div 
        key={handover.id}
        className="bg-white rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        style={{ borderLeft: `4px solid ${getCategoryStyle(handover.time_category).color}` }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold" style={{ color: FIGMA_COLORS.text.primary }}>
              {handover.job_title}
            </h4>
            <p className="text-sm mt-1" style={{ color: FIGMA_COLORS.text.secondary }}>
              {handover.department_name} • {handover.plant_name}
            </p>
          </div>
          <Badge 
            className="text-xs px-2 py-1"
            style={{ 
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
              border: 'none'
            }}
          >
            {handover.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs" style={{ color: FIGMA_COLORS.text.light }}>Leaving</p>
            <p className="text-sm font-medium" style={{ color: FIGMA_COLORS.text.primary }}>
              {handover.leaving_employee_name}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: FIGMA_COLORS.text.light }}>Incoming</p>
            <p className="text-sm font-medium" style={{ color: FIGMA_COLORS.text.primary }}>
              {handover.incoming_employee_name || 'Not assigned'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: FIGMA_COLORS.text.light }}>Progress</span>
            <span className="text-xs font-medium" style={{ color: FIGMA_COLORS.text.primary }}>
              {Math.round(handover.completion_percentage || 0)}%
            </span>
          </div>
          <Progress 
            value={handover.completion_percentage || 0} 
            className="h-2"
            style={{ backgroundColor: FIGMA_COLORS.divider }}
          />
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: FIGMA_COLORS.text.light }}>
              {handover.completed_items || 0}/{handover.total_items || 0} tasks
            </span>
            <span style={{ color: FIGMA_COLORS.text.secondary }}>
              Due: {new Date(handover.due_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: FIGMA_COLORS.background }}>
      {/* Sidebar - Exact Figma Design */}
      <div 
        className={cn(
          "flex flex-col transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-[280px]"
        )}
        style={{ backgroundColor: FIGMA_COLORS.sidebar }}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b" style={{ borderColor: FIGMA_COLORS.sidebarHover }}>
          <div className="flex items-center justify-between">
            <h1 className={cn(
              "font-bold text-xl text-white transition-opacity",
              sidebarCollapsed && "opacity-0"
            )}>
              OFIR.AI
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-white hover:bg-white/10"
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                sidebarCollapsed && "rotate-180"
              )} />
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b" style={{ borderColor: FIGMA_COLORS.sidebarHover }}>
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback style={{ backgroundColor: FIGMA_COLORS.sidebarActive, color: FIGMA_COLORS.white }}>
                {currentUser?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Manager</p>
                <p className="text-xs" style={{ color: '#cccccc' }}>
                  {currentUser?.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
              style={{ backgroundColor: FIGMA_COLORS.sidebarActive }}
            >
              <Home className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && "Dashboard"}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Users className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && "Team"}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <FileText className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && "Reports"}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && "Settings"}
            </Button>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: FIGMA_COLORS.sidebarHover }}>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {!sidebarCollapsed && "Logout"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4" style={{ borderColor: FIGMA_COLORS.divider }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: FIGMA_COLORS.text.primary }}>
              Team Handovers
            </h2>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" style={{ color: FIGMA_COLORS.text.secondary }} />
              </Button>
              <Button 
                variant="default" 
                size="sm"
                style={{ backgroundColor: FIGMA_COLORS.sidebarActive }}
              >
                New Handover
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border-b px-6 py-3" style={{ borderColor: FIGMA_COLORS.divider }}>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                style={{ color: FIGMA_COLORS.text.light }} />
              <Input
                type="text"
                placeholder="Search handovers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                style={{ 
                  backgroundColor: FIGMA_COLORS.filterBg,
                  borderColor: FIGMA_COLORS.border
                }}
              />
            </div>

            {/* Department Filter */}
            <Select 
              value={filters.department_filter || 'all'} 
              onValueChange={(value) => updateFilters({ department_filter: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[150px]" style={{ 
                backgroundColor: FIGMA_COLORS.filterBg,
                borderColor: FIGMA_COLORS.border
              }}>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {data?.filterOptions.departments.filter(d => d).map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select 
              value={filters.role_filter || 'all'} 
              onValueChange={(value) => updateFilters({ role_filter: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[120px]" style={{ 
                backgroundColor: FIGMA_COLORS.filterBg,
                borderColor: FIGMA_COLORS.border
              }}>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {data?.filterOptions.roles.filter(r => r).map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select 
              value={filters.status_filter || 'all'} 
              onValueChange={(value) => updateFilters({ status_filter: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[140px]" style={{ 
                backgroundColor: FIGMA_COLORS.filterBg,
                borderColor: FIGMA_COLORS.border
              }}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {data?.filterOptions.statuses.filter(s => s).map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Hide Completed */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hide-completed"
                checked={filters.hide_completed || false}
                onCheckedChange={(checked) => updateFilters({ hide_completed: checked as boolean })}
              />
              <label htmlFor="hide-completed" className="text-sm" style={{ color: FIGMA_COLORS.text.secondary }}>
                Hide Completed
              </label>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                  style={{ borderColor: FIGMA_COLORS.sidebarActive }}></div>
                <p style={{ color: FIGMA_COLORS.text.secondary }}>Loading handovers...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <Card className="p-6 max-w-md">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: FIGMA_COLORS.status.overdue }} />
                <p className="text-center" style={{ color: FIGMA_COLORS.text.primary }}>
                  Error loading dashboard: {error}
                </p>
                <Button onClick={refresh} className="w-full mt-4">
                  Retry
                </Button>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Overdue Section */}
              {data?.grouped.overdue && data.grouped.overdue.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <AlertCircle className="h-5 w-5 mr-2" style={{ color: FIGMA_COLORS.status.overdue }} />
                    <h3 className="font-semibold" style={{ color: FIGMA_COLORS.status.overdue }}>
                      Overdue ({data.grouped.overdue.length})
                    </h3>
                  </div>
                  {filterHandovers(data.grouped.overdue).map(renderHandoverCard)}
                </div>
              )}

              {/* Today Section */}
              {data?.grouped.today && data.grouped.today.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 mr-2" style={{ color: FIGMA_COLORS.status.today }} />
                    <h3 className="font-semibold" style={{ color: FIGMA_COLORS.status.today }}>
                      Today ({data.grouped.today.length})
                    </h3>
                  </div>
                  {filterHandovers(data.grouped.today).map(renderHandoverCard)}
                </div>
              )}

              {/* This Week Section */}
              {data?.grouped.this_week && data.grouped.this_week.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 mr-2" style={{ color: FIGMA_COLORS.status.thisWeek }} />
                    <h3 className="font-semibold" style={{ color: FIGMA_COLORS.status.thisWeek }}>
                      This Week ({data.grouped.this_week.length})
                    </h3>
                  </div>
                  {filterHandovers(data.grouped.this_week).map(renderHandoverCard)}
                </div>
              )}

              {/* Next Week Section */}
              {data?.grouped.next_week && data.grouped.next_week.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 mr-2" style={{ color: FIGMA_COLORS.status.nextWeek }} />
                    <h3 className="font-semibold" style={{ color: FIGMA_COLORS.status.nextWeek }}>
                      Next Week ({data.grouped.next_week.length})
                    </h3>
                  </div>
                  {filterHandovers(data.grouped.next_week).map(renderHandoverCard)}
                </div>
              )}

              {/* Completed Section */}
              {!filters.hide_completed && data?.grouped.completed && data.grouped.completed.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-5 w-5 mr-2" style={{ color: FIGMA_COLORS.status.completed }} />
                    <h3 className="font-semibold" style={{ color: FIGMA_COLORS.status.completed }}>
                      Completed ({data.grouped.completed.length})
                    </h3>
                  </div>
                  {filterHandovers(data.grouped.completed).map(renderHandoverCard)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}