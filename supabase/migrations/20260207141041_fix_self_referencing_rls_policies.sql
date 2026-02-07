/*
  # Fix self-referencing RLS policies on admins table

  1. New Functions
    - `is_super_admin()` - SECURITY DEFINER function that checks if current user is an active super_admin
    - `is_active_admin()` - SECURITY DEFINER function that checks if current user is an active admin
    Both bypass RLS to avoid circular recursion when used in policies on the admins table.

  2. Updated Policies on `admins`
    - "Super admins can view all admins" (SELECT) - now uses is_super_admin()
    - "Super admins can insert admins" (INSERT) - now uses is_super_admin()
    - "Super admins can update all admins" (UPDATE) - now uses is_super_admin()

  3. Updated Policies on `admin_permissions`
    - "Active admins can view permissions" (SELECT) - now uses is_active_admin()
    - "Super admins can insert permissions" (INSERT) - now uses is_super_admin()
    - "Super admins can delete permissions" (DELETE) - now uses is_super_admin()

  4. Important Notes
    - The root issue was that the "Super admins can view all admins" SELECT policy
      contained a subquery on the admins table itself, causing circular RLS evaluation
      which made the admin login query fail with an error.
    - SECURITY DEFINER functions bypass RLS internally, breaking the circular dependency.
*/

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE id = auth.uid()
    AND is_active = true
    AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE id = auth.uid()
    AND is_active = true
  );
$$;

DROP POLICY IF EXISTS "Super admins can view all admins" ON admins;
CREATE POLICY "Super admins can view all admins"
  ON admins FOR SELECT
  TO authenticated
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admins can insert admins" ON admins;
CREATE POLICY "Super admins can insert admins"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can update all admins" ON admins;
CREATE POLICY "Super admins can update all admins"
  ON admins FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Active admins can view permissions" ON admin_permissions;
CREATE POLICY "Active admins can view permissions"
  ON admin_permissions FOR SELECT
  TO authenticated
  USING (is_active_admin());

DROP POLICY IF EXISTS "Super admins can insert permissions" ON admin_permissions;
CREATE POLICY "Super admins can insert permissions"
  ON admin_permissions FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admins can delete permissions" ON admin_permissions;
CREATE POLICY "Super admins can delete permissions"
  ON admin_permissions FOR DELETE
  TO authenticated
  USING (is_super_admin());