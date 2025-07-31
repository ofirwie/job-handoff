import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
  TrendingUp,
  Settings,
  BarChart3,
  Award,
  CheckCircle
} from "lucide-react";

// Interface for template data from Supabase
interface Template {
  id: string;
  name: string;
  job_codes: string[];
  sections: any;
  department: string;
  is_department_standard: boolean;
  status: string;
  template_version: number;
  created_at: string;
  updated_at: string;
  manager_id?: string;
  parent_template_id?: string;
  // Metrics from template_metrics table
  usage_count?: number;
  avg_completion_time_hours?: number;
  avg_success_rating?: number;
  completion_rate?: number;
  feedback_count?: number;
  recommendation_rate?: number;
}

interface TemplateMetrics {
  totalTemplates: number;
  totalUsage: number;
  avgSuccessRate: number;
  avgCompletionTime: number;
}

// Albaad departments from our templates
const DEPARTMENTS = [
  'Production',
  'Quality Assurance', 
  'Research & Development',
  'Engineering',
  'Supply Chain',
  'Human Resources',
  'Finance',
  'Sales & Marketing',
  'Maintenance',
  'Environmental & Safety'
];

const LEVELS = ['junior', 'senior', 'manager', 'director'];

const getJobLevel = (templateName: string): string => {
  const name = templateName.toLowerCase();
  if (name.includes('director')) return 'director';
  if (name.includes('manager')) return 'manager';
  if (name.includes('specialist') || name.includes('coordinator') || name.includes('analyst')) return 'senior';
  return 'junior';
};

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [metrics, setMetrics] = useState<TemplateMetrics>({
    totalTemplates: 0,
    totalUsage: 0,
    avgSuccessRate: 0,
    avgCompletionTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Load templates from Supabase
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      // Fetch templates with metrics
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates')
        .select(`
          *,
          template_metrics (
            usage_count,
            avg_completion_time_hours,
            avg_success_rating,
            completion_rate,
            feedback_count,
            recommendation_rate
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (templatesError) {
        console.error('Error loading templates:', templatesError);
        return;
      }

      // Transform data and merge metrics
      const processedTemplates = templatesData?.map(template => ({
        ...template,
        usage_count: template.template_metrics?.[0]?.usage_count || 0,
        avg_completion_time_hours: template.template_metrics?.[0]?.avg_completion_time_hours || 0,
        avg_success_rating: template.template_metrics?.[0]?.avg_success_rating || 0,
        completion_rate: template.template_metrics?.[0]?.completion_rate || 0,
        feedback_count: template.template_metrics?.[0]?.feedback_count || 0,
        recommendation_rate: template.template_metrics?.[0]?.recommendation_rate || 0,
      })) || [];

      setTemplates(processedTemplates);

      // Calculate overall metrics
      const totalTemplates = processedTemplates.length;
      const totalUsage = processedTemplates.reduce((sum, t) => sum + (t.usage_count || 0), 0);
      const avgSuccessRate = processedTemplates.reduce((sum, t) => sum + (t.avg_success_rating || 0), 0) / totalTemplates;
      const avgCompletionTime = processedTemplates.reduce((sum, t) => sum + (t.avg_completion_time_hours || 0), 0) / totalTemplates;

      setMetrics({
        totalTemplates,
        totalUsage,
        avgSuccessRate: isNaN(avgSuccessRate) ? 0 : avgSuccessRate,
        avgCompletionTime: isNaN(avgCompletionTime) ? 0 : avgCompletionTime
      });

    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.job_codes.some(code => code.toLowerCase().includes(searchTerm.toLowerCase()));
    const templateLevel = getJobLevel(template.name);
    const matchesLevel = selectedLevel === "all" || templateLevel === selectedLevel;
    const matchesDepartment = selectedDepartment === "all" || template.department === selectedDepartment;
    
    return matchesSearch && matchesLevel && matchesDepartment;
  });

  const handleCreateNew = () => {
    console.log("Create new template");
    // TODO: Navigate to template creation wizard
  };

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleEditTemplate = (template: Template) => {
    console.log("Edit template:", template.id);
    // TODO: Navigate to template editor
  };

  const handleCloneTemplate = (template: Template) => {
    console.log("Clone template:", template.id);
    // TODO: Implement template cloning
  };

  const getTaskCount = (sections: any): number => {
    if (!sections || !sections.tasks) return 0;
    return sections.tasks.length;
  };

  const getEstimatedTime = (sections: any): number => {
    if (!sections || !sections.tasks) return 0;
    // Estimate 30 minutes per task on average
    return sections.tasks.length * 30;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-muted-foreground">Loading templates...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Albaad Templates</h1>
              <p className="text-muted-foreground mt-1">
                Manage handover templates for all Albaad departments and roles.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Template Settings</span>
              </Button>
              <Button onClick={handleCreateNew} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create New Template</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                  <p className="text-2xl font-bold">{metrics.totalTemplates}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Times Used</p>
                  <p className="text-2xl font-bold">{metrics.totalUsage}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Success Rate</p>
                  <p className="text-2xl font-bold">
                    {metrics.avgSuccessRate > 0 ? Math.round(metrics.avgSuccessRate * 100) : '--'}%
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
                    {metrics.avgCompletionTime > 0 ? Math.round(metrics.avgCompletionTime) : '--'} hrs
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Template Library</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Albaad International</Badge>
                  <Badge variant="secondary">{filteredTemplates.length} templates</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search templates by name or job code..."
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
                    {LEVELS.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Templates List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Templates ({filteredTemplates.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>

              {filteredTemplates.map((template) => {
                const taskCount = getTaskCount(template.sections);
                const estimatedTime = getEstimatedTime(template.sections);
                const templateLevel = getJobLevel(template.name);
                
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-lg">{template.name}</h4>
                              {template.is_department_standard && (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Standard
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>Job Codes:</span>
                              {template.job_codes.map((code, index) => (
                                <Badge key={code} variant="outline" className="text-xs">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTemplate(template)}
                              title="View Template"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                              title="Edit Template"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCloneTemplate(template)}
                              title="Clone Template"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-wrap">
                          <Badge variant="outline">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {templateLevel}
                          </Badge>
                          <Badge variant="outline">
                            <Building className="h-3 w-3 mr-1" />
                            {template.department}
                          </Badge>
                          <Badge variant="secondary">
                            {taskCount} tasks
                          </Badge>
                          <Badge variant="secondary">
                            ~{Math.round(estimatedTime / 60)} hrs
                          </Badge>
                          <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                            {template.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4" />
                              <span>Used {template.usage_count || 0} times</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-4 w-4" />
                              <span>
                                {template.avg_success_rating 
                                  ? Math.round(template.avg_success_rating * 100) + '% success'
                                  : 'No data'
                                }
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div>v{template.template_version}</div>
                            <div>Created {new Date(template.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredTemplates.length === 0 && !loading && (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center space-y-2">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {templates.length === 0 
                          ? "No templates available. Create your first template to get started."
                          : "No templates found matching your criteria"
                        }
                      </p>
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
                      <span className="truncate">{selectedTemplate.name}</span>
                      <Badge variant={selectedTemplate.is_department_standard ? 'default' : 'secondary'}>
                        {selectedTemplate.is_department_standard ? 'Standard' : 'Custom'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h6 className="font-medium text-sm mb-2">Job Codes</h6>
                        <div className="flex flex-wrap gap-1">
                          {selectedTemplate.job_codes.map((code) => (
                            <Badge key={code} variant="outline" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h6 className="font-medium text-sm mb-2">Department</h6>
                        <Badge variant="outline">
                          <Building className="h-3 w-3 mr-1" />
                          {selectedTemplate.department}
                        </Badge>
                      </div>

                      {selectedTemplate.sections?.tasks && (
                        <div>
                          <h6 className="font-medium text-sm mb-2">Tasks ({selectedTemplate.sections.tasks.length})</h6>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {selectedTemplate.sections.tasks.slice(0, 5).map((task: any, index: number) => (
                              <div key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                                <span className="text-xs text-muted-foreground mt-1">•</span>
                                <span className="flex-1">{task.description}</span>
                                {task.required && (
                                  <Badge variant="destructive" className="text-xs ml-1">Required</Badge>
                                )}
                              </div>
                            ))}
                            {selectedTemplate.sections.tasks.length > 5 && (
                              <div className="text-xs text-muted-foreground">
                                +{selectedTemplate.sections.tasks.length - 5} more tasks...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                      <div>
                        <span className="font-medium">Tasks:</span>
                        <div className="text-muted-foreground">{getTaskCount(selectedTemplate.sections)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Est. Time:</span>
                        <div className="text-muted-foreground">~{Math.round(getEstimatedTime(selectedTemplate.sections) / 60)}hrs</div>
                      </div>
                      <div>
                        <span className="font-medium">Success Rate:</span>
                        <div className="text-muted-foreground">
                          {selectedTemplate.avg_success_rating 
                            ? Math.round(selectedTemplate.avg_success_rating * 100) + '%'
                            : 'No data'
                          }
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Usage:</span>
                        <div className="text-muted-foreground">{selectedTemplate.usage_count || 0} times</div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <Button className="w-full">
                        Use This Template
                      </Button>
                      <Button variant="outline" className="w-full">
                        Create Handover
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Copy className="h-3 w-3 mr-1" />
                          Clone
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-6">
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center space-y-2">
                      <Eye className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Select a template to preview</p>
                      <p className="text-xs text-muted-foreground">
                        Click on any template to see its details and tasks
                      </p>
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