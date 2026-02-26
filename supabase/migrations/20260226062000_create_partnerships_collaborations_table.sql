/*
  # Create Partnerships & Collaborations Table + Logo Storage

  This migration adds a dedicated directory for partners/collaborators that is
  separate from Business Support.

  Features:
  - Admin can add/edit/delete partners manually
  - Public can read only active partners
  - Supports logo upload via a public storage bucket
*/

-- ------------------------------------------------------------
-- 1) Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partnerships_collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website_url text,
  is_active boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partnerships_collaborations_active_order
  ON public.partnerships_collaborations (is_active, sort_order, created_at);

-- ------------------------------------------------------------
-- 2) RLS
-- ------------------------------------------------------------
ALTER TABLE public.partnerships_collaborations ENABLE ROW LEVEL SECURITY;

-- Public: only active rows
DROP POLICY IF EXISTS "Public can view active partnerships & collaborations" ON public.partnerships_collaborations;
CREATE POLICY "Public can view active partnerships & collaborations"
  ON public.partnerships_collaborations
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admin: full CRUD
DROP POLICY IF EXISTS "Admins can view all partnerships & collaborations" ON public.partnerships_collaborations;
CREATE POLICY "Admins can view all partnerships & collaborations"
  ON public.partnerships_collaborations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert partnerships & collaborations" ON public.partnerships_collaborations;
CREATE POLICY "Admins can insert partnerships & collaborations"
  ON public.partnerships_collaborations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update partnerships & collaborations" ON public.partnerships_collaborations;
CREATE POLICY "Admins can update partnerships & collaborations"
  ON public.partnerships_collaborations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete partnerships & collaborations" ON public.partnerships_collaborations;
CREATE POLICY "Admins can delete partnerships & collaborations"
  ON public.partnerships_collaborations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- ------------------------------------------------------------
-- 3) Storage bucket for logos
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partnerships-logos',
  'partnerships-logos',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "Public read access for partnerships logos" ON storage.objects;
CREATE POLICY "Public read access for partnerships logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'partnerships-logos');

-- Admin upload
DROP POLICY IF EXISTS "Authenticated admins can upload partnerships logos" ON storage.objects;
CREATE POLICY "Authenticated admins can upload partnerships logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'partnerships-logos'
    AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Admin update
DROP POLICY IF EXISTS "Authenticated admins can update partnerships logos" ON storage.objects;
CREATE POLICY "Authenticated admins can update partnerships logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'partnerships-logos'
    AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Admin delete
DROP POLICY IF EXISTS "Authenticated admins can delete partnerships logos" ON storage.objects;
CREATE POLICY "Authenticated admins can delete partnerships logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'partnerships-logos'
    AND EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );
