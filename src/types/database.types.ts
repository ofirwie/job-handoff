// Generated TypeScript types for flexible handover system database
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          code: string;
          settings: Json;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          settings?: Json;
          created_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          settings?: Json;
          created_at?: string;
          is_active?: boolean;
        };
      };
      plants: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          code: string;
          country: string;
          location: string | null;
          manager_email: string | null;
          local_regulations: Json;
          cultural_settings: Json;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          code: string;
          country: string;
          location?: string | null;
          manager_email?: string | null;
          local_regulations?: Json;
          cultural_settings?: Json;
          created_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          code?: string;
          country?: string;
          location?: string | null;
          manager_email?: string | null;
          local_regulations?: Json;
          cultural_settings?: Json;
          created_at?: string;
          is_active?: boolean;
        };
      };
      departments: {
        Row: {
          id: string;
          plant_id: string;
          name: string;
          code: string;
          manager_email: string | null;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          plant_id: string;
          name: string;
          code: string;
          manager_email?: string | null;
          created_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          plant_id?: string;
          name?: string;
          code?: string;
          manager_email?: string | null;
          created_at?: string;
          is_active?: boolean;
        };
      };
      jobs: {
        Row: {
          id: string;
          department_id: string;
          title: string;
          level: 'junior' | 'senior' | 'manager' | 'director' | null;
          description: string | null;
          custom_attributes: Json;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          department_id: string;
          title: string;
          level?: 'junior' | 'senior' | 'manager' | 'director' | null;
          description?: string | null;
          custom_attributes?: Json;
          created_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          department_id?: string;
          title?: string;
          level?: 'junior' | 'senior' | 'manager' | 'director' | null;
          description?: string | null;
          custom_attributes?: Json;
          created_at?: string;
          is_active?: boolean;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'hr' | 'manager' | 'employee' | 'admin';
          plant_id: string | null;
          department_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role: 'hr' | 'manager' | 'employee' | 'admin';
          plant_id?: string | null;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'hr' | 'manager' | 'employee' | 'admin';
          plant_id?: string | null;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          is_system_default: boolean;
          is_active: boolean;
          created_by: string | null;
          industry_specific: boolean;
          usage_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          is_system_default?: boolean;
          is_active?: boolean;
          created_by?: string | null;
          industry_specific?: boolean;
          usage_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          is_system_default?: boolean;
          is_active?: boolean;
          created_by?: string | null;
          industry_specific?: boolean;
          usage_count?: number;
          created_at?: string;
        };
      };
      item_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          fields_schema: Json;
          validation_rules: Json;
          ui_component: string;
          is_system_default: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          fields_schema: Json;
          validation_rules?: Json;
          ui_component?: string;
          is_system_default?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          fields_schema?: Json;
          validation_rules?: Json;
          ui_component?: string;
          is_system_default?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
      };
      base_templates: {
        Row: {
          id: string;
          name: string;
          job_title: string | null;
          level: string | null;
          department: string | null;
          industry: string | null;
          template_data: Json;
          confidence_score: number | null;
          source: 'manual' | 'ai_generated' | 'learned';
          usage_count: number;
          success_rate: number | null;
          created_by: string | null;
          approved_by: string | null;
          created_at: string;
          approved_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          job_title?: string | null;
          level?: string | null;
          department?: string | null;
          industry?: string | null;
          template_data: Json;
          confidence_score?: number | null;
          source?: 'manual' | 'ai_generated' | 'learned';
          usage_count?: number;
          success_rate?: number | null;
          created_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
          approved_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          job_title?: string | null;
          level?: string | null;
          department?: string | null;
          industry?: string | null;
          template_data?: Json;
          confidence_score?: number | null;
          source?: 'manual' | 'ai_generated' | 'learned';
          usage_count?: number;
          success_rate?: number | null;
          created_by?: string | null;
          approved_by?: string | null;
          created_at?: string;
          approved_at?: string | null;
          is_active?: boolean;
        };
      };
      adaptation_rules: {
        Row: {
          id: string;
          name: string;
          rule_type: 'plant' | 'culture' | 'regulation' | 'technology' | 'role' | 'industry';
          condition_match: Json;
          adaptation_logic: Json;
          priority: number | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          rule_type: 'plant' | 'culture' | 'regulation' | 'technology' | 'role' | 'industry';
          condition_match: Json;
          adaptation_logic: Json;
          priority?: number | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          rule_type?: 'plant' | 'culture' | 'regulation' | 'technology' | 'role' | 'industry';
          condition_match?: Json;
          adaptation_logic?: Json;
          priority?: number | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          base_template_id: string | null;
          job_id: string;
          name: string;
          description: string | null;
          version: number | null;
          status: 'draft' | 'approved' | 'active' | 'archived';
          confidence_score: number | null;
          generation_strategy: 'use_existing' | 'merge_multiple' | 'generate_new' | null;
          requires_review: boolean | null;
          learning_mode: boolean | null;
          created_by: string | null;
          approved_by: string | null;
          ai_metadata: Json;
          created_at: string;
          approved_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          base_template_id?: string | null;
          job_id: string;
          name: string;
          description?: string | null;
          version?: number | null;
          status?: 'draft' | 'approved' | 'active' | 'archived';
          confidence_score?: number | null;
          generation_strategy?: 'use_existing' | 'merge_multiple' | 'generate_new' | null;
          requires_review?: boolean | null;
          learning_mode?: boolean | null;
          created_by?: string | null;
          approved_by?: string | null;
          ai_metadata?: Json;
          created_at?: string;
          approved_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          base_template_id?: string | null;
          job_id?: string;
          name?: string;
          description?: string | null;
          version?: number | null;
          status?: 'draft' | 'approved' | 'active' | 'archived';
          confidence_score?: number | null;
          generation_strategy?: 'use_existing' | 'merge_multiple' | 'generate_new' | null;
          requires_review?: boolean | null;
          learning_mode?: boolean | null;
          created_by?: string | null;
          approved_by?: string | null;
          ai_metadata?: Json;
          created_at?: string;
          approved_at?: string | null;
          is_active?: boolean;
        };
      };
      template_items: {
        Row: {
          id: string;
          template_id: string;
          category_id: string;
          item_type_id: string | null;
          title: string;
          description: string | null;
          instructions: string | null;
          priority: number | null;
          estimated_minutes: number | null;
          is_mandatory: boolean | null;
          sort_order: number | null;
          item_data: Json;
          generated_by: 'manual' | 'ai_inference' | 'rule_based' | 'learned';
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          category_id: string;
          item_type_id?: string | null;
          title: string;
          description?: string | null;
          instructions?: string | null;
          priority?: number | null;
          estimated_minutes?: number | null;
          is_mandatory?: boolean | null;
          sort_order?: number | null;
          item_data?: Json;
          generated_by?: 'manual' | 'ai_inference' | 'rule_based' | 'learned';
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          category_id?: string;
          item_type_id?: string | null;
          title?: string;
          description?: string | null;
          instructions?: string | null;
          priority?: number | null;
          estimated_minutes?: number | null;
          is_mandatory?: boolean | null;
          sort_order?: number | null;
          item_data?: Json;
          generated_by?: 'manual' | 'ai_inference' | 'rule_based' | 'learned';
          created_at?: string;
        };
      };
      handovers: {
        Row: {
          id: string;
          template_id: string;
          job_id: string;
          leaving_employee_name: string;
          leaving_employee_email: string;
          incoming_employee_name: string | null;
          incoming_employee_email: string | null;
          manager_name: string;
          manager_email: string;
          start_date: string | null;
          due_date: string;
          completed_date: string | null;
          status: 'created' | 'in_progress' | 'completed' | 'cancelled';
          notes: string | null;
          manager_edits: Json;
          learning_feedback: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          job_id: string;
          leaving_employee_name: string;
          leaving_employee_email: string;
          incoming_employee_name?: string | null;
          incoming_employee_email?: string | null;
          manager_name: string;
          manager_email: string;
          start_date?: string | null;
          due_date: string;
          completed_date?: string | null;
          status?: 'created' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string | null;
          manager_edits?: Json;
          learning_feedback?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          job_id?: string;
          leaving_employee_name?: string;
          leaving_employee_email?: string;
          incoming_employee_name?: string | null;
          incoming_employee_email?: string | null;
          manager_name?: string;
          manager_email?: string;
          start_date?: string | null;
          due_date?: string;
          completed_date?: string | null;
          status?: 'created' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string | null;
          manager_edits?: Json;
          learning_feedback?: Json;
          created_by?: string | null;
          created_at?: string;
        };
      };
      handover_progress: {
        Row: {
          id: string;
          handover_id: string;
          template_item_id: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'not_applicable' | 'skipped';
          actual_minutes: number | null;
          difficulty_rating: number | null;
          completion_notes: string | null;
          completed_by: string | null;
          completed_at: string | null;
          evidence_files: Json;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          handover_id: string;
          template_item_id?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'not_applicable' | 'skipped';
          actual_minutes?: number | null;
          difficulty_rating?: number | null;
          completion_notes?: string | null;
          completed_by?: string | null;
          completed_at?: string | null;
          evidence_files?: Json;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          handover_id?: string;
          template_item_id?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'not_applicable' | 'skipped';
          actual_minutes?: number | null;
          difficulty_rating?: number | null;
          completion_notes?: string | null;
          completed_by?: string | null;
          completed_at?: string | null;
          evidence_files?: Json;
          updated_at?: string | null;
        };
      };
      learning_insights: {
        Row: {
          id: string;
          template_id: string | null;
          job_pattern: string | null;
          insight_type: 'commonly_added' | 'commonly_removed' | 'time_estimation' | 'difficulty_pattern';
          insight_data: Json;
          confidence_level: number | null;
          sample_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id?: string | null;
          job_pattern?: string | null;
          insight_type: 'commonly_added' | 'commonly_removed' | 'time_estimation' | 'difficulty_pattern';
          insight_data: Json;
          confidence_level?: number | null;
          sample_size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string | null;
          job_pattern?: string | null;
          insight_type?: 'commonly_added' | 'commonly_removed' | 'time_estimation' | 'difficulty_pattern';
          insight_data?: Json;
          confidence_level?: number | null;
          sample_size?: number | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values: Json | null;
          new_values: Json | null;
          changed_by: string | null;
          changed_at: string | null;
          ip_address: string | null;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values?: Json | null;
          new_values?: Json | null;
          changed_by?: string | null;
          changed_at?: string | null;
          ip_address?: string | null;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: 'INSERT' | 'UPDATE' | 'DELETE';
          old_values?: Json | null;
          new_values?: Json | null;
          changed_by?: string | null;
          changed_at?: string | null;
          ip_address?: string | null;
        };
      };
      user_permissions: {
        Row: {
          id: string;
          user_id: string;
          resource_type: 'organization' | 'plant' | 'department' | 'handover' | 'template';
          resource_id: string;
          permission_level: 'read' | 'write' | 'admin';
          granted_by: string | null;
          granted_at: string | null;
          expires_at: string | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          resource_type: 'organization' | 'plant' | 'department' | 'handover' | 'template';
          resource_id: string;
          permission_level: 'read' | 'write' | 'admin';
          granted_by?: string | null;
          granted_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          resource_type?: 'organization' | 'plant' | 'department' | 'handover' | 'template';
          resource_id?: string;
          permission_level?: 'read' | 'write' | 'admin';
          granted_by?: string | null;
          granted_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];