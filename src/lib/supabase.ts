import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          cvr: string | null;
          address: string | null;
          postal_code: string | null;
          city: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cvr?: string | null;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cvr?: string | null;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'company_owner' | 'employee';
          company_id: string | null;
          phone: string | null;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'company_owner' | 'employee';
          company_id?: string | null;
          phone?: string | null;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'company_owner' | 'employee';
          company_id?: string | null;
          phone?: string | null;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          cvr: string | null;
          email: string | null;
          phone: string | null;
          contact_person: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          cvr?: string | null;
          email?: string | null;
          phone?: string | null;
          contact_person?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          cvr?: string | null;
          email?: string | null;
          phone?: string | null;
          contact_person?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_addresses: {
        Row: {
          id: string;
          customer_id: string;
          type: string;
          street: string;
          postal_code: string;
          city: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          type?: string;
          street: string;
          postal_code: string;
          city: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          type?: string;
          street?: string;
          postal_code?: string;
          city?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string;
          customer_address_id: string;
          title: string;
          description: string | null;
          estimated_hours: number;
          start_date: string;
          recurrence_type: string | null;
          recurrence_interval: number | null;
          recurrence_end_date: string | null;
          status: 'active' | 'paused' | 'completed' | 'cancelled';
          priority: number;
          created_by: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          customer_id: string;
          customer_address_id: string;
          title: string;
          description?: string | null;
          estimated_hours?: number;
          start_date: string;
          recurrence_type?: string | null;
          recurrence_interval?: number | null;
          recurrence_end_date?: string | null;
          status?: 'active' | 'paused' | 'completed' | 'cancelled';
          priority?: number;
          created_by: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          customer_id?: string;
          customer_address_id?: string;
          title?: string;
          description?: string | null;
          estimated_hours?: number;
          start_date?: string;
          recurrence_type?: string | null;
          recurrence_interval?: number | null;
          recurrence_end_date?: string | null;
          status?: 'active' | 'paused' | 'completed' | 'cancelled';
          priority?: number;
          created_by?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      task_assignments: {
        Row: {
          id: string;
          task_id: string;
          employee_id: string;
          assigned_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          employee_id: string;
          assigned_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          employee_id?: string;
          assigned_date?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          employee_id: string;
          task_id: string;
          start_time: string;
          end_time: string | null;
          total_hours: number | null;
          entry_type: 'automatic' | 'manual';
          location_lat: number | null;
          location_lng: number | null;
          notes: string | null;
          is_approved: boolean;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          task_id: string;
          start_time: string;
          end_time?: string | null;
          total_hours?: number | null;
          entry_type?: 'automatic' | 'manual';
          location_lat?: number | null;
          location_lng?: number | null;
          notes?: string | null;
          is_approved?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          task_id?: string;
          start_time?: string;
          end_time?: string | null;
          total_hours?: number | null;
          entry_type?: 'automatic' | 'manual';
          location_lat?: number | null;
          location_lng?: number | null;
          notes?: string | null;
          is_approved?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}