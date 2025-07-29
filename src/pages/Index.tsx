import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { KPICards } from "@/components/dashboard/KPICards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { HandoverPipeline } from "@/components/dashboard/HandoverPipeline";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, Sarah</h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your handovers today.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-lg font-semibold text-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards />

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Handover Pipeline */}
            <div className="lg:col-span-2">
              <HandoverPipeline />
            </div>
            
            {/* Right Column - Upcoming Deadlines */}
            <div>
              <UpcomingDeadlines />
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </main>
      </div>
    </div>
  );
};

export default Index;
