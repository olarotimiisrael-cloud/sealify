import React, { useState, useEffect } from 'react';
import { 
  Play, StopCircle, AlertTriangle, CheckCircle, Loader2, 
  Database, Terminal, Zap, Shield, Download, Copy, 
  Trash2, RefreshCw, Info, ExternalLink,
  GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const DatabaseDiagramViewer: React.FC = () => {
  const [schema, setSchema] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMermaid, setShowMermaid] = useState(false);

  useEffect(() => {
    generateSchema();
  }, []);

  const generateSchema = async () => {
    setIsGenerating(true);
    try {
      const sql = `-- Sealify Nigeria - Complete Database Schema & ERD
-- Generated for Mermaid.js ERD visualization

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Users / Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories Table
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

-- 3. Subcategories Table
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

-- 4. Listings / Ads Table
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
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_proof_url TEXT,
  amount_paid NUMERIC(14, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Listing Images Table
CREATE TABLE IF NOT EXISTS public.ad_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, ad_id)
);

-- 7. Conversations Table
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

-- 8. Messages Table
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

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('price_drop', 'message', 'offer', 'alert_match', 'system', 'recommendation', 'payment', 'security', 'verification', 'promotion')),
  title TEXT NOT NULL,
  description TEXT,
  link_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Verification Requests Table
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

-- 11. Password Change Requests Table
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

-- 12. Promotion Payments Table
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

-- 13. Ad Reports Table
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

-- 14. Dispute Cases Table
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

-- 15. Audit Logs Table
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

-- 16. System Announcements Table
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

-- 17. Safe Meetup Spots Table
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

-- 18. System Configurations Table
CREATE TABLE IF NOT EXISTS public.system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. Site Settings Table
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

-- 20. Promotion Plans Table
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

-- 21. Search Alerts Table
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

-- 22. Reviews Table
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

-- 23. Buyer Requests Table
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

-- 24. Wallet Table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(14, 2) DEFAULT 0,
  pending_balance NUMERIC(14, 2) DEFAULT 0,
  total_withdrawn NUMERIC(14, 2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 25. Transactions Table
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

-- 26. Escrow Transactions Table
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
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

-- 27. Intrusion Logs Table
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

-- 28. Recent Deals Table
CREATE TABLE IF NOT EXISTS public.recent_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_title TEXT NOT NULL,
  price NUMERIC(14, 2) NOT NULL,
  location TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 29. Buyer Request Responses
CREATE TABLE IF NOT EXISTS public.buyer_request_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.buyer_requests(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_name TEXT NOT NULL,
  seller_avatar TEXT,
  proposed_price NUMERIC(14, 2) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 30. Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB,
  url TEXT,
  referrer TEXT,
  user_agent TEXT,
  viewport TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 31. Performance Metrics Table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC(10, 3) NOT NULL,
  rating VARCHAR(20) CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies (Public read for active data, owners write own data, admins full access)
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public active ads read" ON public.ads FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers manage own ads" ON public.ads FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Admin full access ads" ON public.ads FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public messages read" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid()))
);
CREATE POLICY "Participants send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid()))
);

CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own wallet" ON public.wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT USING (wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid()));
CREATE POLICY "Users view own escrow" ON public.escrow_transactions FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Mermaid ERD Diagram for Visualization
-- Copy the following into mermaid.live to visualize:

\`\`\`mermaid
erDiagram
    PROFILES ||--o{ ADS : "sells"
    PROFILES ||--o{ CONVERSATIONS : "participates"
    PROFILES ||--o{ MESSAGES : "sends"
    PROFILES ||--o{ NOTIFICATIONS : "receives"
    PROFILES ||--o{ FAVORITES : "bookmarks"
    PROFILES ||--o{ WALLETS : "owns"
    PROFILES ||--o{ VERIFICATION_REQUESTS : "requests"
    PROFILES ||--o{ PASSWORD_REQUESTS : "requests"
    PROFILES ||--o{ PROMOTION_PAYMENTS : "pays"
    PROFILES ||--o{ REVIEWS : "reviews"
    PROFILES ||--o{ REPORTS : "reports"
    PROFILES ||--o{ DISPUTES : "files"
    PROFILES ||--o{ AUDIT_LOGS : "generates"
    PROFILES ||--o{ INTRUSION_LOGS : "attempts"
    PROFILES ||--o{ SEARCH_ALERTS : "creates"
    PROFILES ||--o{ BUYER_REQUESTS : "posts"
    PROFILES ||--o{ RECENT_DEALS : "completes"
    
    CATEGORIES ||--o{ SUBCATEGORIES : "contains"
    CATEGORIES ||--o{ ADS : "categorizes"
    SUBCATEGORIES ||--o{ ADS : "specifies"
    
    ADS ||--o{ CONVERSATIONS : "generates"
    ADS ||--o{ MESSAGES : "references"
    ADS ||--o{ FAVORITES : "bookmarked_in"
    ADS ||--o{ REPORTS : "reported_in"
    ADS ||--o{ PROMOTION_PAYMENTS : "promoted_in"
    ADS ||--o{ ESCROW_TRANSACTIONS : "escrowed_in"
    
    CONVERSATIONS ||--o{ MESSAGES : "contains"
    
    WALLETS ||--o{ TRANSACTIONS : "records"
    
    ADS }|--o{ AD_IMAGES : "has"
    PROFILES ||--o{ BUYER_REQUESTS : "posts"
    BUYER_REQUESTS ||--o{ BUYER_REQUEST_RESPONSES : "receives"
    
    ADS ||--o{ ESCROW_TRANSACTIONS : "secured_by"
    PROFILES ||--o{ ESCROW_TRANSACTIONS : "buys"
    PROFILES ||--o{ ESCROW_TRANSACTIONS : "sells"
    
    PROFILES {
        uuid id PK
        text email UK
        text full_name
        text phone_number
        text avatar_url
        text cover_url
        text bio
        varchar role
        boolean verified
        varchar verification_type
        text business_name
        text business_category
        text business_address
        text cac_number
        text business_hours
        text bank_name
        text account_number
        text account_name
        text website_url
        text instagram_handle
        text twitter_handle
        text whatsapp_number
        boolean email_notifications
        boolean whatsapp_notifications
        boolean hide_phone_publicly
        boolean hide_location_publicly
        text location
        timestamp member_since
        varchar status
        text restriction_reason
        varchar appeal_status
        numeric total_value_traded
        integer completed_deals
        text password_hash
        timestamp created_at
        timestamp updated_at
    }
    
    CATEGORIES {
        text id PK
        text name UK
        text icon_name
        text color
        text description
        text parent_id FK
        integer sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    SUBCATEGORIES {
        text id PK
        text category_id FK
        text name
        text description
        text icon_name
        varchar listing_type
        jsonb spec_fields
        integer sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    ADS {
        uuid id PK
        uuid seller_id FK
        text category_id FK
        text subcategory_id FK
        text title
        text description
        numeric price
        numeric original_price
        varchar condition
        text location
        varchar status
        text[] images
        text video_url
        jsonb specifications
        integer views_count
        boolean featured
        text promotion_plan_name
        integer promotion_duration_months
        timestamp promotion_start_date
        timestamp promotion_end_date
        varchar payment_status
        text payment_proof_url
        numeric amount_paid
        timestamp created_at
        timestamp updated_at
    }
    
    CONVERSATIONS {
        uuid id PK
        uuid ad_id FK
        uuid participant_1 FK
        uuid participant_2 FK
        text last_message
        timestamp last_message_time
        integer unread_count_1
        integer unread_count_2
        timestamp created_at
        timestamp updated_at
    }
    
    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        uuid receiver_id FK
        uuid ad_id FK
        text content
        varchar status
        boolean read
        timestamp created_at
    }
    
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        varchar type
        text title
        text description
        text link_url
        boolean read
        timestamp created_at
    }
    
    FAVORITES {
        uuid id PK
        uuid user_id FK
        uuid ad_id FK
        timestamp created_at
    }
    
    WALLETS {
        uuid id PK
        uuid user_id FK UK
        numeric balance
        numeric pending_balance
        numeric total_withdrawn
        text currency
        timestamp updated_at
    }
    
    TRANSACTIONS {
        uuid id PK
        uuid wallet_id FK
        varchar type
        numeric amount
        varchar status
        text description
        text reference
        uuid related_ad_id FK
        uuid related_user_id FK
        timestamp created_at
    }
    
    ESCROW_TRANSACTIONS {
        uuid id PK
        uuid ad_id FK
        uuid buyer_id FK
        uuid seller_id FK
        numeric amount
        varchar status
        text handover_code UK
        text qr_code_url
        text inspection_location
        timestamp inspection_completed_at
        timestamp released_at
        timestamp disputed_at
        timestamp refunded_at
        timestamp created_at
        timestamp updated_at
    }
    
    VERIFICATION_REQUESTS {
        uuid id PK
        uuid user_id FK
        text user_name
        text user_email
        varchar type
        text doc_type
        text doc_number
        text doc_url
        varchar status
        text admin_notes
        uuid reviewed_by FK
        timestamp reviewed_at
        timestamp created_at
        timestamp updated_at
    }
    
    PASSWORD_REQUESTS {
        uuid id PK
        uuid user_id FK
        text user_email
        text user_name
        text nin
        text id_document_url
        text new_password_hash
        text reason
        varchar status
        text admin_notes
        uuid reviewed_by FK
        timestamp reviewed_at
        timestamp created_at
        timestamp updated_at
    }
    
    PROMOTION_PAYMENTS {
        uuid id PK
        uuid user_id FK
        uuid ad_id FK
        numeric amount
        varchar payment_method
        text payment_proof_url
        varchar status
        text plan_name
        integer duration_months
        text admin_notes
        uuid reviewed_by FK
        timestamp reviewed_at
        timestamp created_at
        timestamp updated_at
    }
    
    REVIEWS {
        uuid id PK
        uuid seller_id FK
        uuid buyer_id FK
        text buyer_name
        text buyer_avatar
        integer rating
        text comment
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    REPORTS {
        uuid id PK
        uuid ad_id FK
        text ad_title
        uuid reporter_id FK
        text reporter_name
        text reason
        text details
        varchar status
        text admin_notes
        uuid reviewed_by FK
        timestamp reviewed_at
        timestamp created_at
        timestamp updated_at
    }
    
    DISPUTES {
        uuid id PK
        uuid user_id FK
        text user_email
        text receipt_ref
        text item_title
        text counterparty
        text category
        text reason
        text details
        text evidence_url
        varchar status
        text admin_notes
        uuid assigned_moderator FK
        timestamp resolved_at
        timestamp created_at
        timestamp updated_at
    }
    
    AUDIT_LOGS {
        uuid id PK
        text action
        text details
        varchar type
        uuid user_id FK
        inet ip_address
        text user_agent
        timestamp created_at
    }
    
    INTRUSION_LOGS {
        uuid id PK
        text attempted_email
        jsonb device_info
        boolean media_captured
        text media_status
        varchar status
        inet ip_address
        text user_agent
        timestamp created_at
    }
    
    SYSTEM_CONFIGS {
        uuid id PK
        text key UK
        boolean value
        text description
        timestamp updated_at
    }
    
    SITE_SETTINGS {
        uuid id PK
        text logo_url
        text site_name
        text site_description
        text og_image
        text contact_email
        text contact_phone
        timestamp updated_at
    }
    
    PROMOTION_PLANS {
        uuid id PK
        integer months
        text label
        numeric rate
        text badge
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    SAFE_SPOTS {
        uuid id PK
        text name
        varchar zone
        varchar category
        text address
        text distance
        text hours
        boolean cctv_verified
        numeric latitude
        numeric longitude
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    ANNOUNCEMENTS {
        uuid id PK
        text title
        text message
        varchar type
        boolean active
        text[] target_roles
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }
    
    RECENT_DEALS {
        uuid id PK
        text item_title
        numeric price
        text location
        text time
        timestamp created_at
    }
    
    SEARCH_ALERTS {
        uuid id PK
        uuid user_id FK
        text query
        text category_id FK
        numeric max_price
        text location
        integer match_count
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    BUYER_REQUESTS {
        uuid id PK
        uuid user_id FK
        text user_name
        text user_avatar
        text title
        text category_id FK
        numeric max_budget
        text location
        text description
        integer responses_count
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    BUYER_REQUEST_RESPONSES {
        uuid id PK
        uuid request_id FK
        uuid seller_id FK
        text seller_name
        text seller_avatar
        numeric proposed_price
        text message
        varchar status
        timestamp created_at
    }
    
    ANALYTICS_EVENTS {
        uuid id PK
        text session_id
        text event_name
        jsonb properties
        text url
        text referrer
        text user_agent
        text viewport
        timestamp created_at
    }
    
    PERFORMANCE_METRICS {
        uuid id PK
        text session_id
        text metric_name
        numeric value
        varchar rating
        timestamp timestamp
    }
\`\`\`
`;

      setSchema(sql);
    } catch (err) {
      console.error('Failed to generate schema:', err);
      toast.error('Failed to generate database schema');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(schema);
      toast.success('Schema copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy schema');
    }
  };

  const downloadSqlFile = () => {
    const blob = new Blob([schema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sealify-schema-${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('SQL file downloaded!');
  };

  const copyMermaidToClipboard = async () => {
    const mermaidMatch = schema.match(/```mermaid\n([\s\S]*?)\n```/);
    if (mermaidMatch) {
      await navigator.clipboard.writeText(mermaidMatch[1]);
      toast.success('Mermaid ERD copied! Paste at mermaid.live');
    } else {
      toast.error('Could not extract Mermaid diagram');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            Database Schema & ERD Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copyMermaidToClipboard} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy Mermaid ERD
            </Button>
            <Button onClick={copyToClipboard} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy Full SQL
            </Button>
            <Button variant="outline" onClick={downloadSqlFile} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download .sql
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <p className="text-sm font-medium text-white">Generated Schema ({schema.length} characters)</p>
              <p className="text-xs text-slate-400">
                Complete PostgreSQL schema for Sealify Nigeria marketplace with 31 tables, indexes, RLS policies, and triggers.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowMermaid(!showMermaid)} variant="outline" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                {showMermaid ? 'Hide' : 'Show'} Mermaid ERD
              </Button>
              <Button onClick={generateSchema} disabled={isGenerating} className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate Schema
              </Button>
            </div>

            {showMermaid && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-96 overflow-auto">
                <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">
                  {(() => {
                    const match = schema.match(/```mermaid\n([\s\S]*?)\n```/);
                    return match ? match[1] : 'No Mermaid diagram found';
                  })()}
                </pre>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Copy the above and paste into <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">mermaid.live</a> to visualize the ERD
                </p>
              </div>
            )}

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-96 overflow-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                {schema}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseDiagramViewer;