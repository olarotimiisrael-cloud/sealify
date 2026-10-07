-- Sealify Viral Marketing & Social Integration Migration
-- Adds shareable ad cards, QR codes, and social sharing tracking

-- ===========================================================
-- 1. shareable_links table -----------------------------------
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.shareable_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('profile', 'ad', 'store', 'category', 'search')),
  content_id text NOT NULL, -- UUID or ID of shared content
  platform text NOT NULL CHECK (platform IN ('whatsapp', 'telegram', 'facebook', 'twitter', 'instagram', 'sms', 'email', 'direct_link')),
  url text NOT NULL,
  utm_source text NOT NULL DEFAULT 'sealify',
  utm_medium text NOT NULL DEFAULT 'social',
  utm_campaign text DEFAULT 'organic_share',
  utm_content text, -- identifies specific ad or profile
  referrer_code text, -- tracks referral code if shared via referral link
  clicks integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  last_used_at timestamptz
);

CREATE INDEX idx_shareable_links_user ON public.shareable_links(user_id);
CREATE INDEX idx_shareable_links_content ON public.shareable_links(content_type, content_id);
CREATE INDEX idx_shareable_links_platform ON public.shareable_links(platform);
CREATE INDEX idx_shareable_links_created ON public.shareable_links(created_at);

-- ===========================================================
-- 2. ad_card_assets table ------------------------------------
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.ad_card_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ad_id uuid REFERENCES public.ads(id) ON DELETE CASCADE,
  asset_type text NOT NULL CHECK (asset_type IN ('whatsapp_status', 'instagram_post', 'facebook_ad', 'twitter_card', 'email_banner', 'flyer')),
  aspect_ratio text NOT NULL, -- e.g., '9:16', '1:1', '16:9'
  width integer NOT NULL,
  height integer NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  file_size_bytes integer,
  file_type text NOT NULL CHECK (file_type IN ('png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4')),
  title_overlay text,
  description_overlay text,
  price_overlay text,
  background_color text DEFAULT '#ffffff',
  font_family text DEFAULT 'sans-serif',
  is_template boolean NOT NULL DEFAULT false,
  template_name text,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ad_card_assets_user ON public.ad_card_assets(user_id);
CREATE INDEX idx_ad_card_assets_ad ON public.ad_card_assets(ad_id);
CREATE INDEX idx_ad_card_assets_type ON public.ad_card_assets(asset_type);

-- ===========================================================
-- 3. qr_codes table ------------------------------------------
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ad_id uuid REFERENCES public.ads(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('ad', 'profile', 'store', 'referral_link', 'website')),
  content_id text NOT NULL,
  qr_data text NOT NULL, -- the encoded data (URL, vCard, etc.)
  image_url text NOT NULL,
  size_pixels integer NOT NULL DEFAULT 300,
  error_correction_level text DEFAULT 'M' CHECK (error_correction_level IN ('L', 'M', 'Q', 'H')),
  format text DEFAULT 'png' CHECK (format IN ('png', 'svg', 'pdf')),
  is_dynamic boolean NOT NULL DEFAULT false,
  scan_count integer NOT NULL DEFAULT 0,
  last_scanned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE INDEX idx_qr_codes_user ON public.qr_codes(user_id);
CREATE INDEX idx_qr_codes_ad ON public.qr_codes(ad_id);

-- ===========================================================
-- 4. status_templates table ----------------------------------
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.status_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  aspect_ratio text NOT NULL DEFAULT '9:16',
  width integer NOT NULL DEFAULT 1080,
  height integer NOT NULL DEFAULT 1920,
  template_data jsonb NOT NULL DEFAULT '{}', -- design specifications
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_templates_category ON public.status_templates(category);

-- ===========================================================
-- 5. social_share_events table -------------------------------
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.social_share_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  shareable_link_id uuid REFERENCES public.shareable_links(id) ON DELETE SET NULL,
  platform text NOT NULL,
  shared_by_user_agent text,
  shared_from_ip inet,
  referrer text,
  shared_to text, -- recipient phone/group if known
  shared_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL DEFAULT 'share' -- share, click, conversion
);

CREATE INDEX idx_social_share_events_user ON public.social_share_events(user_id);
CREATE INDEX idx_social_share_events_platform ON public.social_share_events(platform);
CREATE INDEX idx_social_share_events_shared_at ON public.social_share_events(shared_at);

-- ===========================================================
-- 6. Database triggers & functions for updated_at ------------
-- ===========================================================
-- Reuse existing set_updated_at function

CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.shareable_links
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.ad_card_assets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.qr_codes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.status_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===========================================================
-- 7. RLS Policies --------------------------------------------
-- ===========================================================

-- Shareable links: users can view/share their own, public links visible
CREATE POLICY shareable_links_user_own ON public.shareable_links
  FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY shareable_links_public ON public.shareable_links
  FOR SELECT TO anon, authenticated USING (true);

-- Ad card assets: users can manage their own
CREATE POLICY ad_card_assets_user_own ON public.ad_card_assets
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- QR codes: users can manage their own
CREATE POLICY qr_codes_user_own ON public.qr_codes
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Status templates: public can view active ones
CREATE POLICY status_templates_public ON public.status_templates
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- Social share events: users can view their own, admins can view all
CREATE POLICY social_share_events_user_own ON public.social_share_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Audit trigger for ad card assets
CREATE TRIGGER ad_card_audit BEFORE INSERT OR UPDATE ON public.ad_card_assets
AFTER INSERT OR UPDATE
FOR EACH ROW EXECUTE FUNCTION public.audit_log();

COMMENT ON TABLE public.shareable_links IS 'Trackable links for social sharing with UTM parameters';
COMMENT ON TABLE public.ad_card_assets IS 'Pre-generated ad assets for social sharing';
COMMENT ON TABLE public.qr_codes IS 'QR codes for ads, profiles, and stores';
COMMENT ON TABLE public.status_templates IS 'Pre-designed templates for WhatsApp Status and Stories';
COMMENT ON TABLE public.social_share_events IS 'Analytics tracking for social sharing events';
