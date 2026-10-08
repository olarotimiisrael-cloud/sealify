-- ============================================================
-- STORAGE BUCKET RLS POLICIES FOR SEALIFY NIGERIA
-- ============================================================
-- Run this in Supabase SQL Editor to create policies if they don't exist

-- ============================================================
-- PROFILE MEDIA BUCKET (avatars, cover photos, KYC docs)
-- ============================================================

-- Public read access for avatars and cover photos
CREATE POLICY IF NOT EXISTS "Public avatars are viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-media');

-- Users can upload their own profile media
CREATE POLICY IF NOT EXISTS "Users can upload their own profile media" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own profile media
CREATE POLICY IF NOT EXISTS "Users can update their own profile media" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own profile media
CREATE POLICY IF NOT EXISTS "Users can delete their own profile media" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- AD IMAGES BUCKET (listing photos)
-- ============================================================

-- Public read access for ad images
CREATE POLICY IF NOT EXISTS "Public ad images are viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ad-images');

-- Sellers can upload their ad images
CREATE POLICY IF NOT EXISTS "Sellers can upload ad images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Sellers can update their ad images
CREATE POLICY IF NOT EXISTS "Sellers can update their ad images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Sellers can delete their ad images
CREATE POLICY IF NOT EXISTS "Sellers can delete their ad images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- AD VIDEOS BUCKET (listing videos)
-- ============================================================

CREATE POLICY IF NOT EXISTS "Public ad videos are viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ad-videos');

CREATE POLICY IF NOT EXISTS "Sellers can upload ad videos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'ad-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Sellers can update their ad videos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'ad-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Sellers can delete their ad videos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'ad-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- DOCUMENTS BUCKET (KYC, verification docs, receipts)
-- ============================================================

-- Private bucket - only owner can read
CREATE POLICY IF NOT EXISTS "Users can upload their own documents" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can view their own documents" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Admins can view all documents" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND public.is_admin()
);

-- ============================================================
-- MESSAGES BUCKET (conversation attachments)
-- ============================================================

-- Private bucket - only conversation participants can access
CREATE POLICY IF NOT EXISTS "Users can upload their own message attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS "Users can view their own message attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS "Users can update their own message attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY IF NOT EXISTS "Users can delete their own message attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;