/*
  # Fix event registration status constraint

  1. Changes
    - Drop the existing restrictive status CHECK constraint on `event_registrations`
    - Add new constraint allowing 'pending' status needed for paid event flow
  
  2. Reason
    - Paid events need to insert with 'pending' status before payment
    - Current constraint only allows: confirmed, cancelled, attended
    - New constraint allows: confirmed, cancelled, attended, pending
*/

ALTER TABLE event_registrations DROP CONSTRAINT IF EXISTS event_registrations_status_check;

ALTER TABLE event_registrations ADD CONSTRAINT event_registrations_status_check
  CHECK (status = ANY (ARRAY['confirmed', 'cancelled', 'attended', 'pending']));
