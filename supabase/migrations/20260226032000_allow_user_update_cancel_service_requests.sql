/*
  # Allow users to update/cancel their own service requests

  This migration enables authenticated users to:
  - Update their own records while they are still unprocessed (submitted/pending)
  - Cancel their own records by setting status = 'cancelled'

  Affected tables:
  - wakala_applications
  - translation_requests
  - other_legal_requests
*/

-- ------------------------------------------------------------
-- 1) wakala_applications: allow user cancellation (status -> cancelled)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update their own wakala applications" ON wakala_applications;

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
    AND status IN ('pending_payment', 'submitted', 'pending', 'cancelled')
  );

-- ------------------------------------------------------------
-- 2) translation_requests: allow user update/cancel
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update their own translation requests" ON translation_requests;

CREATE POLICY "Users can update their own translation requests"
  ON translation_requests
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status IN ('submitted', 'pending_payment', 'pending')
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status IN ('submitted', 'pending_payment', 'pending', 'cancelled')
  );

-- ------------------------------------------------------------
-- 3) other_legal_requests: allow user update/cancel
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update their own other legal requests" ON other_legal_requests;

CREATE POLICY "Users can update their own other legal requests"
  ON other_legal_requests
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status IN ('submitted', 'pending_payment', 'pending')
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status IN ('submitted', 'pending_payment', 'pending', 'cancelled')
  );
