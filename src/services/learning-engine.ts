// Learning Engine - Analyzes handover feedback to improve templates
import { supabase, handleSupabaseError } from '@/lib/supabase';
import type {
  LearningFeedback,
  LearningPattern,
  LearningInsight,
  BaseTemplate,
  HandoverWithDetails,
  DynamicTemplateItem
} from '@/types/template.types';

export class LearningEngine {
  private readonly learningThreshold: number;
  private readonly confidenceThreshold: number;
  private readonly autoImprovementEnabled: boolean;

  constructor() {
    this.learningThreshold = Number(import.meta.env.VITE_LEARNING_THRESHOLD) || 3;
    this.confidenceThreshold = Number(import.meta.env.VITE_CONFIDENCE_THRESHOLD) || 0.7;
    this.autoImprovementEnabled = import.meta.env.VITE_AUTO_IMPROVEMENT_ENABLED === 'true';
  }

  /**
   * Analyze a completed handover and extract learning insights
   */
  async analyzeCompletedHandover(handover: HandoverWithDetails): Promise<LearningFeedback> {
    try {
      // Extract manager edits from handover data
      const managerEdits = handover.manager_edits as any || {};
      
      // Analyze what was added by managers
      const managerAdditions = this.extractManagerAdditions(managerEdits);
      
      // Analyze what was removed or skipped
      const managerRemovals = this.extractManagerRemovals(handover.progress, managerEdits);
      
      // Analyze time discrepancies
      const timeDiscrepancies = this.analyzeTimeDiscrepancies(handover.progress);
      
      // Analyze difficulty ratings
      const difficultyRatings = this.analyzeDifficultyRatings(handover.progress);
      
      // Extract overall satisfaction from learning feedback
      const learningData = handover.learning_feedback as any || {};
      const overallSatisfaction = learningData.overall_satisfaction || 3;

      const feedback: LearningFeedback = {
        handover_id: handover.id,
        template_id: handover.template_id,
        manager_additions: managerAdditions,
        manager_removals: managerRemovals,
        time_discrepancies: timeDiscrepancies,
        difficulty_ratings: difficultyRatings,
        overall_satisfaction: overallSatisfaction,
        suggestions: learningData.suggestions
      };

      // Store insights in database
      await this.storeLearningInsights(feedback);

      return feedback;
    } catch (error) {
      console.error('Failed to analyze completed handover:', error);
      throw error;
    }
  }

  /**
   * Extract items that managers added to the handover
   */
  private extractManagerAdditions(managerEdits: any): DynamicTemplateItem[] {
    try {
      if (!managerEdits.additions) return [];

      return managerEdits.additions.map((addition: any) => ({
        category: addition.category || 'knowledge_and_insights',
        title: addition.title,
        description: addition.description || '',
        instructions: addition.instructions,
        priority: addition.priority || 5,
        estimated_minutes: addition.estimated_minutes || 30,
        is_mandatory: addition.is_mandatory || false,
        generated_by: 'learned' as const,
        item_data: addition.item_data || {}
      }));
    } catch (error) {
      console.error('Error extracting manager additions:', error);
      return [];
    }
  }

  /**
   * Extract items that managers removed or marked as not applicable
   */
  private extractManagerRemovals(progress: any[], managerEdits: any): string[] {
    try {
      const removals: string[] = [];

      // Items explicitly removed by manager
      if (managerEdits.removals) {
        removals.push(...managerEdits.removals);
      }

      // Items marked as not applicable or skipped
      const skippedItems = progress
        .filter(p => p.status === 'not_applicable' || p.status === 'skipped')
        .map(p => p.template_item_id)
        .filter(id => id !== null);

      removals.push(...skippedItems);

      return [...new Set(removals)]; // Remove duplicates
    } catch (error) {
      console.error('Error extracting manager removals:', error);
      return [];
    }
  }

  /**
   * Analyze time estimation accuracy
   */
  private analyzeTimeDiscrepancies(progress: any[]): LearningFeedback['time_discrepancies'] {
    try {
      return progress
        .filter(p => p.actual_minutes && p.template_item?.estimated_minutes)
        .map(p => ({
          item_id: p.template_item_id,
          estimated_minutes: p.template_item.estimated_minutes,
          actual_minutes: p.actual_minutes
        }));
    } catch (error) {
      console.error('Error analyzing time discrepancies:', error);
      return [];
    }
  }

  /**
   * Analyze difficulty ratings from feedback
   */
  private analyzeDifficultyRatings(progress: any[]): LearningFeedback['difficulty_ratings'] {
    try {
      return progress
        .filter(p => p.difficulty_rating)
        .map(p => ({
          item_id: p.template_item_id,
          rating: p.difficulty_rating,
          notes: p.completion_notes
        }));
    } catch (error) {
      console.error('Error analyzing difficulty ratings:', error);
      return [];
    }
  }

  /**
   * Store learning insights in the database
   */
  private async storeLearningInsights(feedback: LearningFeedback): Promise<void> {
    try {
      // Get template info for job pattern
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .select(`
          *,
          job:jobs!inner(
            title,
            level,
            department:departments!inner(name)
          )
        `)
        .eq('id', feedback.template_id)
        .single();

      if (templateError) handleSupabaseError(templateError);

      const jobPattern = `${template.job.level} ${template.job.title} in ${template.job.department.name}`;

      // Store different types of insights
      const insights = [];

      // Commonly added items
      if (feedback.manager_additions.length > 0) {
        insights.push({
          template_id: feedback.template_id,
          job_pattern: jobPattern,
          insight_type: 'commonly_added' as const,
          insight_data: {
            items: feedback.manager_additions
          },
          confidence_level: 0.5, // Will increase with more samples
          sample_size: 1
        });
      }

      // Commonly removed items
      if (feedback.manager_removals.length > 0) {
        insights.push({
          template_id: feedback.template_id,
          job_pattern: jobPattern,
          insight_type: 'commonly_removed' as const,
          insight_data: {
            item_ids: feedback.manager_removals
          },
          confidence_level: 0.5,
          sample_size: 1
        });
      }

      // Time estimation insights
      if (feedback.time_discrepancies.length > 0) {
        insights.push({
          template_id: feedback.template_id,
          job_pattern: jobPattern,
          insight_type: 'time_estimation' as const,
          insight_data: {
            discrepancies: feedback.time_discrepancies
          },
          confidence_level: 0.6,
          sample_size: 1
        });
      }

      // Difficulty pattern insights
      if (feedback.difficulty_ratings.length > 0) {
        insights.push({
          template_id: feedback.template_id,
          job_pattern: jobPattern,
          insight_type: 'difficulty_pattern' as const,
          insight_data: {
            ratings: feedback.difficulty_ratings
          },
          confidence_level: 0.4,
          sample_size: 1
        });
      }

      // Insert insights
      if (insights.length > 0) {
        const { error } = await supabase
          .from('learning_insights')
          .insert(insights);

        if (error) handleSupabaseError(error);
      }
    } catch (error) {
      console.error('Failed to store learning insights:', error);
      // Don't throw - this is not critical for the main flow
    }
  }

  /**
   * Analyze patterns across multiple handovers and suggest improvements
   */
  async analyzePatterns(templateId?: string, jobPattern?: string): Promise<LearningPattern[]> {
    try {
      let query = supabase
        .from('learning_insights')
        .select('*');

      if (templateId) {
        query = query.eq('template_id', templateId);
      }

      if (jobPattern) {
        query = query.eq('job_pattern', jobPattern);
      }

      const { data: insights, error } = await query;

      if (error) handleSupabaseError(error);

      if (!insights || insights.length === 0) {
        return [];
      }

      // Group insights by type and pattern
      const groupedInsights = this.groupInsightsByPattern(insights);
      
      // Analyze each group for patterns
      const patterns: LearningPattern[] = [];

      for (const [key, insightGroup] of groupedInsights.entries()) {
        const pattern = this.analyzeInsightGroup(key, insightGroup);
        if (pattern) {
          patterns.push(pattern);
        }
      }

      return patterns.sort((a, b) => b.data.confidence - a.data.confidence);
    } catch (error) {
      console.error('Failed to analyze patterns:', error);
      throw error;
    }
  }

  /**
   * Group insights by pattern type and job context
   */
  private groupInsightsByPattern(insights: LearningInsight[]): Map<string, LearningInsight[]> {
    const groups = new Map<string, LearningInsight[]>();

    for (const insight of insights) {
      const key = `${insight.insight_type}_${insight.job_pattern}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      
      groups.get(key)!.push(insight);
    }

    return groups;
  }

  /**
   * Analyze a group of insights to identify patterns
   */
  private analyzeInsightGroup(key: string, insights: LearningInsight[]): LearningPattern | null {
    try {
      const [insightType, jobPattern] = key.split('_', 2);
      
      if (insights.length < this.learningThreshold) {
        return null; // Not enough data
      }

      const sampleSize = insights.length;
      const confidence = Math.min(0.95, sampleSize / 10); // Max 95% confidence

      switch (insightType as LearningInsight['insight_type']) {
        case 'commonly_added':
          return this.analyzeCommonlyAddedPattern(jobPattern, insights, sampleSize, confidence);
          
        case 'commonly_removed':
          return this.analyzeCommonlyRemovedPattern(jobPattern, insights, sampleSize, confidence);
          
        case 'time_estimation':
          return this.analyzeTimeEstimationPattern(jobPattern, insights, sampleSize, confidence);
          
        case 'difficulty_pattern':
          return this.analyzeDifficultyPattern(jobPattern, insights, sampleSize, confidence);
          
        default:
          return null;
      }
    } catch (error) {
      console.error('Error analyzing insight group:', error);
      return null;
    }
  }

  /**
   * Analyze commonly added items pattern
   */
  private analyzeCommonlyAddedPattern(
    jobPattern: string,
    insights: LearningInsight[],
    sampleSize: number,
    confidence: number
  ): LearningPattern | null {
    // Count frequency of added items by title similarity
    const itemFrequency = new Map<string, { count: number; items: any[] }>();

    for (const insight of insights) {
      const items = insight.insight_data.items || [];
      
      for (const item of items) {
        const normalizedTitle = this.normalizeItemTitle(item.title);
        
        if (!itemFrequency.has(normalizedTitle)) {
          itemFrequency.set(normalizedTitle, { count: 0, items: [] });
        }
        
        const entry = itemFrequency.get(normalizedTitle)!;
        entry.count++;
        entry.items.push(item);
      }
    }

    // Find items added in >70% of cases
    const threshold = Math.ceil(sampleSize * 0.7);
    const commonItems = Array.from(itemFrequency.entries())
      .filter(([_, data]) => data.count >= threshold)
      .map(([title, data]) => ({
        title,
        frequency: data.count / sampleSize,
        representative_item: data.items[0]
      }));

    if (commonItems.length === 0) {
      return null;
    }

    return {
      pattern_type: 'commonly_added',
      job_pattern: jobPattern,
      data: {
        frequency: commonItems.length,
        confidence,
        sample_size: sampleSize,
        pattern_details: { common_items: commonItems }
      },
      suggested_action: {
        type: 'add_to_template',
        details: {
          items_to_add: commonItems.map(item => item.representative_item)
        }
      }
    };
  }

  /**
   * Analyze commonly removed items pattern
   */
  private analyzeCommonlyRemovedPattern(
    jobPattern: string,
    insights: LearningInsight[],
    sampleSize: number,
    confidence: number
  ): LearningPattern | null {
    // Count frequency of removed item IDs
    const removalFrequency = new Map<string, number>();

    for (const insight of insights) {
      const itemIds = insight.insight_data.item_ids || [];
      
      for (const itemId of itemIds) {
        removalFrequency.set(itemId, (removalFrequency.get(itemId) || 0) + 1);
      }
    }

    // Find items removed in >70% of cases
    const threshold = Math.ceil(sampleSize * 0.7);
    const commonRemovals = Array.from(removalFrequency.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([itemId, count]) => ({
        item_id: itemId,
        frequency: count / sampleSize
      }));

    if (commonRemovals.length === 0) {
      return null;
    }

    return {
      pattern_type: 'commonly_removed',
      job_pattern: jobPattern,
      data: {
        frequency: commonRemovals.length,
        confidence,
        sample_size: sampleSize,
        pattern_details: { common_removals: commonRemovals }
      },
      suggested_action: {
        type: 'remove_from_template',
        details: {
          items_to_remove: commonRemovals.map(r => r.item_id)
        }
      }
    };
  }

  /**
   * Analyze time estimation accuracy pattern
   */
  private analyzeTimeEstimationPattern(
    jobPattern: string,
    insights: LearningInsight[],
    sampleSize: number,
    confidence: number
  ): LearningPattern {
    const allDiscrepancies = insights.flatMap(insight => insight.insight_data.discrepancies || []);
    
    // Calculate average discrepancy per item
    const itemDiscrepancies = new Map<string, { total: number; count: number; estimated: number }>();

    for (const discrepancy of allDiscrepancies) {
      const itemId = discrepancy.item_id;
      
      if (!itemDiscrepancies.has(itemId)) {
        itemDiscrepancies.set(itemId, { total: 0, count: 0, estimated: discrepancy.estimated_minutes });
      }
      
      const entry = itemDiscrepancies.get(itemId)!;
      entry.total += discrepancy.actual_minutes - discrepancy.estimated_minutes;
      entry.count++;
    }

    const averageDiscrepancies = Array.from(itemDiscrepancies.entries())
      .map(([itemId, data]) => ({
        item_id: itemId,
        average_discrepancy: data.total / data.count,
        estimated_minutes: data.estimated,
        suggested_minutes: Math.max(5, data.estimated + Math.round(data.total / data.count))
      }))
      .filter(item => Math.abs(item.average_discrepancy) > 5); // Only significant discrepancies

    return {
      pattern_type: 'time_estimation',
      job_pattern: jobPattern,
      data: {
        frequency: averageDiscrepancies.length,
        confidence,
        sample_size: sampleSize,
        pattern_details: { average_discrepancies: averageDiscrepancies }
      },
      suggested_action: {
        type: 'adjust_time',
        details: {
          time_adjustments: averageDiscrepancies
        }
      }
    };
  }

  /**
   * Analyze difficulty pattern
   */
  private analyzeDifficultyPattern(
    jobPattern: string,
    insights: LearningInsight[],
    sampleSize: number,
    confidence: number
  ): LearningPattern {
    const allRatings = insights.flatMap(insight => insight.insight_data.ratings || []);
    
    // Calculate average difficulty per item
    const itemDifficulties = new Map<string, { total: number; count: number }>();

    for (const rating of allRatings) {
      const itemId = rating.item_id;
      
      if (!itemDifficulties.has(itemId)) {
        itemDifficulties.set(itemId, { total: 0, count: 0 });
      }
      
      const entry = itemDifficulties.get(itemId)!;
      entry.total += rating.rating;
      entry.count++;
    }

    const difficultyAnalysis = Array.from(itemDifficulties.entries())
      .map(([itemId, data]) => ({
        item_id: itemId,
        average_difficulty: data.total / data.count,
        sample_count: data.count
      }))
      .filter(item => item.sample_count >= 2); // Need at least 2 ratings

    const highDifficultyItems = difficultyAnalysis.filter(item => item.average_difficulty >= 4);
    const lowDifficultyItems = difficultyAnalysis.filter(item => item.average_difficulty <= 2);

    return {
      pattern_type: 'difficulty_pattern',
      job_pattern: jobPattern,
      data: {
        frequency: difficultyAnalysis.length,
        confidence,
        sample_size: sampleSize,
        pattern_details: {
          high_difficulty: highDifficultyItems,
          low_difficulty: lowDifficultyItems
        }
      },
      suggested_action: {
        type: 'adjust_priority',
        details: {
          increase_priority: highDifficultyItems.map(item => item.item_id),
          decrease_priority: lowDifficultyItems.map(item => item.item_id)
        }
      }
    };
  }

  /**
   * Normalize item titles for similarity comparison
   */
  private normalizeItemTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Apply learning patterns to improve templates
   */
  async applyPatternImprovements(patterns: LearningPattern[]): Promise<{
    applied: number;
    skipped: number;
    errors: string[];
  }> {
    if (!this.autoImprovementEnabled) {
      return { applied: 0, skipped: patterns.length, errors: ['Auto-improvement is disabled'] };
    }

    let applied = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const pattern of patterns) {
      try {
        if (pattern.data.confidence < this.confidenceThreshold) {
          skipped++;
          continue;
        }

        const success = await this.applyPatternToTemplate(pattern);
        if (success) {
          applied++;
        } else {
          skipped++;
        }
      } catch (error) {
        errors.push(`Failed to apply pattern: ${error.message}`);
        skipped++;
      }
    }

    return { applied, skipped, errors };
  }

  /**
   * Apply a single pattern improvement to relevant templates
   */
  private async applyPatternToTemplate(pattern: LearningPattern): Promise<boolean> {
    try {
      // This is a simplified implementation
      // In production, you'd want more sophisticated template updating logic
      
      console.log(`Would apply pattern improvement:`, {
        pattern_type: pattern.pattern_type,
        job_pattern: pattern.job_pattern,
        action: pattern.suggested_action,
        confidence: pattern.data.confidence
      });

      // For now, just log the action instead of actually applying it
      // Real implementation would update base_templates table
      
      return true;
    } catch (error) {
      console.error('Failed to apply pattern to template:', error);
      return false;
    }
  }

  /**
   * Get learning statistics
   */
  async getLearningStatistics(): Promise<{
    total_insights: number;
    insights_by_type: Record<string, number>;
    patterns_identified: number;
    improvements_applied: number;
    average_confidence: number;
  }> {
    try {
      const { data: insights, error } = await supabase
        .from('learning_insights')
        .select('insight_type, confidence_level');

      if (error) handleSupabaseError(error);

      const insightsByType = insights?.reduce((acc, insight) => {
        acc[insight.insight_type] = (acc[insight.insight_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const averageConfidence = insights?.length > 0
        ? insights.reduce((sum, insight) => sum + (insight.confidence_level || 0), 0) / insights.length
        : 0;

      return {
        total_insights: insights?.length || 0,
        insights_by_type: insightsByType,
        patterns_identified: 0, // Would need to track this separately
        improvements_applied: 0, // Would need to track this separately
        average_confidence: Math.round(averageConfidence * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get learning statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const learningEngine = new LearningEngine();