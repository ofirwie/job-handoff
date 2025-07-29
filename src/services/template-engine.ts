// FlexibleTemplateEngine - Core service for dynamic template generation
import { supabase, handleSupabaseError } from '@/lib/supabase';
import type {
  JobRequest,
  JobContext,
  JobAnalysis,
  GeneratedTemplate,
  DynamicTemplateItem,
  GenerationStrategy,
  GenerationPlan,
  BaseTemplate,
  AdaptationRule,
  Category,
  JobWithContext,
  FlexibilityConfig
} from '@/types/template.types';

export class FlexibleTemplateEngine {
  private config: FlexibilityConfig;

  constructor(config?: Partial<FlexibilityConfig>) {
    this.config = {
      learning_threshold: Number(import.meta.env.VITE_LEARNING_THRESHOLD) || 3,
      confidence_threshold: Number(import.meta.env.VITE_CONFIDENCE_THRESHOLD) || 0.7,
      auto_improvement_enabled: import.meta.env.VITE_AUTO_IMPROVEMENT_ENABLED === 'true',
      max_similarity_distance: 0.3,
      rule_priority_weights: {
        regulation: 10,
        role: 8,
        plant: 7,
        culture: 5,
        technology: 6,
        industry: 7
      },
      ...config
    };
  }

  /**
   * Main method: Generate a complete template for a new job request
   */
  async generateTemplate(request: JobRequest): Promise<GeneratedTemplate> {
    const startTime = Date.now();

    try {
      // Step 1: Analyze the job request
      const analysis = await this.analyzeJobRequest(request);
      
      // Step 2: Get job context
      const context = await this.buildJobContext(request);
      
      // Step 3: Select generation strategy
      const strategy = this.selectGenerationStrategy(analysis, context);
      
      // Step 4: Generate base template using selected strategy
      let template = await this.generateBaseTemplate(strategy, analysis, context);
      
      // Step 5: Apply adaptation rules
      template = await this.applyAdaptationRules(template, context);
      
      // Step 6: Calculate final confidence score
      const confidenceScore = this.calculateConfidence(template, analysis, strategy);
      
      const generationTime = Date.now() - startTime;
      
      return {
        template: {
          ...template,
          confidence_score: confidenceScore,
          requires_review: confidenceScore < this.config.confidence_threshold,
          learning_mode: strategy.strategy === 'generate_new'
        },
        strategy_used: {
          type: strategy.strategy,
          base_templates: strategy.base_templates,
          applied_rules: strategy.adaptation_rules
        },
        metadata: {
          generation_time: generationTime,
          rules_applied: strategy.adaptation_rules.length,
          ai_generated_items: template.items.filter(item => 
            item.generated_by === 'ai_inference'
          ).length
        }
      };
    } catch (error) {
      console.error('Template generation failed:', error);
      throw new Error(`Template generation failed: ${error.message}`);
    }
  }

  /**
   * Step 1: Analyze job request to determine similarity and strategy
   */
  async analyzeJobRequest(request: JobRequest): Promise<JobAnalysis> {
    try {
      // Find similar base templates
      const { data: similarTemplates, error } = await supabase
        .from('base_templates')
        .select('*')
        .eq('is_active', true)
        .order('confidence_score', { ascending: false });

      if (error) handleSupabaseError(error);

      // Calculate similarity scores
      const scoredTemplates = similarTemplates.map(template => ({
        ...template,
        similarity_score: this.calculateSimilarityScore(request, template)
      }));

      // Sort by similarity
      const sortedTemplates = scoredTemplates.sort((a, b) => b.similarity_score - a.similarity_score);
      const bestMatch = sortedTemplates[0];
      const topMatches = sortedTemplates.slice(0, 3);

      // Determine generation strategy
      let strategy: GenerationStrategy;
      let confidence = 0;

      if (bestMatch?.similarity_score > 0.8) {
        strategy = 'use_existing';
        confidence = bestMatch.similarity_score;
      } else if (topMatches.length > 0 && topMatches[0].similarity_score > 0.3) {
        strategy = 'merge_multiple';
        confidence = topMatches.reduce((avg, t) => avg + t.similarity_score, 0) / topMatches.length;
      } else {
        strategy = 'generate_new';
        confidence = 0.3; // Low confidence for completely new roles
      }

      // Get suggested categories
      const suggestedCategories = await this.getSuggestedCategories(request);

      return {
        similarity_score: bestMatch?.similarity_score || 0,
        closest_matches: topMatches,
        suggested_categories: suggestedCategories,
        confidence_assessment: confidence,
        generation_strategy: strategy,
        requires_review: confidence < this.config.confidence_threshold
      };
    } catch (error) {
      console.error('Job analysis failed:', error);
      throw error;
    }
  }

  /**
   * Calculate similarity between job request and existing template
   */
  private calculateSimilarityScore(request: JobRequest, template: BaseTemplate): number {
    let score = 0;
    let factors = 0;

    // Job title similarity (40% weight)
    if (template.job_title) {
      const titleSimilarity = this.calculateTextSimilarity(request.title, template.job_title);
      score += titleSimilarity * 0.4;
      factors += 0.4;
    }

    // Level exact match (30% weight)
    if (template.level && template.level === request.level) {
      score += 0.3;
    }
    factors += 0.3;

    // Department similarity (20% weight)
    if (template.department) {
      // This would need department lookup - simplified for now
      score += 0.1; // Partial credit
    }
    factors += 0.2;

    // Industry match (10% weight)
    if (template.industry === 'wet_wipes_hygiene') {
      score += 0.1;
    }
    factors += 0.1;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Simple text similarity calculation (could be enhanced with NLP)
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  /**
   * Build job context with full relational data
   */
  async buildJobContext(request: JobRequest): Promise<JobContext> {
    try {
      // Get department with plant and organization
      const { data: department, error: deptError } = await supabase
        .from('departments')
        .select(`
          *,
          plant:plants!inner(
            *,
            organization:organizations!inner(*)
          )
        `)
        .eq('id', request.department_id)
        .single();

      if (deptError) handleSupabaseError(deptError);

      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) handleSupabaseError(profileError);

      // Create job context
      const jobContext: JobWithContext = {
        id: '', // Will be set when job is created
        department_id: request.department_id,
        title: request.title,
        level: request.level,
        description: request.description || null,
        custom_attributes: request.custom_fields || {},
        created_at: new Date().toISOString(),
        is_active: true,
        department: department as any
      };

      return {
        job: jobContext,
        user_profile: userProfile
      };
    } catch (error) {
      console.error('Failed to build job context:', error);
      throw error;
    }
  }

  /**
   * Get suggested categories based on job request
   */
  async getSuggestedCategories(request: JobRequest): Promise<Category[]> {
    try {
      // Get all active categories
      const { data: allCategories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);

      if (error) handleSupabaseError(error);

      // Core categories (always included)
      const coreCategories = allCategories.filter(cat => cat.is_system_default);
      
      // Dynamic categories based on context
      const dynamicCategories = allCategories.filter(cat => 
        !cat.is_system_default && this.shouldIncludeCategory(cat, request)
      );

      return [...coreCategories, ...dynamicCategories];
    } catch (error) {
      console.error('Failed to get suggested categories:', error);
      throw error;
    }
  }

  /**
   * Determine if a dynamic category should be included
   */
  private shouldIncludeCategory(category: Category, request: JobRequest): boolean {
    const title = request.title.toLowerCase();
    
    // Category-specific logic
    switch (category.name) {
      case 'regulatory_compliance':
        return request.level === 'director' || title.includes('compliance') || title.includes('quality');
        
      case 'sustainability_environment':
        return title.includes('sustainability') || title.includes('environment') || title.includes('green');
        
      case 'innovation_rd':
        return title.includes('research') || title.includes('development') || title.includes('innovation');
        
      case 'crisis_management':
        return request.level === 'director' || request.level === 'manager';
        
      case 'digital_transformation':
        return title.includes('digital') || title.includes('it') || title.includes('technology');
        
      case 'manufacturing_operations':
        return title.includes('production') || title.includes('manufacturing') || title.includes('operations');
        
      case 'customer_relations':
        return title.includes('sales') || title.includes('marketing') || title.includes('customer');
        
      default:
        return false;
    }
  }

  /**
   * Select generation strategy based on analysis
   */
  selectGenerationStrategy(analysis: JobAnalysis, context: JobContext): GenerationPlan {
    return {
      strategy: analysis.generation_strategy,
      confidence: analysis.confidence_assessment,
      base_templates: analysis.closest_matches,
      adaptation_rules: [], // Will be populated by applyAdaptationRules
      learning_mode: analysis.generation_strategy === 'generate_new',
      review_required: analysis.requires_review,
      estimated_accuracy: this.estimateAccuracy(analysis, context)
    };
  }

  /**
   * Generate base template using selected strategy
   */
  async generateBaseTemplate(
    strategy: GenerationPlan, 
    analysis: JobAnalysis, 
    context: JobContext
  ): Promise<{
    name: string;
    description: string;
    categories: string[];
    items: DynamicTemplateItem[];
  }> {
    const categories = analysis.suggested_categories.map(cat => cat.name);
    
    let items: DynamicTemplateItem[] = [];
    
    switch (strategy.strategy) {
      case 'use_existing':
        items = await this.adaptExistingTemplate(strategy.base_templates[0], context);
        break;
        
      case 'merge_multiple':
        items = await this.mergeMultipleTemplates(strategy.base_templates, context);
        break;
        
      case 'generate_new':
        items = await this.generateFromScratch(categories, context);
        break;
    }

    return {
      name: `${context.job.title} - ${context.job.department.name}`,
      description: `Handover template for ${context.job.title} in ${context.job.department.name}`,
      categories,
      items
    };
  }

  /**
   * Adapt existing template to new context
   */
  private async adaptExistingTemplate(baseTemplate: BaseTemplate, context: JobContext): Promise<DynamicTemplateItem[]> {
    try {
      const templateData = baseTemplate.template_data as any;
      const items: DynamicTemplateItem[] = templateData.items || [];
      
      // Adapt items to new context
      return items.map(item => ({
        ...item,
        generated_by: 'rule_based' as const
      }));
    } catch (error) {
      console.error('Failed to adapt existing template:', error);
      return [];
    }
  }

  /**
   * Merge multiple templates into one
   */
  private async mergeMultipleTemplates(baseTemplates: BaseTemplate[], context: JobContext): Promise<DynamicTemplateItem[]> {
    const allItems: DynamicTemplateItem[] = [];
    const seenTitles = new Set<string>();

    for (const template of baseTemplates) {
      try {
        const templateData = template.template_data as any;
        const items: DynamicTemplateItem[] = templateData.items || [];
        
        // Add unique items (avoid duplicates by title)
        for (const item of items) {
          if (!seenTitles.has(item.title)) {
            seenTitles.add(item.title);
            allItems.push({
              ...item,
              generated_by: 'rule_based' as const
            });
          }
        }
      } catch (error) {
        console.error('Failed to process template in merge:', error);
      }
    }

    return allItems;
  }

  /**
   * Generate template from scratch for completely new roles
   */
  private async generateFromScratch(categories: string[], context: JobContext): Promise<DynamicTemplateItem[]> {
    const items: DynamicTemplateItem[] = [];

    // Generate basic items for each category
    for (const categoryName of categories) {
      const categoryItems = await this.generateItemsForCategory(categoryName, context);
      items.push(...categoryItems);
    }

    return items;
  }

  /**
   * Generate items for a specific category
   */
  private async generateItemsForCategory(categoryName: string, context: JobContext): Promise<DynamicTemplateItem[]> {
    const items: DynamicTemplateItem[] = [];
    
    // Basic items that every category should have
    const basicItem: DynamicTemplateItem = {
      category: categoryName,
      title: `${categoryName.replace(/_/g, ' ')} Handover`,
      description: `Transfer of ${categoryName.replace(/_/g, ' ')} responsibilities`,
      priority: 5,
      estimated_minutes: 30,
      is_mandatory: true,
      generated_by: 'ai_inference'
    };

    items.push(basicItem);

    // Category-specific items
    switch (categoryName) {
      case 'files_and_documents':
        items.push({
          category: categoryName,
          title: 'Personal Work Files',
          description: 'All job-specific documents and files',
          priority: 8,
          estimated_minutes: 60,
          is_mandatory: true,
          generated_by: 'rule_based'
        });
        break;

      case 'contacts_and_relationships':
        items.push({
          category: categoryName,
          title: 'Key Stakeholder Contacts',
          description: 'Important business contacts and relationships',
          priority: 9,
          estimated_minutes: 45,
          is_mandatory: true,
          generated_by: 'rule_based'
        });
        break;

      case 'systems_and_access':
        items.push({
          category: categoryName,
          title: 'System Access Credentials',
          description: 'IT systems and software access',
          priority: 10,
          estimated_minutes: 30,
          is_mandatory: true,
          generated_by: 'rule_based'
        });
        break;
    }

    return items;
  }

  /**
   * Apply adaptation rules based on context
   */
  async applyAdaptationRules(
    template: { name: string; description: string; categories: string[]; items: DynamicTemplateItem[] }, 
    context: JobContext
  ): Promise<{ name: string; description: string; categories: string[]; items: DynamicTemplateItem[] }> {
    try {
      // Get applicable adaptation rules
      const { data: rules, error } = await supabase
        .from('adaptation_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) handleSupabaseError(error);

      let modifiedTemplate = { ...template };

      for (const rule of rules) {
        if (this.ruleMatches(rule, context)) {
          modifiedTemplate = this.applyRule(rule, modifiedTemplate, context);
        }
      }

      return modifiedTemplate;
    } catch (error) {
      console.error('Failed to apply adaptation rules:', error);
      return template;
    }
  }

  /**
   * Check if adaptation rule matches current context
   */
  private ruleMatches(rule: AdaptationRule, context: JobContext): boolean {
    const conditions = rule.condition_match as any;
    
    // Check plant country
    if (conditions.plant_country) {
      const countries = Array.isArray(conditions.plant_country) 
        ? conditions.plant_country 
        : [conditions.plant_country];
      if (!countries.includes(context.job.department.plant.country)) {
        return false;
      }
    }

    // Check job level
    if (conditions.job_level) {
      const levels = Array.isArray(conditions.job_level) 
        ? conditions.job_level 
        : [conditions.job_level];
      if (!levels.includes(context.job.level)) {
        return false;
      }
    }

    // Check department
    if (conditions.department && conditions.department !== context.job.department.name) {
      return false;
    }

    // Check job title contains
    if (conditions.job_title_contains) {
      const patterns = conditions.job_title_contains;
      const titleLower = context.job.title.toLowerCase();
      if (!patterns.some((pattern: string) => titleLower.includes(pattern.toLowerCase()))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply single adaptation rule to template
   */
  private applyRule(
    rule: AdaptationRule, 
    template: { name: string; description: string; categories: string[]; items: DynamicTemplateItem[] }, 
    context: JobContext
  ): { name: string; description: string; categories: string[]; items: DynamicTemplateItem[] } {
    try {
      const actions = rule.adaptation_logic as any;
      let modifiedTemplate = { ...template };

      // Add categories
      if (actions.add_categories) {
        const newCategories = actions.add_categories.filter(
          (cat: string) => !modifiedTemplate.categories.includes(cat)
        );
        modifiedTemplate.categories = [...modifiedTemplate.categories, ...newCategories];
      }

      // Add items
      if (actions.add_items) {
        const newItems = actions.add_items.map((item: any) => ({
          ...item,
          generated_by: 'rule_based' as const
        }));
        modifiedTemplate.items = [...modifiedTemplate.items, ...newItems];
      }

      // Boost priority
      if (actions.boost_priority) {
        const boost = actions.boost_priority;
        modifiedTemplate.items = modifiedTemplate.items.map(item => {
          if (boost.category && item.category === boost.category) {
            return { ...item, priority: Math.min(10, item.priority + boost.increase) };
          }
          return item;
        });
      }

      return modifiedTemplate;
    } catch (error) {
      console.error('Failed to apply rule:', error);
      return template;
    }
  }

  /**
   * Calculate confidence score for generated template
   */
  private calculateConfidence(
    template: { items: DynamicTemplateItem[] }, 
    analysis: JobAnalysis, 
    strategy: GenerationPlan
  ): number {
    let baseConfidence = analysis.confidence_assessment;

    // Adjust based on number of items (more items = lower confidence for new templates)
    if (strategy.strategy === 'generate_new') {
      const itemCount = template.items.length;
      const idealItemCount = 15; // Sweet spot
      const countFactor = Math.max(0.5, 1 - Math.abs(itemCount - idealItemCount) / 20);
      baseConfidence *= countFactor;
    }

    // Boost confidence if rules were applied
    if (strategy.adaptation_rules && strategy.adaptation_rules.length > 0) {
      baseConfidence = Math.min(1.0, baseConfidence + 0.1);
    }

    return Math.round(baseConfidence * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Estimate accuracy of generated template
   */
  private estimateAccuracy(analysis: JobAnalysis, context: JobContext): number {
    let accuracy = analysis.confidence_assessment;

    // Boost accuracy for roles in familiar departments
    const commonDepartments = ['Production', 'Quality Assurance', 'Engineering'];
    if (commonDepartments.includes(context.job.department.name)) {
      accuracy += 0.1;
    }

    // Boost accuracy for standard job levels
    if (['manager', 'senior'].includes(context.job.level || '')) {
      accuracy += 0.05;
    }

    return Math.min(1.0, accuracy);
  }
}

// Export singleton instance
export const templateEngine = new FlexibleTemplateEngine();