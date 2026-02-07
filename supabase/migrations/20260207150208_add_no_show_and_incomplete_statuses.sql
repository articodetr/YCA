/*
  # Add No-Show and Incomplete Booking Statuses

  1. Modified Tables
    - `wakala_applications`
      - Updated `status` CHECK constraint to include 'no_show' and 'incomplete'
      - Previous values: pending_payment, submitted, in_progress, completed, rejected, cancelled
      - New values added: no_show, incomplete

  2. Notes
    - no_show: Client did not attend the scheduled appointment
    - incomplete: Appointment started but could not be completed
*/

ALTER TABLE wakala_applications
  DROP CONSTRAINT IF EXISTS wakala_applications_status_check;

ALTER TABLE wakala_applications
  ADD CONSTRAINT wakala_applications_status_check
  CHECK (status = ANY (ARRAY[
    'pending_payment'::text,
    'submitted'::text,
    'in_progress'::text,
    'completed'::text,
    'rejected'::text,
    'cancelled'::text,
    'no_show'::text,
    'incomplete'::text
  ]));
