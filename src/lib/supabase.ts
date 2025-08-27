import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      freelancer_tasks: {
        Row: {
          id: string;
          task: string;
          model: string;
          language: string;
          freelancer_name: string;
          freelancer_type: 'Linguist' | 'Language Expert';
          pay_rate_per_day: number;
          total_time_taken: number;
          start_date: string;
          completion_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task: string;
          model: string;
          language: string;
          freelancer_name: string;
          freelancer_type: 'Linguist' | 'Language Expert';
          pay_rate_per_day: number;
          total_time_taken: number;
          start_date: string;
          completion_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task?: string;
          model?: string;
          language?: string;
          freelancer_name?: string;
          freelancer_type?: 'Linguist' | 'Language Expert';
          pay_rate_per_day?: number;
          total_time_taken?: number;
          start_date?: string;
          completion_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type FreelancerTask = Database['public']['Tables']['freelancer_tasks']['Row'];
export type FreelancerTaskInsert = Database['public']['Tables']['freelancer_tasks']['Insert'];