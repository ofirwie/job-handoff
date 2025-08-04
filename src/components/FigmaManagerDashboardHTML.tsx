import React from 'react';

const FigmaManagerDashboardHTML = () => {
  return (
    <div className="dashboard-container" style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ width: '236px', backgroundColor: '#42526e', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-logo" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '32px', padding: '12px' }}>
          OFIR AI
        </div>
        <nav className="sidebar-nav" style={{ flex: 1 }}>
          <div className="sidebar-item" style={{ color: 'rgba(255, 255, 255, 0.8)', padding: '12px 16px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="sidebar-icon">🏠</span>
            <span>Dashboard</span>
          </div>
          <div className="sidebar-item active" style={{ backgroundColor: '#2d7ef8', color: 'white', padding: '12px 16px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="sidebar-icon">👥</span>
            <span>Handovers</span>
          </div>
          <div className="sidebar-item" style={{ color: 'rgba(255, 255, 255, 0.8)', padding: '12px 16px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="sidebar-icon">📊</span>
            <span>Reports</span>
          </div>
          <div className="sidebar-item" style={{ color: 'rgba(255, 255, 255, 0.8)', padding: '12px 16px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="sidebar-icon">👤</span>
            <span>Employees</span>
          </div>
          <div className="sidebar-item" style={{ color: 'rgba(255, 255, 255, 0.8)', padding: '12px 16px', marginBottom: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="sidebar-icon">⚙️</span>
            <span>Settings</span>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fafbfc' }}>
        {/* Header */}
        <div className="header" style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid #e6e6e6', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 className="header-title" style={{ fontSize: '20px', fontWeight: 600, color: '#172b4d' }}>
              Manager Dashboard
            </h1>
            <input 
              type="text" 
              className="search-box" 
              placeholder="Search handovers..."
              style={{ width: '300px', height: '36px', backgroundColor: '#f4f5f7', border: '1px solid #dfe1e6', borderRadius: '6px', padding: '0 12px', fontSize: '14px' }}
            />
          </div>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="notification-icon" style={{ width: '32px', height: '32px', backgroundColor: '#dfe1e6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              🔔
            </div>
            <div className="user-avatar" style={{ width: '32px', height: '32px', backgroundColor: '#2d7ef8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontWeight: 500 }}>
              JM
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="dashboard-content" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {/* Filters Bar */}
          <div className="filters-bar" style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div className="filter-dropdown" style={{ padding: '8px 16px', backgroundColor: '#f4f5f7', border: '1px solid #dfe1e6', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Status
              <span>▼</span>
            </div>
            <div className="filter-dropdown" style={{ padding: '8px 16px', backgroundColor: '#f4f5f7', border: '1px solid #dfe1e6', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Department
              <span>▼</span>
            </div>
            <div className="filter-dropdown" style={{ padding: '8px 16px', backgroundColor: '#f4f5f7', border: '1px solid #dfe1e6', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Date Range
              <span>▼</span>
            </div>
          </div>
          
          {/* Data Table */}
          <div className="data-table" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '180px 164px 164px 273px 264px', backgroundColor: '#f4f5f7', padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div>Employee</div>
              <div>Department</div>
              <div>Progress</div>
              <div>Handover Date</div>
              <div>Status</div>
            </div>
            
            {/* Sample Data Rows */}
            {[
              { initials: 'JD', name: 'John Doe', role: 'Senior Developer', dept: 'Engineering', progress: 75, date: 'Dec 15, 2024', status: 'in-progress' },
              { initials: 'SM', name: 'Sarah Miller', role: 'Product Manager', dept: 'Product', progress: 100, date: 'Dec 10, 2024', status: 'completed' },
              { initials: 'MJ', name: 'Mike Johnson', role: 'Sales Executive', dept: 'Sales', progress: 30, date: 'Dec 20, 2024', status: 'pending' },
              { initials: 'EW', name: 'Emily Wilson', role: 'HR Manager', dept: 'Human Resources', progress: 0, date: 'Dec 5, 2024', status: 'overdue' }
            ].map((row, index) => (
              <div key={index} className="table-row" style={{ display: 'grid', gridTemplateColumns: '180px 164px 164px 273px 264px', padding: '16px 24px', borderBottom: '1px solid #e6e6e6', alignItems: 'center' }}>
                <div className="employee-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="employee-avatar" style={{ width: '32px', height: '32px', backgroundColor: '#2d7ef8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 500, fontSize: '14px' }}>
                    {row.initials}
                  </div>
                  <div>
                    <div className="employee-name" style={{ fontWeight: 500, color: '#172b4d' }}>{row.name}</div>
                    <div className="employee-role" style={{ fontSize: '12px', color: '#6b7280' }}>{row.role}</div>
                  </div>
                </div>
                <div>{row.dept}</div>
                <div>
                  <div className="progress-bar" style={{ width: '120px', height: '8px', backgroundColor: '#e6e6e6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div className="progress-fill" style={{ height: '100%', backgroundColor: '#22c55e', width: `${row.progress}%` }}></div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{row.progress}%</span>
                </div>
                <div>{row.date}</div>
                <div>
                  <span className={`status-badge status-${row.status}`} style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: row.status === 'completed' ? '#dcfce7' : row.status === 'in-progress' ? '#dbeafe' : row.status === 'pending' ? '#fed7aa' : '#fee2e2',
                    color: row.status === 'completed' ? '#22c55e' : row.status === 'in-progress' ? '#2d7ef8' : row.status === 'pending' ? '#f59e0b' : '#dc2626'
                  }}>
                    {row.status.replace('-', ' ').replace(/w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigmaManagerDashboardHTML;