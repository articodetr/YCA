/*
  # Create Storage Buckets for News and Events

  1. New Storage Buckets
    - `news-images` - For news article images
    - `event-images` - For event images
  
  2. Security
    - Enable public access for reading images
    - Allow authenticated admins to upload/update/delete images
    - Set appropriate file size and type restrictions
*/

-- Create news-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news-images',
  'news-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create event-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for news-images bucket
CREATE POLICY "Public read access for news images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'news-images');

CREATE POLICY "Authenticated admins can upload news images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'news-images' AND
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "Authenticated admins can update news images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'news-images' AND
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "Authenticated admins can delete news images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'news-images' AND
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- RLS Policies for event-images bucket
CREATE POLICY "Public read access for event images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated admins can upload event images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-images' AND
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "Authenticated admins can update event images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-images' AND
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "Authenticated admins can delete event images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-images' AND
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );