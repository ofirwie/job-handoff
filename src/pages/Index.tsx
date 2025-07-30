import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { KPICards } from "@/components/dashboard/KPICards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { HandoverPipeline } from "@/components/dashboard/HandoverPipeline";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { DebugInfo } from "@/components/DebugInfo";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [showDebug, setShowDebug] = useState(false);

  // Check if we should show debug mode (environment variables missing)
  const hasEnvVars = (import.meta.env.VITE_SUPABASE_URL || 'https://pjiqcpusjxfjuulojzhc.supabase.co') && 
                     (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaXFjcHVzanhmanV1bG9qemhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjMyNDIsImV4cCI6MjA2OTM5OTI0Mn0.ruZKcHHKCVmpERhanLNPtGE7RMgex6IjtXZ1MHTcMAs');

  if (showDebug) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Job Handoff System - Debug Mode</h1>
            {hasEnvVars && (
              <Button onClick={() => setShowDebug(false)} variant="outline">
                Exit Debug Mode
              </Button>
            )}
          </div>
          <DebugInfo />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          {/* Debug Button */}
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowDebug(true)} 
              variant="ghost" 
              size="sm"
              className="text-xs text-muted-foreground"
            >
              Debug Mode
            </Button>
          </div>

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
