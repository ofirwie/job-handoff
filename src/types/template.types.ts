// Core types for the flexible template system
import { Database } from './database.types';

// Database table types
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Plant = Database['public']['Tables']['plants']['Row'];
export type Department = Database['public']['Tables']['departments']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type ItemType = Database['public']['Tables']['item_types']['Row'];
export type BaseTemplate = Database['public']['Tables']['base_templates']['Row'];
export type AdaptationRule = Database['public']['Tables']['adaptation_rules']['Row'];
export type Template = Database['public']['Tables']['templates']['Row'];
export type TemplateItem = Database['public']['Tables']['template_items']['Row'];
export type Handover = Database['public']['Tables']['handovers']['Row'];
export type HandoverProgress = Database['public']['Tables']['handover_progress']['Row'];
export type LearningInsight = Database['public']['Tables']['learning_insights']['Row'];

// Extended types with relationships
export interface JobWithContext extends Job {
  department: Department & {
    plant: Plant & {
      organization: Organization;
    };
  };
}

export interface TemplateWithItems extends Template {
  items: (TemplateItem & {
    category: Category;
    item_type?: ItemType;
  })[];
  job: JobWithContext;
}

export interface HandoverWithDetails extends Handover {
  template: TemplateWithItems;
  progress: (HandoverProgress & {
    template_item?: TemplateItem & {
      category: Category;
    };
  })[];
}

// Flexible template generation types
export interface JobRequest {
  title: string;
  level: 'junior' | 'senior' | 'manager' | 'director';
  department_id: string;
  description?: string;
  custom_fields?: Record<string, any>;
}

export interface JobContext {
  job: JobWithContext;
  user_profile: UserProfile;
  similar_jobs?: JobWithContext[];
}

export interface JobAnalysis {
  similarity_score: number;
  closest_matches: BaseTemplate[];
  suggested_categories: Category[];
  confidence_assessment: number;
  generation_strategy: 'use_existing' | 'merge_multiple' | 'generate_new';
  requires_review: boolean;
}

export interface DynamicTemplateItem {
  category: string;
  title: string;
  description: string;
  instructions?: string;
  priority: number;
  estimated_minutes: number;
  is_mandatory: boolean;
  item_data?: Record<string, any>;
  generated_by: 'manual' | 'ai_inference' | 'rule_based' | 'learned';
}

export interface GeneratedTemplate {
  template: {
    name: string;
    description: string;
    categories: string[];
    items: DynamicTemplateItem[];
    confidence_score: number;
    requires_review: boolean;
    learning_mode: boolean;
  };
  strategy_used: {
    type: 'use_existing' | 'merge_multiple' | 'generate_new';
    base_templates?: BaseTemplate[];
    applied_rules: AdaptationRule[];
  };
  metadata: {
    generation_time: number;
    rules_applied: number;
    ai_generated_items: number;
  };
}

// Adaptation rule types
export interface RuleCondition {
  plant_country?: string | string[];
  job_level?: string | string[];
  department?: string | string[];
  job_title_contains?: string[];
  custom_condition?: Record<string, any>;
}

export interface RuleAction {
  add_categories?: string[];
  add_items?: DynamicTemplateItem[];
  modify_items?: {
    condition: Record<string, any>;
    changes: Partial<DynamicTemplateItem>;
  }[];
  boost_priority?: {
    category?: string;
    item_pattern?: string;
    increase: number;
  };
  set_mandatory?: {
    category?: string;
    item_pattern?: string;
    mandatory: boolean;
  };
}

// Learning system types
export interface LearningFeedback {
  handover_id: string;
  template_id: string;
  manager_additions: DynamicTemplateItem[];
  manager_removals: string[]; // item IDs
  time_discrepancies: {
    item_id: string;
    estimated_minutes: number;
    actual_minutes: number;
  }[];
  difficulty_ratings: {
    item_id: string;
    rating: number; // 1-5
    notes?: string;
  }[];
  overall_satisfaction: number; // 1-5
  suggestions?: string;
}

export interface LearningPattern {
  pattern_type: 'commonly_added' | 'commonly_removed' | 'time_estimation' | 'difficulty_pattern';
  job_pattern: string; // e.g., "Senior Developer in Engineering"
  data: {
    frequency: number;
    confidence: number;
    sample_size: number;
    pattern_details: Record<string, any>;
  };
  suggested_action: {
    type: 'add_to_template' | 'remove_from_template' | 'adjust_priority' | 'adjust_time';
    details: Record<string, any>;
  };
}

// Category management types  
export interface CategoryDefinition {
  name: string;
  display_name: string;
  description: string;
  applicability_rules: {
    job_levels?: string[];
    departments?: string[];
    always_include?: boolean;
    conditional_logic?: Record<string, any>;
  };
  default_items?: DynamicTemplateItem[];
}

// Item type management types
export interface ItemTypeDefinition {
  name: string;
  description: string;
  fields_schema: {
    required_fields: string[];
    optional_fields: string[];
    field_types: Record<string, 'text' | 'textarea' | 'select' | 'number' | 'date' | 'boolean'>;
    field_options?: Record<string, string[]>; // for select fields
  };
  validation_rules: {
    min_length?: Record<string, number>;
    max_length?: Record<string, number>;
    required_patterns?: Record<string, string>; // regex patterns
  };
  ui_component: string;
}

// Generation strategy types
export type GenerationStrategy = 'use_existing' | 'merge_multiple' | 'generate_new';

export interface GenerationPlan {
  strategy: GenerationStrategy;
  confidence: number;
  base_templates: BaseTemplate[];
  adaptation_rules: AdaptationRule[];
  learning_mode: boolean;
  review_required: boolean;
  estimated_accuracy: number;
}

// Export configuration types
export interface FlexibilityConfig {
  learning_threshold: number; // Minimum handovers before template improvement
  confidence_threshold: number; // Minimum confidence for auto-approval
  auto_improvement_enabled: boolean;
  max_similarity_distance: number; // For finding similar templates
  rule_priority_weights: Record<string, number>;
}