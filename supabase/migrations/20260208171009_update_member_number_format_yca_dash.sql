/*
  # Update Member Number Format to YCA-0001

  1. Changes
    - Reset `members_number_seq` sequence to start from 1
    - Update `generate_member_number()` to produce format YCA-0001, YCA-0002, etc.
    
  2. Important Notes
    - No existing members are affected (table is empty)
    - The trigger `assign_member_number` continues to call this function automatically
*/

ALTER SEQUENCE members_number_seq RESTART WITH 1;

CREATE OR REPLACE FUNCTION generate_member_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'YCA-' || LPAD(nextval('members_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
