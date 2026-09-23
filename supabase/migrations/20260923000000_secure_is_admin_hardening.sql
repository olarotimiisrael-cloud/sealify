-- =============================================================
-- Sealify: harden administrator authorization (single mechanism)
-- =============================================================
-- History: is_admin() has been defined several times across
-- migrations (no-arg auth.uid() variant, a uuid-argument variant,
-- and the canonical 20260820 definition). This migration does NOT
-- rewrite history; it converges production onto ONE hardened pair
-- of functions:
--
--   * public.is_admin()              - no arguments. The decision is
--     bound to auth.uid() (the JWT subject set by PostgREST from a
--     validated Supabase token). An untrusted caller CANNOT pass an
--     arbitrary UUID to escalate privileges through this function.
--
--   * private.is_admin_for(user_id)  - server-side only helper for
--     trusted backends (Cloudflare Pages Functions via Hyperdrive /
--     service-role connections) that must evaluate admin status for
--     a user id already verified from a Bearer token. EXECUTE is
--     revoked from all client roles (anon, authenticated,
--     authenticator) so it can never be reached over PostgREST/RPC
--     from a browser.
--
-- Both are SECURITY DEFINER with a pinned search_path, owner
-- postgres (Supabase standard), RLS on profiles remains enabled and
-- unchanged. Ordinary users cannot modify their own role (RLS
-- restricts profile updates; role changes are admin/service-role
-- operations only).
-- =============================================================

CREATE SCHEMA IF NOT EXISTS private;

-- -------------------------------------------------------------
-- 1. Canonical client-safe function: decision tied to auth.uid()
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.status = 'active'
  );
$$;

ALTER FUNCTION public.is_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role, authenticator;

COMMENT ON FUNCTION public.is_admin() IS
  'Administrator authorization check bound to the authenticated JWT subject (auth.uid()). SECURITY DEFINER with pinned search_path. Do not call with arguments.';

-- -------------------------------------------------------------
-- 2. Server-only helper accepting an explicit (token-verified) id
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.is_admin_for(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_id
      AND p.role = 'admin'
      AND p.status = 'active'
  );
$$;

ALTER FUNCTION private.is_admin_for(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.is_admin_for(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin_for(uuid) FROM anon, authenticated, authenticator;
GRANT EXECUTE ON FUNCTION private.is_admin_for(uuid) TO service_role, postgres;

COMMENT ON FUNCTION private.is_admin_for(uuid) IS
  'Server-side admin check for a caller-provided, token-verified user id. Not exposed to PostgREST; reachable only via direct database connections (Hyperdrive/service role).';

-- -------------------------------------------------------------
-- 3. Retire legacy uuid-argument overload in public schema.
--    Keeping it callable as public.is_admin(uuid) from clients
--    would allow any authenticated user to probe other users'
--    admin status (information leak) and creates ambiguity about
--    which mechanism is authoritative. Its behavior is preserved
--    by private.is_admin_for(uuid).
-- -------------------------------------------------------------
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Ensure schema visibility for direct connections used by the API.
GRANT USAGE ON SCHEMA private TO service_role, postgres;
