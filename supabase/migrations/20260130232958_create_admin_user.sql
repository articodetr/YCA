/*
  # Create Admin User
  
  1. Purpose
    - Creates the admin user account in auth.users
    - Adds admin record to admins table with super_admin role
    - Ensures the admin can access the admin dashboard
  
  2. Admin Details
    - Email: Info@yca-birmingham.org.uk
    - Role: super_admin
    - Status: active
  
  3. Security
    - User is automatically confirmed (email_confirmed_at set)
    - Full admin privileges granted via role
*/

-- Create the admin user in auth.users if not exists
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'Info@yca-birmingham.org.uk';
  
  -- If user doesn't exist, create it
  IF v_user_id IS NULL THEN
    -- Insert user into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
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
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'Info@yca-birmingham.org.uk',
      crypt('Yca1233*', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;
  END IF;
  
  -- Insert or update admin record
  INSERT INTO admins (id, email, full_name, role, is_active)
  VALUES (
    v_user_id,
    'Info@yca-birmingham.org.uk',
    'YCA Administrator',
    'super_admin',
    true
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;
    
END $$;