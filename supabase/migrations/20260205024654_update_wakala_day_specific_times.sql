/*
  # Update Wakala Availability with Day-Specific Times
  
  This migration updates wakala service availability with day-specific time slots based on London timezone.
  
  ## New Schedule
  
  ### Monday to Thursday (DOW 1-4)
  - Operating Hours: 10:00 AM - 2:15 PM
  - Slot Interval: 15 minutes
  - Total Slots: 17 per day
  - Times: 10:00, 10:15, 10:30, 10:45, 11:00, 11:15, 11:30, 11:45, 
           12:00, 12:15, 12:30, 12:45, 13:00, 13:15, 13:30, 13:45, 14:00, 14:15
  
  ### Friday (DOW 5)
  - Operating Hours: 9:00 AM - 11:45 AM
  - Slot Interval: 15 minutes
  - Total Slots: 11 per day
  - Times: 9:00, 9:15, 9:30, 9:45, 10:00, 10:15, 10:30, 10:45, 11:00, 11:15, 11:30, 11:45
  
  ### Saturday & Sunday (DOW 0, 6)
  - Status: CLOSED
  - No slots generated
  
  ## Implementation
  1. Delete all existing wakala availability slots
  2. Create new day-specific slots for 60 days ahead
  3. Add constraint to prevent weekend slot creation
  
  ## Notes
  - All times are in London timezone (Europe/London)
  - Weekends (Saturday & Sunday) are automatically excluded
  - Generates slots for 60 days in advance
*/

-- Create or replace function to generate day-specific wakala slots
CREATE OR REPLACE FUNCTION generate_day_specific_wakala_slots()
RETURNS void AS $$
DECLARE
  v_service_id UUID;
  v_current_date DATE;
  v_end_date DATE;
  v_day_of_week INTEGER;
  v_slot_time TIME;
  v_slot_end_time TIME;
BEGIN
  -- Get Wakala service ID
  SELECT id INTO v_service_id 
  FROM booking_services 
  WHERE name_en = 'Wakala Services' 
  LIMIT 1;
  
  IF v_service_id IS NULL THEN
    RAISE EXCEPTION 'Wakala Services not found';
  END IF;
  
  -- Define date range: today to 60 days ahead
  v_current_date := CURRENT_DATE;
  v_end_date := v_current_date + INTERVAL '60 days';
  
  -- Delete all existing wakala slots
  DELETE FROM availability_slots 
  WHERE service_id = v_service_id;
  
  RAISE NOTICE 'Deleted existing wakala slots';
  
  -- Generate slots for each day
  WHILE v_current_date <= v_end_date LOOP
    -- Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    v_day_of_week := EXTRACT(DOW FROM v_current_date);
    
    -- Skip weekends (Saturday=6, Sunday=0)
    IF v_day_of_week != 0 AND v_day_of_week != 6 THEN
      
      -- Friday schedule: 9:00 AM - 11:45 AM
      IF v_day_of_week = 5 THEN
        v_slot_time := '09:00:00'::TIME;
        
        WHILE v_slot_time <= '11:45:00'::TIME LOOP
          v_slot_end_time := v_slot_time + INTERVAL '15 minutes';
          
          INSERT INTO availability_slots (
            service_id,
            date,
            start_time,
            end_time,
            is_available,
            is_blocked_by_admin
          ) VALUES (
            v_service_id,
            v_current_date,
            v_slot_time,
            v_slot_end_time,
            true,
            false
          );
          
          v_slot_time := v_slot_end_time;
        END LOOP;
        
      -- Monday-Thursday schedule: 10:00 AM - 2:15 PM
      ELSE
        v_slot_time := '10:00:00'::TIME;
        
        WHILE v_slot_time <= '14:15:00'::TIME LOOP
          v_slot_end_time := v_slot_time + INTERVAL '15 minutes';
          
          INSERT INTO availability_slots (
            service_id,
            date,
            start_time,
            end_time,
            is_available,
            is_blocked_by_admin
          ) VALUES (
            v_service_id,
            v_current_date,
            v_slot_time,
            v_slot_end_time,
            true,
            false
          );
          
          v_slot_time := v_slot_end_time;
        END LOOP;
      END IF;
      
      RAISE NOTICE 'Generated slots for % (DOW: %)', v_current_date, v_day_of_week;
    ELSE
      RAISE NOTICE 'Skipped weekend: % (DOW: %)', v_current_date, v_day_of_week;
    END IF;
    
    -- Move to next day
    v_current_date := v_current_date + 1;
  END LOOP;
  
  RAISE NOTICE 'Successfully generated day-specific wakala slots';
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate slots
SELECT generate_day_specific_wakala_slots();

-- Add check constraint to prevent weekend wakala slots (safety measure)
DO $$
BEGIN
  -- Drop existing constraint if exists
  ALTER TABLE availability_slots 
  DROP CONSTRAINT IF EXISTS no_weekend_wakala_slots;
  
  -- Add new constraint
  ALTER TABLE availability_slots
  ADD CONSTRAINT no_weekend_wakala_slots
  CHECK (
    service_id NOT IN (SELECT id FROM booking_services WHERE name_en = 'Wakala Services') OR 
    EXTRACT(DOW FROM date) NOT IN (0, 6)
  );
  
  RAISE NOTICE 'Added constraint to prevent weekend wakala slots';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint already exists or error occurred: %', SQLERRM;
END $$;

-- Drop the function as it's no longer needed after execution
DROP FUNCTION IF EXISTS generate_day_specific_wakala_slots();