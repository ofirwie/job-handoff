import React from 'react';
import { Home, User, Users, Settings, Search, Plus, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '@/styles/monday-professional.css';

interface MondayLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

const MondayLayout: React.FC<MondayLayoutProps> = ({ children, activeTab }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: 'home', icon: Home, label: 'בית', path: '/', badge: null },
    { id: 'employee', icon: User, label: 'עובד', path: '/employee', badge: 3 },
    { id: 'manager', icon: Users, label: 'מנהל', path: '/manager', badge: 7 },
    { id: 'admin', icon: Settings, label: 'מנהל מערכת', path: '/admin', badge: null }
  ];

  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (currentPath === '/') return 'home';
    if (currentPath.includes('/employee')) return 'employee';
    if (currentPath.includes('/manager')) return 'manager';
    if (currentPath.includes('/admin')) return 'admin';
    return 'home';
  };

  const active = getActiveTab();

  return (
    <div className="monday-layout">
      {/* Sidebar */}
      <aside className="monday-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">O</div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>OFIR AI</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Handover System</div>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(({ id, icon: Icon, label, path, badge }) => (
            <Link
              key={id}
              to={path}
              className={`nav-item ${active === id ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={20} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && (
                <span style={{
                  background: '#FF5A5F',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="monday-main">
        {children}
      </main>
    </div>
  );
};

export default MondayLayout;