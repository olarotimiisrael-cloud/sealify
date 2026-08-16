-- Sealify Phase 2B: least-privilege RLS for the active profiles/ads schema.
--
-- This migration is intentionally not executed automatically. Apply it first
-- in a staging Supabase project and run the security test plan in
-- SUPABASE_RLS_SECURITY_TEST_PLAN.md.
--
-- The repository also contains a legacy users/listings SQL model in
-- supabase/schema.sql and the admin schema viewer. Those objects are not
-- modified here because their ownership columns differ from the active
-- application schema and require a separate migration decision.

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL OR to_regclass('public.ads') IS NULL THEN
    RAISE EXCEPTION 'Sealify active schema not detected: expected public.profiles and public.ads';
  END IF;
END
$$;

-- Keep role checks outside client-controlled data and avoid search_path hijacking.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Prevent a profile owner from changing participant identity during an update.
CREATE OR REPLACE FUNCTION public.conversation_participants_unchanged(
  p_conversation_id uuid,
  p_participant_1 uuid,
  p_participant_2 uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE id = p_conversation_id
      AND conversations.participant_1 = p_participant_1
      AND conversations.participant_2 = p_participant_2
  );
$$;

-- Remove all existing policies from the active tables before installing one
-- explicit policy set. RLS remains enabled throughout.
DO $$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY[
        'profiles', 'ads', 'categories', 'subcategories',
        'conversations', 'messages', 'notifications', 'favorites',
        'verification_requests', 'password_requests', 'promotion_payments',
        'reports', 'disputes', 'reviews', 'buyer_requests', 'search_alerts',
        'announcements', 'system_configs', 'site_settings', 'promotion_plans',
        'safe_spots', 'intrusion_logs', 'recent_deals', 'audit_logs',
        'wallets', 'transactions', 'escrow_transactions', 'user_settings',
        'buyer_request_responses', 'push_subscriptions', 'phone_otps'
      ]::name[])
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  END LOOP;
END
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intrusion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- Profiles: private by default. A separate public-profile view is required
-- before exposing selected profile fields to anonymous visitors.
CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id OR public.is_admin());

CREATE POLICY profiles_insert_self_buyer ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id AND role = 'buyer');

CREATE POLICY profiles_insert_admin ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY profiles_update_self_without_role_change ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR ((select auth.uid()) = id AND role = public.current_user_role())
  );

CREATE POLICY profiles_delete_admin_only ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Public marketplace data.
CREATE POLICY ads_select_public_active_or_owner ON public.ads
  FOR SELECT TO anon, authenticated
  USING (status = 'active' OR (select auth.uid()) = seller_id OR public.is_admin());

CREATE POLICY ads_insert_owner ON public.ads
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = seller_id);

CREATE POLICY ads_update_owner_or_admin ON public.ads
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = seller_id OR public.is_admin())
  WITH CHECK ((select auth.uid()) = seller_id OR public.is_admin());

CREATE POLICY ads_delete_owner_or_admin ON public.ads
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = seller_id OR public.is_admin());

CREATE POLICY categories_public_read ON public.categories
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY categories_admin_write ON public.categories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY subcategories_public_read ON public.subcategories
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY subcategories_admin_write ON public.subcategories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Private communications.
CREATE POLICY conversations_select_participant_or_admin ON public.conversations
  FOR SELECT TO authenticated
  USING ((select auth.uid()) IN (participant_1, participant_2) OR public.is_admin());

CREATE POLICY conversations_insert_participant ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IN (participant_1, participant_2));

CREATE POLICY conversations_update_participant_preserving_identity ON public.conversations
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) IN (participant_1, participant_2) OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR ((select auth.uid()) IN (participant_1, participant_2)
      AND public.conversation_participants_unchanged(id, participant_1, participant_2))
  );

CREATE POLICY messages_select_participant_or_admin ON public.messages
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR (sender_id = (select auth.uid()) OR receiver_id = (select auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
        AND (select auth.uid()) IN (participant_1, participant_2)
    )
  );

CREATE POLICY messages_insert_sender_participant ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (select auth.uid())
    AND (
      receiver_id = (select auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.conversations
        WHERE conversations.id = messages.conversation_id
          AND (select auth.uid()) IN (participant_1, participant_2)
      )
    )
  );

CREATE POLICY messages_update_admin_only ON public.messages
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY messages_delete_admin_only ON public.messages
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY notifications_select_own_or_admin ON public.notifications
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY notifications_update_own_or_admin ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY notifications_admin_insert ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY notifications_admin_delete ON public.notifications
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY favorites_own_or_admin ON public.favorites
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());

-- User-submitted workflows; review and status changes are admin-only.
CREATE POLICY verification_select_own_or_admin ON public.verification_requests
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY verification_insert_own ON public.verification_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY verification_admin_write ON public.verification_requests
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY password_requests_select_own_or_admin ON public.password_requests
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY password_requests_insert_own ON public.password_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY password_requests_admin_write ON public.password_requests
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY promotions_select_own_or_admin ON public.promotion_payments
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY promotions_insert_own ON public.promotion_payments
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY promotions_admin_write ON public.promotion_payments
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY reports_insert_authenticated ON public.reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = (select auth.uid()));
CREATE POLICY reports_admin_read_write ON public.reports
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY disputes_select_own_or_admin ON public.disputes
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY disputes_insert_own ON public.disputes
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY disputes_admin_write ON public.disputes
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY reviews_select_approved_public ON public.reviews
  FOR SELECT TO anon, authenticated USING (status = 'approved' OR public.is_admin());
CREATE POLICY reviews_insert_buyer ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (buyer_id = (select auth.uid()));
CREATE POLICY reviews_admin_write ON public.reviews
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY buyer_requests_select_open_or_owner ON public.buyer_requests
  FOR SELECT TO anon, authenticated
  USING (status = 'open' OR user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY buyer_requests_insert_owner ON public.buyer_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY buyer_requests_update_owner_or_admin ON public.buyer_requests
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY buyer_requests_delete_owner_or_admin ON public.buyer_requests
  FOR DELETE TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());

CREATE POLICY search_alerts_own_or_admin ON public.search_alerts
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());

-- Public platform content is readable, but writable only by admins.
CREATE POLICY announcements_public_active_read ON public.announcements
  FOR SELECT TO anon, authenticated USING (active = true OR public.is_admin());
CREATE POLICY announcements_admin_write ON public.announcements
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY system_configs_public_read ON public.system_configs
  FOR SELECT TO anon, authenticated USING (key IS NOT NULL);
CREATE POLICY system_configs_admin_write ON public.system_configs
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY site_settings_public_read ON public.site_settings
  FOR SELECT TO anon, authenticated USING (id IS NOT NULL);
CREATE POLICY site_settings_admin_write ON public.site_settings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY promotion_plans_public_active_read ON public.promotion_plans
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY promotion_plans_admin_write ON public.promotion_plans
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY safe_spots_public_active_read ON public.safe_spots
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY safe_spots_admin_write ON public.safe_spots
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY recent_deals_public_read ON public.recent_deals
  FOR SELECT TO anon, authenticated USING (id IS NOT NULL);
CREATE POLICY recent_deals_admin_write ON public.recent_deals
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY audit_logs_admin_read ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY intrusion_logs_admin_read ON public.intrusion_logs
  FOR SELECT TO authenticated USING (public.is_admin());

-- Financial data: no client writes. These tables remain only until the
-- wallet-removal phase; users can read their own records, admins can review.
CREATE POLICY wallets_select_own_or_admin ON public.wallets
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY wallets_admin_write ON public.wallets
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY transactions_select_own_or_admin ON public.transactions
  FOR SELECT TO authenticated USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.wallets WHERE wallets.id = transactions.wallet_id AND wallets.user_id = (select auth.uid()))
  );
CREATE POLICY transactions_admin_write ON public.transactions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY escrow_select_party_or_admin ON public.escrow_transactions
  FOR SELECT TO authenticated USING (
    buyer_id = (select auth.uid()) OR seller_id = (select auth.uid()) OR public.is_admin()
  );
CREATE POLICY escrow_insert_buyer ON public.escrow_transactions
  FOR INSERT TO authenticated WITH CHECK (buyer_id = (select auth.uid()));
CREATE POLICY escrow_admin_write ON public.escrow_transactions
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY user_settings_own_or_admin ON public.user_settings
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());

CREATE POLICY buyer_responses_select_party_or_admin ON public.buyer_request_responses
  FOR SELECT TO authenticated USING (
    seller_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM public.buyer_requests WHERE buyer_requests.id = request_id AND buyer_requests.user_id = (select auth.uid()))
    OR public.is_admin()
  );
CREATE POLICY buyer_responses_insert_seller ON public.buyer_request_responses
  FOR INSERT TO authenticated WITH CHECK (seller_id = (select auth.uid()));
CREATE POLICY buyer_responses_admin_write ON public.buyer_request_responses
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY push_subscriptions_own_or_admin ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());

-- OTP records are server-only; no anon or authenticated policies are granted.
