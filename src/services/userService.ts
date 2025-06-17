import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const userService = {
  // Get all users with company info
  async getAll() {
    return await supabase
      .from('users')
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });
  },

  // Get users by company
  async getByCompany(companyId: string) {
    return await supabase
      .from('users')
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
  },

  // Get user by ID
  async getById(id: string) {
    return await supabase
      .from('users')
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();
  },

  // Create user profile (after auth signup)
  async createProfile(user: UserInsert) {
    return await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
  },

  // Update user
  async update(id: string, updates: UserUpdate) {
    return await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  // Toggle user status using database function
  async toggleStatus(id: string, isActive: boolean) {
    return await supabase.rpc('update_user_status', {
      p_user_id: id,
      p_is_active: isActive
    });
  },

  // Get company owners for admin using the helper function
  async getCompanyOwners() {
    return await supabase.rpc('get_company_owner_stats');
  },

  // Get employees for company owner
  async getEmployees(companyId: string) {
    return await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .eq('role', 'employee')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
  },
};