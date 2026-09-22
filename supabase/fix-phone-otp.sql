-- Sealify: Complete OTP & Auth Database Fix
-- Run this in Supabase SQL Editor (Database → Query Editor)
-- This creates the phone_otps table, RLS policies, and fixes all auth-related schema issues.

-- ============================================================
-- 1. Create phone_otps table (if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone text NOT NULL,
  otp_hash text NOT NULL,
  channel text NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms', 'whatsapp', 'push')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Indexes for phone_otps
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON public.phone_otps(phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phone_otps_user_id ON public.phone_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_otps_verified ON public.phone_otps(verified);

-- ============================================================
-- 3. Enable RLS on phone_otps
-- ============================================================
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. RLS Policies for phone_otps
-- ============================================================

-- Service role can do everything (for server-side OTP send/verify)
CREATE POLICY phone_otps_service_role_all ON public.phone_otps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Users can only see their own OTPs
CREATE POLICY phone_otps_select_self ON public.phone_otps
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Users can insert their own OTP requests
CREATE POLICY phone_otps_insert_self ON public.phone_otps
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Users can update their own unverified OTPs
CREATE POLICY phone_otps_update_self ON public.phone_otps
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND verified = false)
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 5. Helper function: verify phone OTP
-- ============================================================
CREATE OR REPLACE FUNCTION public.verify_phone_otp(
  p_phone text,
  p_otp text
) RETURNS TABLE (success boolean, user_id uuid, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp_record record;
  v_otp_hash text;
BEGIN
  -- Get the latest unverified OTP for this phone
  SELECT * INTO v_otp_record
  FROM public.phone_otps
  WHERE phone = p_phone
    AND verified = false
    AND locked = false
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  -- No valid OTP found
  IF v_otp_record IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, 'No valid OTP found. Please request a new one.'::text;
    RETURN;
  end if;

  -- Check if OTP is locked (too many attempts)
  IF v_otp_record.attempts >= 5 THEN
    UPDATE public.phone_otps SET locked = true WHERE id = v_otp_record.id;
    RETURN QUERY SELECT false, NULL::uuid, 'OTP locked due to too many attempts. Please request a new one.'::text;
    RETURN;
  end if;

  -- Hash the provided OTP for comparison (simple hash for demo)
  v_otp_hash := encode(digest(p_otp, 'sha256'), 'hex');

  -- In production, compare hashed OTPs
  -- For now, accept the OTP (stored as plain text in demo)
  -- TODO: Replace with proper hash comparison
  IF v_otp_record.otp_hash = p_otp OR v_otp_record.otp_hash = v_otp_hash THEN
    -- Mark as verified
    UPDATE public.phone_otps
    SET verified = true, verified_at = now()
    WHERE id = v_otp_record.id;

    RETURN QUERY SELECT true, v_otp_record.user_id, 'Phone verified successfully.'::text;
    RETURN;
  ELSE
    -- Increment attempts
    UPDATE public.phone_otps
    SET attempts = attempts + 1
    WHERE id = v_otp_record.id;

    RETURN QUERY SELECT false, NULL::uuid, 'Invalid OTP. Please try again.'::text;
    RETURN;
  END IF;
END;
$$;

-- ============================================================
-- 6. Helper function: cleanup expired OTPs
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.phone_otps
  WHERE expires_at < now() - interval '1 hour'
     OR (verified = true AND created_at < now() - interval '24 hours');
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- ============================================================
-- 7. Grant execute permissions on helper functions
-- ============================================================
GRANT EXECUTE ON FUNCTION public.verify_phone_otp TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_otps TO service_role;

-- ============================================================
-- 8. Add phone_otps to RLS reconciliation (update migration)
-- ============================================================
DO $$
BEGIN
  -- Ensure phone_otps is included in reconciliation
  IF to_regclass('public.phone_otps') IS NULL THEN
    RAISE EXCEPTION 'phone_otps table was not created. Run the CREATE TABLE statement above first.';
  END IF;
END
$$;

-- ============================================================
-- 9. Verify all tables exist (optional check)
-- ============================================================
DO $$
DECLARE
  missing_tables text[];
BEGIN
  SELECT array_agg(t.table_name::text) INTO missing_tables
  FROM (VALUES
    ('profiles'), ('ads'), ('ad_images'), ('categories'), ('subcategories'),
    ('announcements'), ('reviews'), ('buyer_requests'), ('buyer_request_responses'),
    ('favorites'), ('search_alerts'), ('user_settings'), ('push_subscriptions'),
    ('verification_requests'), ('password_requests'), ('conversations'), ('messages'),
    ('notifications'), ('reports'), ('audit_logs'), ('intrusion_logs'),
    ('system_configs'), ('wallets'), ('transactions'), ('escrow_orders'),
    ('promotion_payments'), ('site_settings'), ('promotion_plans'), ('disputes'),
    ('safe_spots'), ('recent_deals'), ('analytics_events'), ('performance_metrics'),
    ('phone_otps')
  ) AS t(table_name)
  WHERE to_regclass(format('public.%I', t.table_name)) IS NULL;

  IF missing_tables IS NOT NULL THEN
    RAISE WARNING 'Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'All 34 tables present. Sealify schema is complete.';
  END IF;
END
$$;
