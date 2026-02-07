/*
  # Add SELECT policy for super admins to view all admin records

  1. Security Changes
    - Add SELECT policy on `admins` table allowing active super admins to view all admin records
    - This is needed for the Admin Management page to list all admins

  2. Important Notes
    - Regular admins can still only see their own record via the existing "Admins can read own record" policy
    - Super admins can see all records via this new policy
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Super admins can view all admins'
  ) THEN
    CREATE POLICY "Super admins can view all admins"
      ON admins FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM admins a
          WHERE a.id = auth.uid()
          AND a.is_active = true
          AND a.role = 'super_admin'
        )
      );
  END IF;
END $$;
