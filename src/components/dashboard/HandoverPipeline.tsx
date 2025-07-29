import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Building, Timer, Loader2 } from "lucide-react";
import { useHandovers } from "@/hooks/useHandovers";

export const HandoverPipeline = () => {
  const { handovers, loading, error } = useHandovers({ 
    // Only show active handovers (not completed)
    status: undefined // We'll filter in component
  });

  // Filter to show only active handovers
  const activeHandovers = handovers.filter(h => 
    h.status === 'in_progress' || h.status === 'created'
  ).slice(0, 6); // Limit to 6 for display

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      created: { label: 'Not Started', className: 'bg-muted text-muted-foreground' },
      in_progress: { label: 'In Progress', className: 'status-in-progress' },
      completed: { label: 'Completed', className: 'status-completed' },
      cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created;
    return (
      <Badge className={`${config.className} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-destructive',
      medium: 'text-warning',
      low: 'text-success'
    };
    return colors[priority as keyof typeof colors] || 'text-muted-foreground';
  };

  const calculateProgress = (handover: any) => {
    if (!handover.progress || handover.progress.length === 0) return 0;
    
    const totalItems = handover.progress.length;
    const completedItems = handover.progress.filter((p: any) => p.status === 'completed').length;
    
    return Math.round((completedItems / totalItems) * 100);
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityFromDueDate = (dueDate: string): 'high' | 'medium' | 'low' => {
    const daysRemaining = calculateDaysRemaining(dueDate);
    if (daysRemaining <= 3) return 'high';
    if (daysRemaining <= 7) return 'medium';
    return 'low';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeSinceUpdate = (handover: any) => {
    // Find the most recent activity
    if (!handover.progress || handover.progress.length === 0) return 'No activity';
    
    const recentActivity = handover.progress
      .filter((p: any) => p.updated_at)
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
    
    if (!recentActivity) return 'No recent activity';
    
    const updatedAt = new Date(recentActivity.updated_at);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Updated recently';
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Updated ${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Active Handovers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading handovers...</p>
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
            <User className="mr-2 h-5 w-5 text-primary" />
            Active Handovers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-destructive">Error loading handovers: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeHandovers.length === 0) {
    return (
      <Card className="card-enterprise">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            Active Handovers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <User className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No active handovers</p>
              <p className="text-xs text-muted-foreground">New handovers will appear here</p>
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
            <User className="mr-2 h-5 w-5 text-primary" />
            Active Handovers
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {activeHandovers.length} active
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeHandovers.map((handover) => {
            const progress = calculateProgress(handover);
            const daysRemaining = calculateDaysRemaining(handover.due_date);
            const priority = getPriorityFromDueDate(handover.due_date);
            
            return (
              <div key={handover.id} className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {handover.leaving_employee_name}
                      </h4>
                      <span className={`text-xs font-medium ${getPriorityColor(priority)}`}>
                        {priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {handover.template?.job?.title || 'Unknown Role'}
                      </span>
                      <span className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {handover.template?.job?.department?.name || 'Unknown Dept'}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(handover.due_date)}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(handover.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {daysRemaining > 0 
                        ? `${daysRemaining} days remaining`
                        : daysRemaining === 0
                          ? 'Due today'
                          : `${Math.abs(daysRemaining)} days overdue`
                      }
                    </span>
                    <span className="flex items-center">
                      <Timer className="h-3 w-3 mr-1" />
                      {getTimeSinceUpdate(handover)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};