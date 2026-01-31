/*
  # Fix RLS Policy Circular Dependency for Admins Table

  1. Changes
    - Drop existing SELECT policy with circular dependency
    - Create new simple SELECT policy allowing users to read their own record
    
  2. Security
    - Users can only read their own admin record
    - No circular dependency issues
*/

DROP POLICY IF EXISTS "Admins can view all admins" ON admins;

CREATE POLICY "Admins can read own record"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
