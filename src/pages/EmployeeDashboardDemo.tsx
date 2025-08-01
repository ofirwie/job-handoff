import React from 'react';
import EmployeeDashboard from '@/components/EmployeeDashboard';

const EmployeeDashboardDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-var(--monday-background)">
      <EmployeeDashboard 
        employeeEmail="demo@albaad.com"
        employeeName="עובד דמו"
      />
    </div>
  );
};

export default EmployeeDashboardDemo;