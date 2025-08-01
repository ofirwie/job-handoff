import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import "./styles/monday-design-system.css";
import "./styles/ofir-ai-design-system.css";
import Index from "./pages/Index";
import SafeIndex from "./pages/SafeIndex";
import Handovers from "./pages/Handovers";
import Templates from "./pages/Templates";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";
import Settings from "./pages/Settings";
import DebugRouting from "./pages/DebugRouting";
import AppleHomeScreen from "./pages/AppleHomeScreen";
import HandoverWorkspace from "./pages/HandoverWorkspace";
import TaskFocusView from "./pages/TaskFocusView";
import EmployeeDashboardDemo from "./pages/EmployeeDashboardDemo";
import ManagerDashboardDemo from "./pages/ManagerDashboardDemo";
import AdminDashboardDemo from "./pages/AdminDashboardDemo";
import NavigationDemo from "./components/NavigationDemo";
import MondayHome from "./pages/MondayHome";
import OFIRHome from "./pages/OFIRHome";
import OFIREmployeeDashboard from "./pages/OFIREmployeeDashboard";
import OFIRManagerDashboard from "./pages/OFIRManagerDashboard";
import OFIRAdminDashboard from "./pages/OFIRAdminDashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              <p className="font-semibold">Application Error</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || 'Something went wrong. This might be a database connection issue.'}
              </p>
              <Button onClick={resetErrorBoundary} className="mt-3" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

const App = () => {
  console.log('🚀 App component rendering');
  console.log('Current URL:', window.location.href);
  console.log('Environment:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  });

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Monday.com styled main routes */}
              <Route path="/" element={<NavigationDemo />} />
              <Route path="/main" element={<OFIRHome />} />
              <Route path="/handover/:handoverId" element={<HandoverWorkspace />} />
              <Route path="/handover/:handoverId/task/:taskIndex" element={<TaskFocusView />} />
              
              {/* Role-based dashboards - OFIR AI Style */}
              <Route path="/employee" element={<OFIREmployeeDashboard />} />
              <Route path="/manager" element={<OFIRManagerDashboard />} />
              <Route path="/admin" element={<OFIRAdminDashboard />} />
              
              {/* Legacy role-based dashboards */}
              <Route path="/employee-demo" element={<EmployeeDashboardDemo />} />
              <Route path="/manager-demo" element={<ManagerDashboardDemo />} />
              <Route path="/admin-demo" element={<AdminDashboardDemo />} />
              
              {/* Settings and utilities */}
              <Route path="/demo" element={<NavigationDemo />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Legacy routes for comparison */}
              <Route path="/classic" element={<Index />} />
              <Route path="/classic/handovers" element={<Handovers />} />
              <Route path="/classic/templates" element={<Templates />} />
              <Route path="/apple" element={<AppleHomeScreen />} />
              
              {/* Utility routes */}
              <Route path="/safe" element={<SafeIndex />} />
              <Route path="/debug" element={<DebugRouting />} />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
