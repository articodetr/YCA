/*
  # Add booking columns to translation_requests and other_legal_requests

  1. Modified Tables
    - `translation_requests`
      - Added `document_type` (text) - type of document to translate
      - Added `source_language` (text) - source language
      - Added `target_language` (text) - target language
      - Added `urgency` (text) - urgency level
      - Added `booking_reference` (text, unique) - auto-generated reference
    - `other_legal_requests`
      - Added `description` (text) - detailed description
      - Added `urgency` (text) - urgency level
      - Added `booking_reference` (text, unique) - auto-generated reference

  2. Functions
    - Auto-generation triggers for booking_reference on both tables (YCA-TR-YYYY-NNNN / YCA-LR-YYYY-NNNN)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'translation_requests' AND column_name = 'document_type'
  ) THEN
    ALTER TABLE translation_requests ADD COLUMN document_type text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'translation_requests' AND column_name = 'source_language'
  ) THEN
    ALTER TABLE translation_requests ADD COLUMN source_language text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'translation_requests' AND column_name = 'target_language'
  ) THEN
    ALTER TABLE translation_requests ADD COLUMN target_language text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'translation_requests' AND column_name = 'urgency'
  ) THEN
    ALTER TABLE translation_requests ADD COLUMN urgency text DEFAULT 'standard';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'translation_requests' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE translation_requests ADD COLUMN booking_reference text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'other_legal_requests' AND column_name = 'description'
  ) THEN
    ALTER TABLE other_legal_requests ADD COLUMN description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'other_legal_requests' AND column_name = 'urgency'
  ) THEN
    ALTER TABLE other_legal_requests ADD COLUMN urgency text DEFAULT 'standard';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'other_legal_requests' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE other_legal_requests ADD COLUMN booking_reference text UNIQUE;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION generate_translation_booking_reference()
RETURNS trigger AS $func$
DECLARE
  year_part text;
  seq_num integer;
  new_ref text;
BEGIN
  year_part := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(booking_reference FROM 'YCA-TR-\d{4}-(\d+)') AS integer)
  ), 0) + 1
  INTO seq_num
  FROM translation_requests
  WHERE booking_reference LIKE 'YCA-TR-' || year_part || '-%';

  new_ref := 'YCA-TR-' || year_part || '-' || LPAD(seq_num::text, 4, '0');
  NEW.booking_reference := new_ref;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_translation_booking_reference ON translation_requests;
CREATE TRIGGER set_translation_booking_reference
  BEFORE INSERT ON translation_requests
  FOR EACH ROW
  WHEN (NEW.booking_reference IS NULL)
  EXECUTE FUNCTION generate_translation_booking_reference();

CREATE OR REPLACE FUNCTION generate_legal_booking_reference()
RETURNS trigger AS $func$
DECLARE
  year_part text;
  seq_num integer;
  new_ref text;
BEGIN
  year_part := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(booking_reference FROM 'YCA-LR-\d{4}-(\d+)') AS integer)
  ), 0) + 1
  INTO seq_num
  FROM other_legal_requests
  WHERE booking_reference LIKE 'YCA-LR-' || year_part || '-%';

  new_ref := 'YCA-LR-' || year_part || '-' || LPAD(seq_num::text, 4, '0');
  NEW.booking_reference := new_ref;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_legal_booking_reference ON other_legal_requests;
CREATE TRIGGER set_legal_booking_reference
  BEFORE INSERT ON other_legal_requests
  FOR EACH ROW
  WHEN (NEW.booking_reference IS NULL)
  EXECUTE FUNCTION generate_legal_booking_reference();
