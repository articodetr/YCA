/*
  # Setup Storage Buckets for CMS

  ## Overview
  This migration creates storage buckets for various media types and sets up
  appropriate Row Level Security policies for secure file uploads and access.

  ## New Storage Buckets
  
  1. hero-images - Hero section background images
  2. team-members - Team member profile photos
  3. programmes - Programme images
  4. resources - PDF documents and downloadable resources
  5. event-gallery - Event photo galleries
  6. services - Service-related images
  7. content-images - General content images for About pages, etc.

  ## Security
  - Public read access for all buckets
  - Authenticated admin write access only
  - Automatic file type validation
  - Size limits enforced
*/

-- Insert storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('hero-images', 'hero-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('team-members', 'team-members', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('programmes', 'programmes', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('resources', 'resources', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png']),
  ('event-gallery', 'event-gallery', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('services', 'services', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('content-images', 'content-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access to hero-images
CREATE POLICY "Public read access for hero-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hero-images');

CREATE POLICY "Admins can upload hero-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update hero-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete hero-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to team-members
CREATE POLICY "Public read access for team-members"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-members');

CREATE POLICY "Admins can upload team-members"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'team-members' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update team-members"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'team-members' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete team-members"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'team-members' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to programmes
CREATE POLICY "Public read access for programmes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'programmes');

CREATE POLICY "Admins can upload programmes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'programmes' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update programmes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'programmes' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete programmes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'programmes' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to resources
CREATE POLICY "Public read access for resources"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload resources"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resources' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update resources"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resources' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete resources"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resources' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to event-gallery
CREATE POLICY "Public read access for event-gallery"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-gallery');

CREATE POLICY "Admins can upload event-gallery"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-gallery' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update event-gallery"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-gallery' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete event-gallery"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-gallery' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to services
CREATE POLICY "Public read access for services"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'services');

CREATE POLICY "Admins can upload services"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'services' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update services"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'services' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete services"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'services' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to content-images
CREATE POLICY "Public read access for content-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');

CREATE POLICY "Admins can upload content-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'content-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update content-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'content-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete content-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'content-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );