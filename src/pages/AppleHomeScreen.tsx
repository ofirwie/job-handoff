import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHandovers } from "@/hooks/useAppleHandovers";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { JobWizard } from "@/components/job-wizard/JobWizard";
import type { GeneratedTemplate, JobRequest } from "@/types/template.types";

// Apple-style minimalist home screen
const AppleHomeScreen = () => {
  const navigate = useNavigate();
  const { handovers, loading, urgentAction } = useHandovers();
  const [showNewHandover, setShowNewHandover] = useState(false);

  // Apple-style: Go directly to handover on tap
  const openHandover = (handoverId: string) => {
    navigate(`/handover/${handoverId}`);
  };

  const handleJobWizardComplete = (template: GeneratedTemplate, jobRequest: JobRequest) => {
    console.log("New handover created:", { template, jobRequest });
    setShowNewHandover(false);
    // In real implementation, this would create a new handover and navigate to it
  };

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header - just title and action */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Handovers</h1>
          <Button 
            onClick={() => setShowNewHandover(true)}
            className="rounded-full"
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Urgent action if exists - Apple style alert */}
        {urgentAction && (
          <div 
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl cursor-pointer 
                       hover:bg-red-100 transition-colors"
            onClick={() => openHandover(urgentAction.handoverId)}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{urgentAction.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{urgentAction.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Simple handover list - iPhone style */}
        <div className="space-y-1">
          {handovers.map((handover) => (
            <HandoverCard
              key={handover.id}
              handover={handover}
              onClick={() => openHandover(handover.id)}
            />
          ))}
        </div>

        {/* Empty state */}
        {handovers.length === 0 && !urgentAction && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No active handovers</p>
            <Button 
              onClick={() => setShowNewHandover(true)}
              variant="outline"
              className="rounded-full"
            >
              Create your first handover
            </Button>
          </div>
        )}
      </div>

      {/* New Handover Dialog */}
      <Dialog open={showNewHandover} onOpenChange={setShowNewHandover}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <JobWizard
            onComplete={handleJobWizardComplete}
            onCancel={() => setShowNewHandover(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Apple-style handover card component
const HandoverCard = ({ handover, onClick }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-gray-400';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressRingColor = (progress: number) => {
    if (progress === 100) return 'text-green-500';
    if (progress >= 75) return 'text-blue-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-gray-300';
  };

  return (
    <div 
      className="bg-white rounded-2xl p-4 cursor-pointer hover:bg-gray-50 
                 transition-all hover:shadow-sm border border-gray-100"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {/* Progress Ring - Apple Watch style */}
        <div className="relative">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - handover.progress / 100)}`}
              className={getProgressRingColor(handover.progress)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{handover.progress}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{handover.employeeName}</h3>
              <p className="text-sm text-gray-500">{handover.role}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${getStatusColor(handover.status)}`}>
                {handover.statusLabel}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{handover.timeLeft}</p>
            </div>
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="h-5 w-5 text-gray-300" />
      </div>
    </div>
  );
};

export default AppleHomeScreen;