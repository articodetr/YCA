/*
  # Fix Reservation Functions - Add SECURITY DEFINER

  1. Modified Functions
    - `reserve_availability_slot` - Changed to SECURITY DEFINER so regular (non-admin)
      users can atomically reserve a slot. Without this, RLS policies prevent the
      UPDATE on availability_slots from succeeding for anonymous/authenticated users.
    - `reserve_two_consecutive_slots` - Same fix for 60-minute bookings.
    - `release_availability_slot` - Same fix so slot release works for all users.

  2. Security
    - SECURITY DEFINER allows the function to bypass RLS while still validating
      slot availability inside the function body.
    - Only the specific slot referenced by its UUID can be modified.

  3. Important Notes
    - This is the root cause fix for bookings appearing to succeed but not actually
      marking slots as unavailable. The function ran as SECURITY INVOKER by default,
      meaning the RLS policy on availability_slots blocked the UPDATE for non-admin callers.
*/

CREATE OR REPLACE FUNCTION reserve_availability_slot(
  p_slot_id UUID,
  p_booking_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_slot_available BOOLEAN;
BEGIN
  SELECT is_available INTO v_slot_available
  FROM availability_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
  END IF;

  IF v_slot_available = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot is no longer available');
  END IF;

  UPDATE availability_slots
  SET is_available = false
  WHERE id = p_slot_id;

  RETURN jsonb_build_object('success', true, 'slot_id', p_slot_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


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
    RETURN jsonb_build_object('success', false, 'error', 'First slot not found');
  END IF;

  SELECT is_available INTO v_slot2_available
  FROM availability_slots
  WHERE id = p_slot_id_2
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Second slot not found');
  END IF;

  IF v_slot1_available = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'First slot is no longer available', 'failed_slot', 1);
  END IF;

  IF v_slot2_available = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Second slot is no longer available', 'failed_slot', 2);
  END IF;

  UPDATE availability_slots
  SET is_available = false
  WHERE id IN (p_slot_id_1, p_slot_id_2);

  RETURN jsonb_build_object('success', true, 'slot_id_1', p_slot_id_1, 'slot_id_2', p_slot_id_2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION release_availability_slot(
  p_slot_id UUID
) RETURNS JSONB AS $$
BEGIN
  UPDATE availability_slots
  SET is_available = true
  WHERE id = p_slot_id;

  RETURN jsonb_build_object('success', true, 'slot_id', p_slot_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
