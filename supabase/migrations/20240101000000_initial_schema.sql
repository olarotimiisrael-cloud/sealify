-- Sealify Nigeria - Complete Production Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES / USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  verified BOOLEAN DEFAULT false,
  verification_type VARCHAR(20) DEFAULT 'none' CHECK (verification_type IN ('individual', 'business', 'premium', 'student', 'none')),
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
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'restricted')),
  restriction_reason TEXT,
  appeal_status VARCHAR(20) DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'resolved')),
  total_value_traded NUMERIC(14, 2) DEFAULT 0,
  completed_deals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================
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

-- ============================================================================
-- 3. SUBCATEGORIES TABLE
-- ============================================================================
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

-- ============================================================================
-- 4. ADS / LISTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id TEXT REFERENCES public.subcategories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(14, 2) NOT NULL,
  original_price NUMERIC(14, 2),
  condition VARCHAR(20) NOT NULL CHECK (condition IN ('Brand New', 'Like New', 'Used - Good', 'Used - Fair')),
  location TEXT NOT NULL DEFAULT 'Ogbomoso, Oyo State',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft', 'pending_review')),
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  specifications JSONB DEFAULT '{}'::jsonb,
  views_count INTEGER DEFAULT 1,
  featured BOOLEAN DEFAULT false,
  promotion_plan_name TEXT,
  promotion_duration_months INTEGER DEFAULT 0,
  promotion_start_date TIMESTAMP WITH TIME ZONE,
  promotion_end_date TIMESTAMP WITH TIME ZONE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed')),
  payment_proof_url TEXT,
  amount_paid NUMERIC(14, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 5. AD IMAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ad_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 6. FAVORITES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, ad_id)
);

-- ============================================================================
-- 7. CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count_1 INTEGER DEFAULT 0,
  unread_count_2 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(ad_id, participant_1, participant_2)
);

-- ============================================================================
-- 8. MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 9. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(30) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  link_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 10. VERIFICATION REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('individual', 'business', 'premium', 'student')),
  doc_type TEXT NOT NULL,
  doc_number TEXT NOT NULL,
  doc_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 11. PASSWORD CHANGE REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.password_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  nin TEXT NOT NULL,
  id_document_url TEXT NOT NULL,
  new_password_hash TEXT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 12. PROMOTION PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promotion_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('opay', 'card', 'transfer', 'ussd', 'paystack')),
  payment_proof_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  plan_name TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 13. AD REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  ad_title TEXT NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_name TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 14. DISPUTE CASES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  receipt_ref TEXT,
  item_title TEXT NOT NULL,
  counterparty TEXT NOT NULL,
  category TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL,
  evidence_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved')),
  admin_notes TEXT,
  assigned_moderator UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 15. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  details TEXT,
  type VARCHAR(30) NOT NULL CHECK (type IN ('security', 'user', 'listing', 'broadcast', 'verification', 'intrusion', 'dispute', 'finance')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 16. SYSTEM ANNOUNCEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'alert')),
  active BOOLEAN DEFAULT true,
  target_roles VARCHAR(20)[] DEFAULT ARRAY['buyer', 'seller'],
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 17. SAFE MEETUP SPOTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.safe_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zone VARCHAR(30) NOT NULL CHECK (zone IN ('LAUTECH Area', 'Takie / Center', 'Sabo Market Zone', 'Police HQ')),
  category VARCHAR(30) NOT NULL CHECK (category IN ('Police Safe Zone', 'Public Library', 'Shopping Mall', 'Café')),
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

-- ============================================================================
-- 18. SYSTEM CONFIGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 19. SITE SETTINGS TABLE
-- ============================================================================
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

-- ============================================================================
-- 20. PROMOTION PLANS TABLE
-- ============================================================================
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

-- ============================================================================
-- 21. SEARCH ALERTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id),
  max_price NUMERIC(14, 2),
  location TEXT,
  match_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 22. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 23. BUYER REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.buyer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  title TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id),
  max_budget NUMERIC(14, 2) NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  responses_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'responded', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 24. WALLET TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(14, 2) DEFAULT 0,
  pending_balance NUMERIC(14, 2) DEFAULT 0,
  total_withdrawn NUMERIC(14, 2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 25. TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('sale', 'payout', 'promotion', 'refund', 'escrow_hold', 'escrow_release')),
  amount NUMERIC(14, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  description TEXT NOT NULL,
  reference TEXT,
  related_ad_id UUID REFERENCES public.ads(id),
  related_user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 26. ESCROW TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.escrow_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'funded', 'inspection', 'released', 'disputed', 'refunded')),
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

-- ============================================================================
-- 27. INTRUSION LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.intrusion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempted_email TEXT NOT NULL,
  device_info JSONB,
  media_captured BOOLEAN DEFAULT false,
  media_status TEXT,
  status VARCHAR(20) DEFAULT 'flagged' CHECK (status IN ('flagged', 'reported', 'dismissed')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 28. RECENT DEALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recent_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_title TEXT NOT NULL,
  price NUMERIC(14, 2) NOT NULL,
  location TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_spots ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Profiles: Users can read all, update own
CREATE POLICY "Public profiles readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Ads: Public read active, users manage own
CREATE POLICY "Active ads readable" ON public.ads FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own ads" ON public.ads FOR ALL USING (auth.uid() = seller_id);

-- Favorites: Users manage own
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Conversations: Participants can read/write
CREATE POLICY "Participants can read conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages: Participants can read/write
CREATE POLICY "Participants can read messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Sender can insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: Users manage own
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Wallets: Users manage own
CREATE POLICY "Users manage own wallet" ON public.wallets FOR ALL USING (auth.uid() = user_id);

-- Transactions: Users read own
CREATE POLICY "Users read own transactions" ON public.transactions FOR SELECT USING (auth.uid() = (SELECT user_id FROM wallets WHERE id = wallet_id));

-- Escrow: Buyer/Seller can read
CREATE POLICY "Escrow participants can read" ON public.escrow_orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Safe spots: Public read
CREATE POLICY "Safe spots public read" ON public.safe_spots FOR SELECT USING (is_active = true);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ads_seller_id ON public.ads(seller_id);
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON public.ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_location ON public.ads(location);
CREATE INDEX IF NOT EXISTS idx_ads_price ON public.ads(price);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_ad_id ON public.escrow_orders(ad_id);