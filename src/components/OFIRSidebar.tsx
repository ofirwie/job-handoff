import React from 'react';
import { BarChart3, Users, ClipboardList, FileText, CheckCircle } from 'lucide-react';

interface OFIRSidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
}

export const OFIRSidebar: React.FC<OFIRSidebarProps> = ({ 
  activeItem = 'manager-dashboard',
  onNavigate 
}) => {
  const menuItems = [
    {
      id: 'manager-dashboard',
      icon: BarChart3,
      label: 'Manager Dashboard'
    },
    {
      id: 'team-management',
      icon: Users,
      label: 'Team Management'
    },
    {
      id: 'task-assignment',
      icon: ClipboardList,
      label: 'Task Assignment'
    },
    {
      id: 'reports',
      icon: FileText,
      label: 'Reports'
    },
    {
      id: 'approvals',
      icon: CheckCircle,
      label: 'Approvals'
    }
  ];

  return (
    <div className="w-64 h-screen bg-slate-700 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-600">
        <h1 className="text-xl font-bold text-center">
          OFIR AI | Management
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate?.(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white font-medium' 
                      : 'text-slate-300 hover:bg-slate-600 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-600">
        <div className="text-center text-slate-400 text-sm">
          OFIR AI System
        </div>
      </div>
    </div>
  );
};

export default OFIRSidebar;