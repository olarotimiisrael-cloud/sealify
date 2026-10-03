-- ============================================================================
-- Post-migration verification for
--   supabase/migrations/20261001000000_site_metadata_and_branding.sql
--
-- Paste into the Supabase SQL Editor and run. Every row should report OK.
-- Re-running the migration file itself is safe (it is fully idempotent), so any
-- MISSING row can be fixed simply by running the migration again.
-- ============================================================================

-- 1. All 28 new columns present ---------------------------------------------
SELECT 'columns' AS check_name,
       count(*) AS found,
       28 AS expected,
       CASE WHEN count(*) = 28 THEN 'OK' ELSE 'MISSING' END AS result
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'site_settings'
  AND column_name IN (
    'favicon_url','apple_touch_icon_url','og_title','og_description','og_type',
    'og_image_alt','og_locale','og_site_url','twitter_card','twitter_site_handle',
    'twitter_creator_handle','twitter_title','twitter_description','twitter_image',
    'heading_home_title','heading_home_subtitle','heading_home_cta','heading_home_cta_url',
    'heading_home_badge','page_title_home','meta_description_home','canonical_url',
    'theme_color','manifest_name','manifest_short_name','robots_indexing',
    'page_metadata','is_active'
  )
UNION ALL

-- 2. Singleton index (required by the admin upsert's ON CONFLICT target) ------
SELECT 'singleton_index', count(*), 1,
       CASE WHEN count(*) = 1 THEN 'OK' ELSE 'MISSING' END
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'site_settings'
  AND indexname = 'site_settings_single_active'
UNION ALL

-- 3. Exactly one active settings row ----------------------------------------
SELECT 'single_active_row', count(*), 1,
       CASE WHEN count(*) = 1 THEN 'OK' ELSE 'INVALID' END
FROM public.site_settings
WHERE is_active
UNION ALL

-- 4. updated_at trigger ------------------------------------------------------
SELECT 'updated_at_trigger', count(*), 1,
       CASE WHEN count(*) = 1 THEN 'OK' ELSE 'MISSING' END
FROM pg_trigger
WHERE tgrelid = 'public.site_settings'::regclass
  AND tgname = 'set_updated_at'
  AND NOT tgisinternal
UNION ALL

-- 5. Validation CHECK constraints -------------------------------------------
SELECT 'check_constraints', count(*), 5,
       CASE WHEN count(*) = 5 THEN 'OK' ELSE 'PARTIAL' END
FROM pg_constraint
WHERE conrelid = 'public.site_settings'::regclass
  AND conname IN (
    'site_settings_og_type_check',
    'site_settings_twitter_card_check',
    'site_settings_theme_color_check',
    'site_settings_og_image_alt_length_check',
    'site_settings_page_metadata_is_object_check'
  )
UNION ALL

-- 6. Storage bucket for favicon / logo / share images ------------------------
SELECT 'site_assets_bucket', count(*), 1,
       CASE WHEN count(*) = 1 THEN 'OK' ELSE 'MISSING' END
FROM storage.buckets
WHERE id = 'site-assets' AND public = true
UNION ALL

-- 7. Storage RLS policies (public read, admin-only write) --------------------
SELECT 'site_assets_policies', count(*), 4,
       CASE WHEN count(*) = 4 THEN 'OK' ELSE 'PARTIAL' END
FROM pg_policies
WHERE schemaname = 'storage'
  AND policyname IN (
    'Public can read site assets',
    'Admins can upload site assets',
    'Admins can update site assets',
    'Admins can delete site assets'
  );

-- 8. Live row contents (expect the original row, active, page_metadata '{}') --
SELECT id, site_name, logo_url, favicon_url, is_active, page_metadata, updated_at
FROM public.site_settings
ORDER BY updated_at DESC;