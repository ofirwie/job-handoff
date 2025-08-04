import React, { useState } from 'react';
import OFIRSidebar from './OFIRSidebar';
import TeamHandoversExact from './TeamHandoversExact';

interface ManagerDashboardFigmaActualProps {
  managerEmail: string;
  managerName?: string;
  department?: string;
}

export const ManagerDashboardFigmaActual: React.FC<ManagerDashboardFigmaActualProps> = ({
  managerEmail,
  managerName = "Manager",
  department
}) => {
  const [currentView, setCurrentView] = useState('manager-dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'manager-dashboard':
        return <TeamHandoversExact />;
      case 'team-management':
        return (
          <div className="flex-1 bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Management</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-gray-400 text-lg mb-2">Team Management</div>
              <div className="text-gray-500 text-sm">Coming Soon</div>
            </div>
          </div>
        );
      case 'task-assignment':
        return (
          <div className="flex-1 bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Assignment</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-gray-400 text-lg mb-2">Task Assignment</div>
              <div className="text-gray-500 text-sm">Coming Soon</div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="flex-1 bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-gray-400 text-lg mb-2">Reports</div>
              <div className="text-gray-500 text-sm">Coming Soon</div>
            </div>
          </div>
        );
      case 'approvals':
        return (
          <div className="flex-1 bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Approvals</h1>
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-gray-400 text-lg mb-2">Approvals</div>
              <div className="text-gray-500 text-sm">Coming Soon</div>
            </div>
          </div>
        );
      default:
        return <TeamHandoversExact />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100" dir="ltr">
      {/* Sidebar */}
      <OFIRSidebar 
        activeItem={currentView}
        onNavigate={setCurrentView}
      />
      
      {/* Main Content */}
      {renderContent()}
      
      {/* Debug Info */}
      <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
        <div className="font-semibold text-blue-900">🎨 Figma Design Active</div>
        <div className="text-blue-700 mt-1">
          Manager: {managerName}<br/>
          Email: {managerEmail}<br/>
          View: {currentView}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardFigmaActual;