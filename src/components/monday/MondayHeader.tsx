import React from 'react';
import { Search, Plus, Bell, ChevronDown } from 'lucide-react';

interface MondayHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  onNewHandover?: () => void;
  userName?: string;
  userInitials?: string;
}

const MondayHeader: React.FC<MondayHeaderProps> = ({ 
  title, 
  subtitle, 
  rightContent,
  onNewHandover,
  userName = 'משתמש',
  userInitials = 'AB'
}) => {
  return (
    <header className="monday-header">
      <div>
        <h1 className="header-title">{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '14px', color: '#676879', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="header-actions">
        <div className="search-container" style={{ marginBottom: 0 }}>
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="חיפוש..."
            className="search-input"
            style={{ marginBottom: 0 }}
          />
        </div>
        
        <button className="monday-btn monday-btn-secondary">
          <Bell size={16} />
        </button>
        
        {onNewHandover && (
          <button className="monday-btn monday-btn-primary" onClick={onNewHandover}>
            <Plus size={16} />
            חפיפה חדשה
          </button>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
          <div className="avatar avatar-primary">{userInitials}</div>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{userName}</span>
          <ChevronDown size={16} style={{ color: '#676879' }} />
        </div>
        
        {rightContent}
      </div>
    </header>
  );
};

export default MondayHeader;