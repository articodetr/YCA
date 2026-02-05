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