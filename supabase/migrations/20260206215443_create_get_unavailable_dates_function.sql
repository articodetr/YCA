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
