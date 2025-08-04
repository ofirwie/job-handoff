import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface HandoverItem {
  id: string;
  employeeName: string;
  role: string;
  completedTasks: number;
  totalTasks: number;
  date: string;
  status: 'overdue' | 'today' | 'this-week' | 'next-week';
}

interface TeamHandoversContentProps {
  handovers?: HandoverItem[];
}

// Mock data matching your Figma design
const mockHandovers: HandoverItem[] = [
  // Overdue
  {
    id: '1',
    employeeName: 'מיכל כהן',
    role: 'עמי ג׳וניור -> ד׳ני ג׳ו',
    completedTasks: 3,
    totalTasks: 8,
    date: 'July 28, 2025',
    status: 'overdue'
  },
  // Today's handovers
  {
    id: '2',
    employeeName: 'מדכנית בכיר',
    role: 'יירן מתיז -> אילן נדלן',
    completedTasks: 4,
    totalTasks: 6,
    date: 'August 2, 2025',
    status: 'today'
  },
  {
    id: '3',
    employeeName: 'מנהל שיווק',
    role: 'דידלון אר -> מ׳ מתן',
    completedTasks: 6,
    totalTasks: 6,
    date: 'August 2, 2025',
    status: 'today'
  },
  // This week's handovers
  {
    id: '4',
    employeeName: 'דני דו',
    role: 'מילן כיוון -> רו אמון',
    completedTasks: 2,
    totalTasks: 7,
    date: 'August 7, 2025',
    status: 'this-week'
  },
  // Next week's handovers
  {
    id: '5',
    employeeName: 'מנהל שיוור',
    role: 'שידר מל ג׳י -> ערוה חן',
    completedTasks: 0,
    totalTasks: 6,
    date: 'August 12, 2025',
    status: 'next-week'
  },
  {
    id: '6',
    employeeName: 'QA רכן',
    role: 'עמיתן קו -> מיה נילה',
    completedTasks: 0,
    totalTasks: 4,
    date: 'August 15, 2025',
    status: 'next-week'
  }
];

export const TeamHandoversContent: React.FC<TeamHandoversContentProps> = ({ 
  handovers = mockHandovers 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Group handovers by status
  const groupedHandovers = {
    overdue: handovers.filter(h => h.status === 'overdue'),
    today: handovers.filter(h => h.status === 'today'),
    'this-week': handovers.filter(h => h.status === 'this-week'),
    'next-week': handovers.filter(h => h.status === 'next-week')
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-500';
      case 'today': return 'bg-blue-500';
      case 'this-week': return 'bg-green-500';
      case 'next-week': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string, count: number) => {
    switch (status) {
      case 'overdue': return `🔴 Overdue handovers / ${count} item`;
      case 'today': return `🔵 Today's handovers / ${count} items`;
      case 'this-week': return `🟢 This week's handovers / ${count} items`;
      case 'next-week': return `⚫ Next week's handovers / ${count} items`;
      default: return `Handovers / ${count} items`;
    }
  };

  const getActionButtonText = (status: string) => {
    switch (status) {
      case 'overdue': return 'איזור';
      case 'today': return 'בתהליך';
      case 'this-week': return 'התחל';
      case 'next-week': return 'מתוכנן';
      default: return 'פעולה';
    }
  };

  const getActionButtonColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'today': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'this-week': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'next-week': return 'bg-gray-500 hover:bg-gray-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const renderHandoverItem = (handover: HandoverItem) => (
    <div key={handover.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1 text-right">
        <div className="font-medium text-gray-900 mb-1">{handover.employeeName}</div>
        <div className="text-sm text-gray-600">{handover.role}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {handover.completedTasks} out of {handover.totalTasks} completed
          </div>
          <div className="text-xs text-gray-500">{handover.date}</div>
        </div>
        <Button 
          size="sm" 
          className={`px-6 ${getActionButtonColor(handover.status)}`}
        >
          {getActionButtonText(handover.status)}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Handovers</h1>
        
        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Month" />
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

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search handovers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="rounded"
            />
            Hide completed handovers
          </label>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {Object.entries(groupedHandovers).map(([status, items]) => {
          if (items.length === 0) return null;

          return (
            <Card key={status} className="overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                  <span className="font-medium text-gray-900">
                    {getStatusText(status, items.length)}
                  </span>
                </div>
              </div>
              <CardContent className="p-0">
                {items.map(renderHandoverItem)}
              </CardContent>
            </Card>
          );
        })}

        {Object.values(groupedHandovers).every(items => items.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No handovers found</div>
            <div className="text-gray-500 text-sm">Try adjusting your filters</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamHandoversContent;