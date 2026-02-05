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
