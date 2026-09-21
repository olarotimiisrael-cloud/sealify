-- ============================================================================
-- SEALIFY COMPLETE DATABASE FIX & ADMIN SETUP
-- Run this ENTIRE script in Supabase SQL Editor (has elevated permissions)
-- ============================================================================

-- ============================================================================
-- STEP 1: UPDATE ADMIN PROFILE FOR thesealconsult@gmail.com
-- ============================================================================
UPDATE public.profiles SET role = 'admin', full_name = 'Sealify Admin' WHERE email = 'thesealconsult@gmail.com';
-- Ensure admin@sealify.com remains admin (backup)
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@sealify.com';

-- ============================================================================
-- STEP 2: FIX SERVICE ROLE SCHEMA PERMISSIONS
-- ============================================================================
-- Grant USAGE on public schema to service role key
GRANT USAGE ON SCHEMA public TO service_role;
-- Grant all privileges on all tables in public schema to service role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
-- Grant USAGE on all types in public schema to service role
GRANT USAGE ON ALL TYPES IN SCHEMA public TO service_role;
-- Grant EXECUTE on all functions in public schema to service role
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- STEP 3: ENSURE public.is_admin() FUNCTION EXISTS (backup verification)
-- ============================================================================
-- This function should already exist from migrations, but ensure it's correct
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = $1 AND role = 'admin'
  );
$$;

-- Update comment in admin-setup.sql to reflect public.is_admin usage
-- The admin login endpoint calls public.is_admin(${user.id}) (not private.is_admin)

-- ============================================================================
-- STEP 4: CREATE MISSING ad-videos STORAGE BUCKET AND POLICIES
-- ============================================================================
-- Create ad-videos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-videos', 'ad-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not already)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing ad-videos policies if any (clean slate)
DROP POLICY IF EXISTS "Public ad videos are viewable" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can upload ad videos" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can update their ad videos" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can delete their ad videos" ON storage.objects;

-- Create storage policies for ad-videos bucket
-- Public read access for ad videos
CREATE POLICY "Public ad videos are viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-videos');

-- Sellers can upload their ad videos
CREATE POLICY "Sellers can upload ad videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ad-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Sellers can update their ad videos
CREATE POLICY "Sellers can update their ad videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ad-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Sellers can delete their ad videos
CREATE POLICY "Sellers can delete their ad videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- STEP 5: VERIFY ADMIN USERS
-- ============================================================================
SELECT id, email, role, status FROM public.profiles WHERE email IN ('thesealconsult@gmail.com', 'admin@sealify.com') ORDER BY email;

-- ============================================================================
-- STEP 6: VERIFY STORAGE BUCKETS
-- ============================================================================
SELECT id, name, public FROM storage.buckets ORDER BY name;

-- ============================================================================
-- STEP 7: VERIFY public.is_admin FUNCTION
-- ============================================================================
SELECT public.is_admin(id) as is_admin FROM public.profiles WHERE email = 'thesealconsult@gmail.com';
SELECT public.is_admin(id) as is_admin FROM public.profiles WHERE email = 'admin@sealify.com';