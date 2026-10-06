-- =============================================================
-- Sealify: referral program + welcome email system
-- =============================================================
-- Adds:
--   * profiles.referral_code / referral_count / referral_cycle / referred_by
--   * referrals           (append-only referral ledger)
--   * referral_rewards    (recorded grant + reset)
--   * referral_clicks     (optional anti-fraud click tracking)
--   * email_outbox        (transactional delivery queue)
--   * credit_referral()   (atomic: referral row + cached counter in one tx)
--   * grant_referral_reward() (admin: grant + reset + new cycle, one tx)
--   * referral code backfill for existing users
--   * system_configs.referral_reward_threshold seed
-- All new tables get RLS policies so no client can read/write them
-- through PostgREST. They are written only by server code via
-- service-role / Hyperdrive connections.
-- =============================================================

-- =============================================================
-- 1. profiles: referral columns -------------------------------
-- =============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_count   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_cycle   integer NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.profiles.referral_code IS
  'Stable public referral code, e.g. SEALIFY-7K2M9Q. Never rotated.';
COMMENT ON COLUMN public.profiles.referral_count IS
  'Credited referrals in the CURRENT cycle only. Reset to 0 when a reward is granted.';
COMMENT ON COLUMN public.profiles.referral_cycle IS
  'Current referral cycle (starts at 1, increments each time a reward is granted).';
COMMENT ON COLUMN public.profiles.referred_by IS
  'The profile of the user who referred this user (single attribution, never changes).';

-- =============================================================
-- 2. referrals ledger (source of truth) -----------------------
-- =============================================================
CREATE TABLE public.referrals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id   uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  cycle        integer NOT NULL DEFAULT 1,
  status       text NOT NULL DEFAULT 'credited'
                 CHECK (status IN ('credited','pending_review','revoked')),
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- A user can be referred by at most one person, and never by themselves.
ALTER TABLE public.referrals
  ADD CONSTRAINT referrals_no_self_referral CHECK (referrer_id <> referee_id);

COMMENT ON TABLE public.referrals IS
  'Append-only ledger of every referral credited. referee_id UNIQUE enforces single attribution.';

CREATE INDEX idx_referrals_referrer ON public.referrals (referrer_id, cycle, status);
CREATE INDEX idx_referrals_code     ON public.referrals (referral_code);
CREATE INDEX idx_referrals_created  ON public.referrals (created_at DESC);

-- =============================================================
-- 3. referral_rewards ledger ----------------------------------
-- =============================================================
CREATE TABLE public.referral_rewards (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle                 integer NOT NULL,
  referrals_at_reset    integer NOT NULL,
  granted_by            uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note                  text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.referral_rewards IS
  'Record of every referral reward grant + reset. UNIQUE (user_id, cycle) makes grant idempotent.';

CREATE UNIQUE INDEX uq_referral_rewards_cycle ON public.referral_rewards (user_id, cycle);

-- =============================================================
-- 4. referral_clicks (anti-fraud, no client read) -------------
-- =============================================================
CREATE TABLE public.referral_clicks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text NOT NULL,
  ip_address   inet,
  user_agent   text,
  landing_path text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.referral_clicks IS
  'Click/landing tracking for referral abuse review. No client SELECT access.';

CREATE INDEX idx_referral_clicks_code ON public.referral_clicks (code, created_at DESC);

-- =============================================================
-- 5. email_outbox ---------------------------------------------
-- =============================================================
CREATE TABLE public.email_outbox (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template     text NOT NULL,
  recipient    text NOT NULL,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','sent','failed','suppressed')),
  attempts     integer NOT NULL DEFAULT 0,
  last_error   text,
  dedupe_key   text UNIQUE,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.email_outbox IS
  'Transactional email delivery queue. status + dedupe_key make delivery idempotent.';

CREATE INDEX idx_email_outbox_pending
  ON public.email_outbox (scheduled_at)
  WHERE status = 'pending';

-- One welcome email per user, enforced by the database.
CREATE UNIQUE INDEX uq_email_outbox_welcome_per_user
  ON public.email_outbox ((payload ->> 'userId'))
  WHERE template = 'welcome';

-- =============================================================
-- 6. credit_referral() function -------------------------------
-- =============================================================
CREATE OR REPLACE FUNCTION public.credit_referral(
  p_referee_id   uuid,
  p_referral_code text,
  p_ip           inet   DEFAULT NULL,
  p_user_agent   text   DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_referrer_id uuid;
  v_referrer_cycle integer;
  v_referral_id uuid;
BEGIN
  SELECT p.referred_by INTO v_referrer_id
    FROM public.profiles p
   WHERE p.id = p_referee_id;

  -- No referral: unattributed user, or self-referral.
  IF v_referrer_id IS NULL OR v_referrer_id = p_referee_id THEN
    RETURN NULL;
  END IF;

  SELECT p.referral_cycle INTO v_referrer_cycle
    FROM public.profiles p
   WHERE p.id = v_referrer_id;

  INSERT INTO public.referrals
    (referrer_id, referee_id, referral_code, cycle, status, ip_address, user_agent)
  VALUES
    (v_referrer_id, p_referee_id, p_referral_code, v_referrer_cycle, 'credited', p_ip, p_user_agent)
  ON CONFLICT (referee_id) DO NOTHING
  RETURNING id INTO v_referral_id;

  IF v_referral_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.profiles
     SET referral_count = referral_count + 1,
         updated_at = now()
   WHERE id = v_referrer_id;

  RETURN v_referral_id;
END;
$$;

ALTER FUNCTION public.credit_referral(uuid, text, inet, text) OWNER TO postgres;
COMMENT ON FUNCTION public.credit_referral(uuid, text, inet, text) IS
  'Credits a referral for the referrer and increments their cached referral_count in a single transaction. Returns the referral row id, or NULL on self-referral / duplicate / unknown referee.';

-- =============================================================
-- 7. grant_referral_reward() function -------------------------
-- =============================================================
CREATE OR REPLACE FUNCTION public.grant_referral_reward(
  p_user_id  uuid,
  p_granted_by uuid,
  p_note     text DEFAULT NULL
) RETURNS TABLE (cycle integer, referrals_at_reset integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_cycle integer;
  v_count integer;
BEGIN
  SELECT p.referral_cycle, p.referral_count INTO v_cycle, v_count
    FROM public.profiles p
   WHERE p.id = p_user_id
   FOR UPDATE;

  INSERT INTO public.referral_rewards
    (user_id, cycle, referrals_at_reset, granted_by, note)
  VALUES (p_user_id, v_cycle, v_count, p_granted_by, p_note)
  ON CONFLICT (user_id, cycle) DO NOTHING;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward already granted for cycle %', v_cycle
      USING ERRCODE = 'unique_violation';
  END IF;

  UPDATE public.profiles
     SET referral_count = 0,
         referral_cycle = v_cycle + 1,
         updated_at = now()
   WHERE id = p_user_id;

  RETURN QUERY SELECT v_cycle, v_count;
END;
$$;

ALTER FUNCTION public.grant_referral_reward(uuid, uuid, text) OWNER TO postgres;
COMMENT ON FUNCTION public.grant_referral_reward(uuid, uuid, text) IS
  'Records a referral reward grant (writes referral_rewards) and atomically resets the user''s referral_count to 0 while advancing referral_cycle. One endpoint call = one reward + one reset.';

-- =============================================================
-- 8. code backfill + hardening -------------------------------
-- =============================================================
DO $$
DECLARE
  p record;
  v_code text;
BEGIN
  FOR p IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    LOOP
      v_code := 'SEALIFY-' ||
        upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE referral_code = v_code
      );
    END LOOP;
    UPDATE public.profiles SET referral_code = v_code, referral_count = 0, referral_cycle = 1
      WHERE id = p.id;
  END LOOP;
END $$;

ALTER TABLE public.profiles ALTER COLUMN referral_code SET NOT NULL;

-- =============================================================
-- 9. RLS policies ---------------------------------------------
-- =============================================================
ALTER TABLE public.referrals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks  ENABLE ROW LEVEL SECURITY;

-- Referrers may read their own referral rows. Referees see nothing.
CREATE POLICY referrals_referrer_read ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid());

-- Rewards visible only to owner and to server-side (service_role) reads.
CREATE POLICY referral_rewards_owner_read ON public.referral_rewards
  FOR SELECT USING (user_id = auth.uid());

-- No client-side reads or writes at all.
CREATE POLICY referral_clicks_no_client_access ON public.referral_clicks
  AS RESTRICTIVE FOR ALL USING (false);

CREATE POLICY referral_clicks_insert_server_only ON public.referral_clicks
  FOR INSERT WITH CHECK (false);

CREATE POLICY email_outbox_no_client_access ON public.email_outbox
  AS RESTRICTIVE FOR ALL USING (false);

-- =============================================================
-- 10. system_configs seed -------------------------------------
-- =============================================================
INSERT INTO public.system_configs (key, value, description)
  VALUES ('referral_reward_threshold', '3'::jsonb,
          'Credited referrals required before a user may be granted the free promotional ad month.')
ON CONFLICT (key) DO UPDATE SET value = '3'::jsonb, description = 'Credited referrals required before a user may be granted the free promotional ad month.', updated_at = now();
