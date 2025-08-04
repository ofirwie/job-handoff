import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useManagerDashboardSupabase } from '@/hooks/useManagerDashboardSupabase';
import { ChevronDown, Search } from 'lucide-react';

// EXACT colors from figma-manager-dashboard-specs.json
const FIGMA_COLORS = {
  background: '#fafbfc',
  sidebar: '#42526e',
  sidebarHover: '#33334d',
  sidebarActive: '#2d7ef8',
  white: '#ffffff',
  black: '#000000',
  divider: '#e6e6e6',
  filterBg: '#fafafc',
  border: '#ccd1db',
  textGray: '#cccccc',
  textLight: '#999999',
  // Status colors from Figma
  overdue: '#d42e2e',
  overdueProgress: '#cc7821',
  today: '#2d7ef8',
  todayProgress: '#22c55e',
  thisWeek: '#22c55e',
  nextWeek: '#6b7280',
  pending: '#f59e0b'
};

// EXACT dimensions from Figma
const DIMENSIONS = {
  frame: { width: 1440, height: 900 },
  sidebar: { width: 236, height: 900 },
  contentStart: 306,
  // Column positions from Figma components
  columns: {
    position: { x: 323, width: 180 },
    team: { x: 525, width: 164 },
    progress: { x: 711, width: 164 },
    date: { x: 897, width: 273 },
    status: { x: 1180, width: 264 }
  },
  // Divider positions from Figma
  dividers: [503, 689, 875, 1170],
  rowHeight: 53,
  statusBadge: { width: 264, height: 35 }
};

export default function FigmaTableDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, loading, error, filters, updateFilters, refresh } = useManagerDashboardSupabase({
    auto_refresh: true,
    refresh_interval: 30000
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    } else {
      setCurrentUser(user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const filterHandovers = (handovers: any[]) => {
    if (!searchQuery) return handovers;
    const query = searchQuery.toLowerCase();
    return handovers.filter(h => 
      h.leaving_employee_name?.toLowerCase().includes(query) ||
      h.incoming_employee_name?.toLowerCase().includes(query) ||
      h.job_title?.toLowerCase().includes(query) ||
      h.department_name?.toLowerCase().includes(query)
    );
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'overdue': return FIGMA_COLORS.overdue;
      case 'in_progress': return FIGMA_COLORS.today;
      case 'completed': return FIGMA_COLORS.thisWeek;
      case 'pending_review': return FIGMA_COLORS.pending;
      default: return FIGMA_COLORS.nextWeek;
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch(category) {
      case 'overdue': return '🔴';
      case 'today': return '🔵';
      case 'this_week': return '🟢';
      case 'next_week': return '⚫';
      default: return '';
    }
  };

  const getProgressColor = (category: string, percentage: number) => {
    if (category === 'overdue') return FIGMA_COLORS.overdueProgress;
    if (percentage === 100) return FIGMA_COLORS.thisWeek;
    if (category === 'today') return FIGMA_COLORS.todayProgress;
    return FIGMA_COLORS.nextWeek;
  };

  const renderTableRow = (handover: any, index: number, yPosition: number) => {
    const statusColor = getStatusColor(handover.status);
    const progressColor = getProgressColor(handover.time_category, handover.completion_percentage || 0);
    
    return (
      <div key={handover.id} style={{ position: 'relative' }}>
        {/* Row Background */}
        <div style={{
          position: 'absolute',
          left: DIMENSIONS.contentStart,
          top: yPosition,
          width: 1148,
          height: DIMENSIONS.rowHeight,
          backgroundColor: FIGMA_COLORS.white,
          border: `1px solid ${FIGMA_COLORS.divider}`,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: index === 0 ? `1px solid ${FIGMA_COLORS.divider}` : 'none'
        }} />

        {/* Column 1: Position */}
        <div style={{
          position: 'absolute',
          left: DIMENSIONS.columns.position.x,
          top: yPosition + 17,
          width: DIMENSIONS.columns.position.width,
          fontSize: '14px',
          fontWeight: 500,
          color: FIGMA_COLORS.sidebar,
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}>
          {handover.job_title}
        </div>

        {/* Column 2: Team */}
        <div style={{
          position: 'absolute',
          left: DIMENSIONS.columns.team.x,
          top: yPosition + 17,
          width: DIMENSIONS.columns.team.width,
          fontSize: '14px',
          fontWeight: 400,
          color: FIGMA_COLORS.sidebar,
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}>
          {handover.leaving_employee_name} → {handover.incoming_employee_name || 'TBD'}
        </div>

        {/* Column 3: Progress */}
        <div style={{
          position: 'absolute',
          left: DIMENSIONS.columns.progress.x,
          top: yPosition + 17,
          width: DIMENSIONS.columns.progress.width,
          fontSize: '14px',
          fontWeight: 500,
          color: progressColor,
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}>
          {handover.completed_items || 0} out of {handover.total_items || 0} completed
        </div>

        {/* Column 4: Date */}
        <div style={{
          position: 'absolute',
          left: DIMENSIONS.columns.date.x,
          top: yPosition + 17,
          width: DIMENSIONS.columns.date.width,
          fontSize: '14px',
          fontWeight: 400,
          color: FIGMA_COLORS.sidebar,
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}>
          {new Date(handover.due_date).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>

        {/* Column 5: Status Badge */}
        <div style={{
          position: 'absolute',
          left: DIMENSIONS.columns.status.x,
          top: yPosition + 9,
          width: DIMENSIONS.statusBadge.width,
          height: DIMENSIONS.statusBadge.height,
          backgroundColor: statusColor,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: 400,
            color: FIGMA_COLORS.white,
            fontFamily: 'Inter, -apple-system, sans-serif'
          }}>
            {handover.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Vertical Dividers */}
        {DIMENSIONS.dividers.map((x, idx) => (
          <div key={idx} style={{
            position: 'absolute',
            left: x,
            top: yPosition,
            width: 1,
            height: DIMENSIONS.rowHeight,
            backgroundColor: FIGMA_COLORS.divider
          }} />
        ))}
      </div>
    );
  };

  const renderCategory = (category: string, handovers: any[], startY: number) => {
    const filteredHandovers = filterHandovers(handovers);
    if (filteredHandovers.length === 0) return { endY: startY };

    const categoryColors = {
      'overdue': FIGMA_COLORS.overdue,
      'today': FIGMA_COLORS.today,
      'this_week': FIGMA_COLORS.thisWeek,
      'next_week': FIGMA_COLORS.nextWeek
    };

    const categoryLabels = {
      'overdue': 'Overdue handovers',
      'today': 'Today',
      'this_week': 'This Week',
      'next_week': 'Next Week'
    };

    let currentY = startY;

    return (
      <>
        {/* Category Header */}
        <div style={{
          position: 'absolute',
          left: DIMENSIONS.contentStart,
          top: currentY,
          fontSize: '16px',
          fontWeight: 600,
          color: categoryColors[category as keyof typeof categoryColors],
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}>
          <span style={{ fontSize: '12px', marginRight: '4px' }}>
            ▼ {getCategoryEmoji(category)}
          </span>
          {categoryLabels[category as keyof typeof categoryLabels]} / {filteredHandovers.length} {filteredHandovers.length === 1 ? 'item' : 'items'}
        </div>

        {/* Table Rows */}
        {filteredHandovers.map((handover, index) => 
          renderTableRow(handover, index, currentY + 35 + (index * DIMENSIONS.rowHeight))
        )}
      </>
    );
  };

  let yOffset = 320; // Start position for content

  return (
    <div 
      style={{ 
        width: DIMENSIONS.frame.width,
        height: DIMENSIONS.frame.height,
        backgroundColor: FIGMA_COLORS.background,
        display: 'flex',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Manager Sidebar - EXACT from Figma */}
      <div 
        style={{
          width: DIMENSIONS.sidebar.width,
          height: DIMENSIONS.sidebar.height,
          backgroundColor: FIGMA_COLORS.sidebar,
          position: 'absolute',
          left: 60,
          top: 100,
          zIndex: 10
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '30px 20px',
          borderBottom: `1px solid ${FIGMA_COLORS.sidebarHover}`
        }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: FIGMA_COLORS.white,
            margin: 0,
            fontFamily: 'Inter'
          }}>
            OFIR AI | Management
          </h1>
        </div>

        {/* Manager Profile */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${FIGMA_COLORS.sidebarHover}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: FIGMA_COLORS.textGray,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: FIGMA_COLORS.white
              }}>
                {currentUser?.email?.charAt(0).toUpperCase() || 'M'}
              </span>
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: FIGMA_COLORS.white
              }}>
                Manager
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 400,
                color: FIGMA_COLORS.textGray
              }}>
                {currentUser?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '20px 0' }}>
          <div 
            style={{
              padding: '12px 20px',
              backgroundColor: FIGMA_COLORS.sidebarActive,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: FIGMA_COLORS.white
            }}>
              Dashboard
            </span>
          </div>
          {['Team', 'Tasks', 'Reports', 'Approvals'].map(item => (
            <div 
              key={item}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{
                fontSize: '14px',
                fontWeight: 500,
                color: FIGMA_COLORS.textGray
              }}>
                {item}
              </span>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '20px',
          right: '20px'
        }}>
          <button
            onClick={handleLogout}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: FIGMA_COLORS.textGray,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        position: 'absolute',
        left: DIMENSIONS.contentStart,
        top: 130,
        right: 0,
        bottom: 0
      }}>
        {/* Title */}
        <h2 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: FIGMA_COLORS.sidebar,
          margin: 0,
          fontFamily: 'Inter'
        }}>
          Team Handovers
        </h2>

        {/* Filters Bar */}
        <div style={{
          marginTop: '24px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          {/* Department Filter */}
          <div style={{
            backgroundColor: FIGMA_COLORS.filterBg,
            border: `1px solid ${FIGMA_COLORS.border}`,
            borderRadius: '4px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '140px',
            cursor: 'pointer'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: FIGMA_COLORS.sidebar
            }}>
              Department
            </span>
            <ChevronDown size={16} color={FIGMA_COLORS.sidebar} />
          </div>

          {/* Role Filter */}
          <div style={{
            backgroundColor: FIGMA_COLORS.filterBg,
            border: `1px solid ${FIGMA_COLORS.border}`,
            borderRadius: '4px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '100px',
            cursor: 'pointer'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: FIGMA_COLORS.sidebar
            }}>
              Role
            </span>
            <ChevronDown size={16} color={FIGMA_COLORS.sidebar} />
          </div>

          {/* Year Filter */}
          <div style={{
            backgroundColor: FIGMA_COLORS.filterBg,
            border: `1px solid ${FIGMA_COLORS.border}`,
            borderRadius: '4px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '100px',
            cursor: 'pointer'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: FIGMA_COLORS.sidebar
            }}>
              2025
            </span>
            <ChevronDown size={16} color={FIGMA_COLORS.sidebar} />
          </div>

          {/* Month Filter */}
          <div style={{
            backgroundColor: FIGMA_COLORS.filterBg,
            border: `1px solid ${FIGMA_COLORS.border}`,
            borderRadius: '4px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '100px',
            cursor: 'pointer'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: FIGMA_COLORS.sidebar
            }}>
              All
            </span>
            <ChevronDown size={16} color={FIGMA_COLORS.sidebar} />
          </div>

          {/* Search Box */}
          <div style={{
            flex: 1,
            maxWidth: '300px',
            backgroundColor: FIGMA_COLORS.filterBg,
            border: `1px solid ${FIGMA_COLORS.border}`,
            borderRadius: '4px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Search size={16} color={FIGMA_COLORS.textLight} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '14px',
                fontWeight: 400,
                color: FIGMA_COLORS.sidebar,
                width: '100%'
              }}
            />
          </div>

          {/* Hide Completed */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <input 
              type="checkbox"
              checked={filters.hide_completed || false}
              onChange={(e) => updateFilters({ hide_completed: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
            <span style={{
              fontSize: '14px',
              fontWeight: 400,
              color: FIGMA_COLORS.sidebar
            }}>
              Hide Completed
            </span>
          </label>
        </div>

        {/* Table Content */}
        <div style={{ position: 'relative', marginTop: '40px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: FIGMA_COLORS.sidebar }}>Loading...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: FIGMA_COLORS.overdue }}>Error: {error}</p>
            </div>
          ) : (
            <>
              {/* Overdue Section */}
              {data?.grouped.overdue && data.grouped.overdue.length > 0 && 
                renderCategory('overdue', data.grouped.overdue, yOffset)}
              
              {/* Today Section */}
              {data?.grouped.today && data.grouped.today.length > 0 && 
                renderCategory('today', data.grouped.today, 
                  yOffset + (data?.grouped.overdue?.length || 0) * DIMENSIONS.rowHeight + 100)}
              
              {/* This Week Section */}
              {data?.grouped.this_week && data.grouped.this_week.length > 0 && 
                renderCategory('this_week', data.grouped.this_week, 
                  yOffset + ((data?.grouped.overdue?.length || 0) + (data?.grouped.today?.length || 0)) * DIMENSIONS.rowHeight + 200)}
              
              {/* Next Week Section */}
              {data?.grouped.next_week && data.grouped.next_week.length > 0 && 
                renderCategory('next_week', data.grouped.next_week, 
                  yOffset + ((data?.grouped.overdue?.length || 0) + (data?.grouped.today?.length || 0) + (data?.grouped.this_week?.length || 0)) * DIMENSIONS.rowHeight + 300)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}