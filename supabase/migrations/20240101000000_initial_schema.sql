-- Sealify Nigeria Marketplace - Complete Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned', 'restricted');
CREATE TYPE verification_type AS ENUM ('individual', 'business', 'premium', 'student', 'none');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'draft', 'pending_review');
CREATE TYPE listing_condition AS ENUM ('Brand New', 'Like New', 'Used - Good', 'Used - Fair');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE notification_type AS ENUM ('price_drop', 'message', 'offer', 'alert_match', 'system', 'recommendation', 'payment', 'security', 'verification');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE password_request_status AS ENUM ('pending', 'approved', 'declined');
CREATE TYPE promotion_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
CREATE TYPE dispute_status AS ENUM ('pending', 'in_review', 'resolved');
CREATE TYPE audit_type AS ENUM ('security', 'user', 'ad', 'broadcast', 'verification', 'intrusion', 'dispute', 'finance');
CREATE TYPE announcement_type AS ENUM ('info', 'warning', 'success', 'alert');
CREATE TYPE safe_spot_category AS ENUM ('Police Safe Zone', 'Public Library', 'Shopping Mall', 'Café');
CREATE TYPE safe_spot_zone AS ENUM ('LAUTECH Area', 'Takie / Center', 'Sabo Market Zone', 'Police HQ');
CREATE TYPE payment_method AS ENUM ('opay', 'card', 'transfer', 'ussd', 'paystack', 'flutterwave');
CREATE TYPE transaction_type AS ENUM ('sale', 'payout', 'promotion', 'refund', 'escrow_deposit', 'escrow_release');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed');
CREATE TYPE escrow_status AS ENUM ('created', 'funded', 'inspection', 'released', 'disputed', 'refunded');
CREATE TYPE buyer_request_status AS ENUM ('open', 'responded', 'closed');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================
-- USERS / PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  store_banner_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'buyer',
  verified BOOLEAN DEFAULT false,
  verification_type verification_type DEFAULT 'none',
  business_name TEXT,
  business_category TEXT,
  business_address TEXT,
  cac_number TEXT,
  business_hours TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  twitter_handle TEXT,
  whatsapp_number TEXT,
  email_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT true,
  hide_phone_publicly BOOLEAN DEFAULT false,
  hide_location_publicly BOOLEAN DEFAULT false,
  location TEXT DEFAULT 'Ogbomoso, Oyo State',
  member_since TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status user_status DEFAULT 'active',
  restriction_reason TEXT,
  appeal_status TEXT DEFAULT 'none',
  total_value_traded NUMERIC(14, 2) DEFAULT 0,
  completed_deals INTEGER DEFAULT 0,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  parent_id TEXT REFERENCES public.categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- SUBCATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  listing_type TEXT CHECK (listing_type IN ('product', 'service')) DEFAULT 'product',
  spec_fields JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id TEXT REFERENCES public.subcategories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(14, 2) NOT NULL,
  original_price NUMERIC(14, 2),
  condition listing_condition NOT NULL,
  location TEXT NOT NULL DEFAULT 'Ogbomoso, Oyo State',
  status listing_status DEFAULT 'active',
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  specifications JSONB DEFAULT '{}'::jsonb,
  views_count INTEGER DEFAULT 1,
  featured BOOLEAN DEFAULT false,
  promotion_plan_name TEXT,
  promotion_duration_months INTEGER DEFAULT 0,
  promotion_start_date TIMESTAMP WITH TIME ZONE,
  promotion_end_date TIMESTAMP WITH TIME ZONE,
  payment_status TEXT DEFAULT 'pending',
  payment_proof_url TEXT,
  amount_paid NUMERIC(14, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- LISTING IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  participant_1 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count_1 INTEGER DEFAULT 0,
  unread_count_2 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(listing_id, participant_1, participant_2)
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  status message_status DEFAULT 'sent',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  link_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- VERIFICATION REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  type verification_type NOT NULL,
  doc_type TEXT NOT NULL,
  doc_number TEXT NOT NULL,
  doc_url TEXT NOT NULL,
  status verification_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- PASSWORD CHANGE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.password_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  nin TEXT NOT NULL,
  id_document_url TEXT NOT NULL,
  new_password_hash TEXT NOT NULL,
  reason TEXT NOT NULL,
  status password_request_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- PROMOTION PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.promotion_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_proof_url TEXT,
  status promotion_status DEFAULT 'pending',
  plan_name TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- AD REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  listing_title TEXT NOT NULL,
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reporter_name TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- DISPUTE CASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  receipt_ref TEXT,
  item_title TEXT NOT NULL,
  counterparty TEXT NOT NULL,
  category TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  evidence_url TEXT,
  status dispute_status DEFAULT 'pending',
  admin_notes TEXT,
  assigned_moderator UUID REFERENCES public.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  details TEXT,
  type audit_type NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- SYSTEM ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type announcement_type DEFAULT 'info',
  active BOOLEAN DEFAULT true,
  target_roles user_role[] DEFAULT ARRAY['buyer', 'seller'],
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- SAFE MEETUP SPOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.safe_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zone safe_spot_zone NOT NULL,
  category safe_spot_category NOT NULL,
  address TEXT NOT NULL,
  distance TEXT,
  hours TEXT,
  cctv_verified BOOLEAN DEFAULT true,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- SYSTEM CONFIGURATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT,
  site_name TEXT DEFAULT 'Sealify Nigeria',
  site_description TEXT DEFAULT 'Nigeria''s Trusted Local Marketplace.',
  og_image TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- PROMOTION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.promotion_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  months INTEGER NOT NULL,
  label TEXT NOT NULL,
  rate NUMERIC(14, 2) NOT NULL,
  badge TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- SEARCH ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id),
  max_price NUMERIC(14, 2),
  location TEXT,
  match_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status review_status DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- BUYER REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.buyer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  title TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id),
  max_budget NUMERIC(14, 2) NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  responses_count INTEGER DEFAULT 0,
  status buyer_request_status DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- WALLET TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(14, 2) DEFAULT 0,
  pending_balance NUMERIC(14, 2) DEFAULT 0,
  total_withdrawn NUMERIC(14, 2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  description TEXT NOT NULL,
  reference TEXT,
  related_listing_id UUID REFERENCES public.listings(id),
  related_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- ESCROW TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  status escrow_status DEFAULT 'created',
  handover_code TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  inspection_location TEXT,
  inspection_completed_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  disputed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- INTRUSION LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.intrusion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempted_email TEXT NOT NULL,
  device_info JSONB,
  media_captured BOOLEAN DEFAULT false,
  media_status TEXT,
  status TEXT DEFAULT 'flagged',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- RECENT DEALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recent_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_title TEXT NOT NULL,
  price NUMERIC(14, 2) NOT NULL,
  location TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_listings_title_search ON public.listings USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON public.messages(receiver_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_status ON public.promotion_payments(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON public.escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_safe_spots_zone ON public.safe_spots(zone);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_status ON public.buyer_requests(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_spots ENABLE ROW LEVEL SECURITY;

-- Users: Users can read all profiles, update own profile
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Listings: Public read for active, sellers manage own
CREATE POLICY "Public can view active listings" ON public.listings FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own listings" ON public.listings FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Admins can manage all listings" ON public.listings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Conversations: Participants can view
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);
CREATE POLICY "Participants can create conversations" ON public.conversations FOR INSERT WITH CHECK (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

-- Messages: Participants can view and send
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

-- Notifications: Users can view own
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Favorites: Users manage own
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Wallets: Users view own
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

-- Transactions: Users view own
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wallets WHERE id = wallet_id AND user_id = auth.uid())
);

-- Escrow: Participants can view
CREATE POLICY "Participants can view escrow" ON public.escrow_transactions FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

-- Verification requests: Users view own, admins view all
CREATE POLICY "Users can view own verification" ON public.verification_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage verifications" ON public.verification_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Password requests: Users create own, admins manage
CREATE POLICY "Users can create password requests" ON public.password_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage password requests" ON public.password_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Promotion payments: Users create own, admins manage
CREATE POLICY "Users can create promotion payments" ON public.promotion_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage promotions" ON public.promotion_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Reports: Users create, admins manage
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage reports" ON public.reports FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Disputes: Users create own, admins manage
CREATE POLICY "Users can create disputes" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage disputes" ON public.disputes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews: Buyers create, sellers view
CREATE POLICY "Buyers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');

-- Buyer requests: Users create own, public view open
CREATE POLICY "Users can create buyer requests" ON public.buyer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view open requests" ON public.buyer_requests FOR SELECT USING (status = 'open');

-- Search alerts: Users manage own
CREATE POLICY "Users can manage own search alerts" ON public.search_alerts FOR ALL USING (auth.uid() = user_id);

-- Safe spots: Public read
CREATE POLICY "Public can view safe spots" ON public.safe_spots FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage safe spots" ON public.safe_spots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON public.verification_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_password_requests_updated_at BEFORE UPDATE ON public.password_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotion_payments_updated_at BEFORE UPDATE ON public.promotion_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_safe_spots_updated_at BEFORE UPDATE ON public.safe_spots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotion_plans_updated_at BEFORE UPDATE ON public.promotion_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyer_requests_updated_at BEFORE UPDATE ON public.buyer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escrow_transactions_updated_at BEFORE UPDATE ON public.escrow_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED INITIAL DATA
-- ============================================

-- Insert default categories including Solar & Clean Energy
INSERT INTO public.categories (id, name, icon_name, color, description, sort_order) VALUES
  ('vehicles', 'Vehicles', 'Car', 'bg-blue-500', 'Cars, motorcycles, trucks, and other vehicles', 1),
  ('electronics', 'Electronics', 'Smartphone', 'bg-purple-500', 'Phones, laptops, gadgets, and electronic devices', 2),
  ('real_estate', 'Real Estate', 'Home', 'bg-teal-500', 'Houses, apartments, land, and commercial properties', 3),
  ('fashion', 'Fashion', 'Shirt', 'bg-pink-500', 'Clothing, shoes, accessories, and beauty products', 4),
  ('home_furniture', 'Home & Furniture', 'Armchair', 'bg-amber-500', 'Furniture, appliances, and home decor', 5),
  ('services', 'Services', 'Wrench', 'bg-cyan-500', 'Professional services, repairs, and maintenance', 6),
  ('jobs', 'Jobs', 'Briefcase', 'bg-indigo-500', 'Job listings and recruitment', 7),
  ('beauty_health', 'Beauty & Health', 'Sparkles', 'bg-rose-500', 'Beauty products, health items, and wellness', 8),
  ('utility_energy', 'Utility & Energy', 'Zap', 'bg-yellow-500', 'Generators, solar, batteries, and power solutions', 9),
  ('solar_clean_energy', 'Solar & Clean Energy', 'Sun', 'bg-yellow-500', 'Solar panels, inverters, batteries, installation services', 10)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- Insert Solar & Clean Energy subcategories
INSERT INTO public.subcategories (id, category_id, name, description, icon_name, listing_type, spec_fields, sort_order) VALUES
  ('solar_products', 'solar_clean_energy', 'Solar Accessories & Products', 'Inverters, Solar Panels, Batteries, Charge Controllers, Wiring, Mounting Systems', 'Battery', 'product', '[
    {"key": "productType", "label": "Product Type", "type": "select", "options": ["Solar Panel", "Inverter", "Battery", "Charge Controller", "Mounting System", "Wiring & Connectors", "Monitoring System", "Other Accessory"]},
    {"key": "capacity", "label": "Capacity / Power Rating", "type": "text", "placeholder": "e.g. 5kW, 200Ah, 450W"},
    {"key": "voltage", "label": "Voltage", "type": "select", "options": ["12V", "24V", "48V", "120V", "240V", "380V", "Other"]},
    {"key": "brand", "label": "Brand / Manufacturer", "type": "text", "placeholder": "e.g. Victron, Growatt, Felicity, Bluegate"},
    {"key": "warranty", "label": "Warranty Period", "type": "select", "options": ["1 Year", "2 Years", "3 Years", "5 Years", "10 Years", "Lifetime", "No Warranty"]},
    {"key": "certification", "label": "Certifications", "type": "text", "placeholder": "e.g. IEC, CE, UL, TUV"}
  ]'::jsonb, 1),
  ('solar_installation', 'solar_clean_energy', 'Solar Installation & Maintenance Services', 'System Sizing, Installation Services, Repair & Maintenance, Energy Audits, Consultation', 'Wrench', 'service', '[
    {"key": "serviceType", "label": "Service Type", "type": "select", "options": ["System Design & Sizing", "Full Installation", "Panel Installation Only", "Inverter/Battery Installation", "System Repair", "Preventive Maintenance", "Energy Audit", "Performance Optimization", "System Upgrade"]},
    {"key": "systemSize", "label": "Typical System Size Handled", "type": "select", "options": ["Small (1-3kW)", "Medium (3-10kW)", "Large (10-50kW)", "Commercial (50kW+)", "Industrial (100kW+)"]},
    {"key": "serviceArea", "label": "Service Coverage Area", "type": "text", "placeholder": "e.g. Ogbomoso, Ibadan, Oyo State"},
    {"key": "certifications", "label": "Technician Certifications", "type": "text", "placeholder": "e.g. NABCEP, COREN, Manufacturer Certified"},
    {"key": "warrantyOffered", "label": "Workmanship Warranty", "type": "select", "options": ["3 Months", "6 Months", "1 Year", "2 Years", "5 Years", "No Warranty"]},
    {"key": "responseTime", "label": "Emergency Response Time", "type": "select", "options": ["24 Hours", "48 Hours", "3-5 Days", "1 Week", "Scheduled Only"]}
  ]'::jsonb, 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  listing_type = EXCLUDED.listing_type,
  spec_fields = EXCLUDED.spec_fields,
  sort_order = EXCLUDED.sort_order;

-- Insert default promotion plans
INSERT INTO public.promotion_plans (months, label, rate, badge, is_active) VALUES
  (1, '1 Month', 15000, 'STARTER', true),
  (3, '3 Months', 13000, 'POPULAR', true),
  (6, '6 Months', 11000, 'BEST VALUE', true),
  (12, '12 Months', 9000, 'ENTERPRISE', true)
ON CONFLICT DO NOTHING;

-- Insert default system configs
INSERT INTO public.system_configs (key, value, description) VALUES
  ('maintenance_mode', false, 'Enable maintenance mode to lock marketplace'),
  ('auto_approve_ads', true, 'Automatically approve new listings without admin review'),
  ('require_id_for_posting', false, 'Require ID verification before posting ads'),
  ('ai_spam_filter', true, 'Enable AI-powered spam detection'),
  ('enable_escrow', true, 'Enable Sealify Safe Escrow system'),
  ('enable_buyer_requests', true, 'Enable buyer want board'),
  ('enable_market_insights', true, 'Enable market price analytics')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- Insert default site settings
INSERT INTO public.site_settings (logo_url, site_name, site_description, og_image, contact_email, contact_phone) VALUES
  ('/logo.png', 'Sealify Nigeria', 'Nigeria''s Trusted Local Marketplace.', '/og-image.png', 'support@sealify.ng', '+234 813 120 8468')
ON CONFLICT DO NOTHING;

-- Insert default safe meetup spots for Ogbomoso
INSERT INTO public.safe_spots (name, zone, category, address, distance, hours, cctv_verified, latitude, longitude) VALUES
  ('Ogbomoso Divisional Police HQ', 'Police HQ', 'Police Safe Zone', 'Police Headquarters, Ogbomoso, Oyo State', 'Central Hub', '24/7', true, 8.1333, 4.2500),
  ('LAUTECH Main Gate Security Post', 'LAUTECH Area', 'Police Safe Zone', 'Ladoke Akintola University of Technology, Main Gate, Ogbomoso', 'Campus', '6:00 AM - 10:00 PM', true, 8.1500, 4.2600),
  ('Takie Square Shopping Complex', 'Takie / Center', 'Shopping Mall', 'Takie Square, Ogbomoso, Oyo State', 'Town Center', '8:00 AM - 9:00 PM', true, 8.1350, 4.2550),
  ('Sabo Market Police Post', 'Sabo Market Zone', 'Police Safe Zone', 'Sabo Market, Ogbomoso, Oyo State', 'Market Area', '7:00 AM - 8:00 PM', true, 8.1400, 4.2480),
  ('Ogbomoso Public Library', 'LAUTECH Area', 'Public Library', 'Ogbomoso Public Library, Near LAUTECH, Ogbomoso', 'Campus Area', '8:00 AM - 6:00 PM', true, 8.1480, 4.2580),
  ('Adenike Area Community Center', 'LAUTECH Area', 'Café', 'Adenike Community Center, Ogbomoso', 'Student Zone', '7:00 AM - 9:00 PM', true, 8.1520, 4.2620),
  ('General Hospital Security Post', 'Takie / Center', 'Police Safe Zone', 'Ogbomoso General Hospital, Takie, Ogbomoso', 'Hospital Zone', '24/7', true, 8.1380, 4.2530)
ON CONFLICT DO NOTHING;