// Adaptation Rules Service - Manages dynamic rule system for template customization
import { supabase, handleSupabaseError } from '@/lib/supabase';
import type {
  AdaptationRule,
  JobContext,
  DynamicTemplateItem,
  RuleCondition,
  RuleAction
} from '@/types/template.types';

export class AdaptationRulesService {
  /**
   * Get all active adaptation rules, ordered by priority
   */
  async getActiveRules(): Promise<AdaptationRule[]> {
    try {
      const { data, error } = await supabase
        .from('adaptation_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      console.error('Failed to get adaptation rules:', error);
      throw error;
    }
  }

  /**
   * Get rules that match a specific context
   */
  async getMatchingRules(context: JobContext): Promise<AdaptationRule[]> {
    const allRules = await this.getActiveRules();
    return allRules.filter(rule => this.evaluateRuleCondition(rule, context));
  }

  /**
   * Create a new adaptation rule
   */
  async createRule(
    name: string,
    ruleType: AdaptationRule['rule_type'],
    conditions: RuleCondition,
    actions: RuleAction,
    priority: number = 5
  ): Promise<AdaptationRule> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('adaptation_rules')
        .insert({
          name,
          rule_type: ruleType,
          condition_match: conditions,
          adaptation_logic: actions,
          priority,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      console.error('Failed to create adaptation rule:', error);
      throw error;
    }
  }

  /**
   * Update an existing adaptation rule
   */
  async updateRule(
    ruleId: string,
    updates: Partial<{
      name: string;
      condition_match: RuleCondition;
      adaptation_logic: RuleAction;
      priority: number;
      is_active: boolean;
    }>
  ): Promise<AdaptationRule> {
    try {
      const { data, error } = await supabase
        .from('adaptation_rules')
        .update(updates)
        .eq('id', ruleId)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      console.error('Failed to update adaptation rule:', error);
      throw error;
    }
  }

  /**
   * Delete an adaptation rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('adaptation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) handleSupabaseError(error);
    } catch (error) {
      console.error('Failed to delete adaptation rule:', error);
      throw error;
    }
  }

  /**
   * Test a rule against multiple contexts to see its impact
   */
  async testRule(rule: AdaptationRule, testContexts: JobContext[]): Promise<{
    context: JobContext;
    matches: boolean;
    impact: {
      categories_added: string[];
      items_added: number;
      items_modified: number;
    };
  }[]> {
    const results = [];

    for (const context of testContexts) {
      const matches = this.evaluateRuleCondition(rule, context);
      let impact = {
        categories_added: [],
        items_added: 0,
        items_modified: 0
      };

      if (matches) {
        const actions = rule.adaptation_logic as RuleAction;
        
        if (actions.add_categories) {
          impact.categories_added = actions.add_categories;
        }
        
        if (actions.add_items) {
          impact.items_added = actions.add_items.length;
        }
        
        if (actions.modify_items) {
          impact.items_modified = actions.modify_items.length;
        }
      }

      results.push({ context, matches, impact });
    }

    return results;
  }

  /**
   * Evaluate if a rule condition matches a job context
   */
  private evaluateRuleCondition(rule: AdaptationRule, context: JobContext): boolean {
    try {
      const conditions = rule.condition_match as RuleCondition;

      // Check plant country condition
      if (conditions.plant_country) {
        const countries = Array.isArray(conditions.plant_country) 
          ? conditions.plant_country 
          : [conditions.plant_country];
        
        if (!countries.includes(context.job.department.plant.country)) {
          return false;
        }
      }

      // Check job level condition
      if (conditions.job_level) {
        const levels = Array.isArray(conditions.job_level) 
          ? conditions.job_level 
          : [conditions.job_level];
        
        if (context.job.level && !levels.includes(context.job.level)) {
          return false;
        }
      }

      // Check department condition
      if (conditions.department) {
        const departments = Array.isArray(conditions.department) 
          ? conditions.department 
          : [conditions.department];
        
        if (!departments.includes(context.job.department.name)) {
          return false;
        }
      }

      // Check job title contains condition
      if (conditions.job_title_contains) {
        const patterns = conditions.job_title_contains;
        const titleLower = context.job.title.toLowerCase();
        
        const hasMatchingPattern = patterns.some(pattern => 
          titleLower.includes(pattern.toLowerCase())
        );
        
        if (!hasMatchingPattern) {
          return false;
        }
      }

      // Check custom conditions (flexible JSON matching)
      if (conditions.custom_condition) {
        if (!this.evaluateCustomCondition(conditions.custom_condition, context)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error evaluating rule condition:', error);
      return false;
    }
  }

  /**
   * Evaluate custom conditions (extensible for future needs)
   */
  private evaluateCustomCondition(customCondition: Record<string, any>, context: JobContext): boolean {
    try {
      // Example custom conditions that could be extended:
      
      // Check if job has specific custom attributes
      if (customCondition.has_custom_attribute) {
        const attributeKey = customCondition.has_custom_attribute;
        const customAttrs = context.job.custom_attributes as Record<string, any> || {};
        return attributeKey in customAttrs;
      }

      // Check user role
      if (customCondition.user_role) {
        return context.user_profile.role === customCondition.user_role;
      }

      // Check plant code
      if (customCondition.plant_code) {
        return context.job.department.plant.code === customCondition.plant_code;
      }

      // Check organization settings
      if (customCondition.organization_setting) {
        const settingKey = customCondition.organization_setting.key;
        const expectedValue = customCondition.organization_setting.value;
        const orgSettings = context.job.department.plant.organization.settings as Record<string, any> || {};
        return orgSettings[settingKey] === expectedValue;
      }

      // More custom conditions can be added here as needed
      
      return true; // Default to true if no custom conditions match
    } catch (error) {
      console.error('Error evaluating custom condition:', error);
      return false;
    }
  }

  /**
   * Apply a single rule's actions to a template
   */
  applyRuleToTemplate(
    rule: AdaptationRule,
    template: {
      categories: string[];
      items: DynamicTemplateItem[];
    },
    context: JobContext
  ): {
    categories: string[];
    items: DynamicTemplateItem[];
    changes_applied: string[];
  } {
    try {
      const actions = rule.adaptation_logic as RuleAction;
      const changes: string[] = [];
      let modifiedTemplate = {
        categories: [...template.categories],
        items: [...template.items]
      };

      // Add categories
      if (actions.add_categories) {
        const newCategories = actions.add_categories.filter(
          category => !modifiedTemplate.categories.includes(category)
        );
        
        if (newCategories.length > 0) {
          modifiedTemplate.categories.push(...newCategories);
          changes.push(`Added categories: ${newCategories.join(', ')}`);
        }
      }

      // Add items
      if (actions.add_items) {
        const newItems = actions.add_items.map(item => ({
          ...item,
          generated_by: 'rule_based' as const
        }));
        
        modifiedTemplate.items.push(...newItems);
        changes.push(`Added ${newItems.length} items`);
      }

      // Modify existing items
      if (actions.modify_items) {
        for (const modification of actions.modify_items) {
          const matchingItems = modifiedTemplate.items.filter(item =>
            this.itemMatchesCondition(item, modification.condition)
          );

          for (const item of matchingItems) {
            Object.assign(item, modification.changes);
          }

          if (matchingItems.length > 0) {
            changes.push(`Modified ${matchingItems.length} items`);
          }
        }
      }

      // Boost priority
      if (actions.boost_priority) {
        const boost = actions.boost_priority;
        let modifiedCount = 0;

        modifiedTemplate.items = modifiedTemplate.items.map(item => {
          let shouldBoost = false;

          if (boost.category && item.category === boost.category) {
            shouldBoost = true;
          }

          if (boost.item_pattern && item.title.toLowerCase().includes(boost.item_pattern.toLowerCase())) {
            shouldBoost = true;
          }

          if (shouldBoost) {
            modifiedCount++;
            return {
              ...item,
              priority: Math.min(10, Math.max(1, item.priority + boost.increase))
            };
          }

          return item;
        });

        if (modifiedCount > 0) {
          changes.push(`Boosted priority for ${modifiedCount} items by ${boost.increase}`);
        }
      }

      // Set mandatory status
      if (actions.set_mandatory) {
        const mandatory = actions.set_mandatory;
        let modifiedCount = 0;

        modifiedTemplate.items = modifiedTemplate.items.map(item => {
          let shouldModify = false;

          if (mandatory.category && item.category === mandatory.category) {
            shouldModify = true;
          }

          if (mandatory.item_pattern && item.title.toLowerCase().includes(mandatory.item_pattern.toLowerCase())) {
            shouldModify = true;
          }

          if (shouldModify) {
            modifiedCount++;
            return { ...item, is_mandatory: mandatory.mandatory };
          }

          return item;
        });

        if (modifiedCount > 0) {
          changes.push(`Set mandatory=${mandatory.mandatory} for ${modifiedCount} items`);
        }
      }

      return {
        ...modifiedTemplate,
        changes_applied: changes
      };
    } catch (error) {
      console.error('Error applying rule to template:', error);
      return {
        ...template,
        changes_applied: [`Error applying rule: ${error.message}`]
      };
    }
  }

  /**
   * Check if an item matches a condition for modification
   */
  private itemMatchesCondition(item: DynamicTemplateItem, condition: Record<string, any>): boolean {
    try {
      // Check category match
      if (condition.category && item.category !== condition.category) {
        return false;
      }

      // Check title contains
      if (condition.title_contains && !item.title.toLowerCase().includes(condition.title_contains.toLowerCase())) {
        return false;
      }

      // Check priority range
      if (condition.priority_min && item.priority < condition.priority_min) {
        return false;
      }

      if (condition.priority_max && item.priority > condition.priority_max) {
        return false;
      }

      // Check generated_by
      if (condition.generated_by && item.generated_by !== condition.generated_by) {
        return false;
      }

      // Check mandatory status
      if (condition.is_mandatory !== undefined && item.is_mandatory !== condition.is_mandatory) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error matching item condition:', error);
      return false;
    }
  }

  /**
   * Get rule usage statistics
   */
  async getRuleStatistics(): Promise<{
    total_rules: number;
    active_rules: number;
    rules_by_type: Record<string, number>;
    most_used_rules: Array<{
      id: string;
      name: string;
      usage_count: number;
    }>;
  }> {
    try {
      const { data: allRules, error: allError } = await supabase
        .from('adaptation_rules')
        .select('*');

      if (allError) handleSupabaseError(allError);

      const activeRules = allRules?.filter(rule => rule.is_active) || [];
      
      const rulesByType = allRules?.reduce((acc, rule) => {
        acc[rule.rule_type] = (acc[rule.rule_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Note: Usage count would need to be tracked separately in the database
      // This is a placeholder implementation
      const mostUsedRules = activeRules
        .map(rule => ({
          id: rule.id,
          name: rule.name,
          usage_count: 0 // Would need actual tracking
        }))
        .slice(0, 5);

      return {
        total_rules: allRules?.length || 0,
        active_rules: activeRules.length,
        rules_by_type: rulesByType,
        most_used_rules: mostUsedRules
      };
    } catch (error) {
      console.error('Failed to get rule statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adaptationRulesService = new AdaptationRulesService();