/*
  # Update Wakala Applications Constraints

  1. Changes
    - Add 'cancelled' to allowed status values
    - Allow NULL duration_minutes for non-calendar wakala applications
  
  2. Notes
    - Status constraint now includes: pending_payment, submitted, in_progress, completed, rejected, cancelled
    - duration_minutes constraint allows NULL (for wakala applications without calendar booking)
*/

ALTER TABLE wakala_applications
  DROP CONSTRAINT IF EXISTS wakala_applications_status_check;

ALTER TABLE wakala_applications
  ADD CONSTRAINT wakala_applications_status_check
  CHECK (status = ANY (ARRAY['pending_payment', 'submitted', 'in_progress', 'completed', 'rejected', 'cancelled']));

ALTER TABLE wakala_applications
  DROP CONSTRAINT IF EXISTS wakala_applications_duration_minutes_check;

ALTER TABLE wakala_applications
  ADD CONSTRAINT wakala_applications_duration_minutes_check
  CHECK (duration_minutes IS NULL OR duration_minutes = ANY (ARRAY[30, 60]));
