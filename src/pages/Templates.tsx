import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Copy, 
  Star, 
  Users, 
  Clock,
  FileText,
  Building,
  Briefcase,
  TrendingUp
} from "lucide-react";

// Mock data for templates - in a real app, this would come from the database
const mockTemplates = [
  {
    id: "1",
    name: "Senior Software Developer",
    description: "Complete handover template for senior development roles",
    level: "senior",
    department: "Engineering",
    industry: "Technology",
    categories: ["Technical Documentation", "Code Repositories", "Team Contacts", "Ongoing Projects"],
    itemCount: 24,
    estimatedTime: 180,
    usageCount: 15,
    successRate: 0.92,
    createdAt: "2024-01-15",
    source: "template_library",
    confidenceScore: 0.95,
    isActive: true
  },
  {
    id: "2", 
    name: "Marketing Manager",
    description: "Comprehensive template for marketing leadership transitions",
    level: "manager",
    department: "Marketing",
    industry: "General",
    categories: ["Campaign Materials", "Team Contacts", "Budget Information", "Vendor Relationships"],
    itemCount: 18,
    estimatedTime: 150,
    usageCount: 8,
    successRate: 0.88,
    createdAt: "2024-02-20",
    source: "manual_creation",
    confidenceScore: 0.90,
    isActive: true
  },
  {
    id: "3",
    name: "Operations Director",
    description: "Executive-level template for operations leadership",
    level: "director",
    department: "Operations",
    industry: "Manufacturing",
    categories: ["Strategic Plans", "Key Metrics", "Vendor Contracts", "Team Structure", "Budget Authority"],
    itemCount: 32,
    estimatedTime: 240,
    usageCount: 3,
    successRate: 1.0,
    createdAt: "2024-03-10",
    source: "ai_generated",
    confidenceScore: 0.85,
    isActive: true
  },
  {
    id: "4",
    name: "HR Specialist",
    description: "Template for human resources specialist roles",
    level: "senior",
    department: "Human Resources",
    industry: "General",
    categories: ["Employee Records", "Policies", "Recruitment Materials", "Compliance Documents"],
    itemCount: 20,
    estimatedTime: 120,
    usageCount: 12,
    successRate: 0.95,
    createdAt: "2024-01-30",
    source: "template_library",
    confidenceScore: 0.92,
    isActive: true
  }
];

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof mockTemplates[0] | null>(null);

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || template.level === selectedLevel;
    const matchesDepartment = selectedDepartment === "all" || template.department === selectedDepartment;
    
    return matchesSearch && matchesLevel && matchesDepartment && template.isActive;
  });

  const handleCreateNew = () => {
    // This would typically navigate to a template creation wizard
    console.log("Create new template");
  };

  const handleViewTemplate = (template: typeof mockTemplates[0]) => {
    setSelectedTemplate(template);
  };

  const handleEditTemplate = (template: typeof mockTemplates[0]) => {
    console.log("Edit template:", template.id);
  };

  const handleCloneTemplate = (template: typeof mockTemplates[0]) => {
    console.log("Clone template:", template.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Handover Templates</h1>
              <p className="text-muted-foreground mt-1">
                Manage and create templates for different roles and departments.
              </p>
            </div>
            <Button onClick={handleCreateNew} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create New Template</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                  <p className="text-2xl font-bold">{mockTemplates.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Times Used</p>
                  <p className="text-2xl font-bold">{mockTemplates.reduce((sum, t) => sum + t.usageCount, 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round(mockTemplates.reduce((sum, t) => sum + t.successRate, 0) / mockTemplates.length * 100)}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Time</p>
                  <p className="text-2xl font-bold">
                    {Math.round(mockTemplates.reduce((sum, t) => sum + t.estimatedTime, 0) / mockTemplates.length)} min
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Human Resources">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Templates List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold">
                Templates ({filteredTemplates.length})
              </h3>
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-lg">{template.name}</h4>
                          <p className="text-muted-foreground text-sm">{template.description}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTemplate(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCloneTemplate(template)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-wrap">
                        <Badge variant="outline">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {template.level}
                        </Badge>
                        <Badge variant="outline">
                          <Building className="h-3 w-3 mr-1" />
                          {template.department}
                        </Badge>
                        <Badge variant="secondary">
                          {template.itemCount} items
                        </Badge>
                        <Badge variant="secondary">
                          {template.estimatedTime} min
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>Used {template.usageCount} times</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{Math.round(template.successRate * 100)}% success</span>
                          </div>
                        </div>
                        <div>
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredTemplates.length === 0 && (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center space-y-2">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No templates found matching your criteria</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Template Preview */}
            <div className="lg:col-span-1">
              {selectedTemplate ? (
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedTemplate.name}</span>
                      <Badge variant={selectedTemplate.source === 'ai_generated' ? 'destructive' : 'default'}>
                        {selectedTemplate.source.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h6 className="font-medium text-sm">Categories</h6>
                      <div className="space-y-1">
                        {selectedTemplate.categories.map((category) => (
                          <div key={category} className="text-sm text-muted-foreground">
                            • {category}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Items:</span>
                        <div className="text-muted-foreground">{selectedTemplate.itemCount}</div>
                      </div>
                      <div>
                        <span className="font-medium">Est. Time:</span>
                        <div className="text-muted-foreground">{selectedTemplate.estimatedTime} min</div>
                      </div>
                      <div>
                        <span className="font-medium">Success Rate:</span>
                        <div className="text-muted-foreground">{Math.round(selectedTemplate.successRate * 100)}%</div>
                      </div>
                      <div>
                        <span className="font-medium">Usage:</span>
                        <div className="text-muted-foreground">{selectedTemplate.usageCount} times</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full">
                        Use This Template
                      </Button>
                      <Button variant="outline" className="w-full">
                        Create Handover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-6">
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center space-y-2">
                      <Eye className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Select a template to preview</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Templates;