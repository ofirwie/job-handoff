import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Home, Users, UserPlus, BarChart3, CheckCircle } from 'lucide-react';

/**
 * Manager Dashboard - Exact Figma Implementation
 * 
 * Based on real Figma specifications extracted from file: kLjdmXN2Mf1AxU55cdPqQz
 * Frame: "3. Manager Dashboard" (ID: 3330:195)
 * 
 * Key Design Properties:
 * - Frame Size: 1440x900px
 * - Main Background: #fafbfc
 * - Sidebar Background: #42526e
 * - Active Nav Background: #2d7ef8
 * - Typography: Inter font family with specific weights and sizes
 * - Status Colors: #22c55e (green), #d42e2e (red), #f59e0b (amber), #6b7280 (gray)
 */

export default function ManagerDashboardFigmaExact() {
  return (
    <div 
      className="w-[1440px] h-[900px] flex"
      style={{ backgroundColor: '#fafbfc' }}
    >
      {/* Manager Sidebar - Exact Figma Specs */}
      <div 
        className="w-[280px] h-full flex flex-col"
        style={{ backgroundColor: '#42526e' }}
      >
        {/* Manager Sidebar Logo */}
        <div className="p-6">
          <h1 
            className="text-white"
            style={{
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: '18px',
              lineHeight: '21.78px',
              letterSpacing: '0px'
            }}
          >
            HANDOFF
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex flex-col space-y-1 px-4">
          {/* Active Nav Item - Dashboard */}
          <div 
            className="px-4 py-3 rounded-lg"
            style={{ backgroundColor: '#2d7ef8' }}
          >
            <div className="flex items-center space-x-3">
              <Home className="w-5 h-5 text-white" />
              <span 
                className="text-white"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '14px',
                  lineHeight: '16.94px',
                  letterSpacing: '0px'
                }}
              >
                Dashboard
              </span>
            </div>
          </div>

          {/* Other Nav Items */}
          {[
            { icon: Users, label: 'Team Handovers' },
            { icon: UserPlus, label: 'Assign Tasks' },
            { icon: BarChart3, label: 'Reports' },
            { icon: CheckCircle, label: 'Approvals' }
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="px-4 py-3 rounded-lg hover:bg-[#33334d] transition-colors">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" style={{ color: '#cccccc' }} />
                <span 
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '16.94px',
                    letterSpacing: '0px',
                    color: '#cccccc'
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Manager Profile */}
        <div className="mt-auto p-6">
          <div className="flex items-center space-x-3">
            {/* Manager Avatar */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#ff6b47' }}
            >
              <span 
                className="text-white"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '14px',
                  lineHeight: '16.94px',
                  letterSpacing: '0px'
                }}
              >
                AM
              </span>
            </div>
            
            <div>
              <div 
                className="text-white"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '14px',
                  lineHeight: '16.94px',
                  letterSpacing: '0px'
                }}
              >
                Ahmed Mohammed
              </div>
              <div 
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '14.52px',
                  letterSpacing: '0px',
                  color: '#cccccc'
                }}
              >
                Manager
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {/* Team Handovers Title */}
        <h1 
          style={{
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '32px',
            lineHeight: '38.73px',
            letterSpacing: '0px',
            color: '#42526e',
            marginBottom: '32px'
          }}
        >
          Team Handovers
        </h1>

        {/* Filters Row */}
        <div className="flex items-center space-x-4 mb-8">
          {/* Department Filter */}
          <Select>
            <SelectTrigger 
              className="w-[140px] h-[40px]"
              style={{
                backgroundColor: '#fafafc',
                border: '1px solid #ccd1db',
                borderRadius: '8px'
              }}
            >
              <SelectValue 
                placeholder="Department"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '16.94px',
                  letterSpacing: '0px',
                  color: '#42526e'
                }}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>

          {/* Role Filter */}
          <Select>
            <SelectTrigger 
              className="w-[100px] h-[40px]"
              style={{
                backgroundColor: '#fafafc',
                border: '1px solid #ccd1db',
                borderRadius: '8px'
              }}
            >
              <SelectValue 
                placeholder="Role"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '16.94px',
                  letterSpacing: '0px',
                  color: '#42526e'
                }}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
            </SelectContent>
          </Select>

          {/* Year Filter */}
          <Select>
            <SelectTrigger 
              className="w-[80px] h-[40px]"
              style={{
                backgroundColor: '#fafafc',
                border: '1px solid #ccd1db',
                borderRadius: '8px'
              }}
            >
              <SelectValue 
                placeholder="2024"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '16.94px',
                  letterSpacing: '0px',
                  color: '#42526e'
                }}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>

          {/* Month Filter */}
          <Select>
            <SelectTrigger 
              className="w-[100px] h-[40px]"
              style={{
                backgroundColor: '#fafafc',
                border: '1px solid #ccd1db',
                borderRadius: '8px'
              }}
            >
              <SelectValue 
                placeholder="Month"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '16.94px',
                  letterSpacing: '0px',
                  color: '#42526e'
                }}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jan">January</SelectItem>
              <SelectItem value="feb">February</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#999999' }} />
            <Input
              placeholder="Search handovers..."
              className="pl-10 w-[200px] h-[40px]"
              style={{
                backgroundColor: '#fafafc',
                border: '1px solid #ccd1db',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '16.94px',
                letterSpacing: '0px',
                color: '#999999'
              }}
            />
          </div>

          {/* Hide Completed Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hide-completed"
              style={{
                backgroundColor: '#fafafc',
                border: '1px solid #ccd1db'
              }}
            />
            <label 
              htmlFor="hide-completed"
              style={{
                fontFamily: 'Inter',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '16.94px',
                letterSpacing: '0px',
                color: '#42526e'
              }}
            >
              Hide Completed
            </label>
          </div>
        </div>

        {/* Handovers Table */}
        <div className="space-y-6">
          {/* Overdue Section */}
          <div>
            <h2 
              className="mb-4"
              style={{
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '19.36px',
                letterSpacing: '0px',
                color: '#d42e2e'
              }}
            >
              Overdue
            </h2>
            
            <Card 
              className="border-0"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e6e6e6'
              }}
            >
              <div className="p-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <span 
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '16.94px',
                      letterSpacing: '0px',
                      color: '#42526e'
                    }}
                  >
                    Senior Developer
                  </span>
                  <span 
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '16.94px',
                      letterSpacing: '0px',
                      color: '#42526e'
                    }}
                  >
                    Engineering Team
                  </span>
                  <span 
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '16.94px',
                      letterSpacing: '0px',
                      color: '#cc7821'
                    }}
                  >
                    75%
                  </span>
                  <span 
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '16.94px',
                      letterSpacing: '0px',
                      color: '#42526e'
                    }}
                  >
                    Dec 1, 2024
                  </span>
                  <Badge 
                    style={{
                      backgroundColor: '#d42e2e',
                      color: '#ffffff',
                      border: '1px solid #d42e2e',
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '16.94px',
                      letterSpacing: '0px'
                    }}
                  >
                    Overdue
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Today Section */}
          <div>
            <h2 
              className="mb-4"
              style={{
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '19.36px',
                letterSpacing: '0px',
                color: '#2d7ef8'
              }}
            >
              Today
            </h2>
            
            <div className="space-y-2">
              {/* Today Row 2 */}
              <Card 
                className="border-0"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e6e6e6'
                }}
              >
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Product Manager
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Product Team
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#22c55e'
                      }}
                    >
                      100%
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Dec 15, 2024
                    </span>
                    <Badge 
                      style={{
                        backgroundColor: '#22c55e',
                        color: '#ffffff',
                        border: '1px solid #22c55e',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px'
                      }}
                    >
                      Complete
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Today Row 3 */}
              <Card 
                className="border-0"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e6e6e6'
                }}
              >
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      UI Designer
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Design Team
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#2d7ef8'
                      }}
                    >
                      85%
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Dec 15, 2024
                    </span>
                    <Badge 
                      style={{
                        backgroundColor: '#2d7ef8',
                        color: '#ffffff',
                        border: '1px solid #22c55e',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px'
                      }}
                    >
                      In Progress
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Today Row 4 */}
              <Card 
                className="border-0"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e6e6e6'
                }}
              >
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Marketing Lead
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Marketing Team
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#cc7821'
                      }}
                    >
                      60%
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Dec 15, 2024
                    </span>
                    <Badge 
                      style={{
                        backgroundColor: '#f59e0b',
                        color: '#ffffff',
                        border: '1px solid #22c55e',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px'
                      }}
                    >
                      Pending
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* This Week Section */}
          <div>
            <h2 
              className="mb-4"
              style={{
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '19.36px',
                letterSpacing: '0px',
                color: '#22c55e'
              }}
            >
              This Week
            </h2>
            
            <div className="border-t border-[#e6e6e6] pt-4">
              {/* Week content would go here */}
            </div>
          </div>

          {/* Next Week Section */}
          <div>
            <h2 
              className="mb-4"
              style={{
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '19.36px',
                letterSpacing: '0px',
                color: '#6b7280'
              }}
            >
              Next Week
            </h2>
            
            <div className="space-y-2">
              {/* Next Row 1 */}
              <Card 
                className="border-0"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e6e6e6'
                }}
              >
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Tech Lead
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Engineering Team
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#6b7280'
                      }}
                    >
                      0%
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Dec 22, 2024
                    </span>
                    <Badge 
                      style={{
                        backgroundColor: '#6b7280',
                        color: '#ffffff',
                        border: '1px solid #6b7280',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px'
                      }}
                    >
                      Not Started
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Next Row 2 */}
              <Card 
                className="border-0"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e6e6e6'
                }}
              >
                <div className="p-4">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Data Analyst
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Analytics Team
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#6b7280'
                      }}
                    >
                      0%
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px',
                        color: '#42526e'
                      }}
                    >
                      Dec 24, 2024
                    </span>
                    <Badge 
                      style={{
                        backgroundColor: '#6b7280',
                        color: '#ffffff',
                        border: '1px solid #6b7280',
                        fontFamily: 'Inter',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '16.94px',
                        letterSpacing: '0px'
                      }}
                    >
                      Not Started
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}