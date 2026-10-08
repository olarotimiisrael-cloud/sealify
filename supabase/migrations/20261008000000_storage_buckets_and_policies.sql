-- ============================================================
-- SEALIFY STORAGE BUCKETS AND RLS POLICIES MIGRATION
-- ============================================================
-- Run this in Supabase SQL Editor after ensuring the profile-media bucket
-- has been created via the Supabase Dashboard or API.
--
-- This migration applies RLS policies on storage.objects for the
-- profile-media bucket to enable secure profile photo and cover photo
-- uploads and downloads.
-- ============================================================

-- NOTE: RLS is already enabled by default on storage.objects in Supabase.
-- We only create the policies here. Do NOT run ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- as it requires table ownership and will fail with: "must be owner of table objects".

-- ============================================================
-- PROFILE MEDIA BUCKET POLICIES (avatars, cover photos)
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
-- VERIFICATION
-- ============================================================
-- After running this migration, verify with:
-- SELECT * FROM storage.objects WHERE bucket_id = 'profile-media' LIMIT 5;
-- Check that policies are created:
-- SELECT polname, polcmd, polroles, polqualified FROM pg_policies WHERE tablename = 'objects';