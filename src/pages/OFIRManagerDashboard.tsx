import React from 'react';
import OFIRHeader from '@/components/OFIRHeader';
import ManagerDashboard from '@/components/ManagerDashboard';

const OFIRManagerDashboard: React.FC = () => {
  return (
    <div className="ofir-dashboard">
      <OFIRHeader userName="מנהל הצוות" userRole="manager" />
      <ManagerDashboard managerEmail="manager@company.com" />
    </div>
  );
};

export default OFIRManagerDashboard;