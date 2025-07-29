// BasicInfoStep - First step of job creation wizard
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building, User, Briefcase } from 'lucide-react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { JobRequest, Department, Plant } from '@/types/template.types';

interface BasicInfoStepProps {
  onNext: (jobInfo: JobRequest) => void;
  initialData?: Partial<JobRequest>;
  isLoading?: boolean;
}

interface DepartmentWithPlant extends Department {
  plant: Plant;
}

export function BasicInfoStep({ onNext, initialData, isLoading }: BasicInfoStepProps) {
  const [formData, setFormData] = useState<Partial<JobRequest>>({
    title: '',
    level: undefined,
    department_id: '',
    description: '',
    custom_fields: {},
    ...initialData
  });
  
  const [departments, setDepartments] = useState<DepartmentWithPlant[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          plant:plants!inner(*)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) handleSupabaseError(error);
      setDepartments(data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.level) {
      newErrors.level = 'Job level is required';
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const jobRequest: JobRequest = {
      title: formData.title!.trim(),
      level: formData.level!,
      department_id: formData.department_id!,
      description: formData.description?.trim() || undefined,
      custom_fields: formData.custom_fields || {}
    };

    onNext(jobRequest);
  };

  const updateFormData = (field: keyof JobRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedDepartment = departments.find(dept => dept.id === formData.department_id);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Basic Job Information</h3>
        <p className="text-muted-foreground">
          Let's start by gathering some basic information about the role you're creating.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Job Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            Job Title *
          </Label>
          <Input
            id="title"
            placeholder="e.g., Senior Production Manager"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        {/* Job Level */}
        <div className="space-y-2">
          <Label className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Job Level *
          </Label>
          <Select 
            value={formData.level} 
            onValueChange={(value) => updateFormData('level', value as JobRequest['level'])}
          >
            <SelectTrigger className={errors.level ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select job level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="director">Director</SelectItem>
            </SelectContent>
          </Select>
          {errors.level && (
            <p className="text-sm text-destructive">{errors.level}</p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label className="flex items-center">
            <Building className="mr-2 h-4 w-4" />
            Department *
          </Label>
          {loadingDepartments ? (
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading departments...</span>
            </div>
          ) : (
            <Select 
              value={formData.department_id} 
              onValueChange={(value) => updateFormData('department_id', value)}
            >
              <SelectTrigger className={errors.department_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    <div className="flex flex-col">
                      <span>{dept.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {dept.plant.name} ({dept.plant.country})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.department_id && (
            <p className="text-sm text-destructive">{errors.department_id}</p>
          )}
        </div>

        {/* Selected Plant Info */}
        {selectedDepartment && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Plant Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Plant:</span> {selectedDepartment.plant.name}
                </div>
                <div>
                  <span className="font-medium">Country:</span> {selectedDepartment.plant.country}
                </div>
                <div>
                  <span className="font-medium">Code:</span> {selectedDepartment.plant.code}
                </div>
                <div>
                  <span className="font-medium">Department:</span> {selectedDepartment.name}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Job Description
            <span className="text-muted-foreground ml-1">(optional)</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Brief description of the role's responsibilities and requirements..."
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            This helps us create a more tailored handover template for the role.
          </p>
        </div>

        {/* Custom Fields Preview */}
        {Object.keys(formData.custom_fields || {}).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(formData.custom_fields || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="font-medium">{key}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Context Preview */}
      {formData.title && formData.level && selectedDepartment && (
        <Alert>
          <AlertDescription>
            <strong>Preview:</strong> Creating handover template for{' '}
            <span className="font-medium">
              {formData.level} {formData.title}
            </span>{' '}
            in <span className="font-medium">{selectedDepartment.name}</span> at{' '}
            <span className="font-medium">
              {selectedDepartment.plant.name}
            </span>{' '}
            ({selectedDepartment.plant.country})
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || loadingDepartments}
          className="min-w-32"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Role'
          )}
        </Button>
      </div>
    </div>
  );
}