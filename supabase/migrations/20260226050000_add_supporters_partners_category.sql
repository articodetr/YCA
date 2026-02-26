/*
  # Add Partners category for Business Support listings

  This migration adds a `category` column to `business_supporters` so the same
  table can store BOTH:
  - supporters
  - partners

  Values:
  - 'supporter' (default)
  - 'partner'

  Notes:
  - Existing rows will default to 'supporter'.
  - Admin can switch any row to 'partner' from the dashboard.
*/

-- ------------------------------------------------------------------
-- 1) Add category column (supporter/partner)
-- ------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_supporters' AND column_name = 'category'
  ) THEN
    ALTER TABLE business_supporters
      ADD COLUMN category text NOT NULL DEFAULT 'supporter';
  END IF;
END $$;

-- Safety for legacy rows
UPDATE business_supporters
SET category = 'supporter'
WHERE category IS NULL;

-- ------------------------------------------------------------------
-- 2) Constraint + helpful index
-- ------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_supporters_category_check'
  ) THEN
    ALTER TABLE business_supporters
      ADD CONSTRAINT business_supporters_category_check
      CHECK (category IN ('supporter', 'partner'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS business_supporters_category_active_idx
  ON business_supporters (category, is_active);
