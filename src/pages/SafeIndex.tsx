import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SafeKPICards } from "@/components/dashboard/SafeKPICards";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, Users } from "lucide-react";

const SafeIndex = () => {
  const [showDebug, setShowDebug] = useState(false);

  if (showDebug) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Job Handoff System - Safe Mode</h1>
            <Button onClick={() => setShowDebug(false)} variant="outline">
              Exit Debug Mode
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>✅ Application loaded successfully</p>
                <p>✅ React components rendering</p>
                <p>✅ CSS styles applied</p>
                <p>⚠️ Database queries may be limited due to RLS policies</p>
                <p>✅ Fallback data being used</p>
              </div>
            </CardContent>
          </Card>
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
              <h1 className="text-3xl font-bold text-foreground">Welcome to Job Handoff System</h1>
              <p className="text-muted-foreground mt-1">
                Managing seamless job transitions across your organization.
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

          {/* KPI Cards - Safe Version */}
          <SafeKPICards />

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Handover Pipeline */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Handover Pipeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Sample handover items */}
                    {[
                      { name: "John Smith - Operations Manager", status: "In Progress", progress: 75 },
                      { name: "Sarah Johnson - Marketing Lead", status: "Pending Review", progress: 90 },
                      { name: "Mike Chen - Technical Lead", status: "Starting", progress: 25 }
                    ].map((handover, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{handover.name}</p>
                          <p className="text-sm text-muted-foreground">{handover.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{handover.progress}%</p>
                          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{ width: `${handover.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Upcoming Deadlines */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Upcoming Deadlines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { task: "Marketing handover review", date: "Today", urgent: true },
                      { task: "Technical documentation", date: "Tomorrow", urgent: false },
                      { task: "Operations transition", date: "This week", urgent: false }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        {item.urgent ? 
                          <AlertCircle className="h-4 w-4 text-destructive" /> : 
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        }
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.task}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">✓</p>
                  <p className="text-sm">App Loaded</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">✓</p>
                  <p className="text-sm">UI Rendered</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">✓</p>
                  <p className="text-sm">Styles Applied</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">~</p>
                  <p className="text-sm">Database Limited</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default SafeIndex;