/*
  # Komplet Database Schema for Systemet CMS

  1. New Tables
    - `companies` - Virksomhedsoplysninger
    - `users` - Alle brugere (admin, company_owners, employees)
    - `customers` - Kunder tilknyttet virksomheder
    - `customer_addresses` - Flere adresser per kunde
    - `tasks` - Opgaver med gentagelse og tildeling
    - `task_assignments` - Mange-til-mange relation mellem opgaver og medarbejdere
    - `time_entries` - Tidsregistreringer
    - `routes` - Optimerede ruter for medarbejdere
    - `route_stops` - Stop på ruter
    - `invoices` - Fakturaer
    - `invoice_items` - Fakturalinje
    - `accounting_integrations` - Regnskabsintegrationer
    - `system_settings` - Systemindstillinger

  2. Security
    - Enable RLS på alle tabeller
    - Policies for rollebaseret adgang
    - Admin kan se alt
    - Company owners kan kun se deres egen virksomheds data
    - Employees kan kun se deres egne data

  3. Features
    - Automatisk timestamps
    - Soft delete funktionalitet
    - Audit trail
    - Optimeret indekser
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cvr text,
  address text,
  postal_code text,
  city text,
  phone text,
  email text,
  website text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'company_owner', 'employee')),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  phone text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  cvr text,
  email text,
  phone text,
  contact_person text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer addresses table
CREATE TABLE IF NOT EXISTS customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'main',
  street text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  contact_person text,
  phone text,
  email text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_address_id uuid NOT NULL REFERENCES customer_addresses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  estimated_hours decimal(4,2) NOT NULL DEFAULT 1.0,
  start_date date NOT NULL,
  recurrence_type text CHECK (recurrence_type IN ('once', 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly')),
  recurrence_interval integer DEFAULT 1,
  recurrence_end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  priority integer DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  created_by uuid NOT NULL REFERENCES users(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task assignments (many-to-many between tasks and employees)
CREATE TABLE IF NOT EXISTS task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_date date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, employee_id, assigned_date)
);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  total_hours decimal(4,2),
  entry_type text NOT NULL DEFAULT 'automatic' CHECK (entry_type IN ('automatic', 'manual')),
  location_lat decimal(10,8),
  location_lng decimal(11,8),
  notes text,
  is_approved boolean DEFAULT false,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_date date NOT NULL,
  start_address text,
  start_lat decimal(10,8),
  start_lng decimal(11,8),
  total_distance_km decimal(8,2),
  total_duration_minutes integer,
  is_optimized boolean DEFAULT false,
  optimization_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, route_date)
);

-- Route stops table
CREATE TABLE IF NOT EXISTS route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  stop_order integer NOT NULL,
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  estimated_departure timestamptz,
  actual_departure timestamptz,
  distance_from_previous_km decimal(8,2),
  duration_from_previous_minutes integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'arrived', 'in_progress', 'completed', 'skipped')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Accounting integrations table
CREATE TABLE IF NOT EXISTS accounting_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('dinero', 'economic', 'billy')),
  api_key text,
  api_secret text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  is_active boolean DEFAULT false,
  last_sync timestamptz,
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error')),
  error_message text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, provider)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'DKK',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_method text CHECK (payment_method IN ('invoice', 'mobilepay', 'pbs')),
  external_id text,
  accounting_sync_status text DEFAULT 'pending' CHECK (accounting_sync_status IN ('pending', 'synced', 'error')),
  notes text,
  created_by uuid NOT NULL REFERENCES users(id),
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, invoice_number)
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id),
  time_entry_id uuid REFERENCES time_entries(id),
  description text NOT NULL,
  quantity decimal(8,2) NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  tax_rate decimal(5,2) DEFAULT 25.00,
  created_at timestamptz DEFAULT now()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, key)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_customer_id ON tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_employee_id ON task_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_routes_employee_id ON routes(employee_id);
CREATE INDEX IF NOT EXISTS idx_routes_date ON routes(route_date);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Admins can manage all companies" ON companies
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Company owners can view their company" ON companies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.company_id = companies.id
      AND users.role IN ('company_owner', 'employee')
    )
  );

-- RLS Policies for users
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Company owners can manage their company users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'company_owner'
      AND u.company_id = users.company_id
    )
  );

CREATE POLICY "Users can view their own data" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- RLS Policies for customers
CREATE POLICY "Company users can manage their customers" ON customers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (
        users.role = 'admin' OR
        (users.company_id = customers.company_id AND users.role IN ('company_owner', 'employee'))
      )
    )
  );

-- RLS Policies for customer_addresses
CREATE POLICY "Company users can manage customer addresses" ON customer_addresses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN customers ON customers.company_id = users.company_id
      WHERE users.id = auth.uid() 
      AND customers.id = customer_addresses.customer_id
      AND (
        users.role = 'admin' OR
        users.role IN ('company_owner', 'employee')
      )
    )
  );

-- RLS Policies for tasks
CREATE POLICY "Company users can manage their tasks" ON tasks
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (
        users.role = 'admin' OR
        (users.company_id = tasks.company_id AND users.role IN ('company_owner', 'employee'))
      )
    )
  );

-- RLS Policies for task_assignments
CREATE POLICY "Company users can manage task assignments" ON task_assignments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN tasks ON tasks.company_id = users.company_id
      WHERE users.id = auth.uid() 
      AND tasks.id = task_assignments.task_id
      AND (
        users.role = 'admin' OR
        users.role IN ('company_owner', 'employee')
      )
    )
  );

-- RLS Policies for time_entries
CREATE POLICY "Employees can manage their time entries" ON time_entries
  FOR ALL TO authenticated
  USING (
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      JOIN tasks ON tasks.company_id = users.company_id
      WHERE users.id = auth.uid() 
      AND tasks.id = time_entries.task_id
      AND users.role IN ('admin', 'company_owner')
    )
  );

-- RLS Policies for routes
CREATE POLICY "Employees can manage their routes" ON routes
  FOR ALL TO authenticated
  USING (
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u1
      JOIN users u2 ON u2.company_id = u1.company_id
      WHERE u1.id = auth.uid() 
      AND u2.id = routes.employee_id
      AND u1.role IN ('admin', 'company_owner')
    )
  );

-- RLS Policies for route_stops
CREATE POLICY "Company users can manage route stops" ON route_stops
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM routes
      JOIN users u1 ON u1.id = routes.employee_id
      JOIN users u2 ON u2.company_id = u1.company_id
      WHERE u2.id = auth.uid() 
      AND routes.id = route_stops.route_id
      AND (
        u2.role = 'admin' OR
        u2.role IN ('company_owner', 'employee')
      )
    )
  );

-- RLS Policies for accounting_integrations
CREATE POLICY "Company owners can manage accounting integrations" ON accounting_integrations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (
        users.role = 'admin' OR
        (users.company_id = accounting_integrations.company_id AND users.role = 'company_owner')
      )
    )
  );

-- RLS Policies for invoices
CREATE POLICY "Company users can manage their invoices" ON invoices
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (
        users.role = 'admin' OR
        (users.company_id = invoices.company_id AND users.role IN ('company_owner', 'employee'))
      )
    )
  );

-- RLS Policies for invoice_items
CREATE POLICY "Company users can manage invoice items" ON invoice_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN invoices ON invoices.company_id = users.company_id
      WHERE users.id = auth.uid() 
      AND invoices.id = invoice_items.invoice_id
      AND (
        users.role = 'admin' OR
        users.role IN ('company_owner', 'employee')
      )
    )
  );

-- RLS Policies for system_settings
CREATE POLICY "Admins can manage all settings" ON system_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Company owners can manage their settings" ON system_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.company_id = system_settings.company_id
      AND users.role = 'company_owner'
    )
  );

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_stops_updated_at BEFORE UPDATE ON route_stops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounting_integrations_updated_at BEFORE UPDATE ON accounting_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();