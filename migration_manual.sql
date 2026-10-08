-- Manual migration script for sealify referral system
-- This applies the migration 20261006000000_referral_and_welcome_email.sql

-- Add referral columns to profiles table
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS referral_code TEXT,
    ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS referral_cycle INTEGER NOT NULL DEFAULT 1;

-- Create referrals ledger table
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    cycle INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'credited'
             CHECK (status IN ('credited','pending_review','revoked')),
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_referrals_referrer ON public.referrals (referrer_id, cycle, status);
CREATE INDEX idx_referrals_code ON public.referrals (referral_code);
CREATE INDEX idx_referrals_created ON public.referrals (created_at DESC);

-- Create referral rewards ledger table
CREATE TABLE public.referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cycle INTEGER NOT NULL,
    referrals_at_reset INTEGER NOT NULL,
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    note TEXT,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_referral_rewards_cycle ON public.referral_rewards (user_id, cycle);

-- Create referral clicks table (anti-fraud)
CREATE TABLE public.referral_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    ip_address inet,
    user_agent text,
    landing_path text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_clicks_code ON public.referral_clicks (code, created_at DESC);

-- Create email outbox table (transactional delivery queue)
CREATE TABLE public.email_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template TEXT NOT NULL,
    recipient TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','sent','failed','suppressed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    dedupe_key TEXT UNIQUE,
    scheduled_at timestamptz NOT NULL DEFAULT now(),
    sent_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_outbox_pending ON public.email_outbox (scheduled_at);

-- Credit referral function
CREATE OR REPLACE FUNCTION public.credit_referral(
    p_referrer_id UUID,
    p_referral_code TEXT,
    p_ip INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    SELECT p.referred_by INTO v_referrer_id
        FROM public.profiles p
        WHERE p.id = p_referrer_id;

    IF v_referrer_id IS NULL OR v_referrer_id = p_referrer_id THEN
        RETURN NULL;
    END IF;

    SELECT p.referral_cycle INTO v_referrer_cycle
        FROM public.profiles p
        WHERE p.id = v_referrer_id;

    INSERT INTO public.referrals
        (referrer_id, referee_id, referral_code, cycle, status, ip_address, user_agent)
        VALUES
            (v_referrer_id, p_referral_code, v_referrer_id, v_referrer_cycle, 'credited', p_ip, p_user_agent)
    ON CONFLICT (referral_code) DO NOTHING;

    IF v_referral_id IS NULL THEN
        RETURN NULL;
    END IF;

    UPDATE public.profiles
        SET referral_count = referral_count + 1,
        referral_cycle = v_referrer_cycle + 1,
        updated_at = now()
        WHERE id = v_referrer_id;

    RETURN v_referral_id;
END;
$$;

ALTER FUNCTION public.credit_referral(uuid, text, inet, text) OWNER TO postgres;
COMMENT ON FUNCTION public.credit_referral(uuid, text, inet, text) IS
  'Credits a referral for the referrer and increments their cached referral_count in a single transaction. Returns the referral row id, or NULL on self-referral / duplicate / unknown referee.';

-- Grant referral reward function
CREATE OR REPLACE FUNCTION public.grant_referral_reward(
    p_user_id UUID,
    p_granted_by UUID,
    p_note TEXT DEFAULT NULL
) RETURNS TABLE (cycle INTEGER, referrals_at_reset INTEGER) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    SELECT p.user_id, p.referral_cycle INTO v_cycle, v_count
        FROM public.profiles p
        WHERE p.id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User % not found', p_user_id;
    END IF;

    INSERT INTO public.referral_rewards
        (user_id, cycle, referrals_at_reset, granted_by, note)
        VALUES (p_user_id, v_cycle, v_count, p_granted_by, p_note)
    ON CONFLICT (user_id, cycle) DO NOTHING;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reward already granted for cycle %', v_cycle;
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
  'Records a referral reward grant (writes referral_rewards) and atomically resets the user's referral_count to 0 while advancing referral_cycle. One endpoint call = one reward + one reset.';

-- Enable RLS policies
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;

-- System config seed
INSERT INTO public.system_configs (key, value, description)
    VALUES ('referral_reward_threshold', '3'::jsonb,
            'Credited referrals required before a user may be granted the free promotional ad month.')
ON CONFLICT (key) DO UPDATE SET value = '3'::jsonb, description = 'Credited referrals required before a user may be granted the free promotional ad month.';

-- Create indexes for email outbox
CREATE INDEX idx_email_outbox_welcome PERFORMED ON public.email_outbox ((payload ->> 'userId')) WHERE template = 'welcome';

-- Commit all changes
ROLLBACK;