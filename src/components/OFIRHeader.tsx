import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface OFIRHeaderProps {
  userName?: string;
  userRole?: string;
}

const OFIRHeader: React.FC<OFIRHeaderProps> = ({ 
  userName = 'משתמש דמו', 
  userRole = 'employee' 
}) => {
  const location = useLocation();
  
  const navigationItems = [
    {
      path: '/main',
      icon: '🏠',
      text: 'דף הבית',
      description: 'סקירה כללית של החפיפות'
    },
    {
      path: '/employee',
      icon: '👤',
      text: 'עובד',
      description: 'החפיפה שלי',
      badge: '3'
    },
    {
      path: '/manager',
      icon: '👥',
      text: 'מנהל',
      description: 'ניהול צוות',
      badge: '7'
    },
    {
      path: '/admin',
      icon: '⚙️',
      text: 'מנהל מערכת',
      description: 'ניהול תבניות ומערכת'
    }
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const getUserInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  return (
    <>
      {/* Header with OFIR AI Branding */}
      <header className="ofir-main-header">
        <div className="header-container">
          <div className="brand-section">
            <div className="ofir-logo">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="20" fill="url(#ofirGradient)"/>
                <text x="20" y="26" textAnchor="middle" fill="white" 
                      fontFamily="Inter" fontWeight="bold" fontSize="16">O</text>
                <defs>
                  <linearGradient id="ofirGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#2D7EF8'}}/>
                    <stop offset="100%" style={{stopColor: '#00D4AA'}}/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">OFIR AI</h1>
              <span className="brand-subtitle">Handover System</span>
            </div>
          </div>
          
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-icon">📊</span>
              <span className="stat-text">40+ תבניות</span>
            </div>
            <div className="stat-badge">
              <span className="stat-icon">✅</span>
              <span className="stat-text">RTL Support</span>
            </div>
            <div className="stat-badge">
              <span className="stat-icon">📱</span>
              <span className="stat-text">100% Responsive</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="ofir-main-nav">
        <div className="nav-container">
          <div className="nav-links">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActivePath(item.path) ? 'active' : ''}`}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${navigationItems.indexOf(item) * 0.1}s both`
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <div>
                  <div className="nav-text">{item.text}</div>
                  <div className="nav-description">{item.description}</div>
                </div>
                {item.badge && (
                  <span className="nav-badge pulse">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
          
          <div className="nav-actions">
            <div className="user-menu">
              <div className="user-avatar">
                {getUserInitials(userName)}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ofir-gray-800)' }}>
                  {userName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ofir-gray-600)' }}>
                  {userRole === 'admin' ? 'מנהל מערכת' : 
                   userRole === 'manager' ? 'מנהל' : 'עובד'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default OFIRHeader;