/*
  # Working Hours Configuration and Booking System Enhancement
  
  ## Overview
  Creates working hours configuration system and enhances wakala booking integration.
  
  ## New Tables
  
  ### `working_hours_config`
  - Stores working hours for each day of the week
  - Configurable start/end times and slot intervals
  - Default: Mon-Thu (10:00-14:30), Fri (9:00-11:30), 30-min intervals
  
  ## Modifications to Existing Tables
  
  ### `wakala_applications`
  - Added booking-related fields:
    - `booking_date` (date) - The appointment date
    - `slot_id` (uuid) - Reference to availability_slots
    - `start_time` (time) - Appointment start time
    - `end_time` (time) - Appointment end time
    - `duration_minutes` (integer) - 30 or 60 minutes
    - `cancelled_at` (timestamptz) - When booking was cancelled
    - `cancelled_by_user` (boolean) - Whether user cancelled
  
  ## Functions
  
  ### `generate_availability_slots`
  - Automatically generates time slots based on working hours config
  - Creates 30-minute intervals for each working day
  - Can be called manually or scheduled
  
  ## Security
  - RLS enabled on working_hours_config
  - Only admins can modify working hours
  - Public can view working hours
  
  ## Default Data
  - Monday to Thursday: 10:00 - 14:30 (last appointment at 14:00)
  - Friday: 9:00 - 11:30 (last appointment at 11:00)
  - Saturday & Sunday: Closed
  - 30-minute slot intervals
*/

-- Create working_hours_config table
CREATE TABLE IF NOT EXISTS working_hours_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  day_name_en text NOT NULL,
  day_name_ar text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  last_appointment_time time NOT NULL,
  slot_interval_minutes integer NOT NULL DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(day_of_week)
);

-- Add booking-related columns to wakala_applications
DO $$
BEGIN
  -- Add booking_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'booking_date'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN booking_date date;
  END IF;

  -- Add slot_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'slot_id'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN slot_id uuid REFERENCES availability_slots(id) ON DELETE SET NULL;
  END IF;

  -- Add start_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN start_time time;
  END IF;

  -- Add end_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN end_time time;
  END IF;

  -- Add duration_minutes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN duration_minutes integer CHECK (duration_minutes IN (30, 60));
  END IF;

  -- Add cancelled_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN cancelled_at timestamptz;
  END IF;

  -- Add cancelled_by_user column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'cancelled_by_user'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN cancelled_by_user boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS on working_hours_config
ALTER TABLE working_hours_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for working_hours_config
CREATE POLICY "Anyone can view working hours"
  ON working_hours_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage working hours"
  ON working_hours_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  );

-- Insert default working hours
INSERT INTO working_hours_config (
  day_of_week, day_name_en, day_name_ar, 
  start_time, end_time, last_appointment_time, 
  slot_interval_minutes, is_active
) VALUES
  (1, 'Monday', 'الاثنين', '10:00:00', '14:30:00', '14:00:00', 30, true),
  (2, 'Tuesday', 'الثلاثاء', '10:00:00', '14:30:00', '14:00:00', 30, true),
  (3, 'Wednesday', 'الأربعاء', '10:00:00', '14:30:00', '14:00:00', 30, true),
  (4, 'Thursday', 'الخميس', '10:00:00', '14:30:00', '14:00:00', 30, true),
  (5, 'Friday', 'الجمعة', '09:00:00', '11:30:00', '11:00:00', 30, true),
  (6, 'Saturday', 'السبت', '10:00:00', '14:00:00', '14:00:00', 30, false),
  (7, 'Sunday', 'الأحد', '10:00:00', '14:00:00', '14:00:00', 30, false)
ON CONFLICT (day_of_week) DO NOTHING;

-- Create function to generate availability slots automatically
CREATE OR REPLACE FUNCTION generate_availability_slots_auto(
  p_service_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS integer AS $$
DECLARE
  v_current_date date;
  v_day_of_week integer;
  v_working_hours record;
  v_current_time time;
  v_slots_created integer := 0;
BEGIN
  -- Loop through each date in the range
  v_current_date := p_start_date;
  
  WHILE v_current_date <= p_end_date LOOP
    -- Get day of week (1=Monday, 7=Sunday)
    v_day_of_week := EXTRACT(ISODOW FROM v_current_date);
    
    -- Get working hours for this day
    SELECT * INTO v_working_hours
    FROM working_hours_config
    WHERE day_of_week = v_day_of_week AND is_active = true;
    
    -- If day is active, generate slots
    IF FOUND THEN
      v_current_time := v_working_hours.start_time;
      
      -- Generate slots until last appointment time
      WHILE v_current_time <= v_working_hours.last_appointment_time LOOP
        -- Insert slot if it doesn't exist
        INSERT INTO availability_slots (
          service_id, date, start_time, end_time, is_available, is_blocked_by_admin
        )
        VALUES (
          p_service_id,
          v_current_date,
          v_current_time,
          v_current_time + (v_working_hours.slot_interval_minutes || ' minutes')::interval,
          true,
          false
        )
        ON CONFLICT (service_id, date, start_time) DO NOTHING;
        
        v_slots_created := v_slots_created + 1;
        
        -- Move to next slot
        v_current_time := v_current_time + (v_working_hours.slot_interval_minutes || ' minutes')::interval;
      END LOOP;
    END IF;
    
    -- Move to next day
    v_current_date := v_current_date + 1;
  END LOOP;
  
  RETURN v_slots_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wakala_applications_booking_date ON wakala_applications(booking_date);
CREATE INDEX IF NOT EXISTS idx_wakala_applications_slot_id ON wakala_applications(slot_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_day ON working_hours_config(day_of_week);

-- Update RLS policies for wakala_applications to allow cancellations
DO $$
BEGIN
  -- Drop existing update policy if it exists
  DROP POLICY IF EXISTS "Members can update their own wakala applications" ON wakala_applications;
  
  -- Create new update policy
  CREATE POLICY "Members can update their own wakala applications"
    ON wakala_applications FOR UPDATE
    TO authenticated
    USING (member_id = auth.uid())
    WITH CHECK (member_id = auth.uid());
END $$;