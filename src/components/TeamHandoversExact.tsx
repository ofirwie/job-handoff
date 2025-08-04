import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

interface HandoverItem {
  id: string;
  employeeName: string;
  role: string;
  completedTasks: number;
  totalTasks: number;
  date: string;
  status: 'overdue' | 'today' | 'this-week' | 'next-week';
}

interface TeamHandoversExactProps {
  handovers?: HandoverItem[];
}

// Mock data using English as per Figma design specifications
const mockHandovers: HandoverItem[] = [
  // Overdue
  {
    id: '1',
    employeeName: 'Michal Cohen',
    role: 'Junior Dev -> Senior Dev',
    completedTasks: 3,
    totalTasks: 8,
    date: 'July 28, 2025',
    status: 'overdue'
  },
  // Today's handovers
  {
    id: '2',
    employeeName: 'Senior Engineer',
    role: 'Tech Lead -> Manager',
    completedTasks: 4,
    totalTasks: 6,
    date: 'August 2, 2025',
    status: 'today'
  },
  {
    id: '3',
    employeeName: 'Marketing Manager',
    role: 'Director -> VP',
    completedTasks: 6,
    totalTasks: 6,
    date: 'August 2, 2025',
    status: 'today'
  },
  {
    id: '4',
    employeeName: 'Product Designer',
    role: 'Lead -> Senior Lead',
    completedTasks: 2,
    totalTasks: 5,
    date: 'August 2, 2025',
    status: 'today'
  },
  {
    id: '5',
    employeeName: 'Data Analyst',
    role: 'Analyst -> Senior Analyst',
    completedTasks: 1,
    totalTasks: 3,
    date: 'August 2, 2025',
    status: 'today'
  },
  {
    id: '6',
    employeeName: 'QA Engineer',
    role: 'QA -> Lead QA',
    completedTasks: 3,
    totalTasks: 4,
    date: 'August 2, 2025',
    status: 'today'
  },
  // This week's handovers
  {
    id: '7',
    employeeName: 'Frontend Developer',
    role: 'Developer -> Senior Developer',
    completedTasks: 2,
    totalTasks: 7,
    date: 'August 7, 2025',
    status: 'this-week'
  },
  {
    id: '8',
    employeeName: 'Backend Engineer',
    role: 'Engineer -> Lead Engineer',
    completedTasks: 1,
    totalTasks: 5,
    date: 'August 6, 2025',
    status: 'this-week'
  },
  {
    id: '9',
    employeeName: 'DevOps Specialist',
    role: 'Specialist -> Senior Specialist',
    completedTasks: 3,
    totalTasks: 4,
    date: 'August 8, 2025',
    status: 'this-week'
  },
  // Next week's handovers
  {
    id: '10',
    employeeName: 'Sales Manager',
    role: 'Manager -> Director',
    completedTasks: 0,
    totalTasks: 6,
    date: 'August 12, 2025',
    status: 'next-week'
  },
  {
    id: '11',
    employeeName: 'QA Specialist',
    role: 'Specialist -> Lead Specialist',
    completedTasks: 0,
    totalTasks: 4,
    date: 'August 15, 2025',
    status: 'next-week'
  }
];

export const TeamHandoversExact: React.FC<TeamHandoversExactProps> = ({ 
  handovers = mockHandovers 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'overdue': false,
    'today': false,
    'this-week': false,
    'next-week': false
  });

  // Group handovers by status
  const groupedHandovers = {
    overdue: handovers.filter(h => h.status === 'overdue'),
    today: handovers.filter(h => h.status === 'today'),
    'this-week': handovers.filter(h => h.status === 'this-week'),
    'next-week': handovers.filter(h => h.status === 'next-week')
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return '#ff6b47';
      case 'today': return '#2d7ef8';
      case 'this-week': return '#00b756';
      case 'next-week': return '#42526e';
      default: return '#42526e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return '🔴';
      case 'today': return '🔵';
      case 'this-week': return '🟢';
      case 'next-week': return '⚫';
      default: return '⚫';
    }
  };

  const getStatusText = (status: string, count: number) => {
    switch (status) {
      case 'overdue': return `Overdue handovers / ${count} item${count !== 1 ? 's' : ''}`;
      case 'today': return `Today's handovers / ${count} item${count !== 1 ? 's' : ''}`;
      case 'this-week': return `This week's handovers / ${count} item${count !== 1 ? 's' : ''}`;
      case 'next-week': return `Next week's handovers / ${count} item${count !== 1 ? 's' : ''}`;
      default: return `Handovers / ${count} item${count !== 1 ? 's' : ''}`;
    }
  };

  const getActionButtonText = (status: string) => {
    switch (status) {
      case 'overdue': return 'Urgent';
      case 'today': return 'In Progress';
      case 'this-week': return 'Start';
      case 'next-week': return 'Planned';
      default: return 'Action';
    }
  };

  const getActionButtonColor = (status: string) => {
    switch (status) {
      case 'overdue': return { backgroundColor: '#ff6b47', color: '#ffffff' };
      case 'today': return { backgroundColor: '#2d7ef8', color: '#ffffff' };
      case 'this-week': return { backgroundColor: '#00b756', color: '#ffffff' };
      case 'next-week': return { backgroundColor: '#42526e', color: '#ffffff' };
      default: return { backgroundColor: '#42526e', color: '#ffffff' };
    }
  };

  const renderSectionHeader = (status: string, items: HandoverItem[]) => {
    const isExpanded = expandedSections[status];
    const count = items.length;
    
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          cursor: 'pointer',
          borderBottom: '1px solid #e6e6e6',
          backgroundColor: isExpanded ? '#fafbfc' : '#ffffff'
        }}
        onClick={() => toggleSection(status)}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isExpanded ? (
            <ChevronDown style={{ height: '16px', width: '16px', color: '#42526e' }} />
          ) : (
            <ChevronRight style={{ height: '16px', width: '16px', color: '#42526e' }} />
          )}
          <span style={{ fontSize: '18px' }}>
            {getStatusIcon(status)}
          </span>
          <span style={{ 
            fontSize: '14px',
            fontWeight: 600,
            color: getStatusColor(status),
            fontFamily: 'Inter, sans-serif'
          }}>
            {getStatusText(status, count)}
          </span>
        </div>
      </div>
    );
  };

  const renderHandoverItem = (handover: HandoverItem, isLast: boolean) => (
    <div 
      key={handover.id} 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: !isLast ? '1px solid #e6e6e6' : 'none',
        backgroundColor: '#ffffff'
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '14px',
          fontWeight: 500,
          color: '#42526e',
          marginBottom: '4px',
          fontFamily: 'Inter, sans-serif'
        }}>
          {handover.employeeName}
        </div>
        <div style={{ 
          fontSize: '12px',
          fontWeight: 400,
          color: '#cccccc',
          fontFamily: 'Inter, sans-serif'
        }}>
          {handover.role}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '14px',
            fontWeight: 500,
            color: '#42526e',
            fontFamily: 'Inter, sans-serif'
          }}>
            {handover.completedTasks} out of {handover.totalTasks} completed
          </div>
          <div style={{ 
            fontSize: '12px',
            fontWeight: 400,
            color: '#cccccc',
            marginTop: '4px',
            fontFamily: 'Inter, sans-serif'
          }}>
            {handover.date}
          </div>
        </div>
        <button 
          style={{
            ...getActionButtonColor(handover.status),
            padding: '8px 24px',
            fontSize: '12px',
            fontWeight: 500,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {getActionButtonText(handover.status)}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ 
      flex: 1, 
      backgroundColor: '#fafbfc', 
      fontFamily: 'Inter, sans-serif' 
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e6e6e6', 
        padding: '24px' 
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 700, 
          color: '#42526e', 
          marginBottom: '24px',
          lineHeight: '38.7px',
          margin: '0 0 24px 0'
        }}>
          Team Handovers
        </h1>
        
        {/* Filters - exact Figma specifications */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          marginBottom: '16px' 
        }}>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger style={{ 
              width: '160px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: '#ffffff',
              border: '1px solid #e6e6e6',
              fontFamily: 'Inter, sans-serif'
            }}>
              <SelectValue placeholder="Department ▼" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger style={{ 
              width: '128px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: '#ffffff',
              border: '1px solid #e6e6e6',
              fontFamily: 'Inter, sans-serif'
            }}>
              <SelectValue placeholder="Role ▼" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger style={{ 
              width: '112px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: '#ffffff',
              border: '1px solid #e6e6e6',
              fontFamily: 'Inter, sans-serif'
            }}>
              <SelectValue placeholder="Year ▼" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger style={{ 
              width: '144px',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: '#ffffff',
              border: '1px solid #e6e6e6',
              fontFamily: 'Inter, sans-serif'
            }}>
              <SelectValue placeholder="Month ▼" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              <SelectItem value="jan">January</SelectItem>
              <SelectItem value="feb">February</SelectItem>
              <SelectItem value="mar">March</SelectItem>
              <SelectItem value="apr">April</SelectItem>
              <SelectItem value="may">May</SelectItem>
              <SelectItem value="jun">June</SelectItem>
              <SelectItem value="jul">July</SelectItem>
              <SelectItem value="aug">August</SelectItem>
            </SelectContent>
          </Select>

          <div style={{ 
            position: 'relative', 
            flex: 1, 
            maxWidth: '320px', 
            marginLeft: '16px' 
          }}>
            <Search style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              height: '16px', 
              width: '16px',
              color: '#cccccc' 
            }} />
            <Input
              placeholder="Search handovers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '40px',
                padding: '10px 12px 10px 40px',
                fontSize: '14px',
                fontWeight: 400,
                backgroundColor: '#ffffff',
                border: '1px solid #e6e6e6',
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '14px', 
            fontWeight: 400, 
            marginLeft: '32px', 
            color: '#42526e',
            fontFamily: 'Inter, sans-serif'
          }}>
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              style={{ padding: '10px 0px' }}
              className="rounded"
            />
            Hide completed handovers
          </label>
        </div>
      </div>

      {/* Content - Collapsible Sections */}
      <div style={{ padding: '24px' }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '4px', 
          border: '1px solid #e6e6e6', 
          overflow: 'hidden' 
        }}>
          {Object.entries(groupedHandovers).map(([status, items]) => {
            if (items.length === 0) return null;
            
            const isExpanded = expandedSections[status];
            
            return (
              <div key={status}>
                {renderSectionHeader(status, items)}
                {isExpanded && (
                  <div style={{ backgroundColor: '#ffffff' }}>
                    {items.map((handover, index) => 
                      renderHandoverItem(handover, index === items.length - 1)
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {Object.values(groupedHandovers).every(items => items.length === 0) && (
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '4px', 
            border: '1px solid #e6e6e6', 
            padding: '48px', 
            textAlign: 'center' 
          }}>
            <div style={{ 
              color: '#cccccc', 
              fontSize: '18px', 
              marginBottom: '8px',
              fontFamily: 'Inter, sans-serif'
            }}>
              No handovers found
            </div>
            <div style={{ 
              color: '#cccccc', 
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Try adjusting your filters
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamHandoversExact;