= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 23. BUYER REQUESTS TABLE
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
  status buyer_request_status DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 24. WALLET TABLE
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(14, 2) DEFAULT 0,
  pending_balance NUMERIC(14, 2) DEFAULT 0,
  total_withdrawn NUMERIC(14, 2) DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 25. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  status transaction_status DEFAULT 'pending',
  description TEXT NOT NULL,
  reference TEXT,
  related_listing_id UUID REFERENCES public.ads(id),
  related_user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 26. ESCROW TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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

-- 27. INTRUSION LOGS TABLE
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

-- 28. RECENT DEALS TABLE
CREATE TABLE IF NOT EXISTS public.recent_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_title TEXT NOT NULL,
  price NUMERIC(14, 2) NOT NULL,
  location TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 29. PHONE OTPS TABLE
CREATE TABLE IF NOT EXISTS public.phone_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 30. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  price_drop_alerts BOOLEAN DEFAULT true,
  new_message_alerts BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  promotion_expiry_reminders BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 31. BUYER REQUEST RESPONSES TABLE
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

-- 32. PUSH SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT,
  auth TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, endpoint)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ads_seller_id ON public.ads(seller_id);
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON public.ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_location ON public.ads USING GIN (to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_ads_title_search ON public.ads USING GIN (to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_featured ON public.ads(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_ads_price ON public.ads(price);
CREATE INDEX IF NOT EXISTS idx_ads_views ON public.ads(views_count DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_participant ON public.conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON public.conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON public.favorites(listing_id);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

CREATE INDEX IF NOT EXISTS idx_escrow_listing ON public.escrow_transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer ON public.escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller ON public.escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON public.escrow_transactions(status);

CREATE INDEX IF NOT EXISTS idx_reviews_seller ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_user ON public.buyer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_category ON public.buyer_requests(category_id);

CREATE INDEX IF NOT EXISTS idx_verification_user ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_user ON public.promotion_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_listing ON public.reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_disputes_user ON public.disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intrusion_logs_email ON public.intrusion_logs(attempted_email);
CREATE INDEX IF NOT EXISTS idx_intrusion_logs_created ON public.intrusion_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON public.phone_otps(phone, expires_at);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- ADS POLICIES
CREATE POLICY "Public read active ads" ON public.ads FOR SELECT USING (status = 'active');
CREATE POLICY "Owners can insert own ads" ON public.ads FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Owners can update own ads" ON public.ads FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Owners can delete own ads" ON public.ads FOR DELETE USING (auth.uid() = seller_id);
CREATE POLICY "Admins full access ads" ON public.ads FOR ALL USING (public.is_admin());

-- CONVERSATIONS POLICIES
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can start conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Admins full access conversations" ON public.conversations FOR ALL USING (public.is_admin());

-- MESSAGES POLICIES
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND 
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);
CREATE POLICY "Admins full access messages" ON public.messages FOR ALL USING (public.is_admin());

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins full access notifications" ON public.notifications FOR ALL USING (public.is_admin());

-- FAVORITES POLICIES
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins full access favorites" ON public.favorites FOR ALL USING (public.is_admin());

-- WALLETS POLICIES
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins full access wallets" ON public.wallets FOR ALL USING (public.is_admin());

-- TRANSACTIONS POLICIES
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wallets w WHERE w.id = wallet_id AND w.user_id = auth.uid())
);
CREATE POLICY "Admins full access transactions" ON public.transactions FOR ALL USING (public.is_admin());

-- ESCROW TRANSACTIONS POLICIES
CREATE POLICY "Parties view escrow" ON public.escrow_transactions FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);
CREATE POLICY "Buyers create escrow" ON public.escrow_transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Admins full access escrow" ON public.escrow_transactions FOR ALL USING (public.is_admin());

-- VERIFICATION REQUESTS POLICIES
CREATE POLICY "Users view own verifications" ON public.verification_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create verifications" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access verifications" ON public.verification_requests FOR ALL USING (public.is_admin());

-- PASSWORD REQUESTS POLICIES
CREATE POLICY "Users view own password requests" ON public.password_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create password requests" ON public.password_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access password requests" ON public.password_requests FOR ALL USING (public.is_admin());

-- PROMOTION PAYMENTS POLICIES
CREATE POLICY "Users view own promotions" ON public.promotion_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create promotions" ON public.promotion_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access promotions" ON public.promotion_payments FOR ALL USING (public.is_admin());

-- REPORTS POLICIES
CREATE POLICY "Anyone can report" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins full access reports" ON public.reports FOR ALL USING (public.is_admin());

-- DISPUTES POLICIES
CREATE POLICY "Users view own disputes" ON public.disputes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create disputes" ON public.disputes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access disputes" ON public.disputes FOR ALL USING (public.is_admin());

-- REVIEWS POLICIES
CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Buyers create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Admins full access reviews" ON public.reviews FOR ALL USING (public.is_admin());

-- BUYER REQUESTS POLICIES
CREATE POLICY "Public read open buyer requests" ON public.buyer_requests FOR SELECT USING (status = 'open');
CREATE POLICY "Users create buyer requests" ON public.buyer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners update own requests" ON public.buyer_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins full access buyer requests" ON public.buyer_requests FOR ALL USING (public.is_admin());

-- SEARCH ALERTS POLICIES
CREATE POLICY "Users manage own search alerts" ON public.search_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins full access search alerts" ON public.search_alerts FOR ALL USING (public.is_admin());

-- SAFE SPOTS POLICIES
CREATE POLICY "Public read active safe spots" ON public.safe_spots FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage safe spots" ON public.safe_spots FOR ALL USING (public.is_admin());

-- ANNOUNCEMENTS POLICIES
CREATE POLICY "Public read active announcements" ON public.announcements FOR SELECT USING (active = true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL USING (public.is_admin());

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
      'profiles', 'categories', 'subcategories', 'ads', 'listing_images',
      'conversations', 'messages', 'notifications', 'verification_requests',
      'password_requests', 'promotion_payments', 'reports', 'disputes',
      'announcements', 'safe_spots', 'system_configs', 'site_settings',
      'promotion_plans', 'search_alerts', 'reviews', 'buyer_requests',
      'wallets', 'transactions', 'escrow_transactions', 'site_settings'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    ', tbl);
  END LOOP;
END $$;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- ============================================================
-- INITIAL DATA SEEDING
-- ============================================================

-- Default categories
INSERT INTO public.categories (id, name, icon_name, color, description, sort_order, is_active) VALUES
('vehicles', 'Vehicles', 'Car', 'bg-blue-500', 'Cars, motorcycles, trucks, and other vehicles', 1, true),
('electronics', 'Electronics', 'Smartphone', 'bg-purple-500', 'Phones, laptops, gadgets, and accessories', 2, true),
('real_estate', 'Real Estate', 'Home', 'bg-teal-500', 'Houses, apartments, land, and commercial property', 3, true),
('fashion', 'Fashion', 'Shirt', 'bg-pink-500', 'Clothing, shoes, accessories, and beauty', 4, true),
('home_furniture', 'Home & Furniture', 'Armchair', 'bg-amber-500', 'Furniture, decor, appliances, and home goods', 5, true),
('services', 'Services', 'Wrench', 'bg-cyan-500', 'Professional services, repairs, and freelance work', 6, true),
('jobs', 'Jobs', 'Briefcase', 'bg-indigo-500', 'Job listings and recruitment', 7, true),
('beauty_health', 'Beauty & Health', 'Sparkles', 'bg-rose-500', 'Cosmetics, wellness, and personal care', 8, true),
('utility_energy', 'Utility & Energy', 'Zap', 'bg-yellow-500', 'Generators, solar, batteries, and power solutions', 9, true),
('solar_clean_energy', 'Solar & Clean Energy', 'Sun', 'bg-yellow-500', 'Solar panels, inverters, batteries, and installation services', 10, true)
ON CONFLICT (id) DO NOTHING;

-- Default subcategories for Solar
INSERT INTO public.subcategories (id, category_id, name, description, icon_name, listing_type, spec_fields, sort_order, is_active) VALUES
('solar_products', 'solar_clean_energy', 'Solar Accessories & Products', 'Inverters, Solar Panels, Batteries, Charge Controllers, Wiring, Mounting Systems', 'Battery', 'product', '[
  {"key": "productType", "label": "Product Type", "type": "select", "options": ["Solar Panel", "Inverter", "Battery", "Charge Controller", "Mounting System", "Wiring & Connectors", "Monitoring System", "Other Accessory"]},
  {"key": "capacity", "label": "Capacity / Power Rating", "type": "text", "placeholder": "e.g. 5kW, 200Ah, 450W"},
  {"key": "voltage", "label": "Voltage", "type": "select", "options": ["12V", "24V", "48V", "120V", "240V", "380V", "Other"]},
  {"key": "brand", "label": "Brand / Manufacturer", "type": "text", "placeholder": "e.g. Victron, Growatt, Felicity, Bluegate"},
  {"key": "warranty", "label": "Warranty Period", "type": "select", "options": ["1 Year", "2 Years", "3 Years", "5 Years", "10 Years", "Lifetime", "No Warranty"]},
  {"key": "certification", "label": "Certifications", "type": "text", "placeholder": "e.g. IEC, CE, UL, TUV"}
]'::jsonb, 1, true),
('solar_installation', 'solar_clean_energy', 'Solar Installation & Maintenance Services', 'System Sizing, Installation Services, Repair & Maintenance, Energy Audits, Consultation', 'Wrench', 'service', '[
  {"key": "serviceType", "label": "Service Type", "type": "select", "options": ["System Design & Sizing", "Full Installation", "Panel Installation Only", "Inverter/Battery Installation", "System Repair", "Preventive Maintenance", "Energy Audit", "Performance Optimization", "System Upgrade"]},
  {"key": "systemSize", "label": "Typical System Size Handled", "type": "select", "options": ["Small (1-3kW)", "Medium (3-10kW)", "Large (10-50kW)", "Commercial (50kW+)", "Industrial (100kW+)"]},
  {"key": "serviceArea", "label": "Service Coverage Area", "type": "text", "placeholder": "e.g. Ogbomoso, Ibadan, Oyo State"},
  {"key": "certifications", "label": "Technician Certifications", "type": "text", "placeholder": "e.g. NABCEP, COREN, Manufacturer Certified"},
  {"key": "warrantyOffered", "label": "Workmanship Warranty", "type": "select", "options": ["3 Months", "6 Months", "1 Year", "2 Years", "5 Years", "No Warranty"]},
  {"key": "responseTime", "label": "Emergency Response Time", "type": "select", "options": ["24 Hours", "48 Hours", "3-5 Days", "1 Week", "Scheduled Only"]}
]'::jsonb, 2, true)
ON CONFLICT (id) DO NOTHING;

-- Promotion plans
INSERT INTO public.promotion_plans (months, label, rate, badge, is_active) VALUES
(1, '1 Month', 15000, 'STARTER', true),
(3, '3 Months', 39000, 'POPULAR', true),
(6, '6 Months', 66000, 'BEST VALUE', true),
(12, '12 Months', 108000, 'ENTERPRISE', true)
ON CONFLICT DO NOTHING;

-- System configs
INSERT INTO public.system_configs (key, value, description) VALUES
('maintenance_mode', false, 'Enable maintenance mode to lock public marketplace'),
('auto_approve_ads', true, 'Automatically approve new classified ads without admin review'),
('require_id_for_posting', false, 'Require ID verification before allowing ad posting'),
('ai_spam_filter', true, 'Enable AI-powered spam and fraud detection'),
('max_images_per_ad', 10, 'Maximum images per classified ad'),
('max_file_size_mb', 20, 'Maximum file upload size in MB'),
('platform_fee_percent', 0, 'Platform commission percentage on sales'),
('min_payout_amount', 1000, 'Minimum withdrawal amount in NGN'),
('payout_processing_hours', 4, 'Standard payout processing time in hours')
ON CONFLICT (key) DO NOTHING;

-- Site settings
INSERT INTO public.site_settings (site_name, site_description, og_image, contact_email, contact_phone) VALUES
('Sealify Nigeria', 'Nigeria''s Trusted Local Marketplace for Ogbomosoland & Oyo State.', '/og-image.png', 'support@sealify.ng', '+234 813 120 8468')
ON CONFLICT DO NOTHING;

-- Safe meetup spots (Ogbomoso verified locations)
INSERT INTO public.safe_spots (name, zone, category, address, distance, hours, cctv_verified, latitude, longitude, is_active) VALUES
('Ogbomoso Divisional Police HQ', 'Police HQ', 'Police Safe Zone', 'Police Headquarters, Ogbomoso, Oyo State', 'Central Hub', '24/7', true, 8.1367, 4.2500, true),
('LAUTECH Main Gate Security Post', 'LAUTECH Area', 'Police Safe Zone', 'LAUTECH Main Gate, Ogbomoso, Oyo State', 'Campus Entry', '24/7', true, 8.1450, 4.2480, true),
('Under G Shopping Complex', 'LAUTECH Area', 'Shopping Mall', 'Under G Market, Ogbomoso, Oyo State', 'Student Hub', '8:00 AM - 8:00 PM', true, 8.1420, 4.2490, true),
('Takie Square Mall', 'Takie / Center', 'Shopping Mall', 'Takie Square, Ogbomoso, Oyo State', 'City Center', '9:00 AM - 7:00 PM', true, 8.1380, 4.2520, true),
('Sabo Market Security Post', 'Sabo Market Zone', 'Police Safe Zone', 'Sabo Market, Ogbomoso, Oyo State', 'Market Center', '7:00 AM - 6:00 PM', true, 8.1350, 4.2550, true),
('Ogbomoso Public Library', 'Takie / Center', 'Public Library', 'Public Library, Ogbomoso, Oyo State', 'Quiet Zone', '8:00 AM - 6:00 PM', true, 8.1390, 4.2510, true),
('Adenike Area Café Hub', 'LAUTECH Area', 'Café', 'Adenike Junction, Ogbomoso, Oyo State', 'Student Area', '7:00 AM - 10:00 PM', true, 8.1430, 4.2470, true),
('General Hospital Security Post', 'Police HQ', 'Police Safe Zone', 'LAUTECH Teaching Hospital, Ogbomoso', 'Hospital Zone', '24/7', true, 8.1400, 4.2530, true),
('Oja Oba Market Security', 'Sabo Market Zone', 'Police Safe Zone', 'Oja Oba Market, Ogbomoso', 'Market Center', '7:00 AM - 6:00 PM', true, 8.1340, 4.2540, true),
('Ilorin Garage Park Office', 'Takie / Center', 'Café', 'Ilorin Garage, Takie, Ogbomoso', 'Transport Hub', '6:00 AM - 8:00 PM', true, 8.1370, 4.2515, true)
ON CONFLICT DO NOTHING;

-- Recent deals for live ticker
INSERT INTO public.recent_deals (item_title, price, location, time) VALUES
('iPhone 13 Pro 128GB', 780000, 'Under G, Ogbomoso', '5 minutes ago'),
('Toyota Camry 2012', 3200000, 'Takie, Ogbomoso', '12 minutes ago'),
('HP EliteBook 840 G5', 245000, 'LAUTECH Gate', '23 minutes ago'),
('Self-Contain Room Under G', 280000, 'Under G, Ogbomoso', '35 minutes ago'),
('Bajaj Pulsar 150cc', 320000, 'Adenike Area', '42 minutes ago'),
('Starlink Gen 2 Kit', 520000, 'General Area', '58 minutes ago'),
('Mouka Orthopedic Mattress', 195000, 'LAUTECH Gate', '1 hour ago'),
('Elepaq Generator 2.5kVA', 185000, 'Under G', '1 hour ago')
ON CONFLICT DO NOTHING;

-- Announcements
INSERT INTO public.announcements (title, message, type, active, target_roles) VALUES
('Welcome to Sealify Nigeria!', 'Discover verified local classifieds in Ogbomoso. Buy, sell, and connect safely with our trusted community.', 'success', true, ARRAY['buyer', 'seller']),
('New Safe Meetup Spots Added', 'We have added 10 new CCTV-verified safe exchange locations across Ogbomoso including Police HQs, LAUTECH Gate, and Shopping Malls.', 'info', true, ARRAY['buyer', 'seller']),
('AI Price Guard Now Live', 'Our smart pricing engine now shows fair market values for electronics, vehicles, and real estate in Ogbomosoland.', 'info', true, ARRAY['buyer', 'seller']),
('Solar & Clean Energy Category Launched', 'New dedicated category for solar products and installation services. Verified technicians only.', 'success', true, ARRAY['buyer', 'seller']),
('Important: Never Pay Before Inspection', 'Reminder: Always meet sellers at verified safe spots. Never send commitment fees or advance payments.', 'warning', true, ARRAY['buyer', 'seller'])
ON CONFLICT DO NOTHING;