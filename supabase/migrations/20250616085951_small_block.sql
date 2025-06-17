/*
  # Initial Data for Systemet CMS

  1. Admin User Setup
    - Creates admin company
    - Creates admin user with specified credentials

  2. Sample Data
    - Sample company with owner and employees
    - Sample customers and addresses
    - Sample tasks and assignments
*/

-- Insert admin company
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
) ON CONFLICT (id) DO NOTHING;

-- Insert sample company
INSERT INTO companies (id, name, cvr, address, postal_code, city, phone, email, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Eksempel Service ApS',
  '12345678',
  'Erhvervsvej 123',
  '2000',
  'Frederiksberg',
  '+45 70 12 34 56',
  'kontakt@eksempelservice.dk',
  true
) ON CONFLICT (id) DO NOTHING;

-- Note: Users will be created through Supabase Auth signup process
-- The admin user (william@adely.dk) needs to be created manually through Supabase Auth
-- Then we can link it to the users table with the following data structure:

-- Sample customers for the example company
INSERT INTO customers (id, company_id, name, cvr, email, phone, contact_person, is_active)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Netto Supermarked',
    '87654321',
    'kontakt@netto.dk',
    '+45 70 12 34 56',
    'Karen Jensen',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Kontorbygning A/S',
    '11223344',
    'facility@kontorbygning.dk',
    '+45 80 12 34 56',
    'Lars Andersen',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'Restaurant Bella',
    '55667788',
    'info@restaurantbella.dk',
    '+45 90 12 34 56',
    'Maria Rossi',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Sample customer addresses
INSERT INTO customer_addresses (id, customer_id, type, street, postal_code, city, contact_person, phone)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Hovedadresse',
    'Hovedgade 123',
    '2000',
    'Frederiksberg',
    'Karen Jensen',
    '+45 70 12 34 56'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Hovedkontor',
    'Erhvervsvej 45',
    '2100',
    'København Ø',
    'Lars Andersen',
    '+45 80 12 34 56'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'Filial',
    'Butiksgade 67',
    '2200',
    'København N',
    'Maria Nielsen',
    '+45 81 12 34 56'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'Restaurant',
    'Cafégade 78',
    '2200',
    'København N',
    'Maria Rossi',
    '+45 90 12 34 56'
  )
ON CONFLICT (id) DO NOTHING;

-- Sample system settings
INSERT INTO system_settings (company_id, key, value, description, is_global)
VALUES 
  (
    NULL,
    'default_tax_rate',
    '25.0',
    'Standard momssats i Danmark',
    true
  ),
  (
    NULL,
    'default_currency',
    '"DKK"',
    'Standard valuta',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'working_hours_start',
    '"08:00"',
    'Standard arbejdstid start',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'working_hours_end',
    '"16:00"',
    'Standard arbejdstid slut',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'auto_time_tracking',
    'true',
    'Automatisk tidsregistrering aktiveret',
    false
  )
ON CONFLICT (company_id, key) DO NOTHING;