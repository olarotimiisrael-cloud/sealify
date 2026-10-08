-- ============================================================
-- SEALIFY NIGERIA - STORAGE BUCKET SETUP SCRIPT
-- ============================================================
-- Run this ENTIRE script in Supabase SQL Editor to:
-- 1. Create all required storage buckets
-- 2. Apply RLS policies for secure file uploads
-- 3. Create the admin helper function
-- ============================================================

-- ============================================================
-- PROFILE MEDIA BUCKET POLICIES
-- ============================================================

CREATE POLICY "Public avatars are viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-media');

CREATE POLICY "Users can upload their own profile media" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile media" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile media" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- AD IMAGES BUCKET POLICIES
-- ============================================================

CREATE POLICY "Public ad images are viewable" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ad-images');

CREATE POLICY "Sellers can upload ad images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can update their ad images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can delete their ad images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'ad-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- AD VIDEOS BUCKET POLICIES
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
-- DOCUMENTS BUCKET POLICIES (Private)
-- ============================================================

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
-- MESSAGES BUCKET POLICIES (Private)
-- ============================================================

CREATE POLICY "Users can upload their own message attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own message attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own message attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own message attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- ADMIN HELPER FUNCTION
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

-- ============================================================
-- VERIFICATION
-- ============================================================
-- After running this script, verify with:
-- SELECT * FROM storage.objects WHERE bucket_id = 'profile-media' LIMIT 5;
-- Check that policies are created:
-- SELECT polname, polblobive FROM pg_policies WHERE tablename = 'objects';