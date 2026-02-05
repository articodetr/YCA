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
