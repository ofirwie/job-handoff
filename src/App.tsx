import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import Index from "./pages/Index";
import SafeIndex from "./pages/SafeIndex";
import Handovers from "./pages/Handovers";
import Templates from "./pages/Templates";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";
import DebugRouting from "./pages/DebugRouting";
import AppleHomeScreen from "./pages/AppleHomeScreen";
import HandoverWorkspace from "./pages/HandoverWorkspace";
import TaskFocusView from "./pages/TaskFocusView";
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
              {/* Apple-style routes - simple and linear */}
              <Route path="/" element={<AppleHomeScreen />} />
              <Route path="/handover/:handoverId" element={<HandoverWorkspace />} />
              <Route path="/handover/:handoverId/task/:taskIndex" element={<TaskFocusView />} />
              
              {/* Legacy routes for comparison */}
              <Route path="/classic" element={<Index />} />
              <Route path="/classic/handovers" element={<Handovers />} />
              <Route path="/classic/templates" element={<Templates />} />
              
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
