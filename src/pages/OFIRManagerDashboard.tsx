import React from 'react';
import ManagerDashboardErrorBoundary from '@/components/ManagerDashboardErrorBoundary';
import ManagerDashboardFigmaActual from '@/components/ManagerDashboardFigmaActual';

const OFIRManagerDashboard: React.FC = () => {
  console.log('🚀 OFIRManagerDashboard component rendering - YOUR ACTUAL FIGMA DESIGN');
  
  return (
<<<<<<< HEAD
    <ManagerDashboardErrorBoundary>
      <ManagerDashboardFigmaActual 
        managerEmail="manager@example.com"
        managerName="Michael Cohen"
        department="Product Engineering"
      />
    </ManagerDashboardErrorBoundary>
=======
    <div className="ofir-dashboard">
      <OFIRHeader userName="מנהל הצוות" userRole="manager" />
      <ManagerDashboard managerEmail="manager@company.com" />
    </div>
>>>>>>> 47956d2e5208f30974405f487cb58b8cd0707619
  );
};

export default OFIRManagerDashboard;