/*
  # Integrate Wakala Applications with Booking System

  ## Overview
  Updates the wakala_applications table to integrate with the new booking system while preserving all existing data.

  ## Changes
  
  ### Updates to `wakala_applications`
  - Add `slot_id` (uuid, optional) - Reference to booked time slot
  - Add `start_time` (time, optional) - Start time of appointment
  - Add `end_time` (time, optional) - End time of appointment
  - Keep all existing fields for backward compatibility
  
  ## Notes
  - This migration maintains backward compatibility with existing applications
  - New applications will use the booking system integration
  - Old applications without slot_id will still work
*/

-- Add new columns to wakala_applications for booking system integration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'slot_id'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN slot_id uuid REFERENCES availability_slots(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN start_time time;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN end_time time;
  END IF;
END $$;

-- Create index for faster slot lookups
CREATE INDEX IF NOT EXISTS idx_wakala_applications_slot ON wakala_applications(slot_id);

-- Ensure Wakala Services exist in booking_services
INSERT INTO booking_services (name_en, name_ar, duration_minutes, is_active)
VALUES ('Wakala Services', 'خدمات الوكالة', 60, true)
ON CONFLICT DO NOTHING;