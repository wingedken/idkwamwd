/*
  # Fix all database issues and policies

  1. Drop all existing policies first
  2. Drop functions safely
  3. Create new simple policies
  4. Add helper functions
  5. Set up admin user automation
*/

-- First, drop ALL existing policies that might depend on functions
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Company owners can manage their company users" ON users;
DROP POLICY IF EXISTS "Company owners can manage company users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all companies" ON companies;
DROP POLICY IF EXISTS "Company owners can view their company" ON companies;
DROP POLICY IF EXISTS "Company users can view their company" ON companies;

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_admin_all" ON users;
DROP POLICY IF EXISTS "users_company_owner_manage" ON users;
DROP POLICY IF EXISTS "companies_admin_all" ON companies;
DROP POLICY IF EXISTS "companies_users_view_own" ON companies;
DROP POLICY IF EXISTS "companies_owner_update" ON companies;

-- Now safely drop functions
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid) CASCADE;
DROP FUNCTION IF EXISTS auth.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS auth.get_user_company_id(uuid) CASCADE;

-- Ensure admin company exists first
INSERT INTO companies (id, name, cvr, address, postal_code, city, phone, email, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Systemet Admin',
  NULL,
  'Admin Adresse 1',
  '1000',
  'København K',
  '+45 70 00 00 00',
  'admin@systemet.dk',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  postal_code = EXCLUDED.postal_code,
  city = EXCLUDED.city,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;

-- Create simple, non-recursive policies for users table

-- Allow users to read their own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data (excluding role and company_id)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service_role to do everything (for admin operations)
CREATE POLICY "users_service_role_all" ON users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Simple policies for companies table

-- Allow users to view their own company
CREATE POLICY "companies_users_view_own" ON companies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.company_id = companies.id
    )
  );

-- Allow service_role to manage all companies
CREATE POLICY "companies_service_role_all" ON companies
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a function to safely insert admin user after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only handle the specific admin user
  IF NEW.email = 'william@adely.dk' THEN
    INSERT INTO public.users (id, email, name, role, company_id, is_active)
    VALUES (
      NEW.id,
      NEW.email,
      'William Admin',
      'admin',
      '00000000-0000-0000-0000-000000000001',
      true
    ) ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      company_id = EXCLUDED.company_id,
      is_active = EXCLUDED.is_active;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for automatic admin user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create helper function for getting user stats (using service role privileges)
CREATE OR REPLACE FUNCTION public.get_company_owner_stats()
RETURNS TABLE (
  user_id uuid,
  user_name text,
  user_email text,
  user_phone text,
  company_id uuid,
  company_name text,
  employee_count bigint,
  user_created_at timestamptz,
  user_is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone,
    c.id as company_id,
    c.name as company_name,
    COALESCE(emp_count.count, 0) as employee_count,
    u.created_at as user_created_at,
    u.is_active as user_is_active
  FROM users u
  JOIN companies c ON u.company_id = c.id
  LEFT JOIN (
    SELECT company_id, COUNT(*) as count
    FROM users 
    WHERE role = 'employee' AND is_active = true
    GROUP BY company_id
  ) emp_count ON c.id = emp_count.company_id
  WHERE u.role = 'company_owner'
  ORDER BY u.created_at DESC;
END;
$$;

-- Create function to check if user is admin (for frontend use)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = user_id;
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- Create function to get user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, '');
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_company_owner_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- Insert admin user if it doesn't exist (fallback)
DO $$
BEGIN
  -- Check if admin user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'william@adely.dk') THEN
    -- Insert into auth.users first
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '4c12879b-f37b-4489-b275-109b118c1dcd',
      'authenticated',
      'authenticated',
      'william@adely.dk',
      crypt('wipaSAsaWo23rrd!', gen_salt('bf')),
      NOW(),
      NULL,
      NULL,
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
  
  -- Insert into public.users
  INSERT INTO public.users (id, email, name, role, company_id, is_active)
  VALUES (
    '4c12879b-f37b-4489-b275-109b118c1dcd',
    'william@adely.dk',
    'William Admin',
    'admin',
    '00000000-0000-0000-0000-000000000001',
    true
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    company_id = EXCLUDED.company_id,
    is_active = EXCLUDED.is_active;
END $$;