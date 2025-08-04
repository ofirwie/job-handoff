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
  contentStart: 306, // sidebar(236) + gap(70)
  titlePosition: { x: 306, y: 130 },
  statusBadge: { width: 264, height: 36 }
};

export default function FigmaExactDashboard() {
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

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'overdue': return FIGMA_COLORS.overdue;
      case 'today': return FIGMA_COLORS.today;
      case 'this_week': return FIGMA_COLORS.thisWeek;
      case 'next_week': return FIGMA_COLORS.nextWeek;
      default: return FIGMA_COLORS.textGray;
    }
  };

  const getProgressColor = (category: string) => {
    switch(category) {
      case 'overdue': return FIGMA_COLORS.overdueProgress;
      case 'today': return FIGMA_COLORS.todayProgress;
      case 'this_week': return FIGMA_COLORS.thisWeek;
      case 'next_week': return FIGMA_COLORS.nextWeek;
      default: return FIGMA_COLORS.textGray;
    }
  };

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
          position: 'relative',
          flexShrink: 0
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${FIGMA_COLORS.sidebarHover}`
        }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: FIGMA_COLORS.white,
            margin: 0,
            fontFamily: 'Inter'
          }}>
            OFIR.AI
          </h1>
        </div>

        {/* Manager Profile */}
        <div style={{
          padding: '20px 24px',
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
                JD
              </span>
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: FIGMA_COLORS.white
              }}>
                John Doe
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 400,
                color: FIGMA_COLORS.textGray
              }}>
                Manager
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '20px 0' }}>
          <div 
            style={{
              padding: '12px 24px',
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
          {['Team', 'Assign Tasks', 'Reports', 'Approvals'].map(item => (
            <div 
              key={item}
              style={{
                padding: '12px 24px',
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
          left: '24px',
          right: '24px'
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
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Header with Title */}
        <div style={{
          padding: '40px 40px 24px',
          backgroundColor: FIGMA_COLORS.white,
          borderBottom: `1px solid ${FIGMA_COLORS.divider}`
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: FIGMA_COLORS.sidebar,
            margin: 0,
            fontFamily: 'Inter'
          }}>
            Team Handovers
          </h2>
        </div>

        {/* Filters Bar */}
        <div style={{
          padding: '16px 40px',
          backgroundColor: FIGMA_COLORS.white,
          borderBottom: `1px solid ${FIGMA_COLORS.divider}`,
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
            minWidth: '140px'
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
            minWidth: '100px'
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
            minWidth: '100px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 500,
              color: FIGMA_COLORS.sidebar
            }}>
              2024
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
            minWidth: '100px'
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

        {/* Content Area with Handovers */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 40px',
          backgroundColor: FIGMA_COLORS.background
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: FIGMA_COLORS.sidebar }}>Loading...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: FIGMA_COLORS.overdue }}>Error: {error}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Overdue Section */}
              {data?.grouped.overdue && data.grouped.overdue.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: FIGMA_COLORS.overdue,
                    marginBottom: '16px'
                  }}>
                    Overdue ({data.grouped.overdue.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {filterHandovers(data.grouped.overdue).map(handover => (
                      <div
                        key={handover.id}
                        style={{
                          backgroundColor: FIGMA_COLORS.white,
                          border: `1px solid ${FIGMA_COLORS.divider}`,
                          borderRadius: '4px',
                          padding: '16px 20px',
                          display: 'grid',
                          gridTemplateColumns: '200px 250px 150px 120px 100px',
                          gap: '16px',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {handover.job_title}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {handover.leaving_employee_name} → {handover.incoming_employee_name || 'TBD'}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: getProgressColor('overdue')
                          }}>
                            {Math.round(handover.completion_percentage || 0)}% Complete
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {new Date(handover.due_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            backgroundColor: FIGMA_COLORS.overdue,
                            color: FIGMA_COLORS.white,
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 400,
                            textAlign: 'center'
                          }}>
                            Overdue
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Today Section */}
              {data?.grouped.today && data.grouped.today.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: FIGMA_COLORS.today,
                    marginBottom: '16px'
                  }}>
                    Today ({data.grouped.today.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {filterHandovers(data.grouped.today).map(handover => (
                      <div
                        key={handover.id}
                        style={{
                          backgroundColor: FIGMA_COLORS.white,
                          border: `1px solid ${FIGMA_COLORS.divider}`,
                          borderRadius: '4px',
                          padding: '16px 20px',
                          display: 'grid',
                          gridTemplateColumns: '200px 250px 150px 120px 100px',
                          gap: '16px',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {handover.job_title}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {handover.leaving_employee_name} → {handover.incoming_employee_name || 'TBD'}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: getProgressColor('today')
                          }}>
                            {Math.round(handover.completion_percentage || 0)}% Complete
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {new Date(handover.due_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            backgroundColor: getStatusColor(handover.status),
                            color: FIGMA_COLORS.white,
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 400,
                            textAlign: 'center'
                          }}>
                            {handover.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* This Week Section */}
              {data?.grouped.this_week && data.grouped.this_week.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: FIGMA_COLORS.thisWeek,
                    marginBottom: '16px'
                  }}>
                    This Week ({data.grouped.this_week.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {filterHandovers(data.grouped.this_week).map(handover => (
                      <div
                        key={handover.id}
                        style={{
                          backgroundColor: FIGMA_COLORS.white,
                          border: `1px solid ${FIGMA_COLORS.divider}`,
                          borderRadius: '4px',
                          padding: '16px 20px',
                          display: 'grid',
                          gridTemplateColumns: '200px 250px 150px 120px 100px',
                          gap: '16px',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {handover.job_title}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {handover.leaving_employee_name} → {handover.incoming_employee_name || 'TBD'}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: getProgressColor('this_week')
                          }}>
                            {Math.round(handover.completion_percentage || 0)}% Complete
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {new Date(handover.due_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            backgroundColor: getStatusColor(handover.status),
                            color: FIGMA_COLORS.white,
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 400,
                            textAlign: 'center'
                          }}>
                            {handover.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Week Section */}
              {data?.grouped.next_week && data.grouped.next_week.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: FIGMA_COLORS.nextWeek,
                    marginBottom: '16px'
                  }}>
                    Next Week ({data.grouped.next_week.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {filterHandovers(data.grouped.next_week).map(handover => (
                      <div
                        key={handover.id}
                        style={{
                          backgroundColor: FIGMA_COLORS.white,
                          border: `1px solid ${FIGMA_COLORS.divider}`,
                          borderRadius: '4px',
                          padding: '16px 20px',
                          display: 'grid',
                          gridTemplateColumns: '200px 250px 150px 120px 100px',
                          gap: '16px',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {handover.job_title}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {handover.leaving_employee_name} → {handover.incoming_employee_name || 'TBD'}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: getProgressColor('next_week')
                          }}>
                            {Math.round(handover.completion_percentage || 0)}% Complete
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 400,
                            color: FIGMA_COLORS.sidebar
                          }}>
                            {new Date(handover.due_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            backgroundColor: getStatusColor(handover.status),
                            color: FIGMA_COLORS.white,
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: 400,
                            textAlign: 'center'
                          }}>
                            {handover.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}