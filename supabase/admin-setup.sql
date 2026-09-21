-- =====================================================================
-- SEALIFY ADMIN USER SETUP SCRIPT
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- After running, use the email from line 5 below in Admin Login
-- =====================================================================

-- =====================================================================
-- CONFIGURATION: Set your desired admin credentials here
-- =====================================================================
\set admin_email 'admin@sealify.ng'
\set admin_password 'SealifyAdmin@2024!'
\set admin_full_name 'Sealify Admin'
\set admin_phone '+2348131208468'

-- =====================================================================
-- 1. UPSERT the admin profile into the profiles table
--    (If the auth user doesn't exist yet, this creates the profile row
--     which will be linked via a database trigger after auth sign-up)
-- =====================================================================

-- First, create the auth user through Supabase's built-in function
-- (This requires the service_role key, OR you can do it via the dashboard)
-- If you're running this with anon key, you may need to create the auth user
-- manually via Authentication > Users in the Supabase Dashboard first,
-- THEN run this script.

-- Upsert admin profile directly (for when user already exists in auth)
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone_number,
  role,
  status,
  location,
  verified,
  verification_type,
  avatar_url,
  store_banner_url,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  :admin_email::text,
  :admin_full_name::text,
  :admin_phone::text,
  'admin'::text,
  'active'::text,
  'Ogbomoso, Oyo State'::text,
  true,
  'premium',
  'https://sealify.ng/logo.png',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone_number = EXCLUDED.phone_number,
  role = 'admin',
  status = 'active',
  verified = true,
  verification_type = 'premium',
  updated_at = NOW();

-- =====================================================================
-- 2. Create auth user for the admin (requires service_role key)
--    Run this from the SQL editor using the service_role key
--    OR create the user manually via the Supabase Dashboard:
--    Authentication > Users > Add User
-- =====================================================================

-- IMPORTANT: You must run this with the service_role key (in the SQL editor
-- using your supabase functions key or via service_role).
-- If you can't use this, skip to step 3.

BEGIN;

-- Check if auth user exists, create if not
DO $$
DECLARE
  v_user_id UUID;
  v_existing_email TEXT;
BEGIN
  -- Check if user exists in auth
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = :admin_email::text
  LIMIT 1;

  IF v_user_id IS NULL THEN
    -- Create the auth user using the internal function
    -- You may need to set this password via the Supabase Dashboard instead
    INSERT INTO auth.users (
      instance_id,
      id,
      email,
      encrypted_password,
      created_at,
      updated_at,
      role,
      email_confirmed_at
    ) VALUES (
      1, -- instance_id (usually 1 for single tenant)
      gen_random_uuid(),
      :admin_email::text,
      crypt(:admin_password::text, gen_salt('bf')),
      NOW(),
      NOW(),
      'authenticated',
      NOW()
    );
  END IF;
END $$;

COMMIT;

-- =====================================================================
-- 3. Link auth user to the existing profile (if needed)
-- =====================================================================

-- This ensures the profile's id matches the auth user's id
-- The profile email should match the auth email

UPDATE profiles
SET id = auth.users.id,
    updated_at = NOW()
FROM auth.users
WHERE auth.users.email = :admin_email::text
  AND profiles.email = :admin_email::text
  AND profiles.id != auth.users.id;

-- =====================================================================
-- 4. Ensure the is_admin() function recognizes this user
-- =====================================================================

-- Check if the helper function exists
-- The admin login endpoint calls public.is_admin(${user.id})
-- which should check the profiles table for role = 'admin'

-- Verify the admin user is recognized
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.verified,
  p.status,
  CASE
    WHEN p.role = 'admin' THEN true
    ELSE false
  END AS is_admin_flag
FROM profiles p
WHERE p.email = :admin_email::text;

-- =====================================================================
-- 5. Create user_settings for the admin (required by the app)
-- =====================================================================

INSERT INTO user_settings (
  user_id,
  email_notifications,
  whatsapp_notifications,
  push_notifications,
  price_drop_alerts,
  new_message_alerts,
  weekly_digest,
  promotion_expiry_reminders,
  language,
  theme,
  created_at,
  updated_at
)
SELECT
  p.id,
  true, true, true, true, true, true, true,
  'en', 'dark', NOW(), NOW()
FROM profiles p
WHERE p.email = :admin_email::text
  AND p.role = 'admin'
ON CONFLICT (user_id) DO UPDATE SET
  language = 'en',
  theme = 'dark';

-- =====================================================================
-- 6. Test the admin authentication setup
-- =====================================================================

-- Verify the admin user exists and has correct role
SELECT
  'Admin User Verification' AS check_name,
  email,
  full_name,
  role,
  verified,
  status
FROM profiles
WHERE email = :admin_email::text
  AND role = 'admin'
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================================
-- INSTRUCTIONS:
-- 1. Save the values from CONFIGURATION section above
-- 2. After running this script, go to Supabase Dashboard > Authentication > Users
-- 3. If the admin auth user was not created automatically (service_role issue),
--    create it manually via the UI:
--    - Email: 'admin@sealify.ng'
--    - Password: 'SealifyAdmin@2024!'
--    - Check "Autorespond to email" (optional)
-- 4. Go to your Sealify admin login page
--    URL: https://your-domain.pages.dev/admin/login
--    Email: admin@sealify.ng
--    Password: SealifyAdmin@2024!
-- 5. You should now be logged in as admin
-- =====================================================================
