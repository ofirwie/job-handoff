import { TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SafeKPICards = () => {
  const defaultStats = [
    {
      title: "Active Handovers",
      value: "12",
      change: "+2 from last week",
      changeType: 'positive' as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      description: "Currently in progress"
    },
    {
      title: "Completed This Month",
      value: "47",
      change: "+15% from last month",
      changeType: 'positive' as const,
      icon: <CheckCircle className="h-4 w-4" />,
      description: "Successfully completed"
    },
    {
      title: "Avg. Completion Time",
      value: "8.5 days",
      change: "-1.2 days improvement",
      changeType: 'positive' as const,
      icon: <Clock className="h-4 w-4" />,
      description: "Average time to complete"
    },
    {
      title: "Overdue Items",
      value: "3",
      change: "-2 from last week",
      changeType: 'positive' as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      description: "Need immediate attention"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {defaultStats.map((stat, index) => (
        <Card key={index} className="card-stats group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success">{stat.change}</span>
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export { SafeKPICards };