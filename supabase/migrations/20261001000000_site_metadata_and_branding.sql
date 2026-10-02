-- ============================================================================
-- Site metadata, branding and link-preview administration
--
-- Extends public.site_settings so administrators can manage, at runtime and
-- without a redeploy:
--   * favicon / logo / share image assets
--   * site name and on-page headings
--   * per-route page titles and meta descriptions
--   * Open Graph and Twitter card fields
--
-- Also enforces a single "active" settings row so admin writes are
-- deterministic, and provisions the public `site-assets` storage bucket used
-- for favicon/logo/OG uploads from the admin panel.
--
-- Idempotent: safe to re-run.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. New columns
-- ---------------------------------------------------------------------------

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS favicon_url text,
  ADD COLUMN IF NOT EXISTS apple_touch_icon_url text,
  ADD COLUMN IF NOT EXISTS og_title text,
  ADD COLUMN IF NOT EXISTS og_description text,
  ADD COLUMN IF NOT EXISTS og_type text NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS og_image_alt text,
  ADD COLUMN IF NOT EXISTS og_locale text NOT NULL DEFAULT 'en_NG',
  ADD COLUMN IF NOT EXISTS og_site_url text,
  ADD COLUMN IF NOT EXISTS twitter_card text NOT NULL DEFAULT 'summary_large_image',
  ADD COLUMN IF NOT EXISTS twitter_site_handle text,
  ADD COLUMN IF NOT EXISTS twitter_creator_handle text,
  ADD COLUMN IF NOT EXISTS twitter_title text,
  ADD COLUMN IF NOT EXISTS twitter_description text,
  ADD COLUMN IF NOT EXISTS twitter_image text,
  ADD COLUMN IF NOT EXISTS heading_home_title text,
  ADD COLUMN IF NOT EXISTS heading_home_subtitle text,
  ADD COLUMN IF NOT EXISTS heading_home_cta text,
  ADD COLUMN IF NOT EXISTS heading_home_cta_url text,
  ADD COLUMN IF NOT EXISTS heading_home_badge text,
  ADD COLUMN IF NOT EXISTS page_title_home text,
  ADD COLUMN IF NOT EXISTS meta_description_home text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS theme_color text NOT NULL DEFAULT '#10b981',
  ADD COLUMN IF NOT EXISTS manifest_name text,
  ADD COLUMN IF NOT EXISTS manifest_short_name text,
  ADD COLUMN IF NOT EXISTS robots_indexing boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS page_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Older installs may predate the updated_at trigger on this table.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.site_settings;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Enforce exactly one active settings row
--
-- Existing deployments allowed multiple rows and selected "most recently
-- updated". Normalise to a single active row, then add a partial unique index
-- so admin upserts can rely on a real conflict target.
-- ---------------------------------------------------------------------------

WITH ranked AS (
  SELECT id,
         row_number() OVER (ORDER BY updated_at DESC, id DESC) AS rn
  FROM public.site_settings
)
UPDATE public.site_settings AS s
SET is_active = false
FROM ranked AS r
WHERE s.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS site_settings_single_active
  ON public.site_settings (is_active)
  WHERE is_active;

-- ---------------------------------------------------------------------------
-- 3. Seed the row when the table is empty
-- ---------------------------------------------------------------------------

INSERT INTO public.site_settings (
  logo_url,
  site_name,
  site_description,
  og_image,
  contact_email,
  contact_phone,
  favicon_url,
  apple_touch_icon_url,
  og_title,
  og_description,
  twitter_title,
  twitter_description,
  heading_home_title,
  heading_home_subtitle,
  heading_home_cta,
  page_title_home,
  meta_description_home,
  theme_color,
  manifest_name,
  manifest_short_name,
  page_metadata,
  is_active
)
SELECT
  '/logo.png',
  'Sealify Nigeria',
  'Nigeria''s Trusted Local Marketplace for Ogbomosoland & Oyo State.',
  '/og-image.png',
  'support@sealify.ng',
  '+234 813 120 8468',
  '/favicon.ico',
  '/logo.png',
  'Sealify — Nigeria''s Trusted Local Marketplace',
  'Everything you need in one place. Cars, real estate, electronics, fashion and more. Buy • Sell • Connect.',
  'Sealify — Nigeria''s Trusted Local Marketplace',
  'Buy, sell, and connect safely with verified buyers and sellers in Ogbomosoland and across Nigeria.',
  'Buy and sell anything, safely.',
  'Nigeria''s trusted local marketplace for Ogbomosoland, Oyo State and beyond. Verified sellers, safe meetup zones, instant trading.',
  'Start trading',
  'Sealify — Nigeria''s Trusted Local Marketplace',
  'Buy, sell, and connect locally in Ogbomosoland, Oyo State, and across Nigeria. Verified sellers, safe meetup zones, and instant trading.',
  '#10b981',
  'Sealify Nigeria',
  'Sealify',
  '{}'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- ---------------------------------------------------------------------------
-- 4. Validation constraints for the managed fields
-- ---------------------------------------------------------------------------

ALTER TABLE public.site_settings
  DROP CONSTRAINT IF EXISTS site_settings_og_type_check,
  DROP CONSTRAINT IF EXISTS site_settings_twitter_card_check,
  DROP CONSTRAINT IF EXISTS site_settings_theme_color_check,
  DROP CONSTRAINT IF EXISTS site_settings_og_image_alt_length_check,
  DROP CONSTRAINT IF EXISTS site_settings_page_metadata_is_object_check;

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_og_type_check
    CHECK (og_type IS NULL OR og_type IN ('website', 'article', 'profile', 'product')),
  ADD CONSTRAINT site_settings_twitter_card_check
    CHECK (twitter_card IS NULL OR twitter_card IN ('summary', 'summary_large_image', 'app', 'player')),
  ADD CONSTRAINT site_settings_theme_color_check
    CHECK (theme_color IS NULL OR theme_color ~ '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT site_settings_og_image_alt_length_check
    CHECK (og_image_alt IS NULL OR length(og_image_alt) <= 420),
  ADD CONSTRAINT site_settings_page_metadata_is_object_check
    CHECK (jsonb_typeof(page_metadata) = 'object');

-- ---------------------------------------------------------------------------
-- 5. Storage bucket for favicon / logo / share images
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  3145728,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can read site assets" ON storage.objects;
CREATE POLICY "Public can read site assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admins can upload site assets" ON storage.objects;
CREATE POLICY "Admins can upload site assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update site assets" ON storage.objects;
CREATE POLICY "Admins can update site assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete site assets" ON storage.objects;
CREATE POLICY "Admins can delete site assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin());

COMMIT;
