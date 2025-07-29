// BuildFromScratch - Build completely new template for new roles
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Brain, Lightbulb, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { templateEngine } from '@/services/template-engine';
import { categoryManagement } from '@/services/category-management';
import type { JobAnalysis, JobRequest, Category, DynamicTemplateItem } from '@/types/template.types';

interface BuildFromScratchProps {
  analysis: JobAnalysis;
  jobRequest: JobRequest;
  onGenerate: (template: any) => void;
}

export function BuildFromScratch({ analysis, jobRequest, onGenerate }: BuildFromScratchProps) {
  const [step, setStep] = useState<'planning' | 'generating' | 'reviewing'>('planning');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [generatedItems, setGeneratedItems] = useState<DynamicTemplateItem[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCategories(analysis.suggested_categories);
    setTemplateName(`${jobRequest.title} Handover Template`);
    generateAIInsights();
  }, [analysis, jobRequest]);

  const generateAIInsights = async () => {
    // Mock AI insights for the new role
    const insights = [
      `This appears to be a ${jobRequest.level}-level position in ${jobRequest.title}`,
      `Based on the role, we recommend focusing on knowledge transfer and relationship handover`,
      `Industry-specific compliance items may be required for Albaad operations`,
      `Consider including change management items due to the specialized nature of this role`
    ];
    
    setAiInsights(insights);
  };

  const simulateGeneration = async () => {
    setIsGenerating(true);
    setStep('generating');
    setGenerationProgress(0);

    // Simulate AI generation process
    const steps = [
      { progress: 20, message: 'Analyzing role requirements...' },
      { progress: 40, message: 'Generating category-specific items...' },
      { progress: 60, message: 'Applying plant-specific adaptations...' },
      { progress: 80, message: 'Optimizing item priorities...' },
      { progress: 100, message: 'Finalizing template...' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerationProgress(step.progress);
    }

    // Generate items for each category
    const items: DynamicTemplateItem[] = [];
    
    for (const category of selectedCategories) {
      const categoryItems = await generateItemsForCategory(category, jobRequest);
      items.push(...categoryItems);
    }

    setGeneratedItems(items);
    setStep('reviewing');
    setIsGenerating(false);
  };

  const generateItemsForCategory = async (category: Category, job: JobRequest): Promise<DynamicTemplateItem[]> => {
    const items: DynamicTemplateItem[] = [];
    
    // Generate 2-4 items per category based on job context
    const itemCount = category.is_system_default ? 3 : 2;
    
    for (let i = 0; i < itemCount; i++) {
      items.push({
        category: category.name,
        title: generateItemTitle(category, job, i),
        description: generateItemDescription(category, job, i),
        instructions: generateItemInstructions(category, job, i),
        priority: calculateItemPriority(category, job, i),
        estimated_minutes: estimateItemTime(category, job, i),
        is_mandatory: determineIfMandatory(category, job, i),
        generated_by: 'ai_inference'
      });
    }

    return items;
  };

  const generateItemTitle = (category: Category, job: JobRequest, index: number): string => {
    const titleTemplates = {
      files_and_documents: [
        `${job.title} Documentation Handover`,
        'Project Files and Records',
        'Role-Specific Documentation'
      ],
      processes_and_procedures: [
        `${job.title} Standard Procedures`,
        'Key Process Workflows',
        'Operational Guidelines'
      ],
      contacts_and_relationships: [
        'Key Stakeholder Contacts',
        'Internal Team Relationships',
        'External Partner Connections'
      ],
      systems_and_access: [
        'System Access Credentials',
        'Software and Tool Access',
        'Security Clearances'
      ],
      knowledge_and_insights: [
        'Role-Specific Knowledge',
        'Industry Insights',
        'Lessons Learned'
      ]
    };

    const templates = titleTemplates[category.name as keyof typeof titleTemplates] || [
      `${category.display_name} Item ${index + 1}`,
      `${category.display_name} Requirements`,
      `${category.display_name} Handover`
    ];

    return templates[index] || templates[0];
  };

  const generateItemDescription = (category: Category, job: JobRequest, index: number): string => {
    const descriptions = {
      files_and_documents: [
        `Transfer all documents and files specific to the ${job.title} role`,
        'Handover project files, reports, and documentation',
        'Share role-specific templates and resources'
      ],
      processes_and_procedures: [
        `Key processes and procedures for ${job.title} responsibilities`,
        'Standard operating procedures and workflows',
        'Quality guidelines and best practices'
      ],
      contacts_and_relationships: [
        'Important contacts and stakeholder relationships',
        'Team members and collaboration networks',
        'External partners and vendor contacts'
      ],
      systems_and_access: [
        'IT systems and software access requirements',
        'Login credentials and security tokens',
        'Database and application permissions'
      ],
      knowledge_and_insights: [
        `Specialized knowledge for ${job.title} role`,
        'Industry insights and market understanding',
        'Institutional knowledge and experience'
      ]
    };

    const categoryDescriptions = descriptions[category.name as keyof typeof descriptions] || [
      `${category.display_name} related handover item`,
      `Important ${category.display_name} information`,
      `${category.display_name} transfer requirements`
    ];

    return categoryDescriptions[index] || categoryDescriptions[0];
  };

  const generateItemInstructions = (category: Category, job: JobRequest, index: number): string => {
    const baseInstructions = [
      'Schedule dedicated time to review and transfer this information',
      'Ensure all relevant details are documented and accessible',
      'Verify that the incoming employee understands the requirements'
    ];

    return baseInstructions[index] || baseInstructions[0];
  };

  const calculateItemPriority = (category: Category, job: JobRequest, index: number): number => {
    // Core categories get higher priority
    if (category.is_system_default) {
      return 7 + index; // 7-9 range
    }
    
    // Director level gets higher priorities
    if (job.level === 'director') {
      return 6 + index; // 6-8 range
    }
    
    return 5 + index; // 5-7 range
  };

  const estimateItemTime = (category: Category, job: JobRequest, index: number): number => {
    const baseTimes = {
      files_and_documents: [60, 45, 30],
      processes_and_procedures: [90, 60, 45],
      contacts_and_relationships: [45, 30, 30],
      systems_and_access: [30, 30, 45],
      knowledge_and_insights: [120, 90, 60]
    };

    const categoryTimes = baseTimes[category.name as keyof typeof baseTimes] || [60, 45, 30];
    return categoryTimes[index] || 30;
  };

  const determineIfMandatory = (category: Category, job: JobRequest, index: number): boolean => {
    // Core categories are typically mandatory
    if (category.is_system_default && index === 0) {
      return true;
    }
    
    // Director level has more mandatory items
    if (job.level === 'director' && index < 2) {
      return true;
    }
    
    return index === 0; // First item in each category is typically mandatory
  };

  const handleGenerate = () => {
    const template = {
      name: templateName,
      description: `AI-generated handover template for ${jobRequest.title} role`,
      categories: selectedCategories.map(cat => cat.name),
      items: generatedItems,
      confidence_score: 0.3, // Low confidence for new templates
      requires_review: true,
      learning_mode: true
    };

    onGenerate(template);
  };

  if (step === 'generating') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">Generating Your Template</h3>
          <p className="text-muted-foreground">
            Our AI is creating a custom handover template for your role...
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Generation Progress</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-3" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Categories:</span> {selectedCategories.length}
                </div>
                <div>
                  <span className="font-medium">Expected Items:</span> {selectedCategories.length * 2.5}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'reviewing') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Review Generated Template</h3>
          <p className="text-muted-foreground">
            AI has generated {generatedItems.length} items across {selectedCategories.length} categories.
            Review and approve the template.
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This template is generated using AI and requires review. Items can be refined based on actual usage.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Template Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Template Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{generatedItems.length}</div>
                  <div className="text-sm text-muted-foreground">Items Generated</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedCategories.length}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">Categories Included</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.display_name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Items */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedCategories.map((category) => {
                  const categoryItems = generatedItems.filter(item => item.category === category.name);
                  
                  return (
                    <div key={category.id}>
                      <h6 className="font-medium text-sm mb-2">
                        {category.display_name} ({categoryItems.length})
                      </h6>
                      <div className="space-y-2">
                        {categoryItems.map((item, index) => (
                          <Card key={index} className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h6 className="font-medium text-sm">{item.title}</h6>
                                <div className="flex items-center space-x-1">
                                  <Badge variant="outline" className="text-xs">
                                    P{item.priority}
                                  </Badge>
                                  {item.is_mandatory && (
                                    <Badge variant="destructive" className="text-xs">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                              <div className="text-xs text-muted-foreground">
                                Est. {item.estimated_minutes} minutes
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleGenerate}>
            <Sparkles className="mr-2 h-4 w-4" />
            Use Generated Template
          </Button>
        </div>
      </div>
    );
  }

  // Planning step
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Brain className="mx-auto h-12 w-12 text-primary" />
        <h3 className="text-2xl font-bold">Build From Scratch</h3>
        <p className="text-muted-foreground">
          This role appears to be unique. We'll use AI to generate a custom handover template tailored specifically for this position.
        </p>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            AI Analysis Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Based on your role, we recommend these categories for your handover template:
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {selectedCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{category.display_name}</h5>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                  <Badge variant={category.is_system_default ? 'default' : 'secondary'}>
                    {category.is_system_default ? 'Core' : 'Context'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Preview */}
      <Card>
        <CardHeader>
          <CardTitle>What Will Be Generated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {selectedCategories.length * 2.5}
              </div>
              <div className="text-sm text-muted-foreground">Expected Items</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">30%</div>
              <div className="text-sm text-muted-foreground">Initial Confidence</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">Yes</div>
              <div className="text-sm text-muted-foreground">Review Required</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          onClick={simulateGeneration}
          disabled={isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Template with AI
            </>
          )}
        </Button>
      </div>
    </div>
  );
}