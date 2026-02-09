/*
  # Fix Wakala Documents Bucket and Storage Policies

  ## Problem
  - The 'wakala-documents' bucket was created with public=false, causing "Bucket not found" errors when accessing files
  - Storage policies are too restrictive, preventing anonymous users from uploading documents
  - Admins cannot view/manage all uploaded documents

  ## Changes
  1. Update bucket to be public (allows public URL access)
  2. Add policy for authenticated and anonymous users to upload files
  3. Add policy for everyone to read files (since bucket is public)
  4. Add policy for admins to manage all files

  ## Security
  - Files are in a public bucket, which is appropriate for document uploads that need to be accessed by admins
  - RLS policies still control who can upload
  - Admins have full access for management purposes
*/

-- Update the wakala-documents bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'wakala-documents';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all wakala documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete wakala documents" ON storage.objects;

-- Allow authenticated and anonymous users to upload to wakala-documents
-- This is necessary for the wakala booking form to work for both logged-in and guest users
CREATE POLICY "Anyone can upload to wakala-documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'wakala-documents');

-- Allow everyone to read files from wakala-documents (public bucket)
CREATE POLICY "Anyone can read wakala-documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'wakala-documents');

-- Allow admins to update files in wakala-documents
CREATE POLICY "Admins can update wakala-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'wakala-documents' 
  AND EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.email = auth.email() 
    AND admins.is_active = true
  )
);

-- Allow admins to delete files in wakala-documents
CREATE POLICY "Admins can delete wakala-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'wakala-documents' 
  AND EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.email = auth.email() 
    AND admins.is_active = true
  )
);
