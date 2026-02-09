/*
  # Add user UPDATE and DELETE policies for wakala_applications

  1. Security Changes
    - Update existing UPDATE policy to check both user_id and member_id
    - Add DELETE policy for users to delete their own applications
    - Users can only update/delete applications in specific statuses

  2. Business Rules
    - Users can update applications in: pending_payment, submitted, pending
    - Users can delete applications in: pending_payment, submitted, pending
    - Cannot modify completed, rejected, cancelled, no_show, incomplete, in_progress applications

  3. Notes
    - Ensures users can only modify their own data
    - Protects completed/processed applications from modification
*/

-- Drop the existing member update policy if exists
DROP POLICY IF EXISTS "Members can update their own wakala applications" ON wakala_applications;

-- Create comprehensive UPDATE policy for users
CREATE POLICY "Users can update their own wakala applications"
  ON wakala_applications
  FOR UPDATE
  TO authenticated
  USING (
    (user_id = auth.uid() OR member_id = auth.uid())
    AND status IN ('pending_payment', 'submitted', 'pending')
  )
  WITH CHECK (
    (user_id = auth.uid() OR member_id = auth.uid())
    AND status IN ('pending_payment', 'submitted', 'pending')
  );

-- Create DELETE policy for users
CREATE POLICY "Users can delete their own wakala applications"
  ON wakala_applications
  FOR DELETE
  TO authenticated
  USING (
    (user_id = auth.uid() OR member_id = auth.uid())
    AND status IN ('pending_payment', 'submitted', 'pending')
  );

-- Add comment for clarity
COMMENT ON POLICY "Users can update their own wakala applications" ON wakala_applications 
IS 'Allows authenticated users to update their own wakala applications only if status is pending_payment, submitted, or pending';

COMMENT ON POLICY "Users can delete their own wakala applications" ON wakala_applications 
IS 'Allows authenticated users to delete their own wakala applications only if status is pending_payment, submitted, or pending';
