/*
  Programmes: DB-driven tabs + core tab protection

  What this migration does:
  - Adds is_core boolean to programmes_items (if missing)
  - Ensures the approved core programme tabs exist (insert-only)
  - Marks the approved core slugs as is_core=true
  - Hides the legacy "Women's Programme" tab (slug = 'women') if it exists
  - Prevents deleting core tabs (use is_active=false to hide)
*/

-- 1) Add is_core column (safe if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'programmes_items' AND column_name = 'is_core'
  ) THEN
    ALTER TABLE public.programmes_items
      ADD COLUMN is_core boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- 2) Ensure approved core tabs exist (insert-only)
INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, is_core)
SELECT 'Women and Children\'s Programme', 'Programme description (edit from Admin).', 'women_children', 'women-children', true, 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'women-children');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, is_core)
SELECT 'Elderly\'s Programme', 'Programme description (edit from Admin).', 'elderly', 'elderly', true, 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'elderly');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, is_core)
SELECT 'Youth Programme', 'Programme description (edit from Admin).', 'youth', 'youth', true, 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'youth');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, is_core)
SELECT 'Children\'s Programme', 'Programme description (edit from Admin).', 'children', 'children', true, 4, true
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'children');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, is_core)
SELECT 'Education Programme', 'Programme description (edit from Admin).', 'education', 'education', true, 5, true
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'education');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, is_core)
SELECT 'Men\'s Programme', 'Programme description (edit from Admin).', 'men', 'men', true, 6, true
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'men');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, is_core)
SELECT 'Activities and Sports Programme', 'Programme description (edit from Admin).', 'activities_sports', 'activities-sports', true, 7, true
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'activities-sports');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, is_core)
SELECT 'The Journey Within', 'Programme description (edit from Admin).', 'journey_within', 'journey-within', true, 8, true
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'journey-within');

-- 3) Mark the approved core slugs as core (if rows already existed)
UPDATE public.programmes_items
SET is_core = true
WHERE slug IN (
  'women-children',
  'elderly',
  'youth',
  'children',
  'education',
  'men',
  'activities-sports',
  'journey-within'
);

-- 4) Hide legacy "Women's Programme" if it exists (do not delete, keep for history)
UPDATE public.programmes_items
SET is_active = false
WHERE slug = 'women';

-- 5) Normalize category for core tabs (optional but helps admin consistency)
UPDATE public.programmes_items
SET category = CASE slug
  WHEN 'women-children' THEN 'women_children'
  WHEN 'activities-sports' THEN 'activities_sports'
  WHEN 'journey-within' THEN 'journey_within'
  ELSE slug
END
WHERE is_core = true;

-- 6) Prevent deleting core tabs (use is_active=false instead)
CREATE OR REPLACE FUNCTION public.prevent_delete_core_programmes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(OLD.is_core, false) THEN
    RAISE EXCEPTION 'Core programme tabs cannot be deleted. Set is_active=false to hide instead.';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_delete_core_programmes ON public.programmes_items;
CREATE TRIGGER trg_prevent_delete_core_programmes
BEFORE DELETE ON public.programmes_items
FOR EACH ROW
EXECUTE FUNCTION public.prevent_delete_core_programmes();

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
