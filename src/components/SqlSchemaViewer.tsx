import React from 'react';
import { X, Copy, Check, Database } from 'lucide-react';
import { toast } from 'sonner';

interface SqlSchemaViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCRIPT = `-- Sealify Complete Production PostgreSQL Database Schema & Security Policies
-- Canonical schema matching the current application model.
-- Apply this file to a clean database, then apply:
--   supabase/migrations/20240818000000_rls_reconciliation.sql
--   supabase/seed.sql
--   supabase/storage-policies.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS / PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- ============================================================================
-- 2. CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
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

-- ============================================================================
-- 3. SUBCATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subcategories (
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

-- ============================================================================
-- 4. LISTINGS / ADS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ads (
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

-- ============================================================================
-- 5. LISTING IMAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ad_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id),
  image_url text NOT NULL,
  storage_path text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. ANNOUNCEMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.announcements (
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

-- ============================================================================
-- 7. REVIEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
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

-- ============================================================================
-- 8. BUYER REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.buyer_requests (
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

-- ============================================================================
-- 9. BUYER REQUEST RESPONSES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.buyer_request_responses (
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

-- ============================================================================
-- 10. FAVORITES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  ad_id uuid NOT NULL REFERENCES public.ads(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ad_id)
);

-- ============================================================================
-- 11. SEARCH ALERTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.search_alerts (
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

-- ============================================================================
-- 12. USER SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
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

-- ============================================================================
-- 13. PUSH SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  endpoint text NOT NULL,
  p256dh text,
  auth text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

-- ============================================================================
-- 14. VERIFICATION REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
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

-- ============================================================================
-- 15. PASSWORD REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.password_requests (
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

-- ============================================================================
-- 16. CONVERSATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
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

-- ============================================================================
-- 17. MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
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

-- ============================================================================
-- 18. NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  link_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 19. REPORTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
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

-- ============================================================================
-- 20. AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details text NOT NULL,
  type text NOT NULL,
  user_id uuid REFERENCES public.profiles(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 21. INTRUSION LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.intrusion_logs (
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

-- ============================================================================
-- 22. SYSTEM CONFIGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.system_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 23. SITE SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  site_name text,
  site_description text,
  og_image text,
  contact_email text,
  contact_phone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 24. PROMOTION PLANS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promotion_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  months integer NOT NULL,
  label text NOT NULL,
  rate numeric(14,2) NOT NULL,
  badge text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 25. SAFE SPOTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.safe_spots (
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

-- ============================================================================
-- 26. RECENT DEALS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recent_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_title text NOT NULL,
  price numeric(14,2) NOT NULL,
  location text NOT NULL,
  time text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 27. WALLETS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id),
  balance numeric(14,2) NOT NULL DEFAULT 0,
  pending_balance numeric(14,2) NOT NULL DEFAULT 0,
  total_withdrawn numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 28. TRANSACTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
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

-- ============================================================================
-- 29. PROMOTION PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promotion_payments (
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

-- ============================================================================
-- 30. DISPUTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.disputes (
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

-- ============================================================================
-- 31. ESCROW ORDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.escrow_orders (
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

-- ============================================================================
-- 32. ANALYTICS EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
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

-- ============================================================================
-- 33. PERFORMANCE METRICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  metric_name text NOT NULL,
  value numeric(10,2) NOT NULL,
  rating text NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  timestamp timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_ads_seller_id ON public.ads(seller_id);
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON public.ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_images_ad_id ON public.ad_images(ad_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_user_id ON public.buyer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_parties ON public.escrow_orders(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);

-- ============================================================================
-- DEFAULT SEED DATA
-- ============================================================================
INSERT INTO public.promotion_plans (months, label, rate, badge, is_active) VALUES
  (1, '1 Month', 15000, 'STARTER', TRUE),
  (3, '3 Months', 39000, 'POPULAR', TRUE),
  (6, '6 Months', 66000, 'BEST VALUE', TRUE),
  (12, '12 Months', 108000, 'ENTERPRISE', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.system_configs (key, value, description) VALUES
  ('maintenance_mode', 'false'::jsonb, 'Enable maintenance mode to lock public marketplace'),
  ('auto_approve_ads', 'true'::jsonb, 'Automatically approve new classified ads without admin review'),
  ('require_id_for_posting', 'false'::jsonb, 'Require ID verification before allowing ad posting'),
  ('ai_spam_filter', 'true'::jsonb, 'Enable AI-powered spam and fraud detection'),
  ('max_images_per_ad', '10'::jsonb, 'Maximum images per classified ad'),
  ('max_file_size_mb', '20'::jsonb, 'Maximum file upload size in MB'),
  ('platform_fee_percent', '0'::jsonb, 'Platform commission percentage on sales'),
  ('min_payout_amount', '1000'::jsonb, 'Minimum withdrawal amount in NGN'),
  ('payout_processing_hours', '4'::jsonb, 'Standard payout processing time in hours')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

INSERT INTO public.site_settings (logo_url, site_name, site_description, og_image, contact_email, contact_phone) VALUES
  ('/logo.png', 'Sealify Nigeria', 'Nigeria''s Trusted Local Marketplace for Ogbomosoland & Oyo State.', '/logo.png', 'support@sealify.ng', '+234 813 120 8468')
ON CONFLICT DO NOTHING;

INSERT INTO public.safe_spots (name, zone, category, address, distance, hours, cctv_verified, latitude, longitude, is_active) VALUES
  ('Ogbomoso Divisional Police HQ', 'Police HQ', 'Police Safe Zone', 'Police Headquarters, Ogbomoso, Oyo State', 'Central Hub', '24/7', TRUE, 8.1367, 4.2500, TRUE),
  ('LAUTECH Main Gate Security Post', 'LAUTECH Area', 'Police Safe Zone', 'LAUTECH Main Gate, Ogbomoso, Oyo State', 'Campus Entry', '24/7', TRUE, 8.1450, 4.2480, TRUE),
  ('Under G Shopping Complex', 'LAUTECH Area', 'Shopping Mall', 'Under G Market, Ogbomoso, Oyo State', 'Student Hub', '8:00 AM - 8:00 PM', TRUE, 8.1420, 4.2490, TRUE),
  ('Takie Square Mall', 'Takie / Center', 'Shopping Mall', 'Takie Square, Ogbomoso, Oyo State', 'City Center', '9:00 AM - 7:00 PM', TRUE, 8.1380, 4.2520, TRUE),
  ('Sabo Market Security Post', 'Sabo Market Zone', 'Police Safe Zone', 'Sabo Market, Ogbomoso, Oyo State', 'Market Center', '7:00 AM - 6:00 PM', TRUE, 8.1350, 4.2550, TRUE),
  ('Ogbomoso Public Library', 'Takie / Center', 'Public Library', 'Public Library, Ogbomoso, Oyo State', 'Quiet Zone', '8:00 AM - 6:00 PM', TRUE, 8.1390, 4.2510, TRUE),
  ('Adenike Area Café Hub', 'LAUTECH Area', 'Café', 'Adenike Junction, Ogbomoso, Oyo State', 'Student Area', '7:00 AM - 10:00 PM', TRUE, 8.1430, 4.2470, TRUE),
  ('General Hospital Security Post', 'General Area', 'Police Safe Zone', 'LAUTECH Teaching Hospital, Ogbomoso', 'Hospital Zone', '24/7', TRUE, 8.1400, 4.2530, TRUE),
  ('Oja Oba Market Security', 'Sabo Market Zone', 'Police Safe Zone', 'Oja Oba Market, Ogbomoso', 'Market Center', '7:00 AM - 6:00 PM', TRUE, 8.1340, 4.2540, TRUE),
  ('Ilorin Garage Park Office', 'Takie / Center', 'Café', 'Ilorin Garage, Takie, Ogbomoso', 'Transport Hub', '6:00 AM - 8:00 PM', TRUE, 8.1370, 4.2515, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
-- Enable RLS for all tables
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
ALTER TABLE public.safe_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Public marketplace content
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

-- User-owned records
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

-- Conversations, messages, and notifications
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

-- Moderation and financial records
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

-- Security and system tables
CREATE POLICY audit_logs_admin_read ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY intrusion_logs_admin_read ON public.intrusion_logs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY system_configs_admin_read ON public.system_configs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY system_configs_admin_write ON public.system_configs
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY analytics_admin_read ON public.analytics_events
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY performance_admin_read ON public.performance_metrics
  FOR SELECT TO authenticated USING (public.is_admin());
`;

const SqlSchemaViewer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    toast.success('SQL script copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-lg text-white">Supabase SQL Migration Script</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 my-3">
          Copy and run this migration in your Supabase SQL Editor to set up tables supporting full database integration.
        </p>

        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 leading-relaxed">
          <pre>{SQL_SCRIPT}</pre>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-500">Sealify Core Database Migration</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-colors shadow"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy SQL Script'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SqlSchemaViewer;
