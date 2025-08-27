import { useState, useEffect } from 'react';
import { supabase, Freelancer } from '../lib/supabase';

export const useFreelancers = () => {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('freelancers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setFreelancers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch freelancers');
    } finally {
      setLoading(false);
    }
  };

  const addFreelancer = async (name: string) => {
    try {
      // Check if freelancer already exists (case-insensitive)
      const { data: existing } = await supabase
        .from('freelancers')
        .select('*')
        .ilike('name', name)
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
        .insert([{ name }])
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

  const searchFreelancers = (query: string): Freelancer[] => {
    if (!query) return freelancers;
    
    const lowercaseQuery = query.toLowerCase();
    return freelancers.filter(freelancer => 
      freelancer.name.toLowerCase().includes(lowercaseQuery)
    );
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  return {
    freelancers,
    loading,
    error,
    fetchFreelancers,
    addFreelancer,
    searchFreelancers,
  };
};