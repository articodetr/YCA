/*
  # Business Support: Supporter details + logo uploads

  This migration enables Business Support members to provide supporter details at signup,
  and creates a dedicated storage bucket for supporter logos.

  Changes:
  1) membership_applications
     - Add supporter/business fields: business_name, business_logo_url, business_website_url
     - Allow users to update their own pending applications (so they can fix details before paying)

  2) Storage
     - Create `business-supporters-logos` bucket (public read)
     - Allow authenticated users to upload/update/delete ONLY within their own folder: `{user_id}/...`

  3) business_supporters
     - Add a unique index on membership_application_id so we can UPSERT from edge functions
*/

-- ------------------------------------------------------------------
-- 1) membership_applications: add supporter fields
-- ------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'business_name'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN business_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'business_logo_url'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN business_logo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'business_website_url'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN business_website_url text;
  END IF;
END $$;

-- Allow users to update their own pending applications (needed when an application already exists)
DROP POLICY IF EXISTS "Users can update own pending membership applications" ON membership_applications;

CREATE POLICY "Users can update own pending membership applications"
  ON membership_applications
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND status = 'pending'
    AND payment_status IN ('pending', 'failed')
  )
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND payment_status IN ('pending', 'failed')
  );

-- ------------------------------------------------------------------
-- 2) Storage bucket for supporter logos
-- ------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-supporters-logos',
  'business-supporters-logos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policies on storage.objects are global, so we DROP then CREATE by name
DROP POLICY IF EXISTS "Public read access for business-supporters-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload business-supporters-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own business-supporters-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own business-supporters-logos" ON storage.objects;

CREATE POLICY "Public read access for business-supporters-logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'business-supporters-logos');

CREATE POLICY "Authenticated users can upload business-supporters-logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'business-supporters-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can update own business-supporters-logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'business-supporters-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can delete own business-supporters-logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'business-supporters-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------------
-- 3) business_supporters: unique index for upsert
-- ------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS business_supporters_membership_application_id_key
  ON business_supporters (membership_application_id);
