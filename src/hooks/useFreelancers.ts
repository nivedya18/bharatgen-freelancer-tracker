import { useState, useEffect } from 'react';
import { supabase, Freelancer, FreelancerInsert, FreelancerUpdate } from '../lib/supabase';

export const useFreelancers = () => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const { data, error } = await supabase
        .from('freelancers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching freelancers:', error);
        throw error;
      }
      
      setFreelancers(data || []);
    } catch (err) {
      console.error('Failed to fetch freelancers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch freelancers';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addFreelancer = async (freelancerData: Partial<FreelancerInsert>) => {
    try {
      // Check if freelancer already exists (case-insensitive)
      const { data: existing } = await supabase
        .from('freelancers')
        .select('*')
        .ilike('name', freelancerData.name || '')
        .single();

      if (existing) {
        return { 
          success: false, 
          error: 'A freelancer with this name already exists',
          data: existing 
        };
      }

      // Add the new freelancer
      const { data, error } = await supabase
        .from('freelancers')
        .insert([freelancerData])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setFreelancers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add freelancer';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateFreelancer = async (id: string, updates: Partial<FreelancerUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('freelancers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setFreelancers(prev => 
        prev.map(f => f.id === id ? data : f)
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update freelancer';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteFreelancer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('freelancers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setFreelancers(prev => prev.filter(f => f.id !== id));

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete freelancer';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  return {
    freelancers,
    loading,
    error,
    addFreelancer,
    updateFreelancer,
    deleteFreelancer,
    fetchFreelancers,
  };
};