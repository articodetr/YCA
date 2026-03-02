/*
  Programmes: fixed tabs + per-programme news

  - Ensures programmes_items supports slug/content/gallery.
  - Adds optional programme_id to news so articles can be attached to a programme.
  - Seeds the fixed programme slugs (insert-only; will not overwrite existing rows).
*/

-- -----------------------------
-- 1) Programmes table columns
-- -----------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'programmes_items' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.programmes_items ADD COLUMN slug text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'programmes_items' AND column_name = 'content'
  ) THEN
    ALTER TABLE public.programmes_items ADD COLUMN content text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'programmes_items' AND column_name = 'content_ar'
  ) THEN
    ALTER TABLE public.programmes_items ADD COLUMN content_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'programmes_items' AND column_name = 'gallery_images'
  ) THEN
    ALTER TABLE public.programmes_items ADD COLUMN gallery_images text[] DEFAULT '{}'::text[];
  END IF;
END $$;

-- Ensure slug uniqueness (only when slug is present)
CREATE UNIQUE INDEX IF NOT EXISTS idx_programmes_items_slug_unique
  ON public.programmes_items (slug)
  WHERE slug IS NOT NULL;

-- Drop the old strict category CHECK (so we can support new categories safely)
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.programmes_items'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%category%'
  LOOP
    EXECUTE format('ALTER TABLE public.programmes_items DROP CONSTRAINT IF EXISTS %I', c.conname);
  END LOOP;
END $$;

-- Best-effort: set slugs for existing rows by title if they match
UPDATE public.programmes_items
SET slug = 'women'
WHERE slug IS NULL AND lower(title) IN ('women programme', 'women\'s programme', 'women’s programme');

UPDATE public.programmes_items
SET slug = 'women-children'
WHERE slug IS NULL AND lower(title) IN ('women and children\'s programme', 'women and children’s programme', 'women & children programme');

UPDATE public.programmes_items
SET slug = 'elderly'
WHERE slug IS NULL AND lower(title) IN ('elderly programme', 'elderly\'s programme', 'elderly’s programme');

UPDATE public.programmes_items
SET slug = 'youth'
WHERE slug IS NULL AND lower(title) IN ('youth programme', 'youth program');

UPDATE public.programmes_items
SET slug = 'children'
WHERE slug IS NULL AND lower(title) IN ('children programme', 'children\'s programme', 'children’s programme');

UPDATE public.programmes_items
SET slug = 'education'
WHERE slug IS NULL AND lower(title) IN ('education programme', 'education program');

UPDATE public.programmes_items
SET slug = 'men'
WHERE slug IS NULL AND lower(title) IN ('men programme', 'men\'s programme', 'men’s programme');

UPDATE public.programmes_items
SET slug = 'activities-sports'
WHERE slug IS NULL AND lower(title) IN ('activities and sports programme', 'activities & sports programme');

UPDATE public.programmes_items
SET slug = 'journey-within'
WHERE slug IS NULL AND lower(title) IN ('the journey within', 'journey within', 'journey-within');

-- Seed the fixed programmes (insert-only; won’t overwrite existing rows)
INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number)
SELECT 'Women\'s Programme', 'Programme description (edit from Admin).', 'women', 'women', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'women');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number)
SELECT 'Women and Children’s Programme', 'Programme description (edit from Admin).', 'women_children', 'women-children', true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'women-children');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number)
SELECT 'Elderly\'s Programme', 'Programme description (edit from Admin).', 'elderly', 'elderly', true, 3
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'elderly');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number)
SELECT 'Youth Programme', 'Programme description (edit from Admin).', 'youth', 'youth', true, 4
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'youth');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number)
SELECT 'Children\'s Programme', 'Programme description (edit from Admin).', 'children', 'children', true, 5
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'children');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number)
SELECT 'Education Programme', 'Programme description (edit from Admin).', 'education', 'education', true, 6
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'education');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number)
SELECT 'Men\'s Programme', 'Programme description (edit from Admin).', 'men', 'men', true, 7
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'men');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number)
SELECT 'Activities and Sports Programme', 'Programme description (edit from Admin).', 'activities_sports', 'activities-sports', true, 8
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'activities-sports');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number)
SELECT 'The Journey Within', 'Programme description (edit from Admin).', 'journey', 'journey-within', true, 9
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'journey-within');


-- -----------------------------
-- 2) News table: programme linking
-- -----------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'gallery_images'
  ) THEN
    ALTER TABLE public.news ADD COLUMN gallery_images text[] DEFAULT '{}'::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'programme_id'
  ) THEN
    ALTER TABLE public.news ADD COLUMN programme_id uuid;
  END IF;
END $$;

-- Add FK only if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'news'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'news_programme_id_fkey'
  ) THEN
    ALTER TABLE public.news
      ADD CONSTRAINT news_programme_id_fkey
      FOREIGN KEY (programme_id)
      REFERENCES public.programmes_items(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_news_programme_id_published_at
  ON public.news (programme_id, published_at DESC);
