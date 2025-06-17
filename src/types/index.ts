// Centrale typer for hele systemet
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'company_owner' | 'employee';
  company_id?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  cvr?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  company_id: string;
  role_id?: string;
  skills: string[];
  start_address: string;
  current_location?: { lat: number; lng: number };
  is_active: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  default_skills: string[];
  company_id: string;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_default: boolean;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  cvr?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  addresses: CustomerAddress[];
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  type: string;
  street: string;
  postal_code: string;
  city: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  coordinates?: { lat: number; lng: number };
  is_primary: boolean;
  is_active: boolean;
}

export interface Task {
  id: string;
  company_id: string;
  customer_id: string;
  customer_address_id: string;
  title: string;
  description?: string;
  task_type: string;
  estimated_duration: number; // minutter
  documentation_requirements: DocumentationRequirement[];
  recurrence_pattern?: RecurrencePattern;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  time_window?: { start: string; end: string };
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assigned_employees: string[];
  required_skills: string[];
  is_template: boolean;
  template_name?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentationRequirement {
  type: 'text' | 'photo' | 'signature' | 'checklist';
  title: string;
  description?: string;
  required: boolean;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  interval: number;
  end_date?: string;
  days_of_week?: number[]; // 0-6, Sunday = 0
}

export interface Route {
  id: string;
  employee_id: string;
  date: string;
  tasks: Task[];
  optimized_order: string[]; // task IDs i optimal rækkefølge
  total_distance: number; // km
  total_duration: number; // minutter
  start_location: { lat: number; lng: number };
  is_optimized: boolean;
  optimization_data?: any; // GraphHopper response
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  employee_id: string;
  start_time: string;
  end_time?: string;
  total_hours?: number;
  type: 'automatic' | 'manual';
  gps_data?: { lat: number; lng: number }[];
  notes?: string;
  documentation?: Documentation[];
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Documentation {
  id: string;
  type: 'text' | 'photo' | 'signature';
  content: string; // text content eller base64 for billeder
  title?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  company_id: string;
  customer_id: string;
  invoice_number: string;
  tasks: string[]; // task IDs
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: 'pbs' | 'mobilepay' | 'bank_transfer';
  due_date: string;
  created_by: string;
  sent_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'task_assigned' | 'route_updated' | 'conflict_detected' | 'documentation_required' | 'time_reminder';
  title: string;
  message: string;
  data?: any; // ekstra data relateret til notifikationen
  is_read: boolean;
  created_at: string;
}

export interface TaskTemplate {
  id: string;
  company_id: string;
  name: string;
  task_type: string;
  title: string;
  description?: string;
  estimated_duration: number;
  documentation_requirements: DocumentationRequirement[];
  required_skills: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// API Response typer
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}