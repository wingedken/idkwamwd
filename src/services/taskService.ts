import { supabase } from '../lib/supabase';
import type { Task, TaskTemplate, ApiResponse } from '../types';

export const taskService = {
  // Opret opgave
  async createTask(taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          company_id: taskData.company_id,
          customer_id: taskData.customer_id,
          customer_address_id: taskData.customer_address_id,
          title: taskData.title,
          description: taskData.description,
          task_type: taskData.task_type,
          estimated_duration: taskData.estimated_duration,
          documentation_requirements: taskData.documentation_requirements,
          recurrence_pattern: taskData.recurrence_pattern,
          priority: taskData.priority || 'medium',
          time_window: taskData.time_window,
          status: taskData.status || 'draft',
          assigned_employees: taskData.assigned_employees || [],
          required_skills: taskData.required_skills || [],
          is_template: taskData.is_template || false,
          template_name: taskData.template_name,
          created_by: taskData.created_by
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Hent opgaver for virksomhed
  async getTasksByCompany(companyId: string, filters?: {
    date?: string;
    employee_id?: string;
    status?: string;
    customer_id?: string;
  }): Promise<ApiResponse<Task[]>> {
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          customers (
            id,
            name,
            addresses:customer_addresses (*)
          ),
          assigned_employees:users!tasks_assigned_employees_fkey (
            id,
            name,
            email
          )
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (filters?.date) {
        query = query.gte('created_at', `${filters.date}T00:00:00`)
                    .lt('created_at', `${filters.date}T23:59:59`);
      }

      if (filters?.employee_id) {
        query = query.contains('assigned_employees', [filters.employee_id]);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Opdater opgave
  async updateTask(taskId: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Slet opgave (soft delete)
  async deleteTask(taskId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_active: false })
        .eq('id', taskId);

      if (error) throw error;

      return { success: true, data: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Tildel medarbejdere til opgave
  async assignEmployees(taskId: string, employeeIds: string[]): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          assigned_employees: employeeIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Opret opgave fra skabelon
  async createFromTemplate(templateId: string, overrides: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      // Hent skabelon
      const { data: template, error: templateError } = await supabase
        .from('task_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Opret opgave baseret på skabelon
      const taskData: Partial<Task> = {
        ...overrides,
        title: overrides.title || template.title,
        description: overrides.description || template.description,
        task_type: template.task_type,
        estimated_duration: overrides.estimated_duration || template.estimated_duration,
        documentation_requirements: template.documentation_requirements,
        required_skills: template.required_skills,
        priority: overrides.priority || template.priority,
        is_template: false
      };

      return await this.createTask(taskData);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Gem opgave som skabelon
  async saveAsTemplate(taskId: string, templateName: string): Promise<ApiResponse<TaskTemplate>> {
    try {
      // Hent opgave
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      // Opret skabelon
      const { data, error } = await supabase
        .from('task_templates')
        .insert({
          company_id: task.company_id,
          name: templateName,
          task_type: task.task_type,
          title: task.title,
          description: task.description,
          estimated_duration: task.estimated_duration,
          documentation_requirements: task.documentation_requirements,
          required_skills: task.required_skills,
          priority: task.priority,
          usage_count: 0,
          created_by: task.created_by
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Hent skabeloner
  async getTemplates(companyId: string): Promise<ApiResponse<TaskTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('company_id', companyId)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Tjek for konflikter
  async checkConflicts(taskData: {
    employee_ids: string[];
    start_time: string;
    end_time: string;
    exclude_task_id?: string;
  }): Promise<ApiResponse<{
    has_conflicts: boolean;
    conflicts: Array<{
      employee_id: string;
      employee_name: string;
      conflicting_task: Task;
    }>;
  }>> {
    try {
      const conflicts = [];

      for (const employeeId of taskData.employee_ids) {
        // Tjek for overlappende opgaver
        let query = supabase
          .from('tasks')
          .select(`
            *,
            assigned_employees:users!tasks_assigned_employees_fkey (name)
          `)
          .contains('assigned_employees', [employeeId])
          .neq('status', 'cancelled')
          .neq('status', 'completed');

        if (taskData.exclude_task_id) {
          query = query.neq('id', taskData.exclude_task_id);
        }

        const { data: existingTasks, error } = await query;

        if (error) throw error;

        // Tjek for tidsoverlap
        for (const existingTask of existingTasks || []) {
          // Simpel tidsoverlap check - i produktion ville dette være mere sofistikeret
          const hasOverlap = true; // Placeholder logik
          
          if (hasOverlap) {
            conflicts.push({
              employee_id: employeeId,
              employee_name: existingTask.assigned_employees?.[0]?.name || 'Ukendt',
              conflicting_task: existingTask
            });
          }
        }
      }

      return {
        success: true,
        data: {
          has_conflicts: conflicts.length > 0,
          conflicts
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};