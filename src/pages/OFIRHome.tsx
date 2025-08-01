import React from 'react';
import OFIRHeader from '@/components/OFIRHeader';
import MondayHandoverOverview from '@/components/MondayHandoverOverview';

const OFIRHome: React.FC = () => {
  const userRole = {
    type: 'employee' as const,
    email: 'demo@albaad.com',
    name: 'משתמש דמו'
  };

  return (
    <div className="ofir-dashboard">
      <OFIRHeader userName="משתמש דמו" userRole="employee" />
      <MondayHandoverOverview userRole={userRole} />
    </div>
  );
};

export default OFIRHome;