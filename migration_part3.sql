-- ========== Migration: 20260205165329_create_working_hours_config.sql ==========
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
-- ========== Migration: 20260205174355_create_availability_management_enhancements.sql ==========
/*
  # Availability Management System Enhancements

  1. New Tables
    - `blocked_dates` - Tracks dates that are completely blocked (holidays, off days)
      - `id` (uuid, primary key)
      - `date` (date, unique)
      - `reason_en` (text)
      - `reason_ar` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references admins)

  2. Functions
    - `regenerate_slots_for_date` - Regenerates availability slots for a specific date
    - `regenerate_slots_bulk` - Regenerates slots for multiple dates
    - `get_availability_stats` - Returns statistics about available/booked slots per date

  3. Security
    - Enable RLS on `blocked_dates` table
    - Add policies for admin access only
*/

-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  reason_en text NOT NULL,
  reason_ar text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admins(id)
);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view blocked dates" ON blocked_dates;
  DROP POLICY IF EXISTS "Admins can insert blocked dates" ON blocked_dates;
  DROP POLICY IF EXISTS "Admins can delete blocked dates" ON blocked_dates;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Admin can view all blocked dates
CREATE POLICY "Admins can view blocked dates"
  ON blocked_dates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Admin can insert blocked dates
CREATE POLICY "Admins can insert blocked dates"
  ON blocked_dates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Admin can delete blocked dates
CREATE POLICY "Admins can delete blocked dates"
  ON blocked_dates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Function to regenerate slots for a specific date and service
CREATE OR REPLACE FUNCTION regenerate_slots_for_date(
  p_service_id uuid,
  p_date date
)
RETURNS TABLE(slots_created integer, slots_preserved integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_day_of_week integer;
  v_start_time time;
  v_end_time time;
  v_last_appointment_time time;
  v_slot_interval integer;
  v_is_active boolean;
  v_current_time time;
  v_slots_created integer := 0;
  v_slots_preserved integer := 0;
  v_duration integer;
BEGIN
  -- Get day of week (1=Monday, 7=Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  IF v_day_of_week = 0 THEN
    v_day_of_week := 7;
  END IF;

  -- Check if date is blocked
  IF EXISTS (SELECT 1 FROM blocked_dates WHERE date = p_date) THEN
    DELETE FROM availability_slots
    WHERE service_id = p_service_id
      AND date = p_date
      AND NOT EXISTS (
        SELECT 1 FROM wakala_applications
        WHERE wakala_applications.slot_id = availability_slots.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.slot_id = availability_slots.id
      );

    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  -- Get working hours configuration for this day
  SELECT start_time, end_time, last_appointment_time, slot_interval_minutes, is_active
  INTO v_start_time, v_end_time, v_last_appointment_time, v_slot_interval, v_is_active
  FROM working_hours_config
  WHERE day_of_week = v_day_of_week;

  -- If day is not active or no config found, delete non-booked slots
  IF NOT FOUND OR NOT v_is_active THEN
    DELETE FROM availability_slots
    WHERE service_id = p_service_id
      AND date = p_date
      AND NOT EXISTS (
        SELECT 1 FROM wakala_applications
        WHERE wakala_applications.slot_id = availability_slots.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.slot_id = availability_slots.id
      );

    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  -- Count preserved slots (booked ones)
  SELECT COUNT(*) INTO v_slots_preserved
  FROM availability_slots
  WHERE service_id = p_service_id
    AND date = p_date
    AND (
      EXISTS (
        SELECT 1 FROM wakala_applications
        WHERE wakala_applications.slot_id = availability_slots.id
      )
      OR EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.slot_id = availability_slots.id
      )
    );

  -- Delete old non-booked slots for this date
  DELETE FROM availability_slots
  WHERE service_id = p_service_id
    AND date = p_date
    AND NOT EXISTS (
      SELECT 1 FROM wakala_applications
      WHERE wakala_applications.slot_id = availability_slots.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.slot_id = availability_slots.id
    );

  -- Get service duration
  SELECT duration_minutes INTO v_duration
  FROM booking_services
  WHERE id = p_service_id;

  -- Generate new slots
  v_current_time := v_start_time;
  WHILE v_current_time <= v_last_appointment_time LOOP
    IF NOT EXISTS (
      SELECT 1 FROM availability_slots
      WHERE service_id = p_service_id
        AND date = p_date
        AND start_time = v_current_time
    ) THEN
      INSERT INTO availability_slots (service_id, date, start_time, end_time, is_available)
      VALUES (
        p_service_id,
        p_date,
        v_current_time,
        v_current_time + (v_duration || ' minutes')::interval,
        true
      );
      v_slots_created := v_slots_created + 1;
    END IF;

    v_current_time := v_current_time + (v_slot_interval || ' minutes')::interval;
  END LOOP;

  RETURN QUERY SELECT v_slots_created, v_slots_preserved;
END;
$$;

-- Function to regenerate slots for multiple dates
CREATE OR REPLACE FUNCTION regenerate_slots_bulk(
  p_service_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(total_slots_created integer, total_slots_preserved integer, dates_processed integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_date date;
  v_total_created integer := 0;
  v_total_preserved integer := 0;
  v_dates_count integer := 0;
  v_created integer;
  v_preserved integer;
BEGIN
  v_current_date := p_start_date;

  WHILE v_current_date <= p_end_date LOOP
    SELECT * INTO v_created, v_preserved
    FROM regenerate_slots_for_date(p_service_id, v_current_date);

    v_total_created := v_total_created + v_created;
    v_total_preserved := v_total_preserved + v_preserved;
    v_dates_count := v_dates_count + 1;

    v_current_date := v_current_date + interval '1 day';
  END LOOP;

  RETURN QUERY SELECT v_total_created, v_total_preserved, v_dates_count;
END;
$$;

-- Function to get availability statistics for a date range
CREATE OR REPLACE FUNCTION get_availability_stats(
  p_service_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(
  date date,
  day_name_en text,
  day_name_ar text,
  total_slots integer,
  available_slots integer,
  booked_slots integer,
  blocked_slots integer,
  is_blocked boolean,
  blocked_reason_en text,
  blocked_reason_ar text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date AS slot_date
  ),
  slot_stats AS (
    SELECT
      ds.slot_date,
      COUNT(avs.id) AS total_slots,
      COUNT(avs.id) FILTER (WHERE avs.is_available AND NOT avs.is_blocked_by_admin) AS available_slots,
      COUNT(avs.id) FILTER (WHERE NOT avs.is_available) AS booked_slots,
      COUNT(avs.id) FILTER (WHERE avs.is_blocked_by_admin) AS blocked_slots
    FROM date_series ds
    LEFT JOIN availability_slots avs ON avs.date = ds.slot_date AND avs.service_id = p_service_id
    GROUP BY ds.slot_date
  ),
  working_hours AS (
    SELECT
      day_of_week,
      day_name_en,
      day_name_ar
    FROM working_hours_config
  )
  SELECT
    ss.slot_date,
    wh.day_name_en,
    wh.day_name_ar,
    COALESCE(ss.total_slots, 0)::integer,
    COALESCE(ss.available_slots, 0)::integer,
    COALESCE(ss.booked_slots, 0)::integer,
    COALESCE(ss.blocked_slots, 0)::integer,
    COALESCE(bd.date IS NOT NULL, false) AS is_blocked,
    bd.reason_en,
    bd.reason_ar
  FROM slot_stats ss
  LEFT JOIN working_hours wh ON wh.day_of_week = CASE
    WHEN EXTRACT(DOW FROM ss.slot_date) = 0 THEN 7
    ELSE EXTRACT(DOW FROM ss.slot_date)::integer
  END
  LEFT JOIN blocked_dates bd ON bd.date = ss.slot_date
  ORDER BY ss.slot_date;
END;
$$;
-- ========== Migration: 20260205200413_create_day_specific_hours_table.sql ==========
/*
  # Day-Specific Hours Configuration

  1. New Tables
    - `day_specific_hours` - Stores working hours overrides for specific dates
      - `id` (uuid, primary key)
      - `date` (date, unique) - The specific date for this configuration
      - `start_time` (time) - Start time for this date
      - `end_time` (time) - End time for this date
      - `last_appointment_time` (time) - Last appointment time for this date
      - `slot_interval_minutes` (integer) - Duration between slots in minutes
      - `break_times` (jsonb) - Array of break time periods [{"start": "12:00", "end": "13:00"}]
      - `is_holiday` (boolean) - Whether this date is a holiday (no slots)
      - `holiday_reason_en` (text) - Reason for holiday in English
      - `holiday_reason_ar` (text) - Reason for holiday in Arabic
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references admins)

  2. Functions
    - Update `regenerate_slots_for_date` to check day-specific hours first
    - Add function to get effective working hours for any date

  3. Security
    - Enable RLS on `day_specific_hours` table
    - Add policies for admin access only
*/

-- Create day_specific_hours table
CREATE TABLE IF NOT EXISTS day_specific_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  start_time time NOT NULL DEFAULT '09:00:00',
  end_time time NOT NULL DEFAULT '17:00:00',
  last_appointment_time time NOT NULL DEFAULT '16:30:00',
  slot_interval_minutes integer NOT NULL DEFAULT 30,
  break_times jsonb DEFAULT '[]'::jsonb,
  is_holiday boolean DEFAULT false,
  holiday_reason_en text,
  holiday_reason_ar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admins(id)
);

-- Enable RLS
ALTER TABLE day_specific_hours ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view day specific hours" ON day_specific_hours;
  DROP POLICY IF EXISTS "Admins can insert day specific hours" ON day_specific_hours;
  DROP POLICY IF EXISTS "Admins can update day specific hours" ON day_specific_hours;
  DROP POLICY IF EXISTS "Admins can delete day specific hours" ON day_specific_hours;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Admin can view all day specific hours
CREATE POLICY "Admins can view day specific hours"
  ON day_specific_hours FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Admin can insert day specific hours
CREATE POLICY "Admins can insert day specific hours"
  ON day_specific_hours FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Admin can update day specific hours
CREATE POLICY "Admins can update day specific hours"
  ON day_specific_hours FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Admin can delete day specific hours
CREATE POLICY "Admins can delete day specific hours"
  ON day_specific_hours FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.id = auth.uid()
    )
  );

-- Function to get effective working hours for a specific date
CREATE OR REPLACE FUNCTION get_effective_working_hours(p_date date)
RETURNS TABLE(
  start_time time,
  end_time time,
  last_appointment_time time,
  slot_interval_minutes integer,
  is_active boolean,
  break_times jsonb,
  is_holiday boolean,
  holiday_reason_en text,
  holiday_reason_ar text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_day_of_week integer;
BEGIN
  -- Check if there's a day-specific configuration
  IF EXISTS (SELECT 1 FROM day_specific_hours WHERE date = p_date) THEN
    RETURN QUERY
    SELECT
      dsh.start_time,
      dsh.end_time,
      dsh.last_appointment_time,
      dsh.slot_interval_minutes,
      NOT dsh.is_holiday AS is_active,
      dsh.break_times,
      dsh.is_holiday,
      dsh.holiday_reason_en,
      dsh.holiday_reason_ar
    FROM day_specific_hours dsh
    WHERE dsh.date = p_date;
  ELSE
    -- Get day of week (1=Monday, 7=Sunday)
    v_day_of_week := EXTRACT(DOW FROM p_date);
    IF v_day_of_week = 0 THEN
      v_day_of_week := 7;
    END IF;

    -- Return default working hours for this day of week
    RETURN QUERY
    SELECT
      whc.start_time,
      whc.end_time,
      whc.last_appointment_time,
      whc.slot_interval_minutes,
      whc.is_active,
      '[]'::jsonb AS break_times,
      false AS is_holiday,
      NULL::text AS holiday_reason_en,
      NULL::text AS holiday_reason_ar
    FROM working_hours_config whc
    WHERE whc.day_of_week = v_day_of_week;
  END IF;
END;
$$;

-- Update regenerate_slots_for_date to use day-specific hours
CREATE OR REPLACE FUNCTION regenerate_slots_for_date(
  p_service_id uuid,
  p_date date
)
RETURNS TABLE(slots_created integer, slots_preserved integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_time time;
  v_end_time time;
  v_last_appointment_time time;
  v_slot_interval integer;
  v_is_active boolean;
  v_break_times jsonb;
  v_is_holiday boolean;
  v_current_time time;
  v_slots_created integer := 0;
  v_slots_preserved integer := 0;
  v_duration integer;
  v_break_start time;
  v_break_end time;
  v_is_in_break boolean;
  v_break_period jsonb;
BEGIN
  -- Get effective working hours for this date (day-specific or default)
  SELECT * INTO v_start_time, v_end_time, v_last_appointment_time, v_slot_interval, v_is_active, v_break_times, v_is_holiday
  FROM get_effective_working_hours(p_date);

  -- If day is a holiday or not active, delete non-booked slots
  IF NOT FOUND OR NOT v_is_active OR v_is_holiday THEN
    DELETE FROM availability_slots
    WHERE service_id = p_service_id
      AND date = p_date
      AND NOT EXISTS (
        SELECT 1 FROM wakala_applications
        WHERE wakala_applications.slot_id = availability_slots.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.slot_id = availability_slots.id
      );

    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  -- Count preserved slots (booked ones)
  SELECT COUNT(*) INTO v_slots_preserved
  FROM availability_slots
  WHERE service_id = p_service_id
    AND date = p_date
    AND (
      EXISTS (
        SELECT 1 FROM wakala_applications
        WHERE wakala_applications.slot_id = availability_slots.id
      )
      OR EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.slot_id = availability_slots.id
      )
    );

  -- Delete old non-booked slots for this date
  DELETE FROM availability_slots
  WHERE service_id = p_service_id
    AND date = p_date
    AND NOT EXISTS (
      SELECT 1 FROM wakala_applications
      WHERE wakala_applications.slot_id = availability_slots.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.slot_id = availability_slots.id
    );

  -- Get service duration
  SELECT duration_minutes INTO v_duration
  FROM booking_services
  WHERE id = p_service_id;

  -- Generate new slots, skipping break times
  v_current_time := v_start_time;
  WHILE v_current_time <= v_last_appointment_time LOOP
    -- Check if current time falls within any break period
    v_is_in_break := false;

    IF v_break_times IS NOT NULL AND jsonb_array_length(v_break_times) > 0 THEN
      FOR v_break_period IN SELECT * FROM jsonb_array_elements(v_break_times)
      LOOP
        v_break_start := (v_break_period->>'start')::time;
        v_break_end := (v_break_period->>'end')::time;

        IF v_current_time >= v_break_start AND v_current_time < v_break_end THEN
          v_is_in_break := true;
          EXIT;
        END IF;
      END LOOP;
    END IF;

    -- Only create slot if not in break time and slot doesn't exist
    IF NOT v_is_in_break AND NOT EXISTS (
      SELECT 1 FROM availability_slots
      WHERE service_id = p_service_id
        AND date = p_date
        AND start_time = v_current_time
    ) THEN
      INSERT INTO availability_slots (service_id, date, start_time, end_time, is_available)
      VALUES (
        p_service_id,
        p_date,
        v_current_time,
        v_current_time + (v_duration || ' minutes')::interval,
        true
      );
      v_slots_created := v_slots_created + 1;
    END IF;

    v_current_time := v_current_time + (v_slot_interval || ' minutes')::interval;
  END LOOP;

  RETURN QUERY SELECT v_slots_created, v_slots_preserved;
END;
$$;
-- ========== Migration: 20260205212021_add_business_support_tiers.sql ==========
/*
  # Add Business Support Tiers and Payment Options

  ## Overview
  This migration adds support for Business Support membership tiers (Bronze, Silver, Gold)
  and flexible payment options (annual packages, monthly support, one-time contributions).

  ## Changes to Tables

  ### membership_applications
  - Add `business_support_tier` - Track the chosen tier (bronze, silver, gold, monthly, one_time)
  - Add `custom_amount` - Store custom donation amounts
  - Add `payment_frequency` - Track payment frequency (annual, monthly, one_time)

  ### members
  - Add `business_support_tier` - Active support tier for the member
  - Add `custom_amount` - Active custom amount
  - Add `payment_frequency` - Active payment frequency
  - Add `next_renewal_date` - Track next renewal for monthly subscriptions

  ## Security
  - Existing RLS policies will apply
  - No new policies needed as these are additional fields on existing tables
*/

-- Add business support fields to membership_applications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'business_support_tier'
  ) THEN
    ALTER TABLE membership_applications
    ADD COLUMN business_support_tier text CHECK (
      business_support_tier IS NULL OR
      business_support_tier IN ('bronze', 'silver', 'gold', 'monthly', 'one_time')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'custom_amount'
  ) THEN
    ALTER TABLE membership_applications
    ADD COLUMN custom_amount numeric CHECK (custom_amount IS NULL OR custom_amount > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'payment_frequency'
  ) THEN
    ALTER TABLE membership_applications
    ADD COLUMN payment_frequency text CHECK (
      payment_frequency IS NULL OR
      payment_frequency IN ('annual', 'monthly', 'one_time')
    );
  END IF;
END $$;

-- Add business support fields to members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'business_support_tier'
  ) THEN
    ALTER TABLE members
    ADD COLUMN business_support_tier text CHECK (
      business_support_tier IS NULL OR
      business_support_tier IN ('bronze', 'silver', 'gold', 'monthly', 'one_time')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'custom_amount'
  ) THEN
    ALTER TABLE members
    ADD COLUMN custom_amount numeric CHECK (custom_amount IS NULL OR custom_amount > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'payment_frequency'
  ) THEN
    ALTER TABLE members
    ADD COLUMN payment_frequency text CHECK (
      payment_frequency IS NULL OR
      payment_frequency IN ('annual', 'monthly', 'one_time')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'next_renewal_date'
  ) THEN
    ALTER TABLE members
    ADD COLUMN next_renewal_date date;
  END IF;
END $$;
-- ========== Migration: 20260205222427_add_wakala_slot_foreign_key.sql ==========
/*
  # Add Foreign Key Constraint for Wakala Applications

  1. Changes
    - Add foreign key constraint between `wakala_applications.slot_id` and `availability_slots.id`
    - This enables proper JOIN operations between wakala applications and their booking slots
    - Allows admin dashboard to correctly filter and display bookings by service

  2. Important Notes
    - Uses ON DELETE SET NULL to preserve booking records if a slot is deleted
    - This ensures data integrity while maintaining booking history
*/

-- Add foreign key constraint if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'wakala_applications_slot_id_fkey'
    AND table_name = 'wakala_applications'
  ) THEN
    ALTER TABLE wakala_applications
    ADD CONSTRAINT wakala_applications_slot_id_fkey
    FOREIGN KEY (slot_id)
    REFERENCES availability_slots(id)
    ON DELETE SET NULL;
  END IF;
END $$;
-- ========== Migration: 20260206022713_prevent_duplicate_slot_bookings.sql ==========
/*
  # Prevent Duplicate Slot Bookings

  1. Functions
    - `reserve_availability_slot`: Atomic function to reserve a slot safely
    - Checks if slot is available and marks it as unavailable in one transaction
    - Returns success/failure status

  2. Triggers
    - Trigger to automatically mark slot as unavailable when booking is created
    - Trigger to restore slot availability when booking is cancelled

  3. Security
    - Uses row-level locking to prevent race conditions
    - Ensures only one booking can reserve a slot at a time
*/

-- Create function to atomically reserve a slot
CREATE OR REPLACE FUNCTION reserve_availability_slot(
  p_slot_id UUID,
  p_booking_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_slot_available BOOLEAN;
  v_result JSONB;
BEGIN
  -- Lock the slot row for update to prevent concurrent modifications
  SELECT is_available INTO v_slot_available
  FROM availability_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  -- Check if slot exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Slot not found'
    );
  END IF;

  -- Check if slot is available
  IF v_slot_available = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Slot is no longer available'
    );
  END IF;

  -- Mark slot as unavailable
  UPDATE availability_slots
  SET is_available = false
  WHERE id = p_slot_id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'slot_id', p_slot_id
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to release a slot
CREATE OR REPLACE FUNCTION release_availability_slot(
  p_slot_id UUID
) RETURNS JSONB AS $$
BEGIN
  -- Mark slot as available again
  UPDATE availability_slots
  SET is_available = true
  WHERE id = p_slot_id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'slot_id', p_slot_id
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically mark slot unavailable on booking
CREATE OR REPLACE FUNCTION mark_slot_unavailable_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Only mark unavailable for confirmed, pending, or submitted bookings
  IF NEW.slot_id IS NOT NULL AND NEW.status IN ('confirmed', 'pending', 'submitted', 'in_progress', 'pending_payment') THEN
    UPDATE availability_slots
    SET is_available = false
    WHERE id = NEW.slot_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to restore slot availability on cancellation
CREATE OR REPLACE FUNCTION restore_slot_on_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  -- If booking is cancelled, restore the slot
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' AND NEW.slot_id IS NOT NULL THEN
    UPDATE availability_slots
    SET is_available = true
    WHERE id = NEW.slot_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_mark_slot_unavailable ON wakala_applications;
DROP TRIGGER IF EXISTS trigger_restore_slot_on_cancel ON wakala_applications;

-- Create trigger on wakala_applications insert
CREATE TRIGGER trigger_mark_slot_unavailable
  AFTER INSERT ON wakala_applications
  FOR EACH ROW
  EXECUTE FUNCTION mark_slot_unavailable_on_booking();

-- Create trigger on wakala_applications update
CREATE TRIGGER trigger_restore_slot_on_cancel
  AFTER UPDATE ON wakala_applications
  FOR EACH ROW
  EXECUTE FUNCTION restore_slot_on_cancellation();

-- Add comment
COMMENT ON FUNCTION reserve_availability_slot IS 'Atomically reserves an availability slot using row-level locking to prevent race conditions';
COMMENT ON FUNCTION release_availability_slot IS 'Releases an availability slot making it available for booking again';
-- ========== Migration: 20260206215443_create_get_unavailable_dates_function.sql ==========
/*
  # Public-facing function to get unavailable dates for booking calendar

  1. New Functions
    - `get_unavailable_dates(p_start_date, p_end_date)` - Returns dates that are unavailable for booking
      - Combines holidays from `day_specific_hours` (is_holiday = true)
      - Combines blocked dates from `blocked_dates` table
      - Combines inactive weekdays from `working_hours_config`
      - Uses SECURITY DEFINER to bypass RLS so regular users can call it

  2. Security
    - Function runs with definer privileges to access admin-only tables
    - Only returns date strings - no sensitive admin data is exposed
*/

CREATE OR REPLACE FUNCTION get_unavailable_dates(
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(unavailable_date date, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT dsh.date AS unavailable_date, 'holiday'::text AS reason
    FROM day_specific_hours dsh
    WHERE dsh.is_holiday = true
      AND dsh.date BETWEEN p_start_date AND p_end_date

    UNION

    SELECT bd.date AS unavailable_date, 'blocked'::text AS reason
    FROM blocked_dates bd
    WHERE bd.date BETWEEN p_start_date AND p_end_date

    UNION

    SELECT d::date AS unavailable_date, 'inactive'::text AS reason
    FROM generate_series(p_start_date, p_end_date, '1 day'::interval) d
    WHERE EXISTS (
      SELECT 1 FROM working_hours_config whc
      WHERE whc.day_of_week = CASE
        WHEN EXTRACT(DOW FROM d) = 0 THEN 7
        ELSE EXTRACT(DOW FROM d)::integer
      END
      AND whc.is_active = false
    )
    AND NOT EXISTS (
      SELECT 1 FROM day_specific_hours dsh
      WHERE dsh.date = d::date
    )

    ORDER BY unavailable_date;
END;
$$;
-- ========== Migration: 20260206221530_fix_regenerate_slots_function.sql ==========
/*
  # Fix regenerate_slots_for_date function

  1. Bug Fix
    - Changed slot `end_time` calculation from using service duration to using slot_interval_minutes
    - Previously used `v_duration` (from booking_services.duration_minutes = 60) causing inconsistent slot sizes
    - Now uses `v_slot_interval` (from working hours config) to match the initial slot generation function
    - This ensures slots generated by admin "Save & Regenerate" match the original auto-generated slots

  2. Important Notes
    - The `generate_availability_slots_auto` function already uses slot_interval for end_time
    - This fix aligns `regenerate_slots_for_date` with the same logic
    - Existing booked slots are preserved and not affected
*/

CREATE OR REPLACE FUNCTION regenerate_slots_for_date(
  p_service_id uuid,
  p_date date
)
RETURNS TABLE(slots_created integer, slots_preserved integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_time time;
  v_end_time time;
  v_last_appointment_time time;
  v_slot_interval integer;
  v_is_active boolean;
  v_break_times jsonb;
  v_is_holiday boolean;
  v_current_time time;
  v_slots_created integer := 0;
  v_slots_preserved integer := 0;
  v_break_start time;
  v_break_end time;
  v_is_in_break boolean;
  v_break_period jsonb;
BEGIN
  SELECT * INTO v_start_time, v_end_time, v_last_appointment_time, v_slot_interval, v_is_active, v_break_times, v_is_holiday
  FROM get_effective_working_hours(p_date);

  IF NOT FOUND OR NOT v_is_active OR v_is_holiday THEN
    DELETE FROM availability_slots
    WHERE service_id = p_service_id
      AND date = p_date
      AND NOT EXISTS (
        SELECT 1 FROM wakala_applications
        WHERE wakala_applications.slot_id = availability_slots.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.slot_id = availability_slots.id
      );

    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_slots_preserved
  FROM availability_slots
  WHERE service_id = p_service_id
    AND date = p_date
    AND (
      EXISTS (
        SELECT 1 FROM wakala_applications
        WHERE wakala_applications.slot_id = availability_slots.id
      )
      OR EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.slot_id = availability_slots.id
      )
    );

  DELETE FROM availability_slots
  WHERE service_id = p_service_id
    AND date = p_date
    AND NOT EXISTS (
      SELECT 1 FROM wakala_applications
      WHERE wakala_applications.slot_id = availability_slots.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.slot_id = availability_slots.id
    );

  v_current_time := v_start_time;
  WHILE v_current_time <= v_last_appointment_time LOOP
    v_is_in_break := false;

    IF v_break_times IS NOT NULL AND jsonb_array_length(v_break_times) > 0 THEN
      FOR v_break_period IN SELECT * FROM jsonb_array_elements(v_break_times)
      LOOP
        v_break_start := (v_break_period->>'start')::time;
        v_break_end := (v_break_period->>'end')::time;

        IF v_current_time >= v_break_start AND v_current_time < v_break_end THEN
          v_is_in_break := true;
          EXIT;
        END IF;
      END LOOP;
    END IF;

    IF NOT v_is_in_break AND NOT EXISTS (
      SELECT 1 FROM availability_slots
      WHERE service_id = p_service_id
        AND date = p_date
        AND start_time = v_current_time
    ) THEN
      INSERT INTO availability_slots (service_id, date, start_time, end_time, is_available)
      VALUES (
        p_service_id,
        p_date,
        v_current_time,
        v_current_time + (v_slot_interval || ' minutes')::interval,
        true
      );
      v_slots_created := v_slots_created + 1;
    END IF;

    v_current_time := v_current_time + (v_slot_interval || ' minutes')::interval;
  END LOOP;

  RETURN QUERY SELECT v_slots_created, v_slots_preserved;
END;
$$;
-- ========== Migration: 20260206225243_add_event_registration_fields.sql ==========
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
-- ========== Migration: 20260206230048_add_event_payment_fields.sql ==========
/*
  # Add payment fields to event registrations

  1. Modified Tables
    - `event_registrations`
      - `payment_status` (text) - Payment status: pending, paid, failed
      - `payment_intent_id` (text) - Stripe payment intent ID
      - `ticket_type` (text) - Ticket type: adult, child, member
      - `amount_paid` (numeric) - Amount paid in GBP
      - `booking_reference` (text) - Unique booking reference code
      - `dietary_requirements` (text) - Dietary needs for catered events

  2. Notes
    - All new columns are nullable for backward compatibility with free events
    - Booking reference uses a unique index for fast lookups
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN payment_status text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'payment_intent_id'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN payment_intent_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'ticket_type'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN ticket_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'amount_paid'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN amount_paid numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN booking_reference text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'dietary_requirements'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN dietary_requirements text;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_booking_ref
  ON event_registrations (booking_reference)
  WHERE booking_reference IS NOT NULL;
-- ========== Migration: 20260206233739_create_wakala_documents_storage_bucket.sql ==========
/*
  # Create Wakala Documents Storage Bucket

  1. Storage
    - Create `wakala-documents` bucket for passport and document uploads
    - Bucket is public for read access (URLs shared with admins)

  2. Security
    - Authenticated users can upload files to their own folder
    - Authenticated users can read their own files
    - Admin users can read all files
    - File path pattern: `{user_id}/{timestamp}_{filename}`
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('wakala-documents', 'wakala-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload wakala documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'wakala-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own wakala documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'wakala-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own wakala documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'wakala-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
-- ========== Migration: 20260206233807_update_wakala_status_and_duration_constraints.sql ==========
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
-- ========== Migration: 20260206235851_create_page_images_and_expand_settings.sql ==========
/*
  # Create page_images table and expand site_settings

  1. New Tables
    - `page_images`
      - `id` (uuid, primary key)
      - `page_key` (text) - identifies which page (e.g., 'home', 'services', 'about_mission')
      - `image_key` (text) - identifies which image slot (e.g., 'header_bg', 'welcome_section', 'event_1')
      - `image_url` (text) - the URL of the image
      - `alt_text` (text) - alt text in English
      - `alt_text_ar` (text) - alt text in Arabic
      - `is_active` (boolean) - whether image is shown
      - `created_at` / `updated_at` (timestamptz)

  2. New site_settings entries
    - Branding: site_logo, site_logo_text
    - Organization: org_name_en, org_name_ar, org_tagline_en, org_tagline_ar, charity_number
    - Social: social_tiktok
    - Stats: stat_members, stat_programmes, stat_years, stat_impact

  3. Security
    - Enable RLS on `page_images` table
    - Admins can manage page_images
    - Public can read active page_images
*/

CREATE TABLE IF NOT EXISTS page_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  image_key text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  alt_text text DEFAULT '',
  alt_text_ar text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_key, image_key)
);

ALTER TABLE page_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active page images"
  ON page_images FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert page images"
  ON page_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true)
  );

CREATE POLICY "Admins can update page images"
  ON page_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true)
  );

CREATE POLICY "Admins can delete page images"
  ON page_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true)
  );

INSERT INTO site_settings (key, value, description) VALUES
  ('site_logo', '"/logo.png"', 'Main site logo URL'),
  ('site_logo_text', '"/logo_text.png"', 'Site text logo URL'),
  ('org_name_en', '"Yemeni Community Association"', 'Organization name in English'),
  ('org_name_ar', '"جمعية الجالية اليمنية"', 'Organization name in Arabic'),
  ('org_tagline_en', '"Empowering the Yemeni community in Birmingham"', 'Organization tagline in English'),
  ('org_tagline_ar', '"تمكين الجالية اليمنية في برمنغهام"', 'Organization tagline in Arabic'),
  ('charity_number', '"1057470"', 'Charity registration number'),
  ('social_tiktok', '"https://tiktok.com/@ycabirmingham"', 'TikTok profile URL'),
  ('stat_members', '"850"', 'Homepage stat: number of active members'),
  ('stat_programmes', '"5"', 'Homepage stat: number of core programmes'),
  ('stat_years', '"30"', 'Homepage stat: years of service'),
  ('stat_impact', '"1000"', 'Homepage stat: lives impacted')
ON CONFLICT (key) DO NOTHING;

INSERT INTO page_images (page_key, image_key, image_url, alt_text) VALUES
  ('home', 'welcome_section', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800', 'Community gathering'),
  ('home', 'events_1', 'https://images.pexels.com/photos/3184430/pexels-photo-3184430.jpeg?auto=compress&cs=tinysrgb&w=400', 'Community event'),
  ('home', 'events_2', 'https://images.pexels.com/photos/3184632/pexels-photo-3184632.jpeg?auto=compress&cs=tinysrgb&w=400', 'Community gathering'),
  ('services', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Services'),
  ('programmes', 'header_bg', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Programmes'),
  ('events', 'header_bg', 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Events'),
  ('news', 'header_bg', 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=1920', 'News'),
  ('contact', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Contact'),
  ('resources', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Resources'),
  ('about_mission', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Our Mission'),
  ('about_history', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Our History'),
  ('about_team', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Our Team'),
  ('about_partners', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Partners'),
  ('about_reports', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Reports'),
  ('donate', 'header_bg', 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Donate'),
  ('volunteer', 'header_bg', 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Volunteer'),
  ('membership', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Membership'),
  ('jobs', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Jobs'),
  ('partnerships', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Partnerships'),
  ('programmes_women', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Women Programme'),
  ('programmes_men', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Men Programme'),
  ('programmes_youth', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Youth Programme'),
  ('programmes_children', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Children Programme'),
  ('programmes_elderly', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Elderly Programme'),
  ('programmes_journey', 'header_bg', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Journey Within Programme')
ON CONFLICT (page_key, image_key) DO NOTHING;
