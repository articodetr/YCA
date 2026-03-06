/*
  Normalize programmes so Admin + Frontend both use the same DB rows.

  What this migration does:
  - Removes delete protection for core programmes
  - Clears old core flags
  - Keeps only the six requested starting programmes
  - Ensures those six rows exist with the right names / order / slugs
  - Leaves the table fully dynamic afterwards (add/delete/edit continues to work)
*/

-- 1) Allow deleting programmes again
DROP TRIGGER IF EXISTS trg_prevent_delete_core_programmes ON public.programmes_items;
DROP FUNCTION IF EXISTS public.prevent_delete_core_programmes();

-- 2) Clear old core protection flags
UPDATE public.programmes_items
SET is_core = false
WHERE COALESCE(is_core, false) = true;

-- 3) Remove old / extra seeded programmes so only the requested starting set remains
DELETE FROM public.programmes_items
WHERE COALESCE(slug, '') NOT IN (
  'women-children',
  'elderly',
  'youth',
  'education',
  'activities-sports',
  'journey-within'
);

-- 4) Ensure the requested programmes exist
INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, color, icon)
SELECT 'Women and Children''s Programme', 'Programme description (edit from Admin).', 'women_children', 'women-children', true, 1, '#10B981', 'Users'
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'women-children');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, color, icon)
SELECT 'Elderly''s Programme', 'Programme description (edit from Admin).', 'elderly', 'elderly', true, 2, '#10B981', 'HeartHandshake'
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'elderly');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, color, icon)
SELECT 'Youth Programme', 'Programme description (edit from Admin).', 'youth', 'youth', true, 3, '#10B981', 'Users'
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'youth');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, color, icon)
SELECT 'Education Programme', 'Programme description (edit from Admin).', 'education', 'education', true, 4, '#10B981', 'BookOpen'
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'education');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, color, icon)
SELECT 'Activities and Sports Programme', 'Programme description (edit from Admin).', 'activities_sports', 'activities-sports', true, 5, '#10B981', 'Trophy'
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'activities-sports');

INSERT INTO public.programmes_items (title, description, category, slug, is_active, order_number, color, icon)
SELECT 'The Journey Within', 'Programme description (edit from Admin).', 'journey_within', 'journey-within', true, 6, '#10B981', 'Compass'
WHERE NOT EXISTS (SELECT 1 FROM public.programmes_items WHERE slug = 'journey-within');

-- 5) Normalize those six rows
UPDATE public.programmes_items
SET
  title = CASE slug
    WHEN 'women-children' THEN 'Women and Children''s Programme'
    WHEN 'elderly' THEN 'Elderly''s Programme'
    WHEN 'youth' THEN 'Youth Programme'
    WHEN 'education' THEN 'Education Programme'
    WHEN 'activities-sports' THEN 'Activities and Sports Programme'
    WHEN 'journey-within' THEN 'The Journey Within'
    ELSE title
  END,
  category = CASE slug
    WHEN 'women-children' THEN 'women_children'
    WHEN 'elderly' THEN 'elderly'
    WHEN 'youth' THEN 'youth'
    WHEN 'education' THEN 'education'
    WHEN 'activities-sports' THEN 'activities_sports'
    WHEN 'journey-within' THEN 'journey_within'
    ELSE category
  END,
  order_number = CASE slug
    WHEN 'women-children' THEN 1
    WHEN 'elderly' THEN 2
    WHEN 'youth' THEN 3
    WHEN 'education' THEN 4
    WHEN 'activities-sports' THEN 5
    WHEN 'journey-within' THEN 6
    ELSE order_number
  END,
  is_active = true,
  updated_at = now()
WHERE slug IN (
  'women-children',
  'elderly',
  'youth',
  'education',
  'activities-sports',
  'journey-within'
);

NOTIFY pgrst, 'reload schema';
