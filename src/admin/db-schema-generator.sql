-- PostgreSQL Schema for Sealify

-- Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  business_name TEXT,
  business_address TEXT,
  verification_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads Table
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  specifications JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Subcategories Table
CREATE TABLE subcategories (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('product', 'service'))
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  listing_id UUID REFERENCES ads(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escrow Table
CREATE TABLE escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES ads(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyer Requests Table
CREATE TABLE buyer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  listing_id UUID REFERENCES ads(id),
  content TEXT NOT NULL,
  responses_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets Table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  balance NUMERIC(10,2) DEFAULT 0,
  pending_balance NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id),
  type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage Setup (Supabase)
-- CREATE STORAGE BUCKET profile-media
-- ALTER STORAGE BUCKET profile-media SET PUBLIC = TRUE;
-- CREATE STORAGE BUCKET ad-images
-- ALTER STORAGE BUCKET ad-images SET PUBLIC = TRUE;

-- RLS Policies
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "profiles_policy" ON profiles FOR ALL TO public WHERE id = authz_uid();
-- ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "ads_policy" ON ads FOR ALL TO public WHERE seller_id = authz_uid();

-- Indexes
CREATE INDEX idx_ads_seller ON ads (seller_id);
CREATE INDEX idx_profiles_email ON profiles (email);