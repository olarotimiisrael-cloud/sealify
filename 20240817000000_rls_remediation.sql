-- SEALIFY RLS REMEDIATION MIGRATION
-- This migration applies the least-privilege RLS policies identified in the security audit.
-- It targets the active 'profiles'/'ads' schema model.

-- Precondition: This script assumes RLS is already enabled on most tables by previous migrations.
-- We will explicitly enable it where it was missing.

-- =================================================================
-- A. Enable RLS on tables that were missing it
-- =================================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intrusion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_request_responses ENABLE ROW LEVEL SECURITY;

-- For telemetry tables from server/db/schema.sql
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- B. Drop existing unsafe policies
-- =================================================================

-- Drop broad public/authenticated access policies from initial migrations.
-- Note: The performance-fix migration already replaced some of these with FOR ALL,
-- which we will also drop and replace with more granular policies.

-- Profiles
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles write access" ON public.profiles;
DROP POLICY IF EXISTS "Users update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins all access" ON public.profiles;

-- Ads
DROP POLICY IF EXISTS "Public active ads read" ON public.ads;
DROP POLICY IF EXISTS "Ad performance" ON public.ads;

-- Notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "All access for notification owners" ON public.notifications;

-- Financial Tables (Remove all non-admin write access)
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.wallets;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.wallets;
DROP POLICY IF EXISTS "Enable read access for owner" ON public.wallets;
DROP POLICY IF EXISTS "All access for wallet owners" ON public.wallets;
DROP POLICY IF EXISTS "Enable read access for transaction owners" ON public.transactions;
DROP POLICY IF EXISTS "All access for transaction owners" ON public.transactions;
DROP POLICY IF EXISTS "Enable read for buyer and seller" ON public.escrow_transactions;
DROP POLICY IF EXISTS "Enable insert for buyers" ON public.escrow_transactions;

-- Reports
DROP POLICY IF EXISTS "Anyone can report" ON public.reports;

-- Messages & Conversations (replace with safer versions)
DROP POLICY IF EXISTS "All access for participants" ON public.messages;
DROP POLICY IF EXISTS "All access for participants" ON public.conversations;

-- Telemetry (replace CHECK(true))
DROP POLICY IF EXISTS "System can insert analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "System can insert performance" ON public.performance_metrics;

-- =================================================================
-- C. Create new least-privilege policies
-- =================================================================

-- C.1. Profiles: No public read. Self-read/update only. Admins can manage.
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent self-role-escalation. The role must not change from its current value.
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- C.2. Ads: Public read for active ads, owner-only writes.
CREATE POLICY "Public can view active ads" ON public.ads
  FOR SELECT TO anon, authenticated USING (status = 'active');

CREATE POLICY "Users can insert their own ads" ON public.ads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Owners can update their own ads" ON public.ads
  FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Owners can delete their own ads" ON public.ads
  FOR DELETE TO authenticated USING (auth.uid() = seller_id);

-- C.3. Conversations & Messages: Participant-only access.
CREATE POLICY "Participants can view conversations" ON public.conversations
  FOR SELECT TO authenticated USING (auth.uid() IN (participant_1, participant_2));

CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id AND auth.uid() IN (c.participant_1, c.participant_2)
  ));

CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND auth.uid() IN (c.participant_1, c.participant_2)
    )
  );

-- C.4. Notifications: Recipient-only read/update. No user inserts.
CREATE POLICY "Users can read their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- C.5. Financial Tables: Read-only for owners. No user writes.
CREATE POLICY "Owners can view their own wallet" ON public.wallets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Owners can view their own transactions" ON public.transactions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.wallets w WHERE w.id = transactions.wallet_id AND w.user_id = auth.uid()));

CREATE POLICY "Parties can view their escrow transactions" ON public.escrow_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- C.6. Reports: Authenticated users can insert.
CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- C.7. System & Security Logs: No ordinary user access.
-- Admin policies are managed separately and are assumed to exist.
-- By enabling RLS and not providing policies for authenticated/anon, we deny access.

-- C.8. Phone OTPs: No user access at all.
-- By enabling RLS and not providing any policies, all access is denied.
-- This table should only be accessed by the service_role key on the server.

-- C.9. Telemetry: No user access.
-- By enabling RLS and not providing policies, we deny access.
-- A separate policy for a trusted server role would be needed if direct insertion is required.

-- =================================================================
-- D. Admin Policies (Re-affirm admin full access where needed)
-- =================================================================

CREATE POLICY "Admins have full access" ON public.profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access" ON public.ads FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access" ON public.reports FOR ALL USING (public.is_admin());
-- Add other admin policies as required, following this pattern.