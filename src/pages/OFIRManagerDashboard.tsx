import React from 'react';
import ManagerDashboardErrorBoundary from '@/components/ManagerDashboardErrorBoundary';
import ManagerDashboardFigmaActual from '@/components/ManagerDashboardFigmaActual';

const OFIRManagerDashboard: React.FC = () => {
  console.log('🚀 OFIRManagerDashboard component rendering - YOUR ACTUAL FIGMA DESIGN');
  
  return (
    <ManagerDashboardErrorBoundary>
      <ManagerDashboardFigmaActual 
        managerEmail="manager@example.com"
        managerName="Michael Cohen"
        department="Product Engineering"
      />
    </ManagerDashboardErrorBoundary>
  );
};

export default OFIRManagerDashboard;