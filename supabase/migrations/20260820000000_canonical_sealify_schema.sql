-- Sealify canonical current schema baseline.
--
-- This migration is for a clean, separate staging database. It is deliberately
-- not rerunnable against an existing database and contains no DROP/CASCADE
-- operations. Historical migrations are preserved but are not the initializer
-- for the current application model.
--
-- Apply order:
--   1. This schema baseline
--   2. 20240818000000_rls_reconciliation.sql
--   3. Staging-only seed data and Storage/Auth configuration

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL
     OR to_regclass('public.ads') IS NOT NULL
     OR to_regclass('public.ad_images') IS NOT NULL
     OR to_regclass('public.escrow_orders') IS NOT NULL THEN
    RAISE EXCEPTION 'Sealify canonical baseline requires a clean database';
  END IF;
END
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  avatar_url text,
  cover_url text,
  store_banner_url text,
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  verified boolean NOT NULL DEFAULT false,
  verification_type text NOT NULL DEFAULT 'none',
  business_name text,
  business_category text,
  business_address text,
  cac_number text,
  business_hours text,
  bank_name text,
  account_number text,
  account_name text,
  website_url text,
  instagram_handle text,
  twitter_handle text,
  whatsapp_number text,
  bio text,
  member_since timestamptz NOT NULL DEFAULT now(),
  location text DEFAULT 'Ogbomoso, Oyo State',
  status text NOT NULL DEFAULT 'active',
  restriction_reason text,
  appeal_status text NOT NULL DEFAULT 'none',
  total_value_traded numeric(14,2) NOT NULL DEFAULT 0,
  completed_deals integer NOT NULL DEFAULT 0,
  email_notifications boolean NOT NULL DEFAULT true,
  whatsapp_notifications boolean NOT NULL DEFAULT true,
  hide_phone_publicly boolean NOT NULL DEFAULT false,
  hide_location_publicly boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon_name text NOT NULL,
  color text NOT NULL,
  description text,
  parent_id text REFERENCES public.categories(id),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.subcategories (
  id text PRIMARY KEY,
  category_id text NOT NULL REFERENCES public.categories(id),
  name text NOT NULL,
  description text,
  icon_name text,
  listing_type text NOT NULL DEFAULT 'product',
  spec_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  title text NOT NULL,
  description text NOT NULL,
  price numeric(14,2) NOT NULL,
  original_price numeric(14,2),
  category_id text NOT NULL REFERENCES public.categories(id),
  subcategory_id text REFERENCES public.subcategories(id),
  condition text NOT NULL,
  location text NOT NULL DEFAULT 'Ogbomoso, Oyo State',
  status text NOT NULL DEFAULT 'active',
  views_count integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  promotion_plan_name text,
  promotion_duration_months integer,
  promotion_start_date timestamptz,
  promotion_end_date timestamptz,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_proof_url text,
  amount_paid numeric(14,2),
  images text[] NOT NULL DEFAULT '{}',
  video_url text,
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ad_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id),
  image_url text NOT NULL,
  storage_path text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  target_roles text[] NOT NULL DEFAULT ARRAY['buyer','seller'],
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  buyer_id uuid NOT NULL REFERENCES public.profiles(id),
  buyer_name text NOT NULL,
  buyer_avatar text,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.buyer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  user_name text NOT NULL,
  user_avatar text,
  title text NOT NULL,
  category_id text NOT NULL REFERENCES public.categories(id),
  max_budget numeric(14,2) NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  responses_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.buyer_request_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.buyer_requests(id),
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  seller_name text NOT NULL,
  seller_avatar text,
  proposed_price numeric(14,2) NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  ad_id uuid NOT NULL REFERENCES public.ads(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ad_id)
);

CREATE TABLE public.search_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  query text NOT NULL,
  category_id text REFERENCES public.categories(id),
  max_price numeric(14,2),
  location text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id),
  email_notifications boolean NOT NULL DEFAULT true,
  whatsapp_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  price_drop_alerts boolean NOT NULL DEFAULT true,
  new_message_alerts boolean NOT NULL DEFAULT true,
  weekly_digest boolean NOT NULL DEFAULT true,
  promotion_expiry_reminders boolean NOT NULL DEFAULT true,
  language text NOT NULL DEFAULT 'en',
  theme text NOT NULL DEFAULT 'dark',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  endpoint text NOT NULL,
  p256dh text,
  auth text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

CREATE TABLE public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  user_name text NOT NULL,
  user_email text NOT NULL,
  type text NOT NULL,
  doc_type text,
  doc_number text,
  doc_url text,
  id_document_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.password_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  user_email text NOT NULL,
  user_name text NOT NULL,
  nin text NOT NULL,
  id_document_url text NOT NULL,
  new_password_hash text,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id),
  participant_1 uuid NOT NULL REFERENCES public.profiles(id),
  participant_2 uuid NOT NULL REFERENCES public.profiles(id),
  last_message text,
  last_message_time timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ad_id, participant_1, participant_2)
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id),
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  receiver_id uuid NOT NULL REFERENCES public.profiles(id),
  ad_id uuid NOT NULL REFERENCES public.ads(id),
  content text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  link_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES public.ads(id),
  ad_title text,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id),
  reporter_name text,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details text NOT NULL,
  type text NOT NULL,
  user_id uuid REFERENCES public.profiles(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.intrusion_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  attempted_email text NOT NULL,
  device_info jsonb,
  media_captured boolean NOT NULL DEFAULT false,
  media_status text,
  status text NOT NULL DEFAULT 'flagged',
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.system_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  site_name text,
  site_description text,
  og_image text,
  contact_email text,
  contact_phone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.promotion_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  months integer NOT NULL,
  label text NOT NULL,
  rate numeric(14,2) NOT NULL,
  badge text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.safe_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  zone text NOT NULL,
  category text NOT NULL,
  address text NOT NULL,
  distance text NOT NULL,
  hours text NOT NULL,
  cctv_verified boolean NOT NULL DEFAULT false,
  latitude numeric,
  longitude numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.recent_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_title text NOT NULL,
  price numeric(14,2) NOT NULL,
  location text NOT NULL,
  time text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id),
  balance numeric(14,2) NOT NULL DEFAULT 0,
  pending_balance numeric(14,2) NOT NULL DEFAULT 0,
  total_withdrawn numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallets(id),
  type text NOT NULL,
  amount numeric(14,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  description text NOT NULL,
  reference text,
  related_ad_id uuid REFERENCES public.ads(id),
  related_listing_id uuid REFERENCES public.ads(id),
  related_user_id uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.promotion_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  ad_id uuid NOT NULL REFERENCES public.ads(id),
  amount numeric(14,2) NOT NULL,
  payment_method text,
  payment_proof_url text,
  status text NOT NULL DEFAULT 'pending',
  plan_name text NOT NULL,
  duration_months integer NOT NULL,
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  user_email text NOT NULL,
  receipt_ref text,
  item_title text NOT NULL,
  counterparty text NOT NULL,
  category text NOT NULL,
  reason text NOT NULL,
  details text NOT NULL,
  evidence_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.escrow_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id),
  buyer_id uuid NOT NULL REFERENCES public.profiles(id),
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  amount numeric(14,2) NOT NULL,
  status text NOT NULL DEFAULT 'created',
  handover_code text UNIQUE NOT NULL,
  qr_code_url text,
  inspection_location text,
  inspection_completed_at timestamptz,
  released_at timestamptz,
  disputed_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_name text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  url text,
  referrer text,
  user_agent text,
  viewport text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  metric_name text NOT NULL,
  value numeric(10,2) NOT NULL,
  rating text NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  timestamp timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_ads_seller_id ON public.ads(seller_id);
CREATE INDEX idx_ads_category_id ON public.ads(category_id);
CREATE INDEX idx_ads_status ON public.ads(status);
CREATE INDEX idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX idx_ad_images_ad_id ON public.ad_images(ad_id, sort_order);
CREATE INDEX idx_reviews_seller_id ON public.reviews(seller_id);
CREATE INDEX idx_buyer_requests_user_id ON public.buyer_requests(user_id);
CREATE INDEX idx_conversations_participants ON public.conversations(participant_1, participant_2);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id, created_at);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX idx_transactions_wallet_id ON public.transactions(wallet_id, created_at DESC);
CREATE INDEX idx_escrow_orders_parties ON public.escrow_orders(buyer_id, seller_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);

CREATE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = $1 AND role = 'admin'
  );
$$;

CREATE FUNCTION public.conversation_participants_unchanged(
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
    SELECT 1 FROM public.conversations
    WHERE id = p_conversation_id
      AND participant_1 = p_participant_1
      AND participant_2 = p_participant_2
  );
$$;
