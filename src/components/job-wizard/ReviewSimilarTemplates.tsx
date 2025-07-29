// ReviewSimilarTemplates - Review and approve similar templates
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Eye, Edit, Star } from 'lucide-react';
import type { JobAnalysis, BaseTemplate } from '@/types/template.types';

interface ReviewSimilarTemplatesProps {
  analysis: JobAnalysis;
  onApprove: (template?: any) => void;
}

export function ReviewSimilarTemplates({ analysis, onApprove }: ReviewSimilarTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<BaseTemplate | null>(
    analysis.closest_matches[0] || null
  );

  const handleApprove = () => {
    onApprove(selectedTemplate);
  };

  const getTemplateData = (template: BaseTemplate) => {
    try {
      return template.template_data as any;
    } catch {
      return { categories: [], items: [] };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Review Similar Templates</h3>
        <p className="text-muted-foreground">
          We found {analysis.closest_matches.length} similar template{analysis.closest_matches.length !== 1 ? 's' : ''}. 
          Review and select the best match for your role.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template Selection */}
        <div className="lg:col-span-1 space-y-4">
          <h4 className="font-semibold">Available Templates</h4>
          {analysis.closest_matches.map((template) => {
            const templateData = getTemplateData(template);
            const isSelected = selectedTemplate?.id === template.id;
            
            return (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium text-sm">{template.name}</h5>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {Math.round((template.confidence_score || 0) * 100)}% match
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.level}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {templateData.items?.length || 0} items • {templateData.categories?.length || 0} categories
                      </div>
                      
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        <span>Used {template.usage_count || 0} times</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Template Preview */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedTemplate.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {Math.round((selectedTemplate.confidence_score || 0) * 100)}% confidence
                    </Badge>
                    <Badge variant={selectedTemplate.source === 'ai_generated' ? 'destructive' : 'default'}>
                      {selectedTemplate.source}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="items">Items</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h6 className="font-medium text-sm">Template Info</h6>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Level: {selectedTemplate.level || 'Not specified'}</div>
                          <div>Department: {selectedTemplate.department || 'Any'}</div>
                          <div>Industry: {selectedTemplate.industry || 'General'}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h6 className="font-medium text-sm">Usage Stats</h6>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Times used: {selectedTemplate.usage_count || 0}</div>
                          <div>Success rate: {Math.round((selectedTemplate.success_rate || 0) * 100)}%</div>
                          <div>Created: {new Date(selectedTemplate.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedTemplate.job_title && (
                      <div>
                        <h6 className="font-medium text-sm">Original Job Title</h6>
                        <p className="text-sm text-muted-foreground">{selectedTemplate.job_title}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="categories" className="space-y-4">
                    <div className="grid gap-2">
                      {getTemplateData(selectedTemplate).categories?.map((category: string) => (
                        <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{category.replace(/_/g, ' ')}</span>
                          <Badge variant="outline">Category</Badge>
                        </div>
                      )) || (
                        <p className="text-sm text-muted-foreground">No categories defined</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="items" className="space-y-4">
                    <div className="space-y-3">
                      {getTemplateData(selectedTemplate).items?.map((item: any, index: number) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h6 className="font-medium">{item.title}</h6>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={item.is_mandatory ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  Priority {item.priority}
                                </Badge>
                                {item.is_mandatory && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Category: {item.category?.replace(/_/g, ' ')}</span>
                              <span>Est. {item.estimated_minutes || 30} minutes</span>
                            </div>
                          </div>
                        </Card>
                      )) || (
                        <p className="text-sm text-muted-foreground">No items defined</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
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

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Customize Instead
        </Button>
        
        <Button 
          onClick={handleApprove}
          disabled={!selectedTemplate}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Use This Template
        </Button>
      </div>
    </div>
  );
}