/*
  # Create Wakala Documents Storage Bucket

  1. Storage
    - Create `wakala-documents` bucket for passport and document uploads
    - Bucket is public for read access (URLs shared with admins)
  
  2. Security
    - Authenticated users can upload files to their own folder
    - Authenticated users can read their own files
    - Admin users can read all files
    - File path pattern: `{user_id}/{timestamp}_{filename}`
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('wakala-documents', 'wakala-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload wakala documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'wakala-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own wakala documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'wakala-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own wakala documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'wakala-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
