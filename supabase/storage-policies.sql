-- Run these in Supabase SQL Editor after creating buckets
-- Enable RLS on storage.objects (already enabled by default)

-- ============================================================
-- PROFILE MEDIA BUCKET (avatars, cover photos)
-- ============================================================
-- Public read access for avatars and cover photos
CREATE POLICY "Public avatars are viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-media');

-- Users can upload their own profile media
CREATE POLICY "Users can upload their own profile media" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own profile media
CREATE POLICY "Users can update their own profile media" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own profile media
CREATE POLICY "Users can delete their own profile media" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- AD IMAGES BUCKET (listing photos)
-- ============================================================
-- Public read access for ad images
CREATE POLICY "Public ad images are viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ad-images');

-- Sellers can upload their ad images
CREATE POLICY "Sellers can upload ad images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Sellers can update their ad images
CREATE POLICY "Sellers can update their ad images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Sellers can delete their ad images
CREATE POLICY "Sellers can delete their ad images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- AD VIDEOS BUCKET (listing videos)
-- ============================================================
CREATE POLICY "Public ad videos are viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ad-videos');

CREATE POLICY "Sellers can upload ad videos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'ad-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can update their ad videos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'ad-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can delete their ad videos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'ad-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- DOCUMENTS BUCKET (KYC, verification docs, receipts)
-- ============================================================
-- Private bucket - only owner can read
CREATE POLICY "Users can upload their own documents" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all documents" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND public.is_admin()
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