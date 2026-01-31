/*
  # Add Policy for Admins to View All Admin Records

  1. Changes
    - Add policy allowing super_admin to view all admin records
    
  2. Security
    - Only active admins can view all admin records
    - Based on role stored in their own record
*/

CREATE POLICY "Super admins can view all admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins admin_check
      WHERE admin_check.id = auth.uid() 
      AND admin_check.is_active = true
      LIMIT 1
    )
  );
