/*
  # Fix ambiguous company_id reference in get_company_owner_stats function

  1. Function Updates
    - Drop and recreate the `get_company_owner_stats` function
    - Fix ambiguous column references by using proper table aliases
    - Ensure all column references are properly qualified

  2. Changes Made
    - Add proper table aliases (u for users, c for companies, etc.)
    - Qualify all column references with their respective table aliases
    - Maintain the same function signature and return type
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_company_owner_stats(uuid);

-- Recreate the function with proper column qualification
CREATE OR REPLACE FUNCTION get_company_owner_stats(input_company_id uuid)
RETURNS TABLE (
  total_employees bigint,
  active_tasks bigint,
  total_customers bigint,
  pending_invoices bigint,
  total_revenue numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total employees in the company
    (SELECT COUNT(*)::bigint 
     FROM users u 
     WHERE u.company_id = input_company_id 
       AND u.role IN ('employee', 'company_owner')
       AND u.is_active = true) as total_employees,
    
    -- Active tasks for the company
    (SELECT COUNT(*)::bigint 
     FROM tasks t 
     WHERE t.company_id = input_company_id 
       AND t.status = 'active'
       AND t.is_active = true) as active_tasks,
    
    -- Total customers for the company
    (SELECT COUNT(*)::bigint 
     FROM customers cust 
     WHERE cust.company_id = input_company_id 
       AND cust.is_active = true) as total_customers,
    
    -- Pending invoices count
    (SELECT COUNT(*)::bigint 
     FROM invoices inv 
     WHERE inv.company_id = input_company_id 
       AND inv.status IN ('draft', 'sent')) as pending_invoices,
    
    -- Total revenue from paid invoices
    (SELECT COALESCE(SUM(inv.total_amount), 0)::numeric 
     FROM invoices inv 
     WHERE inv.company_id = input_company_id 
       AND inv.status = 'paid') as total_revenue;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_company_owner_stats(uuid) TO authenticated;