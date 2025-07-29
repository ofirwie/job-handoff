// useHandovers - Hook for managing handover data with Supabase
import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { HandoverWithDetails, Handover } from '@/types/template.types';

export function useHandovers(filters?: {
  status?: string;
  plant_id?: string;
  department_id?: string;
}) {
  const [handovers, setHandovers] = useState<HandoverWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    overdue: 0,
    completion_rate: 0,
    avg_completion_days: 0
  });

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('handovers')
        .select(`
          *,
          template:templates!inner(
            *,
            items:template_items(
              *,
              category:categories(*)
            ),
            job:jobs!inner(
              *,
              department:departments!inner(
                *,
                plant:plants!inner(
                  *,
                  organization:organizations(*)
                )
              )
            )
          ),
          progress:handover_progress(
            *,
            template_item:template_items(
              *,
              category:categories(*)
            )
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.plant_id) {
        query = query.eq('template.job.department.plant_id', filters.plant_id);
      }

      if (filters?.department_id) {
        query = query.eq('template.job.department_id', filters.department_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) handleSupabaseError(fetchError);

      const handoversData = data as HandoverWithDetails[] || [];
      setHandovers(handoversData);

      // Calculate statistics
      const total = handoversData.length;
      const active = handoversData.filter(h => 
        h.status === 'in_progress' || h.status === 'created'
      ).length;
      const completed = handoversData.filter(h => h.status === 'completed').length;
      
      // Calculate overdue (due_date passed and not completed)
      const today = new Date();
      const overdue = handoversData.filter(h => 
        h.status !== 'completed' && new Date(h.due_date) < today
      ).length;

      // Calculate completion rate
      const completion_rate = total > 0 ? (completed / total) * 100 : 0;

      // Calculate average completion time
      const completedHandovers = handoversData.filter(h => h.completed_date);
      const avg_completion_days = completedHandovers.length > 0
        ? completedHandovers.reduce((sum, h) => {
            const start = new Date(h.start_date || h.created_at);
            const end = new Date(h.completed_date!);
            return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          }, 0) / completedHandovers.length
        : 0;

      setStats({
        total,
        active,
        completed,
        overdue,
        completion_rate: Math.round(completion_rate),
        avg_completion_days: Math.round(avg_completion_days * 10) / 10
      });
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch handovers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createHandover = async (handoverData: Partial<Handover>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('handovers')
        .insert({
          ...handoverData,
          created_by: user.id,
          status: 'created',
          manager_edits: [],
          learning_feedback: {}
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);

      // Refresh handovers list
      await fetchHandovers();
      
      return data;
    } catch (err) {
      console.error('Failed to create handover:', err);
      throw err;
    }
  };

  const updateHandover = async (handoverId: string, updates: Partial<Handover>) => {
    try {
      const { data, error } = await supabase
        .from('handovers')
        .update(updates)
        .eq('id', handoverId)
        .select()
        .single();

      if (error) handleSupabaseError(error);

      // Update local state
      setHandovers(prev => prev.map(h => 
        h.id === handoverId ? { ...h, ...updates } : h
      ));

      return data;
    } catch (err) {
      console.error('Failed to update handover:', err);
      throw err;
    }
  };

  const deleteHandover = async (handoverId: string) => {
    try {
      const { error } = await supabase
        .from('handovers')
        .delete()
        .eq('id', handoverId);

      if (error) handleSupabaseError(error);

      // Remove from local state
      setHandovers(prev => prev.filter(h => h.id !== handoverId));
    } catch (err) {
      console.error('Failed to delete handover:', err);
      throw err;
    }
  };

  const getUpcomingDeadlines = (days: number = 7) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return handovers.filter(h => {
      if (h.status === 'completed') return false;
      const dueDate = new Date(h.due_date);
      return dueDate <= targetDate;
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  };

  const getHandoversByStatus = (status: string) => {
    return handovers.filter(h => h.status === status);
  };

  const getRecentActivity = (limit: number = 10) => {
    return handovers
      .filter(h => h.progress && h.progress.length > 0)
      .flatMap(h => 
        h.progress
          .filter(p => p.completed_at)
          .map(p => ({
            handover_id: h.id,
            handover_name: `${h.leaving_employee_name} - ${h.template.job.title}`,
            activity_type: 'item_completed',
            item_title: p.template_item?.title || 'Unknown item',
            completed_by: p.completed_by,
            completed_at: p.completed_at!,
            status: p.status
          }))
      )
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, limit);
  };

  useEffect(() => {
    fetchHandovers();
  }, [filters]);

  return {
    handovers,
    loading,
    error,
    stats,
    createHandover,
    updateHandover,
    deleteHandover,
    refetch: fetchHandovers,
    getUpcomingDeadlines,
    getHandoversByStatus,
    getRecentActivity
  };
}