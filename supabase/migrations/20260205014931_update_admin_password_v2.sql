/*
  # Update Admin Password

  ## Overview
  Updates the password for the admin user Info@yca-birmingham.org.uk to '123456'

  ## Changes
  - Updates the password in auth.users using Supabase's auth functions
  - Ensures the admin user exists in the admins table

  ## Security Notes
  - This is a one-time update for the super admin account
  - Password should be changed after first login for security
*/

-- Update the admin user's password using Supabase's auth schema
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'Info@yca-birmingham.org.uk';

  -- If user exists, update the password
  IF admin_user_id IS NOT NULL THEN
    -- Update password directly in auth.users
    -- Supabase will handle the encryption
    UPDATE auth.users
    SET
      encrypted_password = crypt('123456', gen_salt('bf')),
      updated_at = now()
    WHERE id = admin_user_id;

    -- Ensure the user is in the admins table
    INSERT INTO admins (id, email, full_name, role, is_active)
    VALUES (
      admin_user_id,
      'Info@yca-birmingham.org.uk',
      'YCA Administrator',
      'super_admin',
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET
      full_name = 'YCA Administrator',
      role = 'super_admin',
      is_active = true;

    RAISE NOTICE 'Admin password updated successfully for Info@yca-birmingham.org.uk';
  ELSE
    RAISE NOTICE 'Admin user not found, please create user first';
  END IF;
END $$;