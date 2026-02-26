/*
  Add a structured JSON field to store per-attendee details for paid event registrations.
  This enables requiring full attendee info (name + age) for each ticket and exporting per event.
*/

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS attendees_details jsonb;

-- Optional: small description for clarity
COMMENT ON COLUMN event_registrations.attendees_details IS 'Array of attendee objects: {ticket_type, first_name, last_name, full_name, age}';

-- Refresh PostgREST schema cache (safe no-op if function not present)
DO $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
EXCEPTION WHEN others THEN
  -- ignore
END $$;
