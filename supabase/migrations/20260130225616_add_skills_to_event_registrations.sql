/*
  # Add skills column to event_registrations table

  1. Changes
    - Add `skills` column to `event_registrations` table
      - Type: text
      - Nullable: true
      - Description: Stores the skills of the person registering for the event
  
  2. Notes
    - This field is optional and allows registrants to list their skills when signing up for events
    - No data migration needed as table is currently empty
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'skills'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN skills text;
  END IF;
END $$;