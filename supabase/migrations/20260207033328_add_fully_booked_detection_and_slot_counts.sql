/*
  # Add Fully Booked Day Detection and Public Slot Counts

  1. Modified Functions
    - `get_unavailable_dates` - Updated to also detect days where slots exist
      but ALL are booked (is_available = false). These days now return with
      reason 'fully_booked' so the frontend can distinguish them from holidays,
      blocked dates, and inactive days.

  2. New Functions
    - `get_public_slot_counts(p_service_id, p_start_date, p_end_date)` - Returns
      the count of available slots per date for a given service. Used by the
      calendar to show a badge with remaining appointments on each day.
      - Uses SECURITY DEFINER to allow public access
      - Returns: slot_date, available_count

  3. Security
    - Both functions use SECURITY DEFINER to bypass RLS
    - Only aggregated counts are exposed, no sensitive data
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

    UNION

    SELECT asd.slot_date AS unavailable_date, 'fully_booked'::text AS reason
    FROM (
      SELECT avs.date AS slot_date,
             count(*) AS total_slots,
             count(*) FILTER (WHERE avs.is_available = true AND avs.is_blocked_by_admin = false) AS available_slots
      FROM availability_slots avs
      WHERE avs.date BETWEEN p_start_date AND p_end_date
      GROUP BY avs.date
      HAVING count(*) FILTER (WHERE avs.is_available = true AND avs.is_blocked_by_admin = false) = 0
    ) asd

    ORDER BY unavailable_date;
END;
$$;


CREATE OR REPLACE FUNCTION get_public_slot_counts(
  p_service_id UUID,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(slot_date date, available_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT avs.date AS slot_date,
           count(*) FILTER (WHERE avs.is_available = true AND avs.is_blocked_by_admin = false) AS available_count
    FROM availability_slots avs
    WHERE avs.service_id = p_service_id
      AND avs.date BETWEEN p_start_date AND p_end_date
    GROUP BY avs.date
    ORDER BY avs.date;
END;
$$;
