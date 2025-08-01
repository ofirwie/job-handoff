import React from 'react';
import OFIRHeader from '@/components/OFIRHeader';
import AdminDashboard from '@/components/AdminDashboard';

const OFIRAdminDashboard: React.FC = () => {
  return (
    <div className="ofir-dashboard">
      <OFIRHeader userName="מנהל המערכת" userRole="admin" />
      <div className="dashboard-content">
        <div className="dashboard-header" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="ofir-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="ofir-card-header">
              <h2 className="ofir-card-title">🤖 OFIR AI - Template Wizard</h2>
              <p className="ofir-card-subtitle">
                מערכת ניהול תבניות חכמה עם אינטליגנציה מלאכותית
              </p>
            </div>
            <div className="ofir-card-body">
              <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="dashboard-card">
                  <div className="card-icon" style={{ background: 'linear-gradient(135deg, var(--ofir-primary) 0%, var(--ofir-secondary) 100%)', color: 'white' }}>
                    🎯
                  </div>
                  <div className="card-metric">40+</div>
                  <div className="card-label">תבניות חפיפות</div>
                  <div className="card-change positive">+12 השבוע</div>
                </div>
                
                <div className="dashboard-card">
                  <div className="card-icon" style={{ background: 'linear-gradient(135deg, var(--ofir-success) 0%, #00E5AA 100%)', color: 'white' }}>
                    🤖
                  </div>
                  <div className="card-metric">AI</div>
                  <div className="card-label">מסייע חכם</div>
                  <div className="card-change positive">מופעל</div>
                </div>
                
                <div className="dashboard-card">
                  <div className="card-icon" style={{ background: 'linear-gradient(135deg, var(--ofir-warning) 0%, #FFC040 100%)', color: 'white' }}>
                    📊
                  </div>
                  <div className="card-metric">95%</div>
                  <div className="card-label">יעילות מערכת</div>
                  <div className="card-change positive">+5% החודש</div>
                </div>
              </div>
              
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button className="ofir-btn ofir-btn-primary ofir-btn-lg" style={{ marginRight: '1rem' }}>
                  🎯 יצירת תבנית חדשה
                </button>
                <button className="ofir-btn ofir-btn-secondary ofir-btn-lg">
                  📈 דוחות וניתוחים
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <AdminDashboard adminEmail="admin@company.com" />
      </div>
    </div>
  );
};

export default OFIRAdminDashboard;