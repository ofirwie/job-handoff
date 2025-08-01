import React from 'react';
import MondayManagerDashboard from '@/components/MondayManagerDashboard';

const ManagerDashboardDemo: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--monday-background)' }}>
      <MondayManagerDashboard 
        managerEmail="manager@albaad.com"
        managerName="מנהל דמו"
        department="הנדסה"
      />
    </div>
  );
};

export default ManagerDashboardDemo;