/*
  # Admin dashboard service statistics (Advisory Office + Wakala)

  This migration adds an RPC function that returns aggregated dashboard stats
  for the Advisory Office (calendar bookings) and Wakala services (paid only).

  Notes
  - Wakala stats intentionally include ONLY paid/completed payments.
  - Advisory bookings are identified by `service_type` starting with 'advisory'.
  - Soft-deleted records (status = 'deleted_by_admin') are excluded.
  - Function is restricted to authenticated, active admins.
*/

CREATE OR REPLACE FUNCTION public.get_admin_service_stats(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
  _start date;
  _end date;
  _days integer;

  _advisory_total_range bigint;
  _advisory_completed_range bigint;
  _advisory_cancelled_range bigint;
  _advisory_no_show_range bigint;
  _advisory_upcoming bigint;

  _wakala_paid_total_range bigint;
  _wakala_open_paid bigint;
  _wakala_completed_paid_range bigint;
  _wakala_rejected_paid_range bigint;
  _wakala_revenue_range numeric;

  _advisory_series jsonb;
  _wakala_series jsonb;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.admins a
    WHERE a.id = _uid
      AND a.is_active = true
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  _end := COALESCE(end_date, CURRENT_DATE);
  _start := COALESCE(start_date, (_end - 29));
  IF _start > _end THEN
    RAISE EXCEPTION 'Invalid date range';
  END IF;
  _days := (_end - _start) + 1;

  /* Advisory Office (range = bookings created within range; upcoming = future appointments) */
  SELECT
    COUNT(*) FILTER (
      WHERE wa.created_at::date BETWEEN _start AND _end
    ),
    COUNT(*) FILTER (
      WHERE wa.created_at::date BETWEEN _start AND _end
        AND wa.status = 'completed'
    ),
    COUNT(*) FILTER (
      WHERE wa.created_at::date BETWEEN _start AND _end
        AND wa.status = 'cancelled'
    ),
    COUNT(*) FILTER (
      WHERE wa.created_at::date BETWEEN _start AND _end
        AND wa.status = 'no_show'
    ),
    COUNT(*) FILTER (
      WHERE wa.booking_date IS NOT NULL
        AND wa.booking_date >= CURRENT_DATE
        AND wa.status = ANY (ARRAY['submitted','in_progress'])
    )
  INTO
    _advisory_total_range,
    _advisory_completed_range,
    _advisory_cancelled_range,
    _advisory_no_show_range,
    _advisory_upcoming
  FROM public.wakala_applications wa
  WHERE wa.status IS DISTINCT FROM 'deleted_by_admin'
    AND wa.service_type IS NOT NULL
    AND wa.service_type LIKE 'advisory%';

  WITH days AS (
    SELECT generate_series(_start, _end, interval '1 day')::date AS d
  ),
  counts AS (
    SELECT wa.created_at::date AS d, COUNT(*)::int AS c
    FROM public.wakala_applications wa
    WHERE wa.status IS DISTINCT FROM 'deleted_by_admin'
      AND wa.service_type IS NOT NULL
      AND wa.service_type LIKE 'advisory%'
      AND wa.created_at::date BETWEEN _start AND _end
    GROUP BY 1
  )
  SELECT jsonb_agg(
    jsonb_build_object('date', days.d::text, 'count', COALESCE(counts.c, 0))
    ORDER BY days.d
  )
  INTO _advisory_series
  FROM days
  LEFT JOIN counts ON counts.d = days.d;

  /* Wakala (paid only) */
  SELECT
    COUNT(*) FILTER (
      WHERE wa.created_at::date BETWEEN _start AND _end
    ),
    COUNT(*) FILTER (
      WHERE wa.status = ANY (ARRAY['submitted','in_progress','approved'])
    ),
    COUNT(*) FILTER (
      WHERE wa.created_at::date BETWEEN _start AND _end
        AND wa.status = ANY (ARRAY['completed','approved'])
    ),
    COUNT(*) FILTER (
      WHERE wa.created_at::date BETWEEN _start AND _end
        AND wa.status = 'rejected'
    ),
    COALESCE(SUM(wa.fee_amount) FILTER (
      WHERE wa.created_at::date BETWEEN _start AND _end
    ), 0)
  INTO
    _wakala_paid_total_range,
    _wakala_open_paid,
    _wakala_completed_paid_range,
    _wakala_rejected_paid_range,
    _wakala_revenue_range
  FROM public.wakala_applications wa
  WHERE wa.status IS DISTINCT FROM 'deleted_by_admin'
    AND wa.wakala_type IS NOT NULL
    AND lower(COALESCE(wa.payment_status, '')) = ANY (ARRAY['paid','completed']);

  WITH days AS (
    SELECT generate_series(_start, _end, interval '1 day')::date AS d
  ),
  counts AS (
    SELECT wa.created_at::date AS d, COUNT(*)::int AS c
    FROM public.wakala_applications wa
    WHERE wa.status IS DISTINCT FROM 'deleted_by_admin'
      AND wa.wakala_type IS NOT NULL
      AND lower(COALESCE(wa.payment_status, '')) = ANY (ARRAY['paid','completed'])
      AND wa.created_at::date BETWEEN _start AND _end
    GROUP BY 1
  )
  SELECT jsonb_agg(
    jsonb_build_object('date', days.d::text, 'count', COALESCE(counts.c, 0))
    ORDER BY days.d
  )
  INTO _wakala_series
  FROM days
  LEFT JOIN counts ON counts.d = days.d;

  RETURN jsonb_build_object(
    'range', jsonb_build_object('start', _start::text, 'end', _end::text, 'days', _days),
    'advisory', jsonb_build_object(
      'total_range', COALESCE(_advisory_total_range, 0),
      'upcoming', COALESCE(_advisory_upcoming, 0),
      'completed_range', COALESCE(_advisory_completed_range, 0),
      'cancelled_range', COALESCE(_advisory_cancelled_range, 0),
      'no_show_range', COALESCE(_advisory_no_show_range, 0),
      'series', COALESCE(_advisory_series, '[]'::jsonb)
    ),
    'wakala', jsonb_build_object(
      'paid_total_range', COALESCE(_wakala_paid_total_range, 0),
      'open_paid', COALESCE(_wakala_open_paid, 0),
      'completed_paid_range', COALESCE(_wakala_completed_paid_range, 0),
      'rejected_paid_range', COALESCE(_wakala_rejected_paid_range, 0),
      'revenue_range', COALESCE(_wakala_revenue_range, 0),
      'series', COALESCE(_wakala_series, '[]'::jsonb)
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_service_stats(date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_service_stats(date, date) TO authenticated;
