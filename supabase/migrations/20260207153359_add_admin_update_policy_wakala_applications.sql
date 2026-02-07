/*
  # Add admin UPDATE policy for wakala_applications

  1. Security Changes
    - Add UPDATE policy so active admins can modify wakala_applications
      (status changes, admin assignment, etc.)

  2. Notes
    - Previously only members could update their own applications
    - Admins were silently blocked by RLS when changing status or assigning
*/

CREATE POLICY "Admins can update wakala applications"
  ON wakala_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );
