-- Sealify Phase 2D: canonical RLS reconciliation
--
-- This migration supersedes the policy sets from:
--   20240101000000_initial_schema.sql
--   20240127000001_rls_performance_fixes.sql
--   20240816000000_rls_least_privilege.sql
--   20240817000000_rls_remediation.sql
--
-- It is intentionally unapplied. Run it only after confirming the production
-- catalog and reviewing SUPABASE_RLS_SECURITY_TEST_PLAN.md. The confirmed
-- active image and escrow tables are ad_images and escrow_orders.

DO $$
DECLARE
  required_table name;
  required_tables constant name[] := ARRAY[
    'profiles', 'ads', 'ad_images', 'categories', 'subcategories', 'announcements',
    'reviews', 'buyer_requests', 'buyer_request_responses', 'favorites',
    'search_alerts', 'user_settings', 'push_subscriptions', 'verification_requests',
    'password_requests', 'conversations', 'messages', 'notifications', 'reports',
    'audit_logs', 'intrusion_logs', 'system_configs', 'wallets', 'transactions',
    'escrow_orders', 'promotion_payments', 'site_settings', 'promotion_plans',
    'disputes', 'safe_spots', 'recent_deals', 'analytics_events', 'performance_metrics'
  ];
BEGIN
  FOREACH required_table IN ARRAY required_tables LOOP
    IF to_regclass(format('public.%I', required_table)) IS NULL THEN
      RAISE EXCEPTION 'Sealify active schema is incomplete: expected public.%', required_table;
    END IF;
  END LOOP;
END
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = $1 AND role = 'admin'
  );
$$;

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
      AND participant_1 = p_participant_1
      AND participant_2 = p_participant_2
  );
$$;

-- Remove every existing policy on the active model before installing the
-- canonical set. PostgreSQL combines permissive policies with OR semantics;
-- leaving an old policy behind could therefore broaden access.
DO $$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY[
        'profiles', 'ads', 'ad_images', 'categories', 'subcategories', 'announcements',
        'reviews', 'buyer_requests', 'buyer_request_responses', 'favorites',
        'search_alerts', 'user_settings', 'push_subscriptions',
        'verification_requests', 'password_requests', 'conversations',
        'messages', 'notifications', 'reports', 'audit_logs',
        'intrusion_logs', 'system_configs', 'wallets',
        'transactions', 'escrow_orders', 'promotion_payments', 'site_settings',
        'promotion_plans', 'disputes', 'safe_spots', 'recent_deals', 'analytics_events',
        'performance_metrics'
      ]::name[])
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_row.policyname, policy_row.schemaname, policy_row.tablename
    );
  END LOOP;
END
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intrusion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Public marketplace content.
CREATE POLICY profiles_select_self_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id OR public.is_admin());
CREATE POLICY profiles_insert_self_buyer_or_admin ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR ((select auth.uid()) = id AND role = 'buyer'));
CREATE POLICY profiles_update_self_without_role_change_or_admin ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id OR public.is_admin())
  WITH CHECK (public.is_admin() OR ((select auth.uid()) = id AND role = public.current_user_role()));
CREATE POLICY profiles_delete_admin_only ON public.profiles
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY ads_select_active_public_or_owner ON public.ads
  FOR SELECT TO anon, authenticated
  USING (status = 'active' OR (select auth.uid()) = seller_id OR public.is_admin());
CREATE POLICY ads_insert_owner ON public.ads
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = seller_id);
CREATE POLICY ads_update_owner_or_admin ON public.ads
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = seller_id OR public.is_admin())
  WITH CHECK ((select auth.uid()) = seller_id OR public.is_admin());
CREATE POLICY ads_delete_owner_or_admin ON public.ads
  FOR DELETE TO authenticated USING ((select auth.uid()) = seller_id OR public.is_admin());

-- Images are public only when attached to an active ad. Sellers can manage
-- images only when the parent ad belongs to them.
CREATE POLICY ad_images_select_active_ad_or_owner ON public.ad_images
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ads a
      WHERE a.id = ad_id
        AND (a.status = 'active' OR a.seller_id = (select auth.uid()) OR public.is_admin())
    )
  );
CREATE POLICY ad_images_insert_ad_owner ON public.ad_images
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ads a
      WHERE a.id = ad_id AND (a.seller_id = (select auth.uid()) OR public.is_admin())
    )
  );
CREATE POLICY ad_images_update_ad_owner_or_admin ON public.ad_images
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ads a
      WHERE a.id = ad_id AND (a.seller_id = (select auth.uid()) OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ads a
      WHERE a.id = ad_id AND (a.seller_id = (select auth.uid()) OR public.is_admin())
    )
  );
CREATE POLICY ad_images_delete_ad_owner_or_admin ON public.ad_images
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ads a
      WHERE a.id = ad_id AND (a.seller_id = (select auth.uid()) OR public.is_admin())
    )
  );

CREATE POLICY categories_select_active_public ON public.categories
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY categories_admin_write ON public.categories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY subcategories_select_active_public ON public.subcategories
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY subcategories_admin_write ON public.subcategories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY announcements_select_active_public ON public.announcements
  FOR SELECT TO anon, authenticated USING (active = true OR public.is_admin());
CREATE POLICY announcements_admin_write ON public.announcements
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY reviews_select_approved_public ON public.reviews
  FOR SELECT TO anon, authenticated USING (status = 'approved' OR public.is_admin());
CREATE POLICY reviews_insert_buyer ON public.reviews
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = buyer_id);
CREATE POLICY reviews_admin_write ON public.reviews
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY safe_spots_select_active_public ON public.safe_spots
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY safe_spots_admin_write ON public.safe_spots
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY recent_deals_select_public ON public.recent_deals
  FOR SELECT TO anon, authenticated USING (id IS NOT NULL);
CREATE POLICY recent_deals_admin_write ON public.recent_deals
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY site_settings_select_public ON public.site_settings
  FOR SELECT TO anon, authenticated USING (id IS NOT NULL);
CREATE POLICY site_settings_admin_write ON public.site_settings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY promotion_plans_select_active_public ON public.promotion_plans
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY promotion_plans_admin_write ON public.promotion_plans
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- User-owned records.
CREATE POLICY buyer_requests_select_open_or_owner ON public.buyer_requests
  FOR SELECT TO anon, authenticated
  USING (status = 'open' OR (select auth.uid()) = user_id OR public.is_admin());
CREATE POLICY buyer_requests_insert_owner ON public.buyer_requests
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY buyer_requests_update_owner_or_admin ON public.buyer_requests
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id OR public.is_admin())
  WITH CHECK ((select auth.uid()) = user_id OR public.is_admin());
CREATE POLICY buyer_requests_delete_owner_or_admin ON public.buyer_requests
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id OR public.is_admin());

CREATE POLICY buyer_responses_select_participant_or_admin ON public.buyer_request_responses
  FOR SELECT TO authenticated
  USING (
    seller_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.buyer_requests br
      WHERE br.id = request_id AND br.user_id = (select auth.uid())
    )
    OR public.is_admin()
  );
CREATE POLICY buyer_responses_insert_seller ON public.buyer_request_responses
  FOR INSERT TO authenticated WITH CHECK (seller_id = (select auth.uid()));
CREATE POLICY buyer_responses_admin_write ON public.buyer_request_responses
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY favorites_owner ON public.favorites
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY search_alerts_owner ON public.search_alerts
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY user_settings_owner ON public.user_settings
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY push_subscriptions_owner ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());

CREATE POLICY verification_select_owner_or_admin ON public.verification_requests
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY verification_insert_owner ON public.verification_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY verification_admin_write ON public.verification_requests
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY password_requests_select_owner_or_admin ON public.password_requests
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY password_requests_insert_owner ON public.password_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY password_requests_admin_write ON public.password_requests
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Conversations, messages, and notifications.
CREATE POLICY conversations_select_participant_or_admin ON public.conversations
  FOR SELECT TO authenticated
  USING ((select auth.uid()) IN (participant_1, participant_2) OR public.is_admin());
CREATE POLICY conversations_insert_participant ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IN (participant_1, participant_2));
CREATE POLICY conversations_update_participant_or_admin ON public.conversations
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) IN (participant_1, participant_2) OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR ((select auth.uid()) IN (participant_1, participant_2)
      AND public.conversation_participants_unchanged(id, participant_1, participant_2))
  );
CREATE POLICY conversations_admin_delete ON public.conversations
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY messages_select_participant_or_admin ON public.messages
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR sender_id = (select auth.uid())
    OR receiver_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (select auth.uid()) IN (c.participant_1, c.participant_2)
    )
  );
CREATE POLICY messages_insert_sender_participant ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (select auth.uid())
    AND (
      receiver_id = (select auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_id
          AND (select auth.uid()) IN (c.participant_1, c.participant_2)
      )
    )
  );
CREATE POLICY messages_admin_write ON public.messages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY notifications_select_owner_or_admin ON public.notifications
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY notifications_update_owner_or_admin ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY notifications_admin_write ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY notifications_admin_delete ON public.notifications
  FOR DELETE TO authenticated USING (public.is_admin());

-- Moderation and financial records.
CREATE POLICY reports_insert_authenticated ON public.reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = (select auth.uid()));
CREATE POLICY reports_admin_write ON public.reports
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY disputes_select_owner_or_admin ON public.disputes
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY disputes_insert_owner ON public.disputes
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY disputes_admin_write ON public.disputes
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY promotions_select_owner_or_admin ON public.promotion_payments
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY promotions_insert_owner ON public.promotion_payments
  FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY promotions_admin_write ON public.promotion_payments
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY wallets_select_owner_or_admin ON public.wallets
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY wallets_admin_write ON public.wallets
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY transactions_select_owner_or_admin ON public.transactions
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.wallets w
      WHERE w.id = wallet_id AND w.user_id = (select auth.uid())
    )
  );
CREATE POLICY transactions_admin_write ON public.transactions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY escrow_orders_select_party_or_admin ON public.escrow_orders
  FOR SELECT TO authenticated
  USING (buyer_id = (select auth.uid()) OR seller_id = (select auth.uid()) OR public.is_admin());
CREATE POLICY escrow_orders_insert_buyer ON public.escrow_orders
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (
      buyer_id = (select auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.ads a
        WHERE a.id = ad_id AND a.seller_id = seller_id
      )
    )
  );
CREATE POLICY escrow_orders_admin_write ON public.escrow_orders
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Security and system tables. Service-role/server operations bypass RLS;
-- ordinary anon/authenticated clients receive no policies here.
CREATE POLICY audit_logs_admin_read ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY intrusion_logs_admin_read ON public.intrusion_logs
  FOR SELECT TO authenticated USING (public.is_admin());
-- system_configs may contain operational controls and is not public config.
-- Public settings belong in site_settings or a purpose-built safe view.
CREATE POLICY system_configs_admin_read ON public.system_configs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY system_configs_admin_write ON public.system_configs
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY analytics_admin_read ON public.analytics_events
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY performance_admin_read ON public.performance_metrics
  FOR SELECT TO authenticated USING (public.is_admin());
