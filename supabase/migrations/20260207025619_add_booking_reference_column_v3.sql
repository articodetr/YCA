/*
  # Add booking reference column and tracking support

  1. Modified Tables
    - `wakala_applications`
      - `booking_reference` (text, unique) - Unique reference code for tracking bookings

  2. New Functions
    - `generate_booking_reference()` trigger function - auto-generates YCA-YYYY-NNNN references

  3. Notes
    - Backfills existing rows with sequential references
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN booking_reference text UNIQUE;
  END IF;
END $$;

DROP FUNCTION IF EXISTS generate_booking_reference() CASCADE;

CREATE FUNCTION generate_booking_reference()
RETURNS trigger AS $$
DECLARE
  current_year text;
  next_seq int;
  new_ref text;
BEGIN
  IF NEW.booking_reference IS NULL THEN
    current_year := to_char(now(), 'YYYY');

    SELECT COALESCE(MAX(
      CAST(SUBSTRING(booking_reference FROM 'YCA-' || current_year || '-(\d+)') AS int)
    ), 0) + 1
    INTO next_seq
    FROM wakala_applications
    WHERE booking_reference LIKE 'YCA-' || current_year || '-%';

    new_ref := 'YCA-' || current_year || '-' || LPAD(next_seq::text, 4, '0');

    WHILE EXISTS (SELECT 1 FROM wakala_applications WHERE booking_reference = new_ref) LOOP
      next_seq := next_seq + 1;
      new_ref := 'YCA-' || current_year || '-' || LPAD(next_seq::text, 4, '0');
    END LOOP;

    NEW.booking_reference := new_ref;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_booking_reference
  BEFORE INSERT ON wakala_applications
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_reference();

DO $$
DECLARE
  rec RECORD;
  seq int;
  yr text;
  prev_yr text := '';
BEGIN
  seq := 0;
  FOR rec IN
    SELECT id, created_at FROM wakala_applications
    WHERE booking_reference IS NULL
    ORDER BY created_at
  LOOP
    yr := to_char(rec.created_at, 'YYYY');
    IF yr <> prev_yr THEN
      seq := 1;
      prev_yr := yr;
    ELSE
      seq := seq + 1;
    END IF;

    UPDATE wakala_applications
    SET booking_reference = 'YCA-' || yr || '-' || LPAD(seq::text, 4, '0')
    WHERE id = rec.id;
  END LOOP;
END $$;
