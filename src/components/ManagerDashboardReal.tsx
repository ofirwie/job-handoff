import React, { useState, useCallback } from 'react';
import { useManagerDashboardSupabase } from '@/hooks/useManagerDashboardSupabase';
import { HandoverStatus } from '@/types/manager-dashboard.types';

const ManagerDashboardReal = () => {
  // State for filters
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    search: '',
    hideCompleted: false
  });

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    overdue: true,
    today: true,
    thisWeek: true,
    nextWeek: true
  });

  // Fetch data using the Supabase hook
  const { data, loading, error, updateFilters, refresh } = useManagerDashboardSupabase({
    auto_refresh: true,
    refresh_interval: 30000
  });

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: string, value: any) => {
    const newFilters = { ...filters };
    if (filterType === 'hideCompleted') {
      newFilters.hideCompleted = value;
    } else {
      newFilters[filterType] = value;
    }
    setFilters(newFilters);
    
    // Update hook filters
    updateFilters({
      department_filter: newFilters.department || undefined,
      role_filter: newFilters.role || undefined,
      hide_completed: newFilters.hideCompleted,
      search_query: newFilters.search || undefined
    });
  }, [filters, updateFilters]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get status color
  const getStatusColor = (status: HandoverStatus | string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'overdue': return '#D42E2E';
      case 'in_progress': 
      case 'in progress': return '#2D7EF8';
      case 'completed': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'scheduled': 
      case 'created': return '#6B7280';
      case 'cancelled': return '#EF4444';
      case 'pending_review': return '#F59E0B';
      case 'approved': return '#22C55E';
      case 'rejected': return '#EF4444';
      default: return '#42526E';
    }
  };

  // Get status label in Hebrew
  const getStatusLabel = (status: HandoverStatus | string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'overdue': return 'איחור';
      case 'in_progress': return 'בתהליך';
      case 'in progress': return 'בתהליך';
      case 'completed': return 'הסתיים';
      case 'pending': return 'המתנה';
      case 'scheduled': return 'מתוכנן';
      case 'created': return 'נוצר';
      case 'cancelled': return 'בוטל';
      case 'pending_review': return 'ממתין לאישור';
      case 'approved': return 'אושר';
      case 'rejected': return 'נדחה';
      default: return status; // Return original if no translation
    }
  };

  // Get progress text color
  const getProgressColor = (status: HandoverStatus | string, completed: number, total: number) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'completed' || completed === total) return '#22C55E';
    if (statusLower === 'in_progress' || statusLower === 'in progress') return '#2D7EF8';
    if (statusLower === 'overdue') return '#CC7821';
    if (completed === 0) return '#6B7280';
    return '#CC7821';
  };

  if (loading && !data) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'red' }}>Error loading dashboard: {error}</div>
      </div>
    );
  }

  const handoverGroups = data?.grouped || {
    overdue: [],
    today: [],
    this_week: [],
    next_week: [],
    future: [],
    completed: []
  };

  const filterOptions = data?.filterOptions || {
    departments: [],
    roles: [],
    statuses: [],
    plants: [],
    countries: []
  };

  // Calculate positions for items
  let currentTop = 202; // Start position for first section
  const sectionGap = 55; // Gap between sections
  const itemHeight = 54; // Height of each item
  const itemGap = 2; // Gap between items

  const renderHandoverItem = (handover: any, top: number) => {
    // Use the correct field names from Supabase
    const jobTitle = handover.job_title || handover.role_title || 'No Role';
    const leavingName = handover.leaving_employee_name || handover.employee_name || 'Unknown';
    const receivingName = handover.receiving_employee_name || handover.incoming_employee_name || 'TBD';
    const completedCount = handover.completed_tasks_count ?? handover.completed_items ?? 0;
    const totalCount = handover.total_tasks_count ?? handover.total_items ?? 0;
    const date = handover.planned_date || handover.due_date || handover.departure_date;
    const handoverId = handover.handover_id || handover.id;
    
    return (
      <React.Fragment key={handoverId}>
        {/* Item background */}
        <div style={{ width: '1148px', height: '54px', left: '239px', top: `${top}px`, position: 'absolute', background: 'white', border: '1px #E6E6E6 solid' }}></div>
        
        {/* Role/Job Title */}
        <div style={{ width: '177px', height: '15px', left: '256px', top: `${top + 18}px`, position: 'absolute', color: '#42526E', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500, wordWrap: 'break-word', textAlign: 'left' }}>
          {jobTitle}
        </div>
        
        {/* Employees - align left for English names */}
        <div style={{ width: '164px', height: '15px', left: '458px', top: `${top + 18}px`, position: 'absolute', color: '#42526E', fontSize: '14px', fontFamily: 'Inter', fontWeight: 400, wordWrap: 'break-word', textAlign: 'left' }}>
          {leavingName} → {receivingName}
        </div>
        
        {/* Progress */}
        <div style={{ width: '152px', height: '15px', left: '644px', top: `${top + 18}px`, position: 'absolute', color: getProgressColor(handover.status, completedCount, totalCount), fontSize: '14px', fontFamily: 'Inter', fontWeight: 500, wordWrap: 'break-word' }}>
          {completedCount} out of {totalCount} completed
        </div>
        
        {/* Date */}
        <div style={{ width: '118px', height: '15px', left: '830px', top: `${top + 18}px`, position: 'absolute', color: '#42526E', fontSize: '14px', fontFamily: 'Inter', fontWeight: 400, wordWrap: 'break-word' }}>
          {date ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No date'}
        </div>
        
        {/* Status button - always use Hebrew labels for consistency */}
        <div style={{ width: '264px', height: '36px', left: '1113px', top: `${top + 9}px`, position: 'absolute', background: getStatusColor(handover.status), border: `1px ${getStatusColor(handover.status)} solid`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer' }}>
          <div style={{ color: 'white', fontSize: '14px', fontFamily: 'Inter', fontWeight: 400 }}>{getStatusLabel(handover.status)}</div>
        </div>
        
        {/* Vertical separator lines */}
        <div style={{ width: '1px', height: '54px', left: '436px', top: `${top}px`, position: 'absolute', background: '#E6E6E6' }}></div>
        <div style={{ width: '1px', height: '54px', left: '622px', top: `${top}px`, position: 'absolute', background: '#E6E6E6' }}></div>
        <div style={{ width: '1px', height: '54px', left: '808px', top: `${top}px`, position: 'absolute', background: '#E6E6E6' }}></div>
        <div style={{ width: '1px', height: '54px', left: '1103px', top: `${top}px`, position: 'absolute', background: '#E6E6E6' }}></div>
      </React.Fragment>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ width: '1440px', height: '900px', position: 'relative', background: '#FAFBFC', overflow: 'auto' }}>
        {/* Sidebar */}
        <div style={{ width: '236px', height: '900px', left: '0px', top: '0px', position: 'absolute', background: '#42526E', overflow: 'hidden' }}>
          <div style={{ left: '20px', top: '30px', position: 'absolute', color: 'white', fontSize: '18px', fontFamily: 'Inter', fontWeight: 700, wordWrap: 'break-word' }}>
            OFIR AI | Management
          </div>
          <div style={{ width: '240px', height: '40px', left: '20px', top: '100px', position: 'absolute', background: 'rgba(44.88, 125.97, 248.11, 0.20)', overflow: 'hidden' }}>
            <div style={{ left: '15px', top: '12px', position: 'absolute', color: 'white', fontSize: '14px', fontFamily: 'Inter', fontWeight: 600, wordWrap: 'break-word' }}>
              📊 Manager Dashboard
            </div>
          </div>
          <div style={{ left: '35px', top: '162px', position: 'absolute', color: '#CCCCCC', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500, wordWrap: 'break-word', cursor: 'pointer' }}>
            👥 Team Management
          </div>
          <div style={{ left: '35px', top: '202px', position: 'absolute', color: '#CCCCCC', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500, wordWrap: 'break-word', cursor: 'pointer' }}>
            📋 Task Assignment
          </div>
          <div style={{ left: '35px', top: '242px', position: 'absolute', color: '#CCCCCC', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500, wordWrap: 'break-word', cursor: 'pointer' }}>
            📈 Reports
          </div>
          <div style={{ left: '35px', top: '282px', position: 'absolute', color: '#CCCCCC', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500, wordWrap: 'break-word', cursor: 'pointer' }}>
            ✅ Approvals
          </div>
          <div style={{ width: '240px', height: '60px', left: '0px', top: '820px', position: 'absolute', background: 'rgba(51, 51, 76.50, 0.30)', overflow: 'hidden' }}>
            <div style={{ width: '40px', height: '40px', left: '15px', top: '10px', position: 'absolute', background: '#FF6B47', overflow: 'hidden', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: 'white', fontSize: '14px', fontFamily: 'Inter', fontWeight: 600 }}>רכ</div>
            </div>
            <div style={{ left: '65px', top: '15px', position: 'absolute', color: 'white', fontSize: '14px', fontFamily: 'Inter', fontWeight: 600, wordWrap: 'break-word' }}>
              רחל כהן
            </div>
            <div style={{ left: '65px', top: '35px', position: 'absolute', color: '#CCCCCC', fontSize: '12px', fontFamily: 'Inter', fontWeight: 400, wordWrap: 'break-word' }}>
              Team Manager
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div style={{ width: '272px', height: '56px', left: '246px', top: '30px', position: 'absolute', color: '#42526E', fontSize: '32px', fontFamily: 'Inter', fontWeight: 700, wordWrap: 'break-word' }}>
          Team Handovers
        </div>
        
        {/* Filters */}
        <select 
          value={filters.department}
          onChange={(e) => handleFilterChange('department', e.target.value)}
          style={{ width: '190px', height: '38px', padding: '8px 12px', left: '236px', top: '83px', position: 'absolute', background: '#FAFAFC', outline: '1px #CCD1DB solid', outlineOffset: '-1px', border: 'none', color: '#42526E', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer' }}
        >
          <option value="">Department ▼</option>
          {filterOptions.departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        
        <select 
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          style={{ width: '190px', height: '38px', padding: '8px 12px', left: '426px', top: '83px', position: 'absolute', background: '#FAFAFC', outline: '1px #CCD1DB solid', outlineOffset: '-1px', border: 'none', color: '#42526E', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer' }}
        >
          <option value="">Role ▼</option>
          {filterOptions.roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        
        <select 
          value={filters.year}
          onChange={(e) => handleFilterChange('year', e.target.value)}
          style={{ width: '127px', height: '38px', padding: '8px 12px', left: '616px', top: '83px', position: 'absolute', background: '#FAFAFC', outline: '1px #CCD1DB solid', outlineOffset: '-1px', border: 'none', color: '#42526E', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer' }}
        >
          <option value="2025">2025 ▼</option>
          <option value="2024">2024 ▼</option>
          <option value="2023">2023 ▼</option>
        </select>
        
        <select 
          value={filters.month}
          onChange={(e) => handleFilterChange('month', e.target.value)}
          style={{ width: '140px', height: '38px', padding: '8px 12px', left: '743px', top: '83px', position: 'absolute', background: '#FAFAFC', outline: '1px #CCD1DB solid', outlineOffset: '-1px', border: 'none', color: '#42526E', fontSize: '14px', fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer' }}
        >
          <option value="1">January ▼</option>
          <option value="2">February ▼</option>
          <option value="3">March ▼</option>
          <option value="4">April ▼</option>
          <option value="5">May ▼</option>
          <option value="6">June ▼</option>
          <option value="7">July ▼</option>
          <option value="8">August ▼</option>
          <option value="9">September ▼</option>
          <option value="10">October ▼</option>
          <option value="11">November ▼</option>
          <option value="12">December ▼</option>
        </select>
        
        <input 
          type="text" 
          placeholder="🔍 Search handovers..." 
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ width: '300px', height: '38px', padding: '10px 12px', left: '883px', top: '83px', position: 'absolute', background: '#FAFAFC', outline: '1px #CCD1DB solid', outlineOffset: '-1px', border: 'none', color: '#42526E', fontSize: '14px', fontFamily: 'Inter', fontWeight: 400 }} 
        />
        
        <div style={{ width: '210px', height: '40px', paddingTop: '10px', paddingBottom: '10px', left: '1189px', top: '81px', position: 'absolute', background: '#FAFAFC', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <label style={{ color: '#42526E', fontSize: '14px', fontFamily: 'Inter', fontWeight: 400, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={filters.hideCompleted}
              onChange={(e) => handleFilterChange('hideCompleted', e.target.checked)}
              style={{ marginRight: '8px' }} 
            />
            Hide completed handovers
          </label>
        </div>
        
        {/* Handover Sections */}
        {(() => {
          let topPosition = 202;
          const sections = [];
          
          // Overdue Section
          if (handoverGroups.overdue.length > 0) {
            sections.push(
              <React.Fragment key="overdue">
                <div 
                  onClick={() => toggleSection('overdue')}
                  style={{ width: '375px', height: '17px', left: '246px', top: `${topPosition}px`, position: 'absolute', color: '#D42E2E', fontSize: '16px', fontFamily: 'Inter', fontWeight: 600, wordWrap: 'break-word', cursor: 'pointer' }}
                >
                  {expandedSections.overdue ? '▼' : '▶'} 🔴 Overdue handovers / {handoverGroups.overdue.length} item{handoverGroups.overdue.length !== 1 ? 's' : ''}
                </div>
                {expandedSections.overdue && handoverGroups.overdue.map((handover, index) => {
                  const itemTop = topPosition + 53 + (index * (itemHeight + itemGap));
                  return renderHandoverItem(handover, itemTop);
                })}
              </React.Fragment>
            );
            if (expandedSections.overdue) {
              topPosition += 53 + (handoverGroups.overdue.length * (itemHeight + itemGap)) + sectionGap;
            } else {
              topPosition += 53 + sectionGap;
            }
          }
          
          // Today Section
          if (handoverGroups.today.length > 0) {
            sections.push(
              <React.Fragment key="today">
                <div 
                  onClick={() => toggleSection('today')}
                  style={{ width: '381px', height: '16px', left: '246px', top: `${topPosition}px`, position: 'absolute', color: '#2D7EF8', fontSize: '16px', fontFamily: 'Inter', fontWeight: 600, wordWrap: 'break-word', cursor: 'pointer' }}
                >
                  {expandedSections.today ? '▼' : '▶'} 🔵 Today's handovers / {handoverGroups.today.length} item{handoverGroups.today.length !== 1 ? 's' : ''}
                </div>
                {expandedSections.today && handoverGroups.today.map((handover, index) => {
                  const itemTop = topPosition + 34 + (index * (itemHeight + itemGap));
                  return renderHandoverItem(handover, itemTop);
                })}
              </React.Fragment>
            );
            if (expandedSections.today) {
              topPosition += 34 + (handoverGroups.today.length * (itemHeight + itemGap)) + sectionGap;
            } else {
              topPosition += 34 + sectionGap;
            }
          }
          
          // This Week Section
          if (handoverGroups.this_week.length > 0) {
            sections.push(
              <React.Fragment key="thisWeek">
                <div 
                  onClick={() => toggleSection('thisWeek')}
                  style={{ width: '403px', height: '17px', left: '246px', top: `${topPosition}px`, position: 'absolute', color: '#22C55E', fontSize: '16px', fontFamily: 'Inter', fontWeight: 600, wordWrap: 'break-word', cursor: 'pointer' }}
                >
                  {expandedSections.thisWeek ? '▼' : '▶'} 🟢 This week's handovers / {handoverGroups.this_week.length} item{handoverGroups.this_week.length !== 1 ? 's' : ''}
                </div>
                {expandedSections.thisWeek && handoverGroups.this_week.map((handover, index) => {
                  const itemTop = topPosition + 36 + (index * (itemHeight + itemGap));
                  return renderHandoverItem(handover, itemTop);
                })}
              </React.Fragment>
            );
            if (expandedSections.thisWeek) {
              topPosition += 36 + (handoverGroups.this_week.length * (itemHeight + itemGap)) + sectionGap;
            } else {
              topPosition += 36 + sectionGap;
            }
          }
          
          // Next Week Section
          if (handoverGroups.next_week.length > 0) {
            sections.push(
              <React.Fragment key="nextWeek">
                <div 
                  onClick={() => toggleSection('nextWeek')}
                  style={{ width: '418px', height: '16px', left: '246px', top: `${topPosition}px`, position: 'absolute', color: '#6B7280', fontSize: '16px', fontFamily: 'Inter', fontWeight: 600, wordWrap: 'break-word', cursor: 'pointer' }}
                >
                  {expandedSections.nextWeek ? '▼' : '▶'} ⚫ Next week's handovers / {handoverGroups.next_week.length} item{handoverGroups.next_week.length !== 1 ? 's' : ''}
                </div>
                {expandedSections.nextWeek && handoverGroups.next_week.map((handover, index) => {
                  const itemTop = topPosition + 35 + (index * (itemHeight + itemGap));
                  return renderHandoverItem(handover, itemTop);
                })}
              </React.Fragment>
            );
          }
          
          return sections;
        })()}
        
      </div>
    </div>
  );
};

export default ManagerDashboardReal;