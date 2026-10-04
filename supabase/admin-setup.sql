-- =====================================================================
-- SEALIFY ADMIN USER SETUP
-- Run in the Supabase SQL Editor (https://supabase.com/dashboard).
--
-- This script PROMOTES AN EXISTING ACCOUNT to administrator. It never
-- creates an auth user and never creates a profiles row from scratch,
-- because a profile whose id is not an auth.users id can never be loaded:
-- loadProfileForAuthUser() looks up `profiles.id = auth.users.id`, and
-- public.is_admin() does the same lookup.
--
-- Sealify operates with a single administrator. Do not run this script to
-- add more.
--
-- Usage: set the email below, then run the whole file.
-- =====================================================================

-- =====================================================================
-- CONFIGURATION: the one account allowed to administer Sealify.
-- Must already exist under Authentication > Users.
-- =====================================================================
\set admin_email 'thesealconsult@gmail.com'

-- =====================================================================
-- 1. Guard: the account must exist in auth.users.
--    Failing here is correct. Creating the auth user from SQL is not
--    supported by Supabase, and inventing a profiles row with a random
--    uuid produces a profile that no login can ever load.
-- =====================================================================
DO $$
DECLARE
  v_admin_email TEXT := :'admin_email';
  v_user_id UUID;
  v_profile_id UUID;
BEGIN
  SELECT u.id INTO v_user_id
  FROM auth.users u
  WHERE lower(u.email) = lower(v_admin_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION
      'No auth user exists for %. Create the account under Authentication > Users first, then re-run this script.',
      v_admin_email;
  END IF;

  -- A profile row keyed to a different id is the exact condition that makes
  -- administrator login fail with "your administrator profile could not be
  -- loaded". Re-key it when the profile is clearly the orphaned one.
  SELECT p.id INTO v_profile_id
  FROM public.profiles p
  WHERE lower(p.email) = lower(v_admin_email)
    AND p.id <> v_user_id
  LIMIT 1;

  IF v_profile_id IS NOT NULL THEN
    RAISE EXCEPTION
      'The profile row for % is keyed to % but the auth user id is %. Reconcile it deliberately before granting admin: re-key the profile, or create the correct profile row and delete the orphan.',
      v_admin_email, v_profile_id, v_user_id;
  END IF;
END $$;

-- =====================================================================
-- 2. Promote the account's own profile row to administrator.
--    Profiles are created by the sign-up trigger, so the row should
--    already exist with the correct id.
-- =====================================================================
UPDATE public.profiles
SET role        = 'admin',
    status      = 'active',
    verified    = true,
    updated_at  = NOW()
WHERE id = (SELECT u.id FROM auth.users u WHERE lower(u.email) = lower(:'admin_email') LIMIT 1);

-- =====================================================================
-- 3. Guarantee exactly one administrator.
--    Anything else carrying role = 'admin' is demoted to buyer.
-- =====================================================================
UPDATE public.profiles p
SET role       = 'buyer',
    updated_at = NOW()
WHERE p.role = 'admin'
  AND lower(p.email) <> lower(:'admin_email');

-- =====================================================================
-- 4. user_settings (required by the app)
-- =====================================================================
INSERT INTO public.user_settings (
  user_id,
  email_notifications,
  whatsapp_notifications,
  push_notifications,
  price_drop_alerts,
  new_message_alerts,
  weekly_digest,
  promotion_expiry_reminders,
  language,
  theme,
  created_at,
  updated_at
)
SELECT
  u.id,
  true, true, true, true, true, true, true,
  'en', 'dark', NOW(), NOW()
FROM auth.users u
WHERE lower(u.email) = lower(:'admin_email')
ON CONFLICT (user_id) DO UPDATE
SET language = 'en',
    theme    = 'dark';

-- =====================================================================
-- 5. Verification. Each row must report OK.
-- =====================================================================

-- 5.1 Exactly one administrator, and it is the configured account.
SELECT 'single_admin' AS check_name,
       count(*) AS found,
       1 AS expected,
       CASE WHEN count(*) = 1 THEN 'OK' ELSE 'INVALID' END AS result
FROM public.profiles
WHERE role = 'admin';

-- 5.2 The administrator's profile id is its auth user id, so
--     loadProfileForAuthUser() can find it.
SELECT 'admin_profile_linked' AS check_name,
       count(*) AS found,
       1 AS expected,
       CASE WHEN count(*) = 1 THEN 'OK' ELSE 'MISSING' END AS result
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin'
  AND lower(u.email) = lower(:'admin_email');

-- 5.3 The policy administrator login depends on is installed.
--     Without it, RLS hides every row and login reports that the
--     administrator profile could not be loaded.
--     Full check: scripts/verify-rls-coverage.sql
SELECT 'admin_select_policy' AS check_name,
       count(*) AS found,
       1 AS expected,
       CASE WHEN count(*) = 1 THEN 'OK' ELSE 'MISSING' END AS result
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND policyname = 'profiles_select_self_or_admin'
  AND cmd = 'SELECT';

-- =====================================================================
-- AFTER RUNNING
--   Admin login: https://sealify.thesealconsult.com.ng/admin/login
--   Sign in as the configured email. The dashboard reads its data from the
--   database through RLS-filtered PostgREST queries.
-- =====================================================================