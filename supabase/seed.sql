-- Sealify Database Seed Script
-- Run this in Supabase SQL Editor after running the migration

-- 1. Insert Categories
INSERT INTO public.categories (id, name, icon_name, color, description, sort_order, is_active) VALUES
('vehicles', 'Vehicles', 'Car', 'bg-blue-500', 'Cars, motorcycles, trucks and other vehicles', 1, true),
('electronics', 'Electronics', 'Smartphone', 'bg-purple-500', 'Phones, laptops, gadgets and accessories', 2, true),
('real_estate', 'Real Estate', 'Home', 'bg-teal-500', 'Houses, apartments, land and commercial property', 3, true),
('fashion', 'Fashion', 'Shirt', 'bg-pink-500', 'Clothing, shoes, accessories and beauty', 4, true),
('home_furniture', 'Home & Furniture', 'Armchair', 'bg-amber-500', 'Furniture, decor and household items', 5, true),
('services', 'Services', 'Wrench', 'bg-cyan-500', 'Professional services and repairs', 6, true),
('jobs', 'Jobs', 'Briefcase', 'bg-indigo-500', 'Job listings and career opportunities', 7, true),
('beauty_health', 'Beauty & Health', 'Sparkles', 'bg-rose-500', 'Cosmetics, wellness and personal care', 8, true),
('utility_energy', 'Utility & Energy', 'Zap', 'bg-yellow-500', 'Generators, solar, batteries and power', 9, true),
('solar_clean_energy', 'Solar & Clean Energy', 'Sun', 'bg-yellow-500', 'Solar panels, inverters, installation services', 10, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 2. Insert Subcategories for Vehicles
INSERT INTO public.subcategories (id, category_id, name, description, icon_name, listing_type, spec_fields, sort_order, is_active) VALUES
('cars', 'vehicles', 'Cars', 'Sedans, SUVs, hatchbacks and more', 'Car', 'product', '[{"key":"transmission","label":"Transmission","type":"select","options":["Automatic","Manual"]},{"key":"fuel","label":"Fuel Type","type":"select","options":["Petrol","Diesel","Hybrid","Electric"]},{"key":"mileage","label":"Mileage","type":"text","placeholder":"e.g. 85,000 km"},{"key":"year","label":"Year","type":"number"}]', 1, true),
('motorcycles', 'vehicles', 'Motorcycles', 'Bikes, scooters and trikes', 'Bike', 'product', '[{"key":"engine","label":"Engine Capacity","type":"select","options":["100cc","125cc","150cc","200cc","250cc+"]},{"key":"type","label":"Bike Type","type":"select","options":["Sport","Cruiser","Commuter","Off-road","Scooter"]}]', 2, true),
('commercial', 'vehicles', 'Commercial Vehicles', 'Trucks, buses, vans and pickups', 'Truck', 'product', '[{"key":"capacity","label":"Load Capacity","type":"text","placeholder":"e.g. 2 tons"},{"key":"body","label":"Body Type","type":"select","options":["Pickup","Van","Truck","Bus","Container"]}]', 3, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  spec_fields = EXCLUDED.spec_fields,
  updated_at = NOW();

-- 3. Insert Subcategories for Electronics
INSERT INTO public.subcategories (id, category_id, name, description, icon_name, listing_type, spec_fields, sort_order, is_active) VALUES
('phones', 'electronics', 'Mobile Phones', 'Smartphones and feature phones', 'Smartphone', 'product', '[{"key":"brand","label":"Brand","type":"select","options":["Apple","Samsung","Tecno","Infinix","Xiaomi","Oppo","Vivo","Other"]},{"key":"storage","label":"Storage","type":"select","options":["32GB","64GB","128GB","256GB","512GB","1TB"]},{"key":"ram","label":"RAM","type":"select","options":["2GB","3GB","4GB","6GB","8GB","12GB+"]},{"key":"condition","label":"Condition","type":"select","options":["Brand New","Like New","Used - Good","Used - Fair"]}]', 1, true),
('laptops', 'electronics', 'Laptops & Computers', 'Laptops, desktops and accessories', 'Laptop', 'product', '[{"key":"processor","label":"Processor","type":"select","options":["Intel Core i3","Intel Core i5","Intel Core i7","Intel Core i9","AMD Ryzen 3","AMD Ryzen 5","AMD Ryzen 7","AMD Ryzen 9","Other"]},{"key":"ram","label":"RAM","type":"select","options":["4GB","8GB","16GB","32GB","64GB"]},{"key":"storage","label":"Storage","type":"select","options":["128GB SSD","256GB SSD","512GB SSD","1TB SSD","1TB HDD","2TB+"]},{"key":"screen","label":"Screen Size","type":"select","options":["13 inch","14 inch","15.6 inch","17 inch","Other"]}]', 2, true),
('accessories', 'electronics', 'Accessories', 'Chargers, cases, headphones and more', 'Headphones', 'product', '[{"key":"type","label":"Accessory Type","type":"select","options":["Charger","Case","Headphones","Power Bank","Cable","Screen Protector","Other"]},{"key":"compatibility","label":"Compatible With","type":"text","placeholder":"e.g. iPhone 13, Samsung Galaxy"}]', 3, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  spec_fields = EXCLUDED.spec_fields,
  updated_at = NOW();

-- 4. Insert Subcategories for Real Estate
INSERT INTO public.subcategories (id, category_id, name, description, icon_name, listing_type, spec_fields, sort_order, is_active) VALUES
('houses', 'real_estate', 'Houses for Sale', 'Residential homes and villas', 'Home', 'product', '[{"key":"bedrooms","label":"Bedrooms","type":"select","options":["1","2","3","4","5+"]},{"key":"bathrooms","label":"Bathrooms","type":"select","options":["1","2","3","4+"]},{"key":"type","label":"Property Type","type":"select","options":["Detached","Semi-detached","Terraced","Bungalow","Duplex"]},{"key":"furnished","label":"Furnished","type":"select","options":["Yes","No","Partially"]}]', 1, true),
('apartments', 'real_estate', 'Apartments & Flats', 'Apartments for rent or sale', 'Building', 'product', '[{"key":"bedrooms","label":"Bedrooms","type":"select","options":["Studio","1","2","3","4+"]},{"key":"floor","label":"Floor","type":"text","placeholder":"e.g. 2nd floor"},{"key":"amenities","label":"Amenities","type":"text","placeholder":"e.g. Pool, Gym, Parking, Security"}]', 2, true),
('land', 'real_estate', 'Land & Plots', 'Residential and commercial land', 'MapPin', 'product', '[{"key":"size","label":"Plot Size","type":"text","placeholder":"e.g. 60x120ft, 1 acre"},{"key":"title","label":"Title Document","type":"select","options":["C of O","Governor Consent","Excision","Survey Plan","Receipt Only"]},{"key":"purpose","label":"Intended Use","type":"select","options":["Residential","Commercial","Agricultural","Mixed"]}]', 3, true),
('rentals', 'real_estate', 'Short-term Rentals', 'Hostels, Airbnb and short lets', 'Key', 'service', '[{"key":"type","label":"Rental Type","type":"select","options":["Hostel","Self-contain","Airbnb","Hotel Room","Shared Room"]},{"key":"duration","label":"Minimum Stay","type":"select","options":["Daily","Weekly","Monthly","Yearly"]},{"key":"utilities","label":"Utilities Included","type":"text","placeholder":"e.g. Water, Electricity, WiFi"}]', 4, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  spec_fields = EXCLUDED.spec_fields,
  updated_at = NOW();

-- 5. Insert Subcategories for Solar & Clean Energy
INSERT INTO public.subcategories (id, category_id, name, description, icon_name, listing_type, spec_fields, sort_order, is_active) VALUES
('solar_products', 'solar_clean_energy', 'Solar Accessories & Products', 'Inverters, Solar Panels, Batteries, Charge Controllers, Wiring, Mounting Systems', 'Battery', 'product', '[{"key":"productType","label":"Product Type","type":"select","options":["Solar Panel","Inverter","Battery","Charge Controller","Mounting System","Wiring & Connectors","Monitoring System","Other Accessory"]},{"key":"capacity","label":"Capacity / Power Rating","type":"text","placeholder":"e.g. 5kW, 200Ah, 450W"},{"key":"voltage","label":"Voltage","type":"select","options":["12V","24V","48V","120V","240V","380V","Other"]},{"key":"brand","label":"Brand / Manufacturer","type":"text","placeholder":"e.g. Victron, Growatt, Felicity, Bluegate"},{"key":"warranty","label":"Warranty Period","type":"select","options":["1 Year","2 Years","3 Years","5 Years","10 Years","Lifetime","No Warranty"]},{"key":"certification","label":"Certifications","type":"text","placeholder":"e.g. IEC, CE, UL, TUV"}]', 1, true),
('solar_installation', 'solar_clean_energy', 'Solar Installation & Maintenance Services', 'System Sizing, Installation Services, Repair & Maintenance, Energy Audits, Consultation', 'Wrench', 'service', '[{"key":"serviceType","label":"Service Type","type":"select","options":["System Design & Sizing","Full Installation","Panel Installation Only","Inverter/Battery Installation","System Repair","Preventive Maintenance","Energy Audit","Performance Optimization","System Upgrade"]},{"key":"systemSize","label":"Typical System Size Handled","type":"select","options":["Small (1-3kW)","Medium (3-10kW)","Large (10-50kW)","Commercial (50kW+)","Industrial (100kW+)"]},{"key":"serviceArea","label":"Service Coverage Area","type":"text","placeholder":"e.g. Ogbomoso, Ibadan, Oyo State"},{"key":"certifications","label":"Technician Certifications","type":"text","placeholder":"e.g. NABCEP, COREN, Manufacturer Certified"},{"key":"warrantyOffered","label":"Workmanship Warranty","type":"select","options":["3 Months","6 Months","1 Year","2 Years","5 Years","No Warranty"]},{"key":"responseTime","label":"Emergency Response Time","type":"select","options":["24 Hours","48 Hours","3-5 Days","1 Week","Scheduled Only"]}]', 2, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  spec_fields = EXCLUDED.spec_fields,
  updated_at = NOW();

-- 6. Insert Promotion Plans
INSERT INTO public.promotion_plans (months, label, rate, badge, is_active) VALUES
(1, '1 Month Boost', 15000, 'STARTER', true),
(3, '3 Months Boost', 13000, 'POPULAR', true),
(6, '6 Months Boost', 11000, 'BEST VALUE', true),
(12, '1 Year Boost', 9000, 'PREMIUM', true)
ON CONFLICT DO NOTHING;

-- 7. Insert System Configurations
INSERT INTO public.system_configs (key, value, description) VALUES
('maintenance_mode', false, 'Locks public marketplace feed for updates'),
('auto_approve_ads', true, 'Post listings instantly without admin pre-review'),
('require_id_for_posting', false, 'Require ID verification before posting ads'),
('ai_spam_filter', true, 'Enable AI-powered spam detection'),
('max_images_per_listing', true, 'Allow up to 10 images per listing'),
('enable_escrow', true, 'Enable Sealify Safe Escrow feature'),
('enable_biometric', true, 'Allow biometric app lock'),
('max_compare_items', true, 'Maximum items in comparison (3)')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 8. Insert Site Settings
INSERT INTO public.site_settings (logo_url, site_name, site_description, og_image, contact_email, contact_phone) VALUES
('/logo.png', 'Sealify Nigeria', 'Nigeria''s Trusted Local Marketplace for Ogbomosoland & Oyo State.', '/og-image.png', 'support@sealify.ng', '+234 813 120 8468')
ON CONFLICT DO NOTHING;

-- 9. Insert Safe Meetup Spots
INSERT INTO public.safe_spots (name, zone, category, address, distance, hours, cctv_verified, latitude, longitude, is_active) VALUES
('Ogbomoso Divisional Police HQ', 'Police HQ', 'Police Safe Zone', 'Ogbomoso Police Division, Ilorin Road', 'Central Hub', '24/7', true, 8.1333, 4.2500, true),
('LAUTECH Main Gate Security Post', 'LAUTECH Area', 'Police Safe Zone', 'LAUTECH Main Gate, Ogbomoso', 'Campus Entry', '6:00 AM - 10:00 PM', true, 8.1500, 4.2600, true),
('Under G Shopping Complex', 'LAUTECH Area', 'Shopping Mall', 'Under G Junction, Ogbomoso', 'Student Hub', '8:00 AM - 9:00 PM', true, 8.1450, 4.2550, true),
('Takie Square Mall', 'Takie / Center', 'Shopping Mall', 'Takie Square, Ogbomoso', 'Commercial Center', '9:00 AM - 8:00 PM', true, 8.1350, 4.2450, true),
('Ogbomoso Central Library', 'Takie / Center', 'Public Library', 'Ogbomoso Town Hall Road', 'Town Center', '8:00 AM - 6:00 PM', true, 8.1380, 4.2480, true),
('Sabo Market Security Post', 'Sabo Market Zone', 'Police Safe Zone', 'Sabo Market, Ogbomoso', 'Market Center', '6:00 AM - 8:00 PM', true, 8.1280, 4.2400, true),
('Adenike Area Police Post', 'LAUTECH Area', 'Police Safe Zone', 'Adenike Junction, Ogbomoso', 'Campus Zone', '24/7', true, 8.1520, 4.2620, true),
('Aroje Police Checkpoint', 'Sabo Market Zone', 'Police Safe Zone', 'Aroje Road, Ogbomoso', 'Residential Zone', '24/7', true, 8.1200, 4.2350, true)
ON CONFLICT DO NOTHING;

-- 10. Insert System Announcements
INSERT INTO public.announcements (title, message, type, active, target_roles) VALUES
('Welcome to Sealify Nigeria!', 'Discover verified local deals in Ogbomoso. Post free ads, chat with sellers, and trade safely at our verified meetup spots.', 'success', true, ARRAY['buyer', 'seller']),
('New Safe Meetup Spot: LAUTECH Library Gate', 'The LAUTECH Library Gate has been officially added as a Verified Safe Spot with 24/7 security and enhanced lighting for campus trades.', 'info', true, ARRAY['buyer', 'seller']),
('Marketplace Security Protocol v2.4 Live', 'We have updated our fraud detection algorithms to better protect users against overpayment scams and fake payment alerts.', 'warning', true, ARRAY['buyer', 'seller']),
('Solar & Clean Energy Category Launched', 'New dedicated category for solar products and installation services. Find inverters, panels, batteries and certified installers.', 'success', true, ARRAY['buyer', 'seller'])
ON CONFLICT DO NOTHING;

-- 11. Create Admin User (password will be set via Supabase Auth)
-- Note: Create the auth user first in Supabase Dashboard > Authentication > Users
-- Then run this to create the profile:
-- INSERT INTO public.users (id, email, full_name, phone_number, role, verified, verification_type, location, status) VALUES
-- ('your-admin-uuid-here', 'admin@sealify.ng', 'Sealify Official', '+234 813 120 8468', 'admin', true, 'premium', 'Ogbomoso, Oyo State', 'active')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', verified = true, verification_type = 'premium';

-- 12. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON public.listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON public.listings(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(location);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_promotion_payments_status ON public.promotion_payments(status);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intrusion_logs_timestamp ON public.intrusion_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON public.escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id ON public.search_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_user_id ON public.buyer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_safe_spots_zone ON public.safe_spots(zone);
CREATE INDEX IF NOT EXISTS idx_safe_spots_is_active ON public.safe_spots(is_active) WHERE is_active = true;

-- 13. Enable Realtime for Key Tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verification_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promotion_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.disputes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.buyer_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.escrow_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.safe_spots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;

-- 14. Grant Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;