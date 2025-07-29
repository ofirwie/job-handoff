// Category Management Service - Handles dynamic categories and item types
import { supabase, handleSupabaseError } from '@/lib/supabase';
import type {
  Category,
  ItemType,
  CategoryDefinition,
  ItemTypeDefinition,
  JobContext
} from '@/types/template.types';

export class CategoryManagementService {
  /**
   * Get all active categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('is_system_default', { ascending: false })
        .order('usage_count', { ascending: false });

      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      console.error('Failed to get categories:', error);
      throw error;
    }
  }

  /**
   * Get core system categories (always included)
   */
  async getCoreCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_system_default', true)
        .eq('is_active', true)
        .order('name');

      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      console.error('Failed to get core categories:', error);
      throw error;
    }
  }

  /**
   * Get dynamic categories (context-dependent)
   */
  async getDynamicCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_system_default', false)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      console.error('Failed to get dynamic categories:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(definition: CategoryDefinition): Promise<Category> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: definition.name,
          display_name: definition.display_name,
          description: definition.description,
          is_system_default: false,
          is_active: true,
          created_by: user.id,
          industry_specific: definition.applicability_rules?.always_include ? false : true,
          usage_count: 0
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }

  /**
   * Update an existing category
   */
  async updateCategory(
    categoryId: string,
    updates: Partial<{
      display_name: string;
      description: string;
      is_active: boolean;
    }>
  ): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }

  /**
   * Delete a category (only custom categories)
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // First check if it's a system default category
      const { data: category, error: checkError } = await supabase
        .from('categories')
        .select('is_system_default')
        .eq('id', categoryId)
        .single();

      if (checkError) handleSupabaseError(checkError);

      if (category?.is_system_default) {
        throw new Error('Cannot delete system default categories');
      }

      // Check if category is being used in any templates
      const { data: usage, error: usageError } = await supabase
        .from('template_items')
        .select('id')
        .eq('category_id', categoryId)
        .limit(1);

      if (usageError) handleSupabaseError(usageError);

      if (usage && usage.length > 0) {
        throw new Error('Cannot delete category that is being used in templates');
      }

      // Safe to delete
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) handleSupabaseError(error);
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }

  /**
   * Increment usage count for a category
   */
  async incrementCategoryUsage(categoryId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_category_usage', {
        category_id: categoryId
      });

      if (error) {
        // Fallback to manual increment if RPC function doesn't exist
        const { data: category, error: getError } = await supabase
          .from('categories')
          .select('usage_count')
          .eq('id', categoryId)
          .single();

        if (getError) handleSupabaseError(getError);

        const { error: updateError } = await supabase
          .from('categories')
          .update({ usage_count: (category?.usage_count || 0) + 1 })
          .eq('id', categoryId);

        if (updateError) handleSupabaseError(updateError);
      }
    } catch (error) {
      console.error('Failed to increment category usage:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Get applicable categories for a specific job context
   */
  async getApplicableCategories(context: JobContext): Promise<Category[]> {
    try {
      const allCategories = await this.getCategories();
      const coreCategories = allCategories.filter(cat => cat.is_system_default);
      const dynamicCategories = allCategories.filter(cat => !cat.is_system_default);

      // Core categories are always included
      const applicableCategories = [...coreCategories];

      // Apply logic for dynamic categories
      for (const category of dynamicCategories) {
        if (this.shouldIncludeCategory(category, context)) {
          applicableCategories.push(category);
        }
      }

      return applicableCategories;
    } catch (error) {
      console.error('Failed to get applicable categories:', error);
      throw error;
    }
  }

  /**
   * Determine if a dynamic category should be included for a job context
   */
  private shouldIncludeCategory(category: Category, context: JobContext): boolean {
    const title = context.job.title.toLowerCase();
    const level = context.job.level;
    const department = context.job.department.name;
    const country = context.job.department.plant.country;

    switch (category.name) {
      case 'regulatory_compliance':
        return (
          level === 'director' ||
          title.includes('compliance') ||
          title.includes('quality') ||
          title.includes('regulatory') ||
          department === 'Quality Assurance'
        );

      case 'sustainability_environment':
        return (
          title.includes('sustainability') ||
          title.includes('environment') ||
          title.includes('green') ||
          title.includes('eco') ||
          department === 'Environmental & Safety'
        );

      case 'innovation_rd':
        return (
          title.includes('research') ||
          title.includes('development') ||
          title.includes('innovation') ||
          title.includes('r&d') ||
          department === 'Research & Development'
        );

      case 'crisis_management':
        return (
          level === 'director' ||
          (level === 'manager' && title.includes('senior'))
        );

      case 'cultural_adaptation':
        return country !== 'Israel'; // International plants need cultural adaptation

      case 'digital_transformation':
        return (
          title.includes('digital') ||
          title.includes('it') ||
          title.includes('technology') ||
          title.includes('systems') ||
          title.includes('data')
        );

      case 'manufacturing_operations':
        return (
          title.includes('production') ||
          title.includes('manufacturing') ||
          title.includes('operations') ||
          department === 'Production' ||
          department === 'Engineering'
        );

      case 'customer_relations':
        return (
          title.includes('sales') ||
          title.includes('marketing') ||
          title.includes('customer') ||
          title.includes('account') ||
          department === 'Sales & Marketing'
        );

      default:
        return false;
    }
  }

  /**
   * Get category statistics
   */
  async getCategoryStatistics(): Promise<{
    total_categories: number;
    core_categories: number;
    dynamic_categories: number;
    most_used: Array<{
      id: string;
      name: string;
      display_name: string;
      usage_count: number;
    }>;
  }> {
    try {
      const categories = await this.getCategories();
      const coreCount = categories.filter(cat => cat.is_system_default).length;
      const dynamicCount = categories.filter(cat => !cat.is_system_default).length;

      const mostUsed = categories
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 5)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          display_name: cat.display_name,
          usage_count: cat.usage_count
        }));

      return {
        total_categories: categories.length,
        core_categories: coreCount,
        dynamic_categories: dynamicCount,
        most_used: mostUsed
      };
    } catch (error) {
      console.error('Failed to get category statistics:', error);
      throw error;
    }
  }
}

export class ItemTypeManagementService {
  /**
   * Get all active item types
   */
  async getItemTypes(): Promise<ItemType[]> {
    try {
      const { data, error } = await supabase
        .from('item_types')
        .select('*')
        .order('is_system_default', { ascending: false })
        .order('name');

      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      console.error('Failed to get item types:', error);
      throw error;
    }
  }

  /**
   * Get system default item types
   */
  async getSystemItemTypes(): Promise<ItemType[]> {
    try {
      const { data, error } = await supabase
        .from('item_types')
        .select('*')
        .eq('is_system_default', true)
        .order('name');

      if (error) handleSupabaseError(error);
      return data || [];
    } catch (error) {
      console.error('Failed to get system item types:', error);
      throw error;
    }
  }

  /**
   * Create a new item type
   */
  async createItemType(definition: ItemTypeDefinition): Promise<ItemType> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('item_types')
        .insert({
          name: definition.name,
          description: definition.description,
          fields_schema: definition.fields_schema,
          validation_rules: definition.validation_rules,
          ui_component: definition.ui_component,
          is_system_default: false,
          created_by: user.id
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      console.error('Failed to create item type:', error);
      throw error;
    }
  }

  /**
   * Update an existing item type
   */
  async updateItemType(
    itemTypeId: string,
    updates: Partial<{
      description: string;
      fields_schema: any;
      validation_rules: any;
      ui_component: string;
    }>
  ): Promise<ItemType> {
    try {
      const { data, error } = await supabase
        .from('item_types')
        .update(updates)
        .eq('id', itemTypeId)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return data;
    } catch (error) {
      console.error('Failed to update item type:', error);
      throw error;
    }
  }

  /**
   * Delete an item type (only custom types)
   */
  async deleteItemType(itemTypeId: string): Promise<void> {
    try {
      // Check if it's a system default
      const { data: itemType, error: checkError } = await supabase
        .from('item_types')
        .select('is_system_default')
        .eq('id', itemTypeId)
        .single();

      if (checkError) handleSupabaseError(checkError);

      if (itemType?.is_system_default) {
        throw new Error('Cannot delete system default item types');
      }

      // Check usage
      const { data: usage, error: usageError } = await supabase
        .from('template_items')
        .select('id')
        .eq('item_type_id', itemTypeId)
        .limit(1);

      if (usageError) handleSupabaseError(usageError);

      if (usage && usage.length > 0) {
        throw new Error('Cannot delete item type that is being used');
      }

      // Delete
      const { error } = await supabase
        .from('item_types')
        .delete()
        .eq('id', itemTypeId);

      if (error) handleSupabaseError(error);
    } catch (error) {
      console.error('Failed to delete item type:', error);
      throw error;
    }
  }

  /**
   * Get the appropriate item type for a category
   */
  async getItemTypeForCategory(categoryName: string): Promise<ItemType | null> {
    try {
      // Mapping logic based on category
      let itemTypeName: string;

      switch (categoryName) {
        case 'files_and_documents':
          itemTypeName = 'document_transfer';
          break;
        case 'contacts_and_relationships':
          itemTypeName = 'contact_handover';
          break;
        case 'systems_and_access':
          itemTypeName = 'system_access';
          break;
        case 'processes_and_procedures':
        case 'knowledge_and_insights':
          itemTypeName = 'process_knowledge';
          break;
        default:
          itemTypeName = 'document_transfer'; // Default fallback
      }

      const { data, error } = await supabase
        .from('item_types')
        .select('*')
        .eq('name', itemTypeName)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        handleSupabaseError(error);
      }

      return data || null;
    } catch (error) {
      console.error('Failed to get item type for category:', error);
      return null;
    }
  }

  /**
   * Validate item data against item type schema
   */
  validateItemData(itemType: ItemType, itemData: Record<string, any>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const schema = itemType.fields_schema as any;
    const validation = itemType.validation_rules as any;

    try {
      // Check required fields
      if (schema.required_fields) {
        for (const field of schema.required_fields) {
          if (!itemData[field] || itemData[field] === '') {
            errors.push(`Required field '${field}' is missing`);
          }
        }
      }

      // Check field types
      if (schema.field_types) {
        for (const [field, expectedType] of Object.entries(schema.field_types)) {
          if (itemData[field] !== undefined) {
            const value = itemData[field];
            if (!this.validateFieldType(value, expectedType as string)) {
              errors.push(`Field '${field}' has invalid type. Expected ${expectedType}`);
            }
          }
        }
      }

      // Check validation rules
      if (validation.min_length) {
        for (const [field, minLength] of Object.entries(validation.min_length)) {
          if (itemData[field] && itemData[field].length < (minLength as number)) {
            errors.push(`Field '${field}' is too short. Minimum length: ${minLength}`);
          }
        }
      }

      if (validation.max_length) {
        for (const [field, maxLength] of Object.entries(validation.max_length)) {
          if (itemData[field] && itemData[field].length > (maxLength as number)) {
            errors.push(`Field '${field}' is too long. Maximum length: ${maxLength}`);
          }
        }
      }

      if (validation.required_patterns) {
        for (const [field, pattern] of Object.entries(validation.required_patterns)) {
          if (itemData[field]) {
            const regex = new RegExp(pattern as string);
            if (!regex.test(itemData[field])) {
              errors.push(`Field '${field}' does not match required pattern`);
            }
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        errors: ['Validation failed due to internal error']
      };
    }
  }

  /**
   * Validate field type
   */
  private validateFieldType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'text':
      case 'textarea':
      case 'select':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'date':
        return !isNaN(Date.parse(value));
      case 'boolean':
        return typeof value === 'boolean';
      default:
        return true; // Unknown type, allow it
    }
  }
}

// Export singleton instances
export const categoryManagement = new CategoryManagementService();
export const itemTypeManagement = new ItemTypeManagementService();