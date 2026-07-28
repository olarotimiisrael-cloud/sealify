-- Sealify Complete Production PostgreSQL Database Schema & Security Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users / Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  store_banner_url TEXT,
  role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  verified BOOLEAN DEFAULT false,
  verification_type VARCHAR(20) DEFAULT 'none' CHECK (verification_type IN ('individual', 'business', 'premium', 'student', 'none')),
  business_name TEXT,
  cac_number TEXT,
  business_hours TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  twitter_handle TEXT,
  whatsapp_number TEXT,
  bio TEXT,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  location TEXT DEFAULT 'Ogbomoso, Oyo State',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'restricted')),
  restriction_reason TEXT,
  appeal_status VARCHAR(20) DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'resolved')),
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(14, 2) NOT NULL,
  original_price NUMERIC(14, 2),
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Ogbomoso, Oyo State',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold')),
  views_count INTEGER DEFAULT 1,
  featured BOOLEAN DEFAULT false,
  promotion_plan_name TEXT,
  promotion_duration_months INTEGER DEFAULT 0,
  promotion_start_date TIMESTAMP WITH TIME ZONE,
  promotion_end_date TIMESTAMP WITH TIME ZONE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed')),
  payment_proof_url TEXT,
  amount_paid NUMERIC(14, 2),
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Listing Images Table
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  participant_1 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Verification Requests Table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  doc_type TEXT NOT NULL,
  doc_number TEXT NOT NULL,
  doc_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Password Requests Table
CREATE TABLE IF NOT EXISTS public.password_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  nin TEXT NOT NULL,
  id_document_url TEXT NOT NULL,
  new_password TEXT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Promotion Payments Table
CREATE TABLE IF NOT EXISTS public.promotion_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_proof_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  plan_name TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Disputes Table
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
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  listing_title TEXT NOT NULL,
  reporter_name TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Buyer Requests Table
CREATE TABLE IF NOT EXISTS public.buyer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  max_budget NUMERIC(14, 2) NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  responses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Search Alerts Table
CREATE TABLE IF NOT EXISTS public.search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  category TEXT NOT NULL,
  max_price NUMERIC(14, 2),
  location TEXT NOT NULL,
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'alert')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. System Configs Table
CREATE TABLE IF NOT EXISTS public.system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value BOOLEAN NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18b. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT,
  site_name TEXT,
  site_description TEXT,
  og_image TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. Promotion Plans Table
CREATE TABLE IF NOT EXISTS public.promotion_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  months INTEGER NOT NULL,
  label TEXT NOT NULL,
  rate NUMERIC(14, 2) NOT NULL,
  badge TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 20. Safe Spots Table
CREATE TABLE IF NOT EXISTS public.safe_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  distance TEXT NOT NULL,
  hours TEXT NOT NULL,
  cctv_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 21. Intrusion Logs Table
CREATE TABLE IF NOT EXISTS public.intrusion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  attempted_email TEXT NOT NULL,
  device_info JSONB,
  media_captured BOOLEAN DEFAULT false,
  media_status TEXT,
  status VARCHAR(20) DEFAULT 'flagged' CHECK (status IN ('flagged', 'reported', 'dismissed'))
);

-- 22. Recent Deals Table
CREATE TABLE IF NOT EXISTS public.recent_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_title TEXT NOT NULL,
  price NUMERIC(14, 2) NOT NULL,
  location TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies - Allow all operations for authenticated users (admin will manage via service role)
CREATE POLICY "Public Users All" ON public.users FOR ALL USING (true);
CREATE POLICY "Public Listings All" ON public.listings FOR ALL USING (true);
CREATE POLICY "Public Listing Images All" ON public.listing_images FOR ALL USING (true);
CREATE POLICY "Public Favorites All" ON public.favorites FOR ALL USING (true);
CREATE POLICY "Public Messages All" ON public.messages FOR ALL USING (true);
CREATE POLICY "Public Conversations All" ON public.conversations FOR ALL USING (true);
CREATE POLICY "Public Notifications All" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Public Verification Requests All" ON public.verification_requests FOR ALL USING (true);
CREATE POLICY "Public Password Requests All" ON public.password_requests FOR ALL USING (true);
CREATE POLICY "Public Promotion Payments All" ON public.promotion_payments FOR ALL USING (true);
CREATE POLICY "Public Disputes All" ON public.disputes FOR ALL USING (true);
CREATE POLICY "Public Reports All" ON public.reports FOR ALL USING (true);
CREATE POLICY "Public Audit Logs All" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Public Reviews All" ON public.reviews FOR ALL USING (true);
CREATE POLICY "Public Buyer Requests All" ON public.buyer_requests FOR ALL USING (true);
CREATE POLICY "Public Search Alerts All" ON public.search_alerts FOR ALL USING (true);
CREATE POLICY "Public Announcements All" ON public.announcements FOR ALL USING (true);
CREATE POLICY "Public System Configs All" ON public.system_configs FOR ALL USING (true);
CREATE POLICY "Public Site Settings All" ON public.site_settings FOR ALL USING (true);
CREATE POLICY "Public Promotion Plans All" ON public.promotion_plans FOR ALL USING (true);
CREATE POLICY "Public Safe Spots All" ON public.safe_spots FOR ALL USING (true);
CREATE POLICY "Public Intrusion Logs All" ON public.intrusion_logs FOR ALL USING (true);
CREATE POLICY "Public Recent Deals All" ON public.recent_deals FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(featured);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON public.messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_requests_user_id ON public.password_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_user_id ON public.promotion_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_listing_id ON public.promotion_payments(listing_id);
CREATE INDEX IF NOT EXISTS idx_disputes_user_id ON public.disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON public.reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_user_id ON public.buyer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id ON public.search_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_intrusion_logs_timestamp ON public.intrusion_logs(timestamp DESC);

-- Insert default promotion plans
INSERT INTO public.promotion_plans (months, label, rate, badge) VALUES
  (1, '1 Month', 15000, 'STARTER'),
  (3, '3 Months', 13000, 'POPULAR'),
  (6, '6 Months', 11000, 'BEST VALUE'),
  (12, '1 Year', 9000, 'PREMIUM')
ON CONFLICT DO NOTHING;

-- Insert default system configs
INSERT INTO public.system_configs (key, value) VALUES
  ('maintenanceMode', false),
  ('autoApproveAds', true),
  ('requireIdForPosting', false),
  ('aiSpamFilter', true)
ON CONFLICT (key) DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (logo_url, site_name, site_description, og_image, contact_email, contact_phone) VALUES
  ('/logo.png', 'Sealify Nigeria', 'Nigeria''s Trusted Local Marketplace for Ogbomosoland & Oyo State.', '/og-image.png', 'support@sealify.ng', '+234 813 120 8468')
ON CONFLICT DO NOTHING;

-- Insert default safe spots for Ogbomoso
INSERT INTO public.safe_spots (name, zone, category, address, distance, hours, cctv_verified) VALUES
  ('Ogbomoso Divisional Police HQ', 'Police HQ', 'Police Safe Zone', 'Police HQ, Ogbomoso', 'Central Hub', '24/7', true),
  ('LAUTECH Main Gate Security Post', 'LAUTECH Area', 'Police Safe Zone', 'LAUTECH Main Gate, Ogbomoso', '1 min walk', '24/7', true),
  ('LAUTECH Library Gate', 'LAUTECH Area', 'Public Library', 'LAUTECH Library, Ogbomoso', '3 mins walk', '8:00 AM - 10:00 PM', true),
  ('Takie Square Mall', 'Takie / Center', 'Shopping Mall', 'Takie Square, Ogbomoso', 'Central Hub', '9:00 AM - 9:00 PM', true),
  ('Sabo Market Police Post', 'Sabo Market Zone', 'Police Safe Zone', 'Sabo Market, Ogbomoso', 'Central Hub', '8:00 AM - 8:00 PM', true),
  ('Adenike Area Community Center', 'LAUTECH Area', 'Public Library', 'Adenike Area, Ogbomoso', '5 mins walk', '8:00 AM - 6:00 PM', true),
  ('General Hospital Junction', 'General / Akala Way', 'Police Safe Zone', 'General Hospital Junction, Ogbomoso', 'Central Hub', '24/7', true)
ON CONFLICT DO NOTHING;