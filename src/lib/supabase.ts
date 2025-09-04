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
      master: {
        Row: {
          id: string;
          task_group: string | null;
          task_description: string;
          model: string;
          language: string;
          freelancer_name: string;
          freelancer_id: string | null;
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
          task_group?: string | null;
          task_description: string;
          model: string;
          language: string;
          freelancer_name: string;
          freelancer_id?: string | null;
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
          task_group?: string | null;
          task_description?: string;
          model?: string;
          language?: string;
          freelancer_name?: string;
          freelancer_id?: string | null;
          freelancer_type?: 'Linguist' | 'Language Expert';
          pay_rate_per_day?: number;
          total_time_taken?: number;
          start_date?: string;
          completion_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      freelancers: {
        Row: {
          id: string;
          name: string;
          freelancer_type: 'Linguist' | 'Language Expert' | null;
          language: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          freelancer_type?: 'Linguist' | 'Language Expert' | null;
          language?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          freelancer_type?: 'Linguist' | 'Language Expert' | null;
          language?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rate_card: {
        Row: {
          id: string;
          freelancer_type: 'Linguist' | 'Language Expert';
          group_type: 'Group A' | 'Group B';
          rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          freelancer_type: 'Linguist' | 'Language Expert';
          group_type: 'Group A' | 'Group B';
          rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          freelancer_type?: 'Linguist' | 'Language Expert';
          group_type?: 'Group A' | 'Group B';
          rate?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type FreelancerTask = Database['public']['Tables']['master']['Row'];
export type FreelancerTaskInsert = Database['public']['Tables']['master']['Insert'];
export type Freelancer = Database['public']['Tables']['freelancers']['Row'];
export type FreelancerInsert = Database['public']['Tables']['freelancers']['Insert'];
export type FreelancerUpdate = Database['public']['Tables']['freelancers']['Update'];
export type RateCard = Database['public']['Tables']['rate_card']['Row'];
export type RateCardInsert = Database['public']['Tables']['rate_card']['Insert'];
export type RateCardUpdate = Database['public']['Tables']['rate_card']['Update'];