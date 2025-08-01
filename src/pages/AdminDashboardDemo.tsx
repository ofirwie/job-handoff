import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';

const AdminDashboardDemo: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--monday-background)' }}>
      <AdminDashboard 
        adminEmail="admin@albaad.com"
        adminName="מנהל מערכת"
      />
    </div>
  );
};

export default AdminDashboardDemo;