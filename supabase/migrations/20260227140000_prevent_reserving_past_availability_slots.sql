-- Prevent booking/reserving past availability slots
-- This hardens the system so even if the UI shows a slot, it can't be reserved if it already started.
-- Interprets availability_slots.date + start_time as Europe/London local time.

CREATE OR REPLACE FUNCTION reserve_availability_slot(
  p_slot_id UUID,
  p_booking_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_slot_available BOOLEAN;
  v_slot_date DATE;
  v_slot_start TIME;
  v_slot_ts TIMESTAMPTZ;
BEGIN
  SELECT is_available, date, start_time
    INTO v_slot_available, v_slot_date, v_slot_start
  FROM availability_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
  END IF;

  v_slot_ts := timezone('Europe/London', (v_slot_date + v_slot_start)::timestamp);

  IF v_slot_ts <= now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot time has already passed');
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
  v_date1 DATE;
  v_date2 DATE;
  v_start1 TIME;
  v_start2 TIME;
  v_ts1 TIMESTAMPTZ;
  v_ts2 TIMESTAMPTZ;
BEGIN
  SELECT is_available, date, start_time
    INTO v_slot1_available, v_date1, v_start1
  FROM availability_slots
  WHERE id = p_slot_id_1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'First slot not found');
  END IF;

  SELECT is_available, date, start_time
    INTO v_slot2_available, v_date2, v_start2
  FROM availability_slots
  WHERE id = p_slot_id_2
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Second slot not found');
  END IF;

  v_ts1 := timezone('Europe/London', (v_date1 + v_start1)::timestamp);
  v_ts2 := timezone('Europe/London', (v_date2 + v_start2)::timestamp);

  IF v_ts1 <= now() OR v_ts2 <= now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot time has already passed');
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
