-- Sealify OTP and Admin Messaging Migration
-- This migration adds support for self-hosted OTP verification via email and phone
-- and adds admin messaging capabilities.

-- Email OTPs table
CREATE TABLE IF NOT EXISTS public.email_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_hash text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5),
  delivered_via text NOT NULL DEFAULT 'email' CHECK (delivered_via IN ('email', 'smtp', 'sendgrid')),
  sent_to_email text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_otps_email_created_at ON public.email_otps(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON public.email_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_otps_used ON public.email_otps(used_at) WHERE used_at IS NOT NULL;

-- Admin messages table
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'html')),
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  channel text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp')),
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_messages_sender ON public.admin_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_messages_receiver ON public.admin_messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_messages_status ON public.admin_messages(status);

-- Broadcast messages table for admin messaging
CREATE TABLE IF NOT EXISTS public.admin_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  target text NOT NULL CHECK (target IN ('all', 'buyer', 'seller', 'individual')),
  title text NOT NULL,
  content text NOT NULL,
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'html')),
  channel text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp')),
  user_ids text[], -- JSONB for individual recipients
  audience text, -- JSONB for role-based targeting
  sent_count integer NOT NULL DEFAULT 0,
  delivered_count integer NOT NULL DEFAULT 0,
  read_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  expires_at timestamptz,
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_broadcasts_sender ON public.admin_broadcasts(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_broadcasts_status ON public.admin_broadcasts(sent_at);

-- RLS Policies for email_otps
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS email_otps_service_role_all ON public.email_otps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS email_otps_select_self ON public.email_otps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY IF NOT EXISTS email_otps_insert_self ON public.email_otps
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS email_otps_update_self ON public.email_otps
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

REVOKE ALL ON public.email_otps FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_otps TO authenticated;

-- RLS Policies for admin_messages
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS admin_messages_service_role_all ON public.admin_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS admin_messages_select_receiver ON public.admin_messages
  FOR SELECT TO authenticated USING (receiver_id = auth.uid());

CREATE POLICY IF NOT EXISTS admin_messages_select_sender ON public.admin_messages
  FOR SELECT TO authenticated USING (sender_id = auth.uid());

CREATE POLICY IF NOT EXISTS admin_messages_insert ON public.admin_messages
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY IF NOT EXISTS admin_messages_update ON public.admin_messages
  FOR UPDATE TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid()) WITH CHECK (true);

REVOKE ALL ON public.admin_messages FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_messages TO authenticated;

-- RLS Policies for admin_broadcasts
ALTER TABLE public.admin_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS admin_broadcasts_service_role_all ON public.admin_broadcasts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS admin_broadcasts_select_admin ON public.admin_broadcasts
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS admin_broadcasts_insert_admin ON public.admin_broadcasts
  FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS admin_broadcasts_update_admin ON public.admin_broadcasts
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (true);

REVOKE ALL ON public.admin_broadcasts FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_broadcasts TO authenticated;

-- Add email_confirmed_at and phone_verified_at to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_confirmed_at') THEN
    ALTER TABLE public.profiles ADD COLUMN email_confirmed_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_verified_at') THEN
    ALTER TABLE public.profiles ADD COLUMN phone_verified_at timestamptz;
  END IF;
END $$;