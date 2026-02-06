/*
  # Add event registration fields

  1. Modified Tables
    - `event_registrations`
      - `is_member` (boolean, nullable) - Whether registrant is a YCA member
      - `emergency_contact_name` (text, nullable) - Emergency contact name
      - `emergency_contact_phone` (text, nullable) - Emergency contact phone

  2. Modified Tables
    - `wakala_applications`
      - `applicant_name` (text, nullable) - Name of the person granting power of attorney
      - `agent_name` (text, nullable) - Name of the agent
      - `wakala_type` (text, nullable) - Type of wakala
      - `wakala_format` (text, nullable) - Format of the wakala document

  3. Important Notes
    - All new columns are nullable to avoid breaking existing records
    - Emergency contact fields are used for children and youth events
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'is_member'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN is_member boolean;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'emergency_contact_name'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN emergency_contact_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'emergency_contact_phone'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN emergency_contact_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'applicant_name'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN applicant_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'agent_name'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN agent_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'wakala_type'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN wakala_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'wakala_format'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN wakala_format text;
  END IF;
END $$;
