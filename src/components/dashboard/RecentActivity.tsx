import { Clock, CheckCircle, AlertCircle, User, FileText, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useHandovers } from "@/hooks/useHandovers";

export const RecentActivity = () => {
  const { loading, error, getRecentActivity } = useHandovers();
  
  // Get recent activity (last 10 items)
  const recentActivity = getRecentActivity(10);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'item_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'handover_created':
        return <User className="h-4 w-4" />;
      case 'deadline_approaching':
        return <Clock className="h-4 w-4" />;
      case 'template_approved':
        return <FileText className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      completed: { variant: 'default' as const, label: 'Completed', className: 'status-completed' },
      pending: { variant: 'secondary' as const, label: 'Pending', className: 'status-pending' },
      in_progress: { variant: 'secondary' as const, label: 'In Progress', className: 'status-pending' },
      overdue: { variant: 'destructive' as const, label: 'Overdue', className: 'status-overdue' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? (
      <Badge variant={config.variant} className={`${config.className} text-xs`}>
        {config.label}
      </Badge>
    ) : null;
  };

  const getUserInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-enterprise">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-destructive">Error loading activity: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentActivity.length === 0) {
    return (
      <Card className="card-enterprise">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground">Activity will appear here as handovers progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-enterprise">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            Recent Activity
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            Last {recentActivity.length} actions
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={`${activity.handover_id}-${activity.completed_at}`} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {getActivityIcon(activity.activity_type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">
                    Item completed: {activity.item_title}
                  </p>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  From handover: {activity.handover_name}
                </p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <Avatar className="h-4 w-4 mr-2">
                    <AvatarFallback className="text-xs">
                      {getUserInitials('Unknown User')} {/* Would need user lookup */}
                    </AvatarFallback>
                  </Avatar>
                  <span>User</span> {/* Would need user lookup by completed_by */}
                  <span className="mx-2">•</span>
                  <span>{formatTimeAgo(activity.completed_at)}</span>
                </div>
              </div>
            </div>
          ))}
          
          {recentActivity.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs">Activity will appear as handovers progress</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};