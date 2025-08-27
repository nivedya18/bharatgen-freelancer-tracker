import { useState, useEffect } from 'react';
import { supabase, FreelancerTask, FreelancerTaskInsert } from '../lib/supabase';
import { FilterState } from '../types';

export const useFreelancerTasks = () => {
  const [tasks, setTasks] = useState<FreelancerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (filters?: Partial<FilterState>) => {
    try {
      setLoading(true);
      let query = supabase
        .from('freelancer_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.dateRange?.start) {
        query = query.gte('start_date', filters.dateRange.start);
      }
      if (filters?.dateRange?.end) {
        query = query.lte('completion_date', filters.dateRange.end);
      }
      if (filters?.freelancer_name) {
        query = query.eq('freelancer_name', filters.freelancer_name);
      }
      if (filters?.language) {
        query = query.eq('language', filters.language);
      }
      if (filters?.model) {
        query = query.eq('model', filters.model);
      }
      if (filters?.freelancer_type) {
        query = query.eq('freelancer_type', filters.freelancer_type);
      }
      if (filters?.search) {
        query = query.or(`task.ilike.%${filters.search}%,model.ilike.%${filters.search}%,language.ilike.%${filters.search}%,freelancer_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: FreelancerTaskInsert) => {
    try {
      const { data, error } = await supabase
        .from('freelancer_tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getUniqueValues = (field: keyof FreelancerTask) => {
    return Array.from(new Set(tasks.map(task => task[field]))).filter(Boolean);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    getUniqueValues,
  };
};