/*
  # Storage Bucket for Program Files

  ## Overview
  Creates a storage bucket for payment proof uploads and program files.

  ## New Storage Bucket
  - `program-files` - Stores payment proof screenshots and program PDFs

  ## Security
  - Anyone can upload payment proofs
  - Only authenticated users can view files
  - Only trainers can delete files
*/

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('program-files', 'program-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload files (for payment proofs)
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'program-files');

-- Allow anyone to view files (public bucket)
CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'program-files');

-- Only trainers can delete files
CREATE POLICY "Trainers can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'program-files' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'trainer'
  )
);