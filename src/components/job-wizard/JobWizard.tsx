// JobWizard - Multi-step wizard for creating new roles and generating templates
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Brain, 
  Users, 
  Settings, 
  ArrowRight, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { BasicInfoStep } from './BasicInfoStep';
import { ReviewSimilarTemplates } from './ReviewSimilarTemplates';
import { CustomizeTemplate } from './CustomizeTemplate';
import { BuildFromScratch } from './BuildFromScratch';
import { templateEngine } from '@/services/template-engine';
import type {
  JobRequest,
  JobAnalysis,
  GeneratedTemplate,
  JobContext
} from '@/types/template.types';

enum WizardStep {
  BASIC_INFO = 1,
  ANALYSIS_REVIEW = 2,
  TEMPLATE_GENERATION = 3,
  FINAL_REVIEW = 4
}

interface JobWizardProps {
  onComplete?: (template: GeneratedTemplate, jobRequest: JobRequest) => void;
  onCancel?: () => void;
}

export function JobWizard({ onComplete, onCancel }: JobWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.BASIC_INFO);
  const [jobRequest, setJobRequest] = useState<Partial<JobRequest>>({});
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [generatedTemplate, setGeneratedTemplate] = useState<GeneratedTemplate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { number: 1, title: 'Basic Info', icon: Users },
    { number: 2, title: 'Analysis', icon: Brain },
    { number: 3, title: 'Generation', icon: Sparkles },
    { number: 4, title: 'Review', icon: CheckCircle }
  ];

  const getStepProgress = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  const handleBasicInfoComplete = async (basicInfo: JobRequest) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Store job request
      setJobRequest(basicInfo);
      
      // Analyze the job request
      const jobAnalysis = await templateEngine.analyzeJobRequest(basicInfo);
      setAnalysis(jobAnalysis);
      
      // Move to appropriate next step based on analysis
      setCurrentStep(WizardStep.ANALYSIS_REVIEW);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalysisReview = async (decision: 'approve' | 'customize' | 'rebuild') => {
    setIsProcessing(true);
    setError(null);

    try {
      if (decision === 'approve' && analysis?.generation_strategy === 'use_existing') {
        // Generate template using existing strategy
        const template = await templateEngine.generateTemplate(jobRequest as JobRequest);
        setGeneratedTemplate(template);
        setCurrentStep(WizardStep.FINAL_REVIEW);
      } else {
        // Move to customization/generation step
        setCurrentStep(WizardStep.TEMPLATE_GENERATION);
      }
    } catch (err) {
      setError(`Template generation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTemplateGeneration = async (customTemplate?: any) => {
    setIsProcessing(true);
    setError(null);

    try {
      let template: GeneratedTemplate;
      
      if (customTemplate) {
        // Use custom template provided by user
        template = customTemplate;
      } else {
        // Generate new template
        template = await templateEngine.generateTemplate(jobRequest as JobRequest);
      }
      
      setGeneratedTemplate(template);
      setCurrentStep(WizardStep.FINAL_REVIEW);
    } catch (err) {
      setError(`Template generation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalComplete = () => {
    if (onComplete && generatedTemplate) {
      onComplete(generatedTemplate, jobRequest as JobRequest);
    }
  };

  const handleBack = () => {
    if (currentStep > WizardStep.BASIC_INFO) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const getAnalysisStrategyInfo = () => {
    if (!analysis) return null;

    const strategyInfo = {
      use_existing: {
        title: 'Use Existing Template',
        description: 'High similarity found - we can use an existing template',
        color: 'bg-green-500',
        confidence: analysis.confidence_assessment
      },
      merge_multiple: {
        title: 'Merge Templates',
        description: 'Multiple similar templates found - we can combine them',
        color: 'bg-blue-500',
        confidence: analysis.confidence_assessment
      },
      generate_new: {
        title: 'Build From Scratch',
        description: 'New role detected - we need to create a custom template',
        color: 'bg-purple-500',
        confidence: analysis.confidence_assessment
      }
    };

    return strategyInfo[analysis.generation_strategy];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Create New Role & Template
          </CardTitle>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep} of {steps.length}</span>
                <span>{Math.round(getStepProgress())}% Complete</span>
              </div>
              <Progress value={getStepProgress()} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isComplete = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex flex-col items-center space-y-2">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2
                      ${isComplete 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isActive 
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-muted text-muted-foreground'
                      }
                    `}>
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === WizardStep.BASIC_INFO && (
            <BasicInfoStep
              onNext={handleBasicInfoComplete}
              initialData={jobRequest}
              isLoading={isProcessing}
            />
          )}

          {currentStep === WizardStep.ANALYSIS_REVIEW && analysis && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Analysis Complete</h3>
                <p className="text-muted-foreground">
                  We've analyzed your role and determined the best approach for creating your handover template.
                </p>
              </div>

              {/* Strategy Card */}
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg ${getAnalysisStrategyInfo()?.color} flex items-center justify-center`}>
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="text-lg font-semibold">{getAnalysisStrategyInfo()?.title}</h4>
                      <p className="text-muted-foreground">{getAnalysisStrategyInfo()?.description}</p>
                      
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary">
                          Confidence: {Math.round((analysis.confidence_assessment || 0) * 100)}%
                        </Badge>
                        <Badge variant={analysis.requires_review ? 'destructive' : 'default'}>
                          {analysis.requires_review ? 'Review Required' : 'Auto-Approved'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Similar Templates */}
                  {analysis.closest_matches.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-2">Similar Templates Found:</h5>
                      <div className="space-y-2">
                        {analysis.closest_matches.slice(0, 3).map((template, index) => (
                          <div key={template.id} className="flex justify-between items-center text-sm">
                            <span>{template.name}</span>
                            <Badge variant="outline">
                              {Math.round((template.confidence_score || 0) * 100)}% match
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                {analysis.generation_strategy === 'use_existing' && (
                  <Button onClick={() => handleAnalysisReview('approve')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Use Existing Template
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => handleAnalysisReview('customize')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Customize Template
                </Button>
                
                {analysis.generation_strategy === 'generate_new' && (
                  <Button 
                    variant="secondary"
                    onClick={() => handleAnalysisReview('rebuild')}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Build From Scratch
                  </Button>
                )}
              </div>
            </div>
          )}

          {currentStep === WizardStep.TEMPLATE_GENERATION && analysis && (
            <div className="space-y-6">
              {analysis.generation_strategy === 'use_existing' && (
                <ReviewSimilarTemplates
                  analysis={analysis}
                  onApprove={handleTemplateGeneration}
                />
              )}
              
              {analysis.generation_strategy === 'merge_multiple' && (
                <CustomizeTemplate
                  baseTemplates={analysis.closest_matches}
                  suggestedCategories={analysis.suggested_categories}
                  onSave={handleTemplateGeneration}
                />
              )}
              
              {analysis.generation_strategy === 'generate_new' && (
                <BuildFromScratch
                  analysis={analysis}
                  jobRequest={jobRequest as JobRequest}
                  onGenerate={handleTemplateGeneration}
                />
              )}
            </div>
          )}

          {currentStep === WizardStep.FINAL_REVIEW && generatedTemplate && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="text-2xl font-bold">Template Generated Successfully!</h3>
                <p className="text-muted-foreground">
                  Your handover template has been created and is ready to use.
                </p>
              </div>

              {/* Template Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>{generatedTemplate.template.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {generatedTemplate.template.items.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {generatedTemplate.template.categories.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(generatedTemplate.template.confidence_score * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {generatedTemplate.metadata.generation_time}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Generation Time</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {generatedTemplate.template.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>

                  {generatedTemplate.template.requires_review && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This template requires review due to low confidence score. 
                        Consider having an expert review the generated items.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={currentStep === WizardStep.BASIC_INFO ? onCancel : handleBack}
          disabled={isProcessing}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === WizardStep.BASIC_INFO ? 'Cancel' : 'Back'}
        </Button>

        {currentStep === WizardStep.FINAL_REVIEW && (
          <Button onClick={handleFinalComplete}>
            Complete
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}