# Sealify staging schema setup

The clean staging initializer is:

1. `supabase/migrations/20260820000000_canonical_sealify_schema.sql`
2. `supabase/migrations/20240818000000_rls_reconciliation.sql`
3. Staging-only seed data
4. Storage and Auth configuration

The older migration chain and `supabase/schema.sql` are historical references,
not the initializer for the current application. They contain the obsolete
`users`, `listings`, `listing_images`, `escrow_transactions`, and `phone_otps`
models. Those files remain preserved and must not be run as the current clean
staging path.

## Storage

Create these buckets in the separate staging project only:

- `profile-media` for avatars and profile media;
- `ad-images` for listing photos;
- `documents` for verification/KYC uploads.

The application uses `avatars/` and `listings/` upload folders. Bucket policies
must be reviewed separately before staging setup.

## Auth and seed strategy

Enable email/password Auth. Create buyer, seller, and administrator test users
only in staging. Never commit passwords or production credentials.

Required non-production seed data consists of categories, subcategories, one
admin-role placeholder profile, site settings, active promotion plans, safe
spots, system configuration, and basic announcements. Demo listings, images,
buyer requests, reviews, and notifications are optional.

No production data or production credentials belong in staging.
