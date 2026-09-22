-- Self-contained phone OTP system migration.
-- This migration handles both fresh installs and existing deployments
-- where the phone_otps table may already exist with an older schema.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Schema migration: upgrade existing phone_otps table if needed
-- ============================================================
DO $$
BEGIN
  -- If the table exists with the old schema (phone, otp columns)
  -- but doesn't have phone_number yet, migrate columns
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phone_otps' AND column_name = 'phone')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phone_otps' AND column_name = 'phone_number') THEN
    ALTER TABLE public.phone_otps RENAME COLUMN phone TO phone_number;
  END IF;

  -- If the old otp column exists (plaintext) but otp_hash doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phone_otps' AND column_name = 'otp')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phone_otps' AND column_name = 'otp_hash') THEN
    -- Add otp_hash column
    ALTER TABLE public.phone_otps ADD COLUMN otp_hash text;
    -- Hash existing plaintext OTPs
    UPDATE public.phone_otps SET otp_hash = encode(digest(otp, 'sha256'), 'hex') WHERE otp IS NOT NULL;
    -- Remove old plaintext column
    ALTER TABLE public.phone_otps DROP COLUMN otp;
  END IF;

  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phone_otps' AND column_name = 'used_at') THEN
    ALTER TABLE public.phone_otps ADD COLUMN used_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phone_otps' AND column_name = 'attempts') THEN
    ALTER TABLE public.phone_otps ADD COLUMN attempts integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phone_otps' AND column_name = 'delivered_via') THEN
    ALTER TABLE public.phone_otps ADD COLUMN delivered_via text NOT NULL DEFAULT 'in_app';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phone_otps' AND column_name = 'expires_at') THEN
    -- expires_at may exist already; skip if it does
    NULL;
  END IF;

  -- Ensure phone_number is NOT NULL
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phone_otps' AND column_name = 'phone_number') THEN
    ALTER TABLE public.phone_otps ALTER COLUMN phone_number SET NOT NULL;
  END IF;

END $$;

-- ============================================================
-- Create table if it doesn't exist at all (fresh install)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  otp_hash text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5),
  delivered_via text NOT NULL DEFAULT 'in_app' CHECK (delivered_via IN ('in_app', 'email', 'sms'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_phone_otps_phone_created_at
  ON public.phone_otps(phone_number, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phone_otps_expires_at
  ON public.phone_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_phone_otps_used
  ON public.phone_otps(used_at) WHERE used_at IS NOT NULL;

-- ============================================================
-- RLS: Enable and add permissive policies for server-side access
-- ============================================================
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- Server role (service_role) bypasses RLS automatically.
-- For anon/authenticated clients (admin UI), add a policy:
CREATE POLICY IF NOT EXISTS phone_otps_service_role_all ON public.phone_otps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow authenticated users to read their own OTP records
CREATE POLICY IF NOT EXISTS phone_otps_select_self ON public.phone_otps
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to insert OTP requests
CREATE POLICY IF NOT EXISTS phone_otps_insert_self ON public.phone_otps
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own records
CREATE POLICY IF NOT EXISTS phone_otps_update_self ON public.phone_otps
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Revoke default privileges from anon to prevent direct access
REVOKE ALL ON public.phone_otps FROM anon;

-- Grant explicit privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.phone_otps TO authenticated;
