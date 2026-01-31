-- ===================================================================
-- YCA Birmingham - Admin User Setup Script
-- ===================================================================
--
-- IMPORTANT: Before running this script, you must first create the
-- admin user in Supabase Dashboard → Authentication → Users
--
-- Email: Info@yca-birmingham.org.uk
-- Password: Yca1233*
--
-- Then run this script to add the user to the admins table.
-- ===================================================================

-- Step 1: Find the user ID (for verification)
SELECT id, email, created_at
FROM auth.users
WHERE email = 'Info@yca-birmingham.org.uk';

-- Step 2: Insert into admins table
-- (This will only work if the user exists in auth.users)
INSERT INTO admins (id, email, full_name, role, is_active)
SELECT
  id,
  email,
  'YCA Administrator',
  'super_admin',
  true
FROM auth.users
WHERE email = 'Info@yca-birmingham.org.uk'
ON CONFLICT (id) DO UPDATE
SET
  full_name = 'YCA Administrator',
  role = 'super_admin',
  is_active = true;

-- Step 3: Verify the admin was created
SELECT * FROM admins WHERE email = 'Info@yca-birmingham.org.uk';

-- ===================================================================
-- Success! You can now log in to /admin/login with:
-- Email: Info@yca-birmingham.org.uk
-- Password: Yca1233*
-- ===================================================================
