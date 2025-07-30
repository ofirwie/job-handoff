import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  BarChart3,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JobWizard } from "@/components/job-wizard/JobWizard";
import { cn } from "@/lib/utils";
import type { GeneratedTemplate, JobRequest } from "@/types/template.types";

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showJobWizard, setShowJobWizard] = useState(false);
  const location = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "Handovers",
      icon: Users,
      href: "/handovers",
      badge: "12",
    },
    {
      title: "Templates",
      icon: FileText,
      href: "/templates",
    },
    {
      title: "Calendar",
      icon: Calendar,
      href: "/calendar",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
    {
      title: "Organization",
      icon: Building,
      href: "/organization",
    },
  ];

  const bottomItems = [
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
    {
      title: "Help",
      icon: HelpCircle,
      href: "/help",
    },
  ];

  const handleNewHandover = () => {
    setShowJobWizard(true);
  };

  const handleJobWizardComplete = (template: GeneratedTemplate, jobRequest: JobRequest) => {
    console.log("Job wizard completed:", { template, jobRequest });
    setShowJobWizard(false);
    // Here you would typically save the template and create a handover
    // For now, we'll just close the wizard
  };

  const handleJobWizardCancel = () => {
    setShowJobWizard(false);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-4 top-6 z-10 h-8 w-8 rounded-full border bg-background shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Navigation Header */}
      <div className="p-6">
        <Button 
          className="w-full btn-enterprise"
          onClick={handleNewHandover}
        >
          <Plus className="mr-2 h-4 w-4" />
          {!isCollapsed && "New Handover"}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2 px-3">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "nav-item",
                isActive && "nav-item-active"
              )}
              onClick={() => {
                console.log('🔗 Sidebar navigation clicked:', item.href);
                console.log('Current location:', location.pathname);
              }}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="ml-3">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="space-y-2 p-3">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors nav-item",
                isActive && "nav-item-active"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.title}</span>}
            </Link>
          );
        })}
      </div>

      {/* Job Wizard Dialog */}
      <Dialog open={showJobWizard} onOpenChange={setShowJobWizard}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Handover</DialogTitle>
          </DialogHeader>
          <JobWizard
            onComplete={handleJobWizardComplete}
            onCancel={handleJobWizardCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};