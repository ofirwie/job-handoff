import { CalendarDays, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHandovers } from "@/hooks/useHandovers";

export const UpcomingDeadlines = () => {
  const { loading, error, getUpcomingDeadlines } = useHandovers();
  
  // Get handovers due in the next 14 days
  const upcomingHandovers = getUpcomingDeadlines(14);

  const calculateDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyFromDays = (daysUntilDue: number): 'critical' | 'warning' | 'normal' => {
    if (daysUntilDue < 0 || daysUntilDue <= 1) return 'critical';
    if (daysUntilDue <= 3) return 'warning';
    return 'normal';
  };

  const formatDueDate = (dueDate: string, daysUntilDue: number): string => {
    if (daysUntilDue === 0) return 'Today';
    if (daysUntilDue === 1) return 'Tomorrow';
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
    
    return new Date(dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Process handovers into deadline items
  const deadlines = upcomingHandovers.map(handover => {
    const daysUntilDue = calculateDaysUntilDue(handover.due_date);
    const urgency = getUrgencyFromDays(daysUntilDue);
    
    return {
      id: handover.id,
      title: `${handover.template?.job?.title || 'Handover'} completion`,
      employee: handover.leaving_employee_name,
      dueDate: formatDueDate(handover.due_date, daysUntilDue),
      daysUntilDue,
      urgency,
      type: 'handover_completion' as const,
      department: handover.template?.job?.department?.name || 'Unknown'
    };
  }).sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = {
      critical: { 
        label: 'Critical', 
        className: 'bg-destructive text-destructive-foreground',
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      },
      warning: { 
        label: 'Warning', 
        className: 'bg-warning text-warning-foreground',
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      normal: { 
        label: 'Normal', 
        className: 'bg-muted text-muted-foreground',
        icon: <CalendarDays className="h-3 w-3 mr-1" />
      }
    };

    const config = urgencyConfig[urgency as keyof typeof urgencyConfig];
    return (
      <Badge className={`${config.className} text-xs flex items-center`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      handover_completion: 'Handover',
      document_review: 'Documentation', 
      knowledge_transfer: 'Knowledge',
      system_access: 'System Access'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading deadlines...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-enterprise">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-destructive">Error loading deadlines: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deadlines.length === 0) {
    return (
      <Card className="card-enterprise">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
              <p className="text-xs text-muted-foreground">All handovers are on track</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-enterprise">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center">
          <CalendarDays className="mr-2 h-5 w-5 text-primary" />
          Upcoming Deadlines
        </CardTitle>
        <Button variant="outline" size="sm" className="btn-ghost-enterprise">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deadlines.slice(0, 5).map((deadline) => (
            <div 
              key={deadline.id} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group border border-transparent hover:border-border/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {deadline.title}
                  </p>
                  {getUrgencyBadge(deadline.urgency)}
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className="font-medium">{deadline.employee}</span>
                  <span>•</span>
                  <span>{deadline.department}</span>
                  <span>•</span>
                  <span className={deadline.daysUntilDue <= 0 ? 'text-destructive font-medium' : ''}>
                    {deadline.dueDate}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {deadline.daysUntilDue <= 1 && (
                  <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  View
                </Button>
              </div>
            </div>
          ))}
          
          {deadlines.length > 5 && (
            <div className="text-center pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                +{deadlines.length - 5} more upcoming deadlines
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};