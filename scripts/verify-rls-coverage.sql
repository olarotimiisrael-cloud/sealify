-- ============================================================================
-- RLS coverage verification.
--
-- Paste into the Supabase SQL Editor and run.
--
-- Production incident this guards against: `public.profiles` had row-level
-- security enabled with zero policies. RLS denies every statement when no
-- policy matches, so `loadProfileForAuthUser()` in
-- src/context/SealifyContext.tsx received an empty result set from
-- `.maybeSingle()` and administrator login failed with
-- "Authentication succeeded, but your administrator profile could not be
-- loaded." Server-side `public.is_admin()` kept working because it is
-- SECURITY DEFINER and therefore bypasses RLS, which is why authentication
-- itself succeeded and hid the cause.
--
-- Any row reported UNPROTECTED means clients get zero rows (and zero writes)
-- on that table until policies are installed.
-- ============================================================================

-- 1. Every RLS-enabled table must have at least one policy ---------------------
SELECT 'rls_coverage' AS check_name,
       c.relname AS object_name,
       count(p.policyname) AS found,
       1 AS expected,
       CASE WHEN count(p.policyname) > 0 THEN 'OK' ELSE 'UNPROTECTED' END AS result
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p
  ON p.schemaname = n.nspname AND p.tablename = c.relname
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity
GROUP BY c.relname
ORDER BY count(p.policyname), c.relname;

-- 2. The policies that administrator login depends on --------------------------
SELECT 'admin_login_policies' AS check_name,
       policyname AS object_name,
       1 AS found,
       1 AS expected,
       CASE
         WHEN policyname = 'profiles_select_self_or_admin'
          AND cmd = 'SELECT'
          AND roles @> ARRAY['authenticated']::name[]
          THEN 'OK'
         ELSE 'MISSING'
       END AS result
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND cmd = 'SELECT'
UNION ALL
SELECT 'profiles_select_self_or_admin', 'policy_exists', 0, 1, 'MISSING'
WHERE NOT EXISTS (
  SELECT 1 FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND policyname = 'profiles_select_self_or_admin'
);

-- 3. public.is_admin() must stay zero-argument and auth.uid()-bound ------------
-- A uuid-argument overload lets any client ask whether an arbitrary user is an
-- administrator. Migration 20260923000000_secure_is_admin_hardening.sql dropped
-- it; only the no-argument form may exist.
SELECT 'is_admin_signature' AS check_name,
       'public.is_admin' AS object_name,
       count(*) AS found,
       0 AS expected,
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'UNSAFE_OVERLOAD' END AS result
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'is_admin'
  AND pg_get_function_identity_arguments(p.oid) <> ''
UNION ALL
SELECT 'is_admin_signature',
       'public.is_admin()',
       count(*),
       1,
       CASE WHEN count(*) = 1 THEN 'OK' ELSE 'MISSING' END
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'is_admin'
  AND pg_get_function_identity_arguments(p.oid) = '';