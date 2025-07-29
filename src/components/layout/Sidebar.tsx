import { useState } from "react";
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
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      isActive: true,
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
        <Button className="w-full btn-enterprise">
          <Plus className="mr-2 h-4 w-4" />
          {!isCollapsed && "New Handover"}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2 px-3">
        {navigationItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "nav-item",
              item.isActive && "nav-item-active"
            )}
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
          </a>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="space-y-2 p-3">
        {bottomItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center rounded-lg px-3 py-2 text-sm font-medium nav-item"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="ml-3">{item.title}</span>}
          </a>
        ))}
      </div>
    </div>
  );
};