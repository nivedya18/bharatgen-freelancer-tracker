import { useState, useEffect, useCallback } from 'react';
import { supabase, FreelancerTask, FreelancerTaskInsert } from '../lib/supabase';
import { FilterState } from '../types';

export const useFreelancerTasks = () => {
  const [tasks, setTasks] = useState<FreelancerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters?: Partial<FilterState>) => {
    try {
      setLoading(true);
      let query = supabase
        .from('master')
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
        if (Array.isArray(filters.freelancer_name) && filters.freelancer_name.length > 0) {
          query = query.in('freelancer_name', filters.freelancer_name);
        } else if (typeof filters.freelancer_name === 'string' && filters.freelancer_name) {
          query = query.eq('freelancer_name', filters.freelancer_name);
        }
      }
      if (filters?.language) {
        if (Array.isArray(filters.language) && filters.language.length > 0) {
          query = query.in('language', filters.language);
        } else if (typeof filters.language === 'string' && filters.language) {
          query = query.eq('language', filters.language);
        }
      }
      if (filters?.model) {
        if (Array.isArray(filters.model) && filters.model.length > 0) {
          query = query.in('model', filters.model);
        } else if (typeof filters.model === 'string' && filters.model) {
          query = query.eq('model', filters.model);
        }
      }
      if (filters?.freelancer_type) {
        query = query.eq('freelancer_type', filters.freelancer_type);
      }
      if (filters?.task_status) {
        query = query.eq('task_status', filters.task_status);
      }
      if (filters?.search) {
        query = query.or(`task_description.ilike.%${filters.search}%,task_group.ilike.%${filters.search}%,model.ilike.%${filters.search}%,language.ilike.%${filters.search}%,freelancer_name.ilike.%${filters.search}%,freelancer_type.ilike.%${filters.search}%,task_status.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = async (taskData: FreelancerTaskInsert) => {
    try {
      const { data, error } = await supabase
        .from('master')
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

  const updateTask = async (id: string, updates: Partial<FreelancerTaskInsert>) => {
    try {
      const { data, error } = await supabase
        .from('master')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => task.id === id ? data : task));
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('master')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getUniqueValues = (field: keyof FreelancerTask): string[] => {
    return Array.from(new Set(tasks.map(task => String(task[field])))).filter(Boolean);
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
    updateTask,
    deleteTask,
    getUniqueValues,
  };
};