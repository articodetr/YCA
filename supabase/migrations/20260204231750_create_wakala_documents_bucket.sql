/*
  # Create Wakala Documents Storage Bucket

  ## Overview
  This migration creates a storage bucket for Wakala application documents
  (passport copies, ID documents, etc.) with appropriate security policies.

  ## New Storage Bucket
  - wakala-documents: Private bucket for storing passport copies and documents

  ## Security
  - Private bucket (not public)
  - Authenticated members can upload their own documents
  - Admins can view and manage all documents
  - Members can only access their own uploaded documents
  - Accepts image and PDF files
  - 10MB file size limit per file
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wakala-documents',
  'wakala-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Members can upload their wakala documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'wakala-documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Members can view their own wakala documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'wakala-documents' AND
    (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM admins
        WHERE admins.id = auth.uid()
        AND admins.is_active = true
      )
    )
  );

CREATE POLICY "Admins can view all wakala documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'wakala-documents' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete wakala documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'wakala-documents' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );
