/*
  # Fix ambiguous column reference in get_company_owner_stats function

  1. Database Functions
    - Update `get_company_owner_stats` function to resolve ambiguous column references
    - Properly qualify all column references with table aliases
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_company_owner_stats();

-- Create the corrected function with proper column qualifications
CREATE OR REPLACE FUNCTION get_company_owner_stats()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  company_id uuid,
  company_name text,
  company_cvr text,
  company_phone text,
  company_email text,
  is_active boolean,
  employee_count bigint,
  customer_count bigint,
  task_count bigint,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.company_id,
    c.name as company_name,
    c.cvr as company_cvr,
    c.phone as company_phone,
    c.email as company_email,
    u.is_active,
    COALESCE(emp.employee_count, 0) as employee_count,
    COALESCE(cust.customer_count, 0) as customer_count,
    COALESCE(task.task_count, 0) as task_count,
    u.created_at
  FROM users u
  JOIN companies c ON c.id = u.company_id
  LEFT JOIN (
    SELECT 
      u_emp.company_id,
      COUNT(*) as employee_count
    FROM users u_emp
    WHERE u_emp.role = 'employee' AND u_emp.is_active = true
    GROUP BY u_emp.company_id
  ) emp ON emp.company_id = u.company_id
  LEFT JOIN (
    SELECT 
      cust.company_id,
      COUNT(*) as customer_count
    FROM customers cust
    WHERE cust.is_active = true
    GROUP BY cust.company_id
  ) cust ON cust.company_id = u.company_id
  LEFT JOIN (
    SELECT 
      t.company_id,
      COUNT(*) as task_count
    FROM tasks t
    WHERE t.is_active = true
    GROUP BY t.company_id
  ) task ON task.company_id = u.company_id
  WHERE u.role = 'company_owner'
  ORDER BY u.created_at DESC;
END;
$$;