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
-- Grant USAGE on public schema to service role
GRANT USAGE ON SCHEMA public TO service_role;
-- Grant all privileges on all tables in public schema to service role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
-- Grant EXECUTE on all functions in public schema to service role
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- STEP 3: ENSURE public.is_admin() FUNCTION EXISTS (backup verification)
-- ============================================================================
-- This function already exists from the hardening migration.
-- The admin login endpoint calls public.is_admin() (no arguments, uses auth.uid())
-- No need to recreate.

-- ============================================================================
-- STEP 4: CREATE MISSING ad-videos STORAGE BUCKET AND POLICIES
-- ============================================================================
-- Create ad-videos bucket if it doesn't exist (bypass RLS)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-videos', 'ad-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ad-videos bucket are managed by storage-policies.sql.
-- Skipping to avoid conflicts.

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
-- The is_admin() function checks if the current authenticated user is admin
SELECT auth.uid() as test_user, 'Check that is_admin() works for current auth context' as note;