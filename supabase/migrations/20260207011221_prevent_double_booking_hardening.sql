/*
  # Prevent Double Booking - Database Hardening

  1. Data Cleanup
    - Cancels duplicate pending_payment bookings that reference the same slot
    - Keeps the earliest booking per slot, cancels later duplicates

  2. New Indexes
    - Partial unique index on `wakala_applications(slot_id)` for non-cancelled bookings
      - Prevents two active bookings from referencing the same slot
      - Only applies when slot_id is not null and status is not 'cancelled'

  3. New Functions
    - `reserve_two_consecutive_slots(p_slot_id_1, p_slot_id_2)`
      - Atomically reserves two consecutive slots in a single transaction
      - Uses SELECT ... FOR UPDATE row-level locking on both slots
      - Returns success/failure with details
      - Eliminates the race window that existed when making two separate RPC calls

  4. Realtime
    - Enables Supabase Realtime publication on `availability_slots` table
      - Allows frontend clients to subscribe to live slot availability changes

  5. Important Notes
    - The partial unique index uses a WHERE clause to only enforce uniqueness
      on active (non-cancelled) bookings, so cancelled bookings do not block
      future use of the same slot
    - The two-slot reservation function locks both rows before checking
      availability, preventing any interleaving with other transactions
*/

-- 1. Clean up duplicate slot references: keep earliest per slot, cancel the rest
UPDATE wakala_applications
SET status = 'cancelled',
    cancelled_at = now()
WHERE id IN (
  SELECT unnest(app_ids[2:]) FROM (
    SELECT slot_id,
           array_agg(id ORDER BY created_at) as app_ids
    FROM wakala_applications
    WHERE slot_id IS NOT NULL
      AND status NOT IN ('cancelled')
    GROUP BY slot_id
    HAVING count(*) > 1
  ) dupes
);

-- 2. Partial unique index: only one active booking per slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_wakala_applications_active_slot
  ON wakala_applications (slot_id)
  WHERE slot_id IS NOT NULL AND status NOT IN ('cancelled');

-- 3. Atomic function to reserve two consecutive slots (for 60-minute bookings)
CREATE OR REPLACE FUNCTION reserve_two_consecutive_slots(
  p_slot_id_1 UUID,
  p_slot_id_2 UUID
) RETURNS JSONB AS $$
DECLARE
  v_slot1_available BOOLEAN;
  v_slot2_available BOOLEAN;
BEGIN
  SELECT is_available INTO v_slot1_available
  FROM availability_slots
  WHERE id = p_slot_id_1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'First slot not found'
    );
  END IF;

  SELECT is_available INTO v_slot2_available
  FROM availability_slots
  WHERE id = p_slot_id_2
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Second slot not found'
    );
  END IF;

  IF v_slot1_available = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'First slot is no longer available',
      'failed_slot', 1
    );
  END IF;

  IF v_slot2_available = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Second slot is no longer available',
      'failed_slot', 2
    );
  END IF;

  UPDATE availability_slots
  SET is_available = false
  WHERE id IN (p_slot_id_1, p_slot_id_2);

  RETURN jsonb_build_object(
    'success', true,
    'slot_id_1', p_slot_id_1,
    'slot_id_2', p_slot_id_2
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reserve_two_consecutive_slots IS 'Atomically reserves two consecutive availability slots using row-level locking for 60-minute bookings';

-- 4. Enable Realtime on availability_slots
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'availability_slots'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE availability_slots;
  END IF;
END $$;
