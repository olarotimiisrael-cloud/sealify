-- Sealify Trust Architecture Migration
-- Adds credential verification system for Nigerian professional marketplace

-- ===========================================================
-- 1. verification_badges table ---------------------------------
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.verification_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('government_id', 'professional_certification', 'skill_validation', 'corporate_verification')),
  issuing_authority text NOT NULL,
  verification_method text NOT NULL,
  validity_period_months integer,
  is_required_for text[] NOT NULL, -- roles/categories where badge is required
  is_public boolean NOT NULL DEFAULT true, -- publicly displayed on profile
  requires_manual_review boolean NOT NULL DEFAULT true,
  badge_url text, -- logo/icon URL
  criteria text, -- markdown text explaining requirements
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_badges_type ON public.verification_badges(type);

-- ===========================================================
-- 2. credential_verifications table -----------------------------
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.credential_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES public.verification_badges(id) ON DELETE SET NULL,
  credential_id text, -- external credential identifier (NIN, CAC, etc.)
  issuer text, -- example: "NIMC", "ICAB", "FRSC"
  verification_date timestamptz NOT NULL DEFAULT now(),
  expiry_date timestamptz,
  verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
  verification_issued_at timestamptz,
  verification_approver_id uuid,
  verification_notes text,
  credential_file_url text, -- for document upload (CAC, COREN, etc.)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_credential_verifications_user ON public.credential_verifications(user_id);
CREATE INDEX idx_credential_verifications_badge ON public.credential_verifications(badge_id);

-- ===========================================================
-- 3. profiles: trust & verification fields ------------------------
-- ===========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified_credentials jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credential_expiry_warning_date timestamptz,
  ADD COLUMN IF NOT EXISTS verification_preferences jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.verified_credentials IS 'Array of credential verification IDs with status';
COMMENT ON COLUMN public.profiles.trust_score IS 'Calculated trust score (0-100) based on credentials and reviews';

-- ===========================================================
-- 4. verification_requests table -------------------------------
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES public.verification_badges(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  request_data jsonb NOT NULL DEFAULT '{}',
  reviewer_id uuid,
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_requests_user ON public.verification_requests(user_id);
CREATE INDEX idx_verification_requests_badge ON public.verification_requests(badge_id);

-- ===========================================================
-- 5. Database triggers & functions for updated_at ----------------
-- ===========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.verification_badges
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.credential_verifications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.verification_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===========================================================n-- 6. RLS Policies for trust & verification tables ----------------
-- ===========================================================

-- Anyone can view public badges
CREATE POLICY verification_badges_public ON public.verification_badges
  FOR SELECT TO anon, authenticated USING (is_public = true);

-- Users can view their own credential verifications
CREATE POLICY credential_verifications_user_own ON public.credential_verifications
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Users can view their own verification requests
CREATE POLICY verification_requests_user_own ON public.verification_requests
  FOR ALL TO authenticated USING (user_id = auth.uid());\n-- Reviewers can view verification requests
CREATE POLICY verification_requests_reviewer_own ON public.verification_requests
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = reviewer_id AND p.id = auth.uid())
  );

-- Audit trigger for credential verifications
CREATE TRIGGER credential_audit BEFORE INSERT OR UPDATE ON public.credential_verifications
AFTER INSERT OR UPDATE
FOR EACH ROW EXECUTE FUNCTION public.audit_log();

COMMENT ON TABLE public.verification_badges IS 'Professional and government verification badges';
COMMENT ON TABLE public.credential_verifications IS 'User''s credential verification records';
COMMENT ON TABLE public.verification_requests IS 'Outstanding verification requests awaiting review';
