-- ============================================================================
-- SEALIFY NIGERIA - COMPLETE POSTGRESQL DATABASE SCHEMA
-- Generated for Supabase | Includes Tables, Indexes, RLS Policies, Storage Buckets
-- FIXED: Infinite recursion in RLS policies resolved
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- HELPER FUNCTIONS (Security Definer to avoid recursion)
-- ============================================================================

-- Function to check if user is admin (Security Definer bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$;

-- Function to get user role (Security Definer bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    RETURN COALESCE(user_role, 'buyer');
END;
$$;

-- Function to generate unique handover codes for escrow
CREATE OR REPLACE FUNCTION public.generate_handover_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    code TEXT;
BEGIN
    LOOP
        code := 'ESC-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        IF NOT EXISTS (SELECT 1 FROM public.escrow_orders WHERE handover_code = code) THEN
            RETURN code;
        END IF;
    END LOOP;
END; $$;

-- Function to get user's wallet (create if not exists)
CREATE OR REPLACE FUNCTION public.get_or_create_wallet(user_id UUID DEFAULT auth.uid())
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    wallet_id UUID;
BEGIN
    SELECT id INTO wallet_id FROM public.wallets WHERE user_id = get_or_create_wallet.user_id;
    IF wallet_id IS NULL THEN
        INSERT INTO public.wallets (user_id) VALUES (get_or_create_wallet.user_id) RETURNING id INTO wallet_id;
    END IF;
    RETURN wallet_id;
END; $$;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END; $$;

-- ============================================================================
-- 1. PROFILES TABLE (Extended users table with business info)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    verified BOOLEAN DEFAULT FALSE,
    verification_type TEXT DEFAULT 'none' CHECK (verification_type IN ('individual', 'business', 'premium', 'student', 'none')),
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
    email_notifications BOOLEAN DEFAULT TRUE,
    whatsapp_notifications BOOLEAN DEFAULT TRUE,
    hide_phone_publicly BOOLEAN DEFAULT FALSE,
    hide_location_publicly BOOLEAN DEFAULT FALSE,
    location TEXT DEFAULT 'Ogbomoso, Oyo State',
    member_since TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'restricted')),
    restriction_reason TEXT,
    appeal_status TEXT DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'resolved')),
    total_value_traded NUMERIC(14,2) DEFAULT 0,
    completed_deals INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(verified);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. SUBCATEGORIES TABLE (with spec fields for dynamic forms)
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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. ADS (LISTINGS) TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id TEXT REFERENCES public.subcategories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(14,2) NOT NULL,
    original_price NUMERIC(14,2),
    condition TEXT NOT NULL CHECK (condition IN ('Brand New', 'Like New', 'Used - Good', 'Used - Fair')),
    location TEXT NOT NULL DEFAULT 'Ogbomoso, Oyo State',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft', 'pending_review')),
    images TEXT[] DEFAULT '{}',
    video_url TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    views_count INTEGER DEFAULT 1,
    featured BOOLEAN DEFAULT FALSE,
    promotion_plan_name TEXT,
    promotion_duration_months INTEGER DEFAULT 0,
    promotion_start_date TIMESTAMPTZ,
    promotion_end_date TIMESTAMPTZ,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed')),
    payment_proof_url TEXT,
    amount_paid NUMERIC(14,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ads
CREATE INDEX IF NOT EXISTS idx_ads_seller_id ON public.ads(seller_id);
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON public.ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_featured ON public.ads(featured);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_price ON public.ads(price);
CREATE INDEX IF NOT EXISTS idx_ads_location ON public.ads(location);

-- ============================================================================
-- 5. AD_IMAGES TABLE (Separate table for better image management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ad_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_images_ad_id ON public.ad_images(ad_id);

-- ============================================================================
-- 6. BUYER_REQUESTS TABLE (Want Board)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.buyer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    title TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id),
    max_budget NUMERIC(14,2) NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    responses_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'responded', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_requests_user_id ON public.buyer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_category ON public.buyer_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_status ON public.buyer_requests(status);

-- ============================================================================
-- 7. BUYER_REQUEST_RESPONSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.buyer_request_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.buyer_requests(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    seller_name TEXT NOT NULL,
    seller_avatar TEXT,
    proposed_price NUMERIC(14,2) NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_request_responses_request_id ON public.buyer_request_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_buyer_request_responses_seller_id ON public.buyer_request_responses(seller_id);

-- ============================================================================
-- 8. CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    participant_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    participant_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    last_message TEXT,
    last_message_time TIMESTAMPTZ,
    unread_count_1 INTEGER DEFAULT 0,
    unread_count_2 INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ad_id, participant_1, participant_2)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_ad_id ON public.conversations(ad_id);

-- ============================================================================
-- 9. MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- ============================================================================
-- 10. WALLETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    balance NUMERIC(14,2) DEFAULT 0,
    pending_balance NUMERIC(14,2) DEFAULT 0,
    total_withdrawn NUMERIC(14,2) DEFAULT 0,
    currency TEXT DEFAULT 'NGN',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sale', 'payout', 'promotion', 'refund', 'escrow_hold', 'escrow_release')),
    amount NUMERIC(14,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
    description TEXT NOT NULL,
    reference TEXT,
    related_ad_id UUID REFERENCES public.ads(id),
    related_user_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- ============================================================================
-- 12. ESCROW_ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.escrow_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'funded', 'inspection', 'released', 'disputed', 'refunded')),
    handover_code TEXT UNIQUE NOT NULL,
    qr_code_url TEXT,
    inspection_location TEXT,
    inspection_completed_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    disputed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_orders_ad_id ON public.escrow_orders(ad_id);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_buyer_id ON public.escrow_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_seller_id ON public.escrow_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_orders_status ON public.escrow_orders(status);

-- ============================================================================
-- 13. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('price_drop', 'message', 'offer', 'alert_match', 'system', 'recommendation', 'payment', 'security', 'verification', 'promotion')),
    title TEXT NOT NULL,
    description TEXT,
    link_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================================================
-- 14. USER_SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    whatsapp_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    price_drop_alerts BOOLEAN DEFAULT TRUE,
    new_message_alerts BOOLEAN DEFAULT TRUE,
    weekly_digest BOOLEAN DEFAULT TRUE,
    promotion_expiry_reminders BOOLEAN DEFAULT TRUE,
    biometric_lock BOOLEAN DEFAULT FALSE,
    two_factor_auth BOOLEAN DEFAULT FALSE,
    session_timeout_minutes INTEGER DEFAULT 30,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'dark',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 15. VERIFICATION_REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('individual', 'business', 'premium', 'student')),
    doc_type TEXT NOT NULL,
    doc_number TEXT NOT NULL,
    doc_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);

-- ============================================================================
-- 16. PASSWORD_REQUESTS TABLE
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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 17. PROMOTION_PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promotion_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('opay', 'card', 'transfer', 'ussd', 'paystack')),
    payment_proof_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    plan_name TEXT NOT NULL,
    duration_months INTEGER NOT NULL,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotion_payments_user_id ON public.promotion_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_ad_id ON public.promotion_payments(ad_id);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_status ON public.promotion_payments(status);

-- ============================================================================
-- 18. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON public.reviews(buyer_id);

-- ============================================================================
-- 19. REPORTS TABLE (Ad Reports)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    ad_title TEXT NOT NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name TEXT,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_ad_id ON public.reports(ad_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- ============================================================================
-- 20. DISPUTES TABLE
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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved')),
    admin_notes TEXT,
    assigned_moderator UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_user_id ON public.disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);

-- ============================================================================
-- 21. AUDIT_LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    details TEXT,
    type TEXT NOT NULL CHECK (type IN ('security', 'user', 'ad', 'broadcast', 'verification', 'intrusion', 'dispute', 'finance')),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_type ON public.audit_logs(type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================================
-- 22. INTRUSION_LOGS TABLE (Admin Security)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.intrusion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempted_email TEXT NOT NULL,
    device_info JSONB,
    media_captured BOOLEAN DEFAULT FALSE,
    media_status TEXT,
    status TEXT DEFAULT 'flagged' CHECK (status IN ('flagged', 'reported', 'dismissed')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 23. SYSTEM_CONFIGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 24. SITE_SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT,
    site_name TEXT DEFAULT 'Sealify Nigeria',
    site_description TEXT DEFAULT 'Nigeria''s Trusted Local Marketplace.',
    og_image TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 25. PROMOTION_PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.promotion_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    months INTEGER NOT NULL,
    label TEXT NOT NULL,
    rate NUMERIC(14,2) NOT NULL,
    badge TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 26. SAFE_SPOTS TABLE (Verified Meetup Locations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.safe_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    zone TEXT NOT NULL CHECK (zone IN ('LAUTECH Area', 'Takie / Center', 'Sabo Market Zone', 'Police HQ')),
    category TEXT NOT NULL CHECK (category IN ('Police Safe Zone', 'Public Library', 'Shopping Mall', 'Café')),
    address TEXT NOT NULL,
    distance TEXT,
    hours TEXT,
    cctv_verified BOOLEAN DEFAULT TRUE,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 27. ANNOUNCEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'alert')),
    active BOOLEAN DEFAULT TRUE,
    target_roles TEXT[] DEFAULT ARRAY['buyer', 'seller'],
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 28. RECENT_DEALS TABLE (Live Transaction Ticker)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recent_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_title TEXT NOT NULL,
    price NUMERIC(14,2) NOT NULL,
    location TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 29. SEARCH_ALERTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.search_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    query TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id),
    max_price NUMERIC(14,2),
    location TEXT,
    match_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id ON public.search_alerts(user_id);

-- ============================================================================
-- 30. FAVORITES TABLE (Saved Ads)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_ad_id ON public.favorites(ad_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - FIXED: No infinite recursion
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intrusion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES (Fixed: Use auth.uid() directly, no self-query)
-- ============================================================================

-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles 
FOR SELECT USING (TRUE);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- Admins can manage all profiles (Fixed: Use security definer function)
CREATE POLICY "Admins can manage all profiles" ON public.profiles 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- ADS POLICIES (Fixed: Use auth.uid() for seller checks)
-- ============================================================================

-- Active ads are viewable by everyone, sellers can see their own drafts
CREATE POLICY "Active ads are viewable by everyone" ON public.ads 
FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

-- Sellers can create ads
CREATE POLICY "Sellers can create ads" ON public.ads 
FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own ads
CREATE POLICY "Sellers can update their own ads" ON public.ads 
FOR UPDATE USING (auth.uid() = seller_id);

-- Sellers can delete their own ads
CREATE POLICY "Sellers can delete their own ads" ON public.ads 
FOR DELETE USING (auth.uid() = seller_id);

-- Admins can manage all ads (Fixed: Use security definer function)
CREATE POLICY "Admins can manage all ads" ON public.ads 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- AD_IMAGES POLICIES
-- ============================================================================

CREATE POLICY "Ad images are viewable by everyone" ON public.ad_images 
FOR SELECT USING (TRUE);

CREATE POLICY "Sellers can manage their ad images" ON public.ad_images 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ads WHERE id = ad_id AND seller_id = auth.uid())
);

-- ============================================================================
-- BUYER_REQUESTS POLICIES
-- ============================================================================

CREATE POLICY "Buyer requests are viewable by everyone" ON public.buyer_requests 
FOR SELECT USING (TRUE);

CREATE POLICY "Users can create buyer requests" ON public.buyer_requests 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" ON public.buyer_requests 
FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- BUYER_REQUEST_RESPONSES POLICIES
-- ============================================================================

CREATE POLICY "Responses viewable by request owner and responder" ON public.buyer_request_responses 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.buyer_requests WHERE id = request_id AND user_id = auth.uid())
    OR seller_id = auth.uid()
);

CREATE POLICY "Sellers can respond to requests" ON public.buyer_request_responses 
FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Request owners can update response status" ON public.buyer_request_responses 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.buyer_requests WHERE id = request_id AND user_id = auth.uid())
);

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================

CREATE POLICY "Participants can view their conversations" ON public.conversations 
FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Participants can create conversations" ON public.conversations 
FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Participants can update their conversations" ON public.conversations 
FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

CREATE POLICY "Participants can view messages" ON public.messages 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid()))
);

CREATE POLICY "Participants can send messages" ON public.messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can mark messages as read" ON public.messages 
FOR UPDATE USING (auth.uid() = receiver_id);

-- ============================================================================
-- WALLETS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own wallet" ON public.wallets 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage wallets" ON public.wallets 
FOR ALL USING (TRUE);

-- ============================================================================
-- TRANSACTIONS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own transactions" ON public.transactions 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.wallets WHERE id = wallet_id AND user_id = auth.uid())
);

-- ============================================================================
-- ESCROW_ORDERS POLICIES
-- ============================================================================

CREATE POLICY "Participants can view escrow orders" ON public.escrow_orders 
FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create escrow orders" ON public.escrow_orders 
FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update escrow orders" ON public.escrow_orders 
FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own notifications" ON public.notifications 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications 
FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- USER_SETTINGS POLICIES
-- ============================================================================

CREATE POLICY "Users can manage their own settings" ON public.user_settings 
FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION_REQUESTS POLICIES (Fixed: Use is_admin function)
-- ============================================================================

CREATE POLICY "Users can view their own verification requests" ON public.verification_requests 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification requests" ON public.verification_requests 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verification requests" ON public.verification_requests 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- PASSWORD_REQUESTS POLICIES (Fixed: Use is_admin function)
-- ============================================================================

CREATE POLICY "Users can view their own password requests" ON public.password_requests 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create password requests" ON public.password_requests 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all password requests" ON public.password_requests 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- PROMOTION_PAYMENTS POLICIES (Fixed: Use is_admin function)
-- ============================================================================

CREATE POLICY "Users can view their own promotion payments" ON public.promotion_payments 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create promotion payments" ON public.promotion_payments 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all promotion payments" ON public.promotion_payments 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

CREATE POLICY "Reviews are viewable by everyone" ON public.reviews 
FOR SELECT USING (TRUE);

CREATE POLICY "Buyers can create reviews" ON public.reviews 
FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can manage all reviews" ON public.reviews 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- REPORTS POLICIES
-- ============================================================================

CREATE POLICY "Reporters can view their own reports" ON public.reports 
FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Anyone can create reports" ON public.reports 
FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all reports" ON public.reports 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- DISPUTES POLICIES (Fixed: Use is_admin function)
-- ============================================================================

CREATE POLICY "Users can view their own disputes" ON public.disputes 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create disputes" ON public.disputes 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all disputes" ON public.disputes 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- AUDIT_LOGS POLICIES (Fixed: Use is_admin function)
-- ============================================================================

CREATE POLICY "Admins can view audit logs" ON public.audit_logs 
FOR SELECT USING (public.is_admin());

CREATE POLICY "System can create audit logs" ON public.audit_logs 
FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- INTRUSION_LOGS POLICIES (Fixed: Use is_admin function)
-- ============================================================================

CREATE POLICY "Admins can view intrusion logs" ON public.intrusion_logs 
FOR SELECT USING (public.is_admin());

CREATE POLICY "System can create intrusion logs" ON public.intrusion_logs 
FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- SYSTEM_CONFIGS POLICIES (Fixed: Use is_admin function)
-- ============================================================================

CREATE POLICY "Admins can manage system configs" ON public.system_configs 
FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view system configs" ON public.system_configs 
FOR SELECT USING (TRUE);

-- ============================================================================
-- SITE_SETTINGS POLICIES (Fixed: Use is_admin function)
-- ============================================================================

CREATE POLICY "Admins can manage site settings" ON public.site_settings 
FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view site settings" ON public.site_settings 
FOR SELECT USING (TRUE);

-- ============================================================================
-- PROMOTION_PLANS POLICIES
-- ============================================================================

CREATE POLICY "Public can view active promotion plans" ON public.promotion_plans 
FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage promotion plans" ON public.promotion_plans 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- SAFE_SPOTS POLICIES
-- ============================================================================

CREATE POLICY "Public can view active safe spots" ON public.safe_spots 
FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage safe spots" ON public.safe_spots 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- ANNOUNCEMENTS POLICIES
-- ============================================================================

CREATE POLICY "Public can view active announcements" ON public.announcements 
FOR SELECT USING (active = TRUE);

CREATE POLICY "Admins can manage announcements" ON public.announcements 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- RECENT_DEALS POLICIES
-- ============================================================================

CREATE POLICY "Public can view recent deals" ON public.recent_deals 
FOR SELECT USING (TRUE);

CREATE POLICY "System can create recent deals" ON public.recent_deals 
FOR INSERT WITH CHECK (TRUE);

-- ============================================================================
-- SEARCH_ALERTS POLICIES
-- ============================================================================

CREATE POLICY "Users can manage their own search alerts" ON public.search_alerts 
FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FAVORITES POLICIES
-- ============================================================================

CREATE POLICY "Users can manage their own favorites" ON public.favorites 
FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- CATEGORIES POLICIES
-- ============================================================================

CREATE POLICY "Public can view active categories" ON public.categories 
FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage categories" ON public.categories 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- SUBCATEGORIES POLICIES
-- ============================================================================

CREATE POLICY "Public can view active subcategories" ON public.subcategories 
FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage subcategories" ON public.subcategories 
FOR ALL USING (public.is_admin());

-- ============================================================================
-- APPLY UPDATED_AT TRIGGERS
-- ============================================================================

DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at' AND table_schema = 'public'
        AND table_name NOT IN ('audit_logs', 'intrusion_logs', 'recent_deals')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', tbl.table_name);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', tbl.table_name);
    END LOOP;
END $$;

-- ============================================================================
-- SEED DATA: DEFAULT CATEGORIES
-- ============================================================================
INSERT INTO public.categories (id, name, icon_name, color, description, sort_order, is_active) VALUES
('vehicles', 'Vehicles', 'Car', 'bg-blue-500', 'Cars, motorcycles, trucks, and other vehicles', 1, TRUE),
('electronics', 'Electronics', 'Smartphone', 'bg-purple-500', 'Phones, laptops, gadgets, and accessories', 2, TRUE),
('real_estate', 'Real Estate', 'Home', 'bg-teal-500', 'Houses, apartments, land, and commercial property', 3, TRUE),
('fashion', 'Fashion', 'Shirt', 'bg-pink-500', 'Clothing, shoes, accessories, and beauty', 4, TRUE),
('home_furniture', 'Home & Furniture', 'Armchair', 'bg-amber-500', 'Furniture, decor, appliances, and home goods', 5, TRUE),
('services', 'Services', 'Wrench', 'bg-cyan-500', 'Professional services, repairs, and freelance work', 6, TRUE),
('jobs', 'Jobs', 'Briefcase', 'bg-indigo-500', 'Job listings and recruitment', 7, TRUE),
('beauty_health', 'Beauty & Health', 'Sparkles', 'bg-rose-500', 'Cosmetics, wellness, and personal care', 8, TRUE),
('utility_energy', 'Utility & Energy', 'Zap', 'bg-yellow-500', 'Generators, solar, batteries, and power solutions', 9, TRUE),
('solar_clean_energy', 'Solar & Clean Energy', 'Sun', 'bg-yellow-500', 'Solar panels, inverters, batteries, and installation services', 10, TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- ============================================================================
-- SEED DATA: SOLAR & CLEAN ENERGY SUBCATEGORIES
-- ============================================================================
INSERT INTO public.subcategories (id, category_id, name, description, icon_name, listing_type, spec_fields, sort_order, is_active) VALUES
('solar_products', 'solar_clean_energy', 'Solar Accessories & Products', 'Inverters, Solar Panels, Batteries, Charge Controllers, Wiring, Mounting Systems', 'Battery', 'product', '[
    {"key": "productType", "label": "Product Type", "type": "select", "options": ["Solar Panel", "Inverter", "Battery", "Charge Controller", "Mounting System", "Wiring & Connectors", "Monitoring System", "Other Accessory"]},
    {"key": "capacity", "label": "Capacity / Power Rating", "type": "text", "placeholder": "e.g. 5kW, 200Ah, 450W"},
    {"key": "voltage", "label": "Voltage", "type": "select", "options": ["12V", "24V", "48V", "120V", "240V", "380V", "Other"]},
    {"key": "brand", "label": "Brand / Manufacturer", "type": "text", "placeholder": "e.g. Victron, Growatt, Felicity, Bluegate"},
    {"key": "warranty", "label": "Warranty Period", "type": "select", "options": ["1 Year", "2 Years", "3 Years", "5 Years", "10 Years", "Lifetime", "No Warranty"]},
    {"key": "certification", "label": "Certifications", "type": "text", "placeholder": "e.g. IEC, CE, UL, TUV"}
]'::jsonb, 1, TRUE),
('solar_installation', 'solar_clean_energy', 'Solar Installation & Maintenance Services', 'System Sizing, Installation Services, Repair & Maintenance, Energy Audits, Consultation', 'Wrench', 'service', '[
    {"key": "serviceType", "label": "Service Type", "type": "select", "options": ["System Design & Sizing", "Full Installation", "Panel Installation Only", "Inverter/Battery Installation", "System Repair", "Preventive Maintenance", "Energy Audit", "Performance Optimization", "System Upgrade"]},
    {"key": "systemSize", "label": "Typical System Size Handled", "type": "select", "options": ["Small (1-3kW)", "Medium (3-10kW)", "Large (10-50kW)", "Commercial (50kW+)", "Industrial (100kW+)"]},
    {"key": "serviceArea", "label": "Service Coverage Area", "type": "text", "placeholder": "e.g. Ogbomoso, Ibadan, Oyo State"},
    {"key": "certifications", "label": "Technician Certifications", "type": "text", "placeholder": "e.g. NABCEP, COREN, Manufacturer Certified"},
    {"key": "warrantyOffered", "label": "Workmanship Warranty", "type": "select", "options": ["3 Months", "6 Months", "1 Year", "2 Years", "5 Years", "No Warranty"]},
    {"key": "responseTime", "label": "Emergency Response Time", "type": "select", "options": ["24 Hours", "48 Hours", "3-5 Days", "1 Week", "Scheduled Only"]}
]'::jsonb, 2, TRUE)
ON CONFLICT (id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    listing_type = EXCLUDED.listing_type,
    spec_fields = EXCLUDED.spec_fields,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;

-- ============================================================================
-- SEED DATA: DEFAULT PROMOTION PLANS
-- ============================================================================
INSERT INTO public.promotion_plans (months, label, rate, badge, is_active) VALUES
(1, '1 Month', 15000, 'STARTER', TRUE),
(3, '3 Months', 13000, 'POPULAR', TRUE),
(6, '6 Months', 11000, 'BEST VALUE', TRUE),
(12, '12 Months', 9000, 'ENTERPRISE', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DATA: DEFAULT SAFE SPOTS (Ogbomoso)
-- ============================================================================
INSERT INTO public.safe_spots (name, zone, category, address, distance, hours, cctv_verified, latitude, longitude, is_active) VALUES
('Ogbomoso Divisional Police HQ', 'Police HQ', 'Police Safe Zone', 'Police Headquarters, Ogbomoso, Oyo State', 'Central Hub', '24/7', TRUE, 8.1367, 4.2500, TRUE),
('LAUTECH Main Gate Security Post', 'LAUTECH Area', 'Police Safe Zone', 'LAUTECH Main Gate, Ogbomoso, Oyo State', 'Campus Entry', '24/7', TRUE, 8.1450, 4.2480, TRUE),
('Under G Shopping Complex', 'LAUTECH Area', 'Shopping Mall', 'Under G Market, Ogbomoso, Oyo State', 'Student Hub', '8:00 AM - 8:00 PM', TRUE, 8.1420, 4.2490, TRUE),
('Takie Square Mall', 'Takie / Center', 'Shopping Mall', 'Takie Square, Ogbomoso, Oyo State', 'City Center', '9:00 AM - 7:00 PM', TRUE, 8.1380, 4.2520, TRUE),
('Sabo Market Security Post', 'Sabo Market Zone', 'Police Safe Zone', 'Sabo Market, Ogbomoso, Oyo State', 'Market Center', '7:00 AM - 6:00 PM', TRUE, 8.1350, 4.2550, TRUE),
('Ogbomoso Public Library', 'Takie / Center', 'Public Library', 'Public Library, Ogbomoso, Oyo State', 'Quiet Zone', '8:00 AM - 6:00 PM', TRUE, 8.1390, 4.2510, TRUE),
('Adenike Area Café Hub', 'LAUTECH Area', 'Café', 'Adenike Junction, Ogbomoso, Oyo State', 'Student Area', '7:00 AM - 10:00 PM', TRUE, 8.1430, 4.2470, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DATA: DEFAULT SYSTEM CONFIGS
-- ============================================================================
INSERT INTO public.system_configs (key, value, description) VALUES
('maintenance_mode', FALSE, 'Enable maintenance mode to lock public marketplace'),
('auto_approve_ads', TRUE, 'Automatically approve new classified ads without admin review'),
('require_id_for_posting', FALSE, 'Require ID verification before allowing ad posting'),
('ai_spam_filter', TRUE, 'Enable AI-powered spam and fraud detection'),
('max_images_per_ad', TRUE, 'Maximum 10 images per classified ad'),
('max_file_size_mb', TRUE, 'Maximum file upload size in MB')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- ============================================================================
-- SEED DATA: DEFAULT SITE SETTINGS
-- ============================================================================
INSERT INTO public.site_settings (site_name, site_description, og_image, contact_email, contact_phone) VALUES
('Sealify Nigeria', 'Nigeria''s Trusted Local Marketplace for Ogbomosoland & Oyo State.', '/og-image.png', 'support@sealify.ng', '+234 813 120 8468')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUPABASE STORAGE BUCKETS & RLS POLICIES
-- ============================================================================

-- Create storage buckets (run in Supabase Dashboard > Storage or via SQL)
-- Note: Bucket creation via SQL requires Supabase Admin API, typically done in Dashboard
-- These are the bucket configurations for reference:

/*
-- Bucket: profile-media (for avatars, cover photos, verification docs)
-- Bucket: ad-images (for classified ad images)
-- Bucket: documents (for verification documents, receipts, etc.)

-- Storage Policies for profile-media bucket:
CREATE POLICY "Public avatars are viewable" ON storage.objects FOR SELECT USING (bucket_id = 'profile-media');
CREATE POLICY "Users can upload their own profile media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own profile media" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own profile media" ON storage.objects FOR DELETE USING (bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage Policies for ad-images bucket:
CREATE POLICY "Public ad images are viewable" ON storage.objects FOR SELECT USING (bucket_id = 'ad-images');
CREATE POLICY "Sellers can upload ad images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Sellers can update their ad images" ON storage.objects FOR UPDATE USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Sellers can delete their ad images" ON storage.objects FOR DELETE USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage Policies for documents bucket:
CREATE POLICY "Users can upload their own documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND public.is_admin());
*/

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'SEALIFY NIGERIA DATABASE SCHEMA DEPLOYED SUCCESSFULLY';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Tables Created: 30 core tables + indexes + RLS policies (FIXED)';
    RAISE NOTICE 'Categories Seeded: 10 (including Solar & Clean Energy)';
    RAISE NOTICE 'Subcategories Seeded: 2 (Solar Products & Solar Installation)';
    RAISE NOTICE 'Promotion Plans: 4 tiers (1, 3, 6, 12 months)';
    RAISE NOTICE 'Safe Spots: 7 verified locations in Ogbomoso';
    RAISE NOTICE 'System Configs: 6 platform toggles';
    RAISE NOTICE 'Storage Buckets: profile-media, ad-images, documents (create in Dashboard)';
    RAISE NOTICE 'Security: Infinite recursion FIXED via security definer functions';
    RAISE NOTICE 'Helper Functions: is_admin(), get_user_role(), generate_handover_code()';
    RAISE NOTICE '============================================================================';
END $$;