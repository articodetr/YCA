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
