-- Add a field for admins to record which advisory services were actually provided during the appointment.
-- This is stored as an array of keys that match the 8 "Reason for Appointment" options.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'provided_services'
  ) THEN
    ALTER TABLE wakala_applications
      ADD COLUMN provided_services text[] DEFAULT '{}'::text[];
  END IF;
END $$;

-- Optional: refresh schema cache for PostgREST (useful if you notice the new column not showing immediately)
NOTIFY pgrst, 'reload schema';
