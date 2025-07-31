import { supabase } from "@/lib/supabase";

export interface Template {
  id: string;
  name: string;
  job_codes: string[];
  sections: any;
  department: string;
  is_department_standard: boolean;
  status: 'draft' | 'active' | 'archived' | 'deprecated';
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

export interface TemplateMetrics {
  template_id: string;
  usage_count: number;
  avg_completion_time_hours?: number;
  avg_success_rating?: number;
  completion_rate?: number;
  avg_time_to_complete_days?: number;
  feedback_count: number;
  recommendation_rate?: number;
  last_calculated: string;
  updated_at: string;
}

export interface TemplateFeedback {
  id: string;
  template_id: string;
  handover_id?: string;
  submitted_by: string;
  submitter_role: 'employee' | 'manager' | 'successor';
  rating: number; // 1-5
  completion_time_hours?: number;
  missing_items?: string[];
  unnecessary_items?: string[];
  unclear_instructions?: string[];
  suggestions?: string;
  would_recommend?: boolean;
  created_at: string;
}

export interface TemplatePermission {
  id: string;
  template_id: string;
  user_email: string;
  permission_type: 'view' | 'edit' | 'delete' | 'share' | 'clone';
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export class TemplateService {
  /**
   * Get all templates with optional filters
   */
  static async getTemplates(filters?: {
    department?: string;
    status?: string;
    manager_id?: string;
    search?: string;
  }): Promise<{ data: Template[]; error: any }> {
    try {
      let query = supabase
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
        `);

      // Apply filters
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.manager_id) {
        query = query.eq('manager_id', filters.manager_id);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,job_codes.cs.{${filters.search}}`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return { data: [], error };
      }

      // Transform data and merge metrics
      const processedTemplates = data?.map(template => ({
        ...template,
        usage_count: template.template_metrics?.[0]?.usage_count || 0,
        avg_completion_time_hours: template.template_metrics?.[0]?.avg_completion_time_hours || 0,
        avg_success_rating: template.template_metrics?.[0]?.avg_success_rating || 0,
        completion_rate: template.template_metrics?.[0]?.completion_rate || 0,
        feedback_count: template.template_metrics?.[0]?.feedback_count || 0,
        recommendation_rate: template.template_metrics?.[0]?.recommendation_rate || 0,
      })) || [];

      return { data: processedTemplates, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Get a single template by ID
   */
  static async getTemplate(id: string): Promise<{ data: Template | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          template_metrics (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error };
      }

      // Merge metrics
      const processedTemplate = {
        ...data,
        usage_count: data.template_metrics?.[0]?.usage_count || 0,
        avg_completion_time_hours: data.template_metrics?.[0]?.avg_completion_time_hours || 0,
        avg_success_rating: data.template_metrics?.[0]?.avg_success_rating || 0,
        completion_rate: data.template_metrics?.[0]?.completion_rate || 0,
        feedback_count: data.template_metrics?.[0]?.feedback_count || 0,
        recommendation_rate: data.template_metrics?.[0]?.recommendation_rate || 0,
      };

      return { data: processedTemplate, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new template
   */
  static async createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Template | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .insert([{
          ...template,
          template_version: 1,
          status: template.status || 'draft'
        }])
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Initialize metrics for new template
      await supabase
        .from('template_metrics')
        .insert({
          template_id: data.id,
          usage_count: 0,
          feedback_count: 0
        });

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update an existing template
   */
  static async updateTemplate(
    id: string, 
    updates: Partial<Template>,
    userEmail?: string
  ): Promise<{ data: Template | null; error: any }> {
    try {
      // Check permissions first
      if (userEmail) {
        const hasPermission = await this.checkPermission(id, userEmail, 'edit');
        if (!hasPermission) {
          return { data: null, error: { message: 'Permission denied' } };
        }
      }

      // Increment version if sections changed
      if (updates.sections) {
        const { data: currentTemplate } = await supabase
          .from('templates')
          .select('template_version')
          .eq('id', id)
          .single();

        if (currentTemplate) {
          updates.template_version = currentTemplate.template_version + 1;
        }
      }

      const { data, error } = await supabase
        .from('templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Create version history if sections changed
      if (updates.sections && userEmail) {
        await supabase
          .from('template_versions')
          .insert({
            template_id: id,
            version_number: data.template_version,
            sections: updates.sections,
            change_description: 'Template updated',
            changed_by: userEmail,
            change_type: 'minor'
          });
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Clone a template
   */
  static async cloneTemplate(
    id: string, 
    newName: string,
    userEmail: string,
    options?: {
      department?: string;
      job_codes?: string[];
      is_department_standard?: boolean;
    }
  ): Promise<{ data: Template | null; error: any }> {
    try {
      // Check permission to clone
      const hasPermission = await this.checkPermission(id, userEmail, 'clone');
      if (!hasPermission) {
        return { data: null, error: { message: 'Permission denied' } };
      }

      // Get original template
      const { data: originalTemplate, error: fetchError } = await this.getTemplate(id);
      if (fetchError || !originalTemplate) {
        return { data: null, error: fetchError || { message: 'Template not found' } };
      }

      // Create cloned template
      const clonedTemplate = {
        name: newName,
        job_codes: options?.job_codes || originalTemplate.job_codes,
        sections: originalTemplate.sections,
        department: options?.department || originalTemplate.department,
        is_department_standard: options?.is_department_standard || false,
        status: 'draft' as const,
        parent_template_id: id
      };

      return await this.createTemplate(clonedTemplate);
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(id: string, userEmail?: string): Promise<{ error: any }> {
    try {
      // Check permissions first
      if (userEmail) {
        const hasPermission = await this.checkPermission(id, userEmail, 'delete');
        if (!hasPermission) {
          return { error: { message: 'Permission denied' } };
        }
      }

      // Soft delete by setting status to archived
      const { error } = await supabase
        .from('templates')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Check user permission for template
   */
  static async checkPermission(
    templateId: string, 
    userEmail: string, 
    permissionType: string
  ): Promise<boolean> {
    try {
      // Check direct permissions
      const { data: permissions } = await supabase
        .from('template_permissions')
        .select('*')
        .eq('template_id', templateId)
        .eq('user_email', userEmail)
        .eq('permission_type', permissionType)
        .eq('is_active', true);

      if (permissions && permissions.length > 0) {
        // Check if permission is expired
        const permission = permissions[0];
        if (!permission.expires_at || new Date(permission.expires_at) > new Date()) {
          return true;
        }
      }

      // Check if user is template owner/manager
      const { data: template } = await supabase
        .from('templates')
        .select('manager_id')
        .eq('id', templateId)
        .single();

      // TODO: Match manager_id with user (requires user management system)
      
      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Grant permission to user
   */
  static async grantPermission(
    templateId: string,
    userEmail: string,
    permissionType: string,
    grantedBy: string,
    expiresAt?: string
  ): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('template_permissions')
        .insert({
          template_id: templateId,
          user_email: userEmail,
          permission_type: permissionType,
          granted_by: grantedBy,
          expires_at: expiresAt,
          is_active: true
        });

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get template metrics
   */
  static async getTemplateMetrics(templateId: string): Promise<{ data: TemplateMetrics | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('template_metrics')
        .select('*')
        .eq('template_id', templateId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Calculate and update template metrics
   */
  static async calculateTemplateMetrics(templateId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .rpc('calculate_template_metrics', { template_uuid: templateId });

      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Submit template feedback
   */
  static async submitFeedback(feedback: Omit<TemplateFeedback, 'id' | 'created_at'>): Promise<{ data: TemplateFeedback | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('template_feedback')
        .insert([feedback])
        .select()
        .single();

      if (!error && data) {
        // Recalculate metrics after new feedback
        await this.calculateTemplateMetrics(feedback.template_id);
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get template feedback
   */
  static async getTemplateFeedback(templateId: string): Promise<{ data: TemplateFeedback[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('template_feedback')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Get templates by department with usage stats
   */
  static async getTemplatesByDepartment(): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          department,
          status,
          template_metrics (usage_count, avg_success_rating)
        `)
        .eq('status', 'active');

      if (error) {
        return { data: [], error };
      }

      // Group by department
      const departmentStats: { [key: string]: any } = {};
      
      data?.forEach(template => {
        const dept = template.department;
        if (!departmentStats[dept]) {
          departmentStats[dept] = {
            department: dept,
            total_templates: 0,
            total_usage: 0,
            avg_success_rate: 0,
            templates: []
          };
        }
        
        departmentStats[dept].total_templates++;
        departmentStats[dept].total_usage += template.template_metrics?.[0]?.usage_count || 0;
        departmentStats[dept].templates.push(template);
      });

      // Calculate averages
      Object.values(departmentStats).forEach((dept: any) => {
        const validRatings = dept.templates
          .map((t: any) => t.template_metrics?.[0]?.avg_success_rating)
          .filter((r: number) => r > 0);
        
        dept.avg_success_rate = validRatings.length > 0 
          ? validRatings.reduce((sum: number, r: number) => sum + r, 0) / validRatings.length
          : 0;
      });

      return { data: Object.values(departmentStats), error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Get manager's templates
   */
  static async getManagerTemplates(managerEmail: string): Promise<{ data: Template[]; error: any }> {
    try {
      // Get templates where user has edit permissions or is the manager
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          template_metrics (*),
          template_permissions!inner (*)
        `)
        .or(`template_permissions.user_email.eq.${managerEmail},manager_id.eq.${managerEmail}`)
        .eq('template_permissions.permission_type', 'edit')
        .eq('template_permissions.is_active', true)
        .eq('status', 'active');

      if (error) {
        return { data: [], error };
      }

      // Process templates with metrics
      const processedTemplates = data?.map(template => ({
        ...template,
        usage_count: template.template_metrics?.[0]?.usage_count || 0,
        avg_completion_time_hours: template.template_metrics?.[0]?.avg_completion_time_hours || 0,
        avg_success_rating: template.template_metrics?.[0]?.avg_success_rating || 0,
        completion_rate: template.template_metrics?.[0]?.completion_rate || 0,
        feedback_count: template.template_metrics?.[0]?.feedback_count || 0,
        recommendation_rate: template.template_metrics?.[0]?.recommendation_rate || 0,
      })) || [];

      return { data: processedTemplates, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }

  /**
   * Get template usage analytics
   */
  static async getTemplateAnalytics(templateId?: string): Promise<{ data: any; error: any }> {
    try {
      let query = supabase
        .from('template_usage')
        .select(`
          *,
          templates (name, department),
          handovers (employee_name, status)
        `);

      if (templateId) {
        query = query.eq('template_id', templateId);
      }

      const { data, error } = await query.order('started_at', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      // Calculate analytics
      const analytics = {
        total_usage: data?.length || 0,
        completed_handovers: data?.filter(usage => usage.completed_at).length || 0,
        avg_completion_time: 0,
        success_rate: 0,
        department_breakdown: {} as { [key: string]: number },
        monthly_usage: {} as { [key: string]: number }
      };

      if (data && data.length > 0) {
        // Calculate completion times
        const completedUsages = data.filter(usage => usage.completed_at && usage.started_at);
        if (completedUsages.length > 0) {
          const totalTime = completedUsages.reduce((sum, usage) => {
            const startTime = new Date(usage.started_at).getTime();
            const endTime = new Date(usage.completed_at).getTime();
            return sum + (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
          }, 0);
          analytics.avg_completion_time = totalTime / completedUsages.length;
        }

        // Calculate success rate
        const successfulHandovers = data.filter(usage => 
          usage.handovers?.status === 'approved' || usage.success_score > 4
        );
        analytics.success_rate = successfulHandovers.length / data.length;

        // Department breakdown
        data.forEach(usage => {
          const dept = usage.templates?.department || 'Unknown';
          analytics.department_breakdown[dept] = (analytics.department_breakdown[dept] || 0) + 1;
        });

        // Monthly usage
        data.forEach(usage => {
          const month = new Date(usage.started_at).toISOString().substring(0, 7); // YYYY-MM
          analytics.monthly_usage[month] = (analytics.monthly_usage[month] || 0) + 1;
        });
      }

      return { data: analytics, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Search templates with advanced filters
   */
  static async searchTemplates(query: {
    search?: string;
    departments?: string[];
    job_codes?: string[];
    min_rating?: number;
    is_standard?: boolean;
    created_after?: string;
  }): Promise<{ data: Template[]; error: any }> {
    try {
      let supabaseQuery = supabase
        .from('templates')
        .select(`
          *,
          template_metrics (*)
        `)
        .eq('status', 'active');

      // Apply search filters
      if (query.search) {
        supabaseQuery = supabaseQuery.or(
          `name.ilike.%${query.search}%,job_codes.cs.{${query.search}}`
        );
      }

      if (query.departments && query.departments.length > 0) {
        supabaseQuery = supabaseQuery.in('department', query.departments);
      }

      if (query.is_standard !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_department_standard', query.is_standard);
      }

      if (query.created_after) {
        supabaseQuery = supabaseQuery.gte('created_at', query.created_after);
      }

      const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

      if (error) {
        return { data: [], error };
      }

      // Process and filter by rating
      let processedTemplates = data?.map(template => ({
        ...template,
        usage_count: template.template_metrics?.[0]?.usage_count || 0,
        avg_completion_time_hours: template.template_metrics?.[0]?.avg_completion_time_hours || 0,
        avg_success_rating: template.template_metrics?.[0]?.avg_success_rating || 0,
        completion_rate: template.template_metrics?.[0]?.completion_rate || 0,
        feedback_count: template.template_metrics?.[0]?.feedback_count || 0,
        recommendation_rate: template.template_metrics?.[0]?.recommendation_rate || 0,
      })) || [];

      // Filter by job codes (client-side due to array operations)
      if (query.job_codes && query.job_codes.length > 0) {
        processedTemplates = processedTemplates.filter(template =>
          template.job_codes.some(code => query.job_codes!.includes(code))
        );
      }

      // Filter by minimum rating
      if (query.min_rating) {
        processedTemplates = processedTemplates.filter(template =>
          (template.avg_success_rating || 0) >= query.min_rating!
        );
      }

      return { data: processedTemplates, error: null };
    } catch (error) {
      return { data: [], error };
    }
  }
}

export default TemplateService;