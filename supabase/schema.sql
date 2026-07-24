-- Sealify Supabase PostgreSQL Schema & Row Level Security (RLS)

-- 1. Users / Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  verified BOOLEAN DEFAULT false,
  verification_type VARCHAR(20) DEFAULT 'none' CHECK (verification_type IN ('individual', 'business', 'premium', 'none')),
  business_name TEXT,
  location TEXT DEFAULT 'Ogbomoso, Oyo State',
  member_since TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'restricted')),
  restriction_reason TEXT,
  appeal_status VARCHAR(20) DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'resolved')),
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Listings Table (Prices stored in Nigerian Naira - NGN with top ad promotion duration fields)
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(14, 2) NOT NULL, -- NGN currency
  original_price NUMERIC(14, 2),
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Ogbomoso, Nigeria',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold')),
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  views_count INTEGER DEFAULT 0,
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

-- 3. Listing Images Table (for additional images if needed)
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Verification Submissions Table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  applicant_type TEXT CHECK (applicant_type IN ('individual', 'business', 'premium')),
  doc_type TEXT NOT NULL,
  doc_number TEXT NOT NULL,
  doc_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Password Reset Requests Table (NIN Verification & Admin Review)
CREATE TABLE IF NOT EXISTS public.password_change_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 6. Promotion Payment Requests Table
CREATE TABLE IF NOT EXISTS public.promotion_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_proof_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  plan_name TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Dispute Cases Table
CREATE TABLE IF NOT EXISTS public.dispute_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 8. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  listing_title TEXT NOT NULL,
  reporter_name TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  participant_1 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_avatar TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Buyer Requests Table
CREATE TABLE IF NOT EXISTS public.buyer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  max_budget NUMERIC(14, 2) NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  responses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Search Alerts Table
CREATE TABLE IF NOT EXISTS public.search_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  category TEXT NOT NULL,
  max_price NUMERIC(14, 2),
  location TEXT NOT NULL,
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'alert')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. System Config Table
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value BOOLEAN NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT '00000000-0000-0000-0000-000000000001' PRIMARY KEY,
  logo_url TEXT,
  site_name TEXT,
  site_description TEXT,
  og_image TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. Intrusion Logs Table
CREATE TABLE IF NOT EXISTS public.intrusion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  attempted_email TEXT NOT NULL,
  device_info JSONB NOT NULL,
  media_captured BOOLEAN DEFAULT false,
  media_status TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'flagged' CHECK (status IN ('flagged', 'reported', 'dismissed'))
);

-- 20. Recent Deals Table
CREATE TABLE IF NOT EXISTS public.recent_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_title TEXT NOT NULL,
  price NUMERIC(14, 2) NOT NULL,
  location TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intrusion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_deals ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Public can view profiles, users can update their own
CREATE POLICY "Public profile view" ON public.users FOR SELECT USING (true);
CREATE POLICY "User update self" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access users" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Listings: Anyone can view active listings, sellers can manage their own
CREATE POLICY "Anyone view active listings" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users insert listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Seller update own listing" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Seller delete own listing" ON public.listings FOR DELETE USING (auth.uid() = seller_id);
CREATE POLICY "Admin full access listings" ON public.listings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Verification Requests: Users can create, admins can view all
CREATE POLICY "Users create verification" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin view all verifications" ON public.verification_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update verifications" ON public.verification_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Password Requests: Users can create, admins can view all
CREATE POLICY "Users create password requests" ON public.password_change_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin view all password requests" ON public.password_change_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update password requests" ON public.password_change_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Promotion Payments: Users can create, admins can view all
CREATE POLICY "Users create promotion payments" ON public.promotion_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin view all promotions" ON public.promotion_payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update promotions" ON public.promotion_payments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Dispute Cases: Users can create, admins can view all
CREATE POLICY "Users create disputes" ON public.dispute_cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin view all disputes" ON public.dispute_cases FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update disputes" ON public.dispute_cases FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Reports: Users can create, admins can view all
CREATE POLICY "Users create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin view all reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin update reports" ON public.reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Audit Logs: Admin only
CREATE POLICY "Admin view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Messages: Users can read their own messages
CREATE POLICY "Read personal messages" ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Send messages" ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Conversations: Users can view their conversations
CREATE POLICY "View own conversations" ON public.conversations FOR SELECT 
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Create conversations" ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Update conversations" ON public.conversations FOR UPDATE 
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Notifications: Users can view their own notifications
CREATE POLICY "View own notifications" ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "System insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Reviews: Public can view, buyers can create
CREATE POLICY "Public view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Admin delete reviews" ON public.reviews FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Buyer Requests: Public can view, users can create
CREATE POLICY "Public view buyer requests" ON public.buyer_requests FOR SELECT USING (true);
CREATE POLICY "Users create buyer requests" ON public.buyer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own requests" ON public.buyer_requests FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin full access buyer requests" ON public.buyer_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Search Alerts: Users can manage their own
CREATE POLICY "Users manage search alerts" ON public.search_alerts FOR ALL USING (auth.uid() = user_id);

-- Announcements: Public can view active, admins can manage
CREATE POLICY "Public view active announcements" ON public.announcements FOR SELECT USING (active = true);
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- System Config: Admin only
CREATE POLICY "Admin manage system config" ON public.system_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Site Settings: Admin only
CREATE POLICY "Admin manage site settings" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Intrusion Logs: Admin only
CREATE POLICY "Admin view intrusion logs" ON public.intrusion_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "System insert intrusion logs" ON public.intrusion_logs FOR INSERT WITH CHECK (true);

-- Recent Deals: Public can view
CREATE POLICY "Public view recent deals" ON public.recent_deals FOR SELECT USING (true);
CREATE POLICY "System insert recent deals" ON public.recent_deals FOR INSERT WITH CHECK (true);

-- Function to increment views
CREATE OR REPLACE FUNCTION public.increment_views(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.listings 
  SET views_count = views_count + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default system config
INSERT INTO public.system_config (key, value) VALUES
  ('maintenanceMode', false),
  ('autoApproveAds', true),
  ('requireIdForPosting', false),
  ('aiSpamFilter', true)
ON CONFLICT (key) DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (id, logo_url, site_name, site_description, og_image, contact_email, contact_phone) VALUES
  ('00000000-0000-0000-0000-000000000001', '/logo.png', 'Sealify Master ControlPanel', 'Nigeria''s Trusted Local Marketplace. Buy, sell, and connect locally in Ogbomosoland, Oyo State, and across Nigeria.', '/og-image.png', 'support@sealify.ng', '+234 813 120 8468')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(featured);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_password_requests_status ON public.password_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_status ON public.promotion_payments(status);
CREATE INDEX IF NOT EXISTS idx_dispute_cases_status ON public.dispute_cases(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intrusion_logs_timestamp ON public.intrusion_logs(timestamp DESC);