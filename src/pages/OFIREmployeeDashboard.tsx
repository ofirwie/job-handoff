import React from 'react';
import OFIRHeader from '@/components/OFIRHeader';
import EmployeeDashboard from '@/components/EmployeeDashboard';

const OFIREmployeeDashboard: React.FC = () => {
  return (
    <div className="ofir-dashboard">
      <OFIRHeader userName="יוסי כהן" userRole="employee" />
      <EmployeeDashboard employeeEmail="employee@company.com" />
    </div>
  );
};

export default OFIREmployeeDashboard;