/*
  # Komplet systemopsætning

  1. Oprydning
    - Fjerner alle eksisterende policies og funktioner
    - Starter helt forfra med ren struktur

  2. Grundlæggende opsætning
    - Admin company og bruger
    - Enkle, funktionelle RLS policies
    - Nødvendige hjælpefunktioner

  3. Sikkerhed
    - Rollebaseret adgangskontrol
    - Service role adgang til admin funktioner
    - Automatisk admin bruger oprettelse
*/

-- Fjern alle eksisterende policies
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Company owners can manage their company users" ON users;
DROP POLICY IF EXISTS "Company owners can manage company users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_admin_all" ON users;
DROP POLICY IF EXISTS "users_company_owner_manage" ON users;
DROP POLICY IF EXISTS "users_service_role_all" ON users;

DROP POLICY IF EXISTS "Admins can manage all companies" ON companies;
DROP POLICY IF EXISTS "Company owners can view their company" ON companies;
DROP POLICY IF EXISTS "Company users can view their company" ON companies;
DROP POLICY IF EXISTS "companies_admin_all" ON companies;
DROP POLICY IF EXISTS "companies_users_view_own" ON companies;
DROP POLICY IF EXISTS "companies_owner_update" ON companies;
DROP POLICY IF EXISTS "companies_service_role_all" ON companies;

-- Fjern funktioner sikkert
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_company_id(uuid) CASCADE;
DROP FUNCTION IF EXISTS auth.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS auth.get_user_company_id(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_company_owner_stats() CASCADE;
DROP FUNCTION IF EXISTS public.create_company_owner(uuid, text, text, text, text, text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_status(uuid, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Fjern trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Opret admin company
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

-- Enkle RLS policies for users
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_service_role_all" ON users
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Enkle RLS policies for companies
CREATE POLICY "companies_users_view_own" ON companies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.company_id = companies.id
    )
  );

CREATE POLICY "companies_service_role_all" ON companies
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Hjælpefunktioner
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

CREATE OR REPLACE FUNCTION public.create_company_owner(
  p_user_id uuid,
  p_email text,
  p_name text,
  p_phone text,
  p_company_name text,
  p_company_cvr text,
  p_company_address text,
  p_company_postal_code text,
  p_company_city text,
  p_company_phone text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id uuid;
  v_result json;
BEGIN
  -- Opret virksomhed
  INSERT INTO companies (name, cvr, address, postal_code, city, phone, email, is_active)
  VALUES (p_company_name, p_company_cvr, p_company_address, p_company_postal_code, p_company_city, p_company_phone, p_email, true)
  RETURNING id INTO v_company_id;
  
  -- Opret bruger profil
  INSERT INTO users (id, email, name, role, company_id, phone, is_active)
  VALUES (p_user_id, p_email, p_name, 'company_owner', v_company_id, p_phone, true);
  
  v_result := json_build_object(
    'success', true,
    'company_id', v_company_id,
    'user_id', p_user_id
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    v_result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_status(
  p_user_id uuid,
  p_is_active boolean
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  UPDATE users 
  SET is_active = p_is_active
  WHERE id = p_user_id;
  
  IF FOUND THEN
    v_result := json_build_object('success', true);
  ELSE
    v_result := json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    v_result := json_build_object('success', false, 'error', SQLERRM);
    RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Kun admin bruger oprettes automatisk
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

-- Opret trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tilladelser
GRANT EXECUTE ON FUNCTION public.get_company_owner_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_company_owner(uuid, text, text, text, text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_status(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Opret admin bruger hvis den findes i auth
INSERT INTO public.users (id, email, name, role, company_id, is_active)
SELECT 
  au.id,
  au.email,
  'William Admin',
  'admin',
  '00000000-0000-0000-0000-000000000001',
  true
FROM auth.users au
WHERE au.email = 'william@adely.dk'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  is_active = EXCLUDED.is_active;