import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHandovers } from "@/hooks/useHandovers";

interface KPICardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description: string;
  loading?: boolean;
}

const KPICard = ({ title, value, change, changeType, icon, description, loading }: KPICardProps) => {
  const changeColor = {
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground'
  }[changeType];

  const changeIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : Clock;
  const ChangeIcon = changeIcon;

  return (
    <Card className="card-stats group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {loading ? '--' : value}
        </div>
        <div className={`flex items-center text-xs ${changeColor} mt-1`}>
          {!loading && <ChangeIcon className="h-3 w-3 mr-1" />}
          {loading ? 'Loading...' : change}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export const KPICards = () => {
  const { stats, loading, error } = useHandovers();

  // Calculate trends (mock for now - would need historical data)
  const getChangeText = (current: number, type: string) => {
    // Mock trend calculation - in production this would compare with previous period
    const mockChange = Math.floor(Math.random() * 20) - 10; // -10 to +10
    const isPositive = type === 'overdue' ? mockChange < 0 : mockChange > 0;
    const sign = mockChange >= 0 ? '+' : '';
    
    switch (type) {
      case 'active':
        return `${sign}${mockChange}% from last month`;
      case 'completion':
        return `${sign}${mockChange / 10}% from last month`;  
      case 'overdue':
        return `${Math.abs(mockChange)} from last week`;
      case 'time':
        return `${sign}${mockChange / 10} days improvement`;
      default:
        return 'No data';
    }
  };

  const getChangeType = (change: string): 'positive' | 'negative' | 'neutral' => {
    if (change.includes('+') || change.includes('improvement')) return 'positive';
    if (change.includes('-') && !change.includes('improvement')) return 'negative';
    return 'neutral';
  };

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-stats">
            <CardContent className="flex items-center justify-center h-24">
              <p className="text-sm text-destructive">Error loading data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Active Handovers",
      value: stats.active || 0,
      change: getChangeText(stats.active, 'active'),
      changeType: getChangeType(getChangeText(stats.active, 'active')) as "positive" | "negative" | "neutral",
      icon: <Users className="h-4 w-4" />,
      description: "Currently in progress"
    },
    {
      title: "Completion Rate",
      value: `${stats.completion_rate || 0}%`,
      change: getChangeText(stats.completion_rate, 'completion'),
      changeType: getChangeType(getChangeText(stats.completion_rate, 'completion')) as "positive" | "negative" | "neutral",
      icon: <CheckCircle className="h-4 w-4" />,
      description: "On-time completions"
    },
    {
      title: "Overdue Tasks",
      value: stats.overdue || 0,
      change: getChangeText(stats.overdue, 'overdue'),
      changeType: (stats.overdue === 0 ? 'positive' : 'negative') as "positive" | "negative" | "neutral",
      icon: <AlertTriangle className="h-4 w-4" />,
      description: "Requiring attention"
    },
    {
      title: "Avg. Completion Time",
      value: stats.avg_completion_days > 0 ? `${stats.avg_completion_days} days` : '--',
      change: getChangeText(stats.avg_completion_days, 'time'),
      changeType: getChangeType(getChangeText(stats.avg_completion_days, 'time')) as "positive" | "negative" | "neutral",
      icon: <Clock className="h-4 w-4" />,
      description: "Process efficiency"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} loading={loading} />
      ))}
    </div>
  );
};