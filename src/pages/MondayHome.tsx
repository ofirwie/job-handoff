import React from 'react';
import MondayHandoverOverview from '@/components/MondayHandoverOverview';

const MondayHome: React.FC = () => {
  const userRole = {
    type: 'employee' as const,
    email: 'demo@albaad.com',
    name: 'משתמש דמו'
  };

  return <MondayHandoverOverview userRole={userRole} />;
};

export default MondayHome;