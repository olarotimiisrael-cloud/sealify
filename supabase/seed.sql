-- Sealify Nigeria - Production Seed Data
-- Run this AFTER the initial schema migration

-- ============================================================================
-- 1. DEFAULT ADMIN USER (Create via Supabase Auth first, then run this)
-- Email: admin@sealify.ng
-- Password: [SET_STRONG_PASSWORD_IN_DASHBOARD]

-- After creating auth user, update profile:
UPDATE public.profiles SET
  full_name = 'Sealify Admin',
  role = 'admin',
  verified = true,
  verification_type = 'premium',
  business_name = 'Sealify National Hub',
  location = 'Ogbomoso, Oyo State',
  phone_number = '+234 813 120 8468',
  email_notifications = true,
  whatsapp_notifications = true
WHERE email = 'admin@sealify.ng';

-- ============================================================================
-- 2. SYSTEM CONFIGS
-- ============================================================================
INSERT INTO public.system_configs (key, value, description) VALUES
('maintenance_mode', FALSE, 'Enable maintenance mode to lock public marketplace'),
('auto_approve_ads', TRUE, 'Automatically approve new classified ads without admin review'),
('require_id_for_posting', FALSE, 'Require ID verification before allowing ad posting'),
('ai_spam_filter', TRUE, 'Enable AI-powered spam and fraud detection'),
('max_images_per_ad', 10, 'Maximum images per classified ad'),
('max_file_size_mb', 20, 'Maximum file upload size in MB'),
('platform_fee_percent', 0, 'Platform commission percentage on sales'),
('min_payout_amount', 1000, 'Minimum withdrawal amount in NGN'),
('payout_processing_hours', 4, 'Standard payout processing time in hours')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- ============================================================================
-- 3. SITE SETTINGS
-- ============================================================================
INSERT INTO public.site_settings (
  site_name, site_description, og_image, contact_email, contact_phone
) VALUES (
  'Sealify Nigeria',
  'Nigeria''s Trusted Local Marketplace for Ogbomosoland & Oyo State.',
  '/og-image.png',
  'support@sealify.ng',
  '+234 813 120 8468'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. PROMOTION PLANS
-- ============================================================================
INSERT INTO public.promotion_plans (months, label, rate, badge, is_active) VALUES
(1, '1 Month', 15000, 'STARTER', TRUE),
(3, '3 Months', 39000, 'POPULAR', TRUE),
(6, '6 Months', 66000, 'BEST VALUE', TRUE),
(12, '12 Months', 108000, 'ENTERPRISE', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. SAFE MEETUP SPOTS (Ogbomoso verified locations)
-- ============================================================================
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
-- 6. CATEGORIES (Complete list)
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
-- 7. SOLAR SUBCATEGORIES
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
-- 8. DEFAULT RECENT DEALS (for live ticker)
-- ============================================================================
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

-- ============================================================================
-- 9. ANNOUNCEMENTS
-- ============================================================================
INSERT INTO public.announcements (title, message, type, active, target_roles) VALUES
('Welcome to Sealify Nigeria!', 'Discover verified local classifieds in Ogbomoso. Buy, sell, and connect safely with our trusted community.', 'success', TRUE, ARRAY['buyer', 'seller']),
('New Safe Meetup Spots Added', 'We have added 10 new CCTV-verified safe exchange locations across Ogbomoso including Police HQs, LAUTECH Gate, and Shopping Malls.', 'info', TRUE, ARRAY['buyer', 'seller']),
('AI Price Guard Now Live', 'Our smart pricing engine now shows fair market values for electronics, vehicles, and real estate in Ogbomosoland.', 'info', TRUE, ARRAY['buyer', 'seller']),
('Solar & Clean Energy Category Launched', 'New dedicated category for solar products and installation services. Verified technicians only.', 'success', TRUE, ARRAY['buyer', 'seller']),
('Important: Never Pay Before Inspection', 'Reminder: Always meet sellers at verified safe spots. Never send commitment fees or advance payments.', 'warning', TRUE, ARRAY['buyer', 'seller'])
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. AUDIT LOG ENTRY
-- ============================================================================
INSERT INTO public.audit_logs (action, details, type, user_id) VALUES
('Production Seed Completed', 'Initial production seed data applied successfully', 'security', (SELECT id FROM public.profiles WHERE email = 'admin@sealify.ng' LIMIT 1))
ON CONFLICT DO NOTHING;