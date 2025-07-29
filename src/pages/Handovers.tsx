import { useState } from "react";
import { Plus, Search, Filter, Download, MoreHorizontal } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HandoverRecord {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  manager: string;
  startDate: string;
  dueDate: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
}

const Handovers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handovers: HandoverRecord[] = [
    {
      id: '1',
      employeeName: 'John Smith',
      role: 'Senior Developer',
      department: 'Engineering',
      manager: 'Alice Johnson',
      startDate: '2025-07-15',
      dueDate: '2025-08-15',
      progress: 75,
      status: 'in_progress',
      priority: 'high'
    },
    {
      id: '2',
      employeeName: 'Lisa Garcia',
      role: 'Marketing Manager',
      department: 'Marketing',
      manager: 'Robert Brown',
      startDate: '2025-07-20',
      dueDate: '2025-08-20',
      progress: 45,
      status: 'in_progress',
      priority: 'medium'
    },
    {
      id: '3',
      employeeName: 'Mike Chen',
      role: 'Data Analyst',
      department: 'Analytics',
      manager: 'Sarah Wilson',
      startDate: '2025-07-10',
      dueDate: '2025-08-10',
      progress: 90,
      status: 'review',
      priority: 'low'
    },
    {
      id: '4',
      employeeName: 'Sarah Williams',
      role: 'HR Specialist',
      department: 'Human Resources',
      manager: 'David Miller',
      startDate: '2025-08-01',
      dueDate: '2025-09-01',
      progress: 20,
      status: 'pending',
      priority: 'medium'
    },
    {
      id: '5',
      employeeName: 'Alex Rodriguez',
      role: 'Product Manager',
      department: 'Product',
      manager: 'Emma Davis',
      startDate: '2025-07-05',
      dueDate: '2025-07-25',
      progress: 100,
      status: 'completed',
      priority: 'high'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
      in_progress: { label: 'In Progress', className: 'status-in-progress' },
      review: { label: 'Review', className: 'status-pending' },
      completed: { label: 'Completed', className: 'status-completed' },
      overdue: { label: 'Overdue', className: 'status-overdue' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.className} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { label: 'High', className: 'border-destructive text-destructive' },
      medium: { label: 'Medium', className: 'border-warning text-warning' },
      low: { label: 'Low', className: 'border-success text-success' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge variant="outline" className={`${config.className} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const filteredHandovers = handovers.filter(handover => {
    const matchesSearch = handover.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         handover.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         handover.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || handover.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Handovers</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track all employee handover processes
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="enterprise">
                <Plus className="mr-2 h-4 w-4" />
                New Handover
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="card-enterprise">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search handovers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Status: {statusFilter === "all" ? "All" : statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("in_progress")}>
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("review")}>
                      Review
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                      Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Handovers Table */}
          <Card className="card-enterprise">
            <CardHeader>
              <CardTitle>All Handovers ({filteredHandovers.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role & Department</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHandovers.map((handover) => (
                    <TableRow key={handover.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{handover.employeeName}</div>
                          <div className="text-sm text-muted-foreground">ID: {handover.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{handover.role}</div>
                          <div className="text-sm text-muted-foreground">{handover.department}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{handover.manager}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{handover.progress}%</span>
                          </div>
                          <Progress value={handover.progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(handover.status)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(handover.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(handover.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Download Report</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Handovers;