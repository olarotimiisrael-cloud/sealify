# Sealify RLS Security Test Plan

This plan is for a staging Supabase project only. It contains no credentials
and is not executed by the application build.

## Table classification

| Class | Tables |
|---|---|
| Public/read-only | `ads` (active rows), `categories`, `subcategories`, `announcements` (active), `site_settings`, `promotion_plans` (active), `safe_spots` (active), `recent_deals`, approved `reviews`, open `buyer_requests` |
| Authenticated/user-owned | `profiles`, `favorites`, `search_alerts`, `user_settings`, `push_subscriptions`, `verification_requests`, `password_requests`, `promotion_payments`, `disputes`, `buyer_requests`, `buyer_request_responses` |
| Private participant data | `conversations`, `messages`, `notifications` |
| Admin-only | `system_configs` writes, `audit_logs`, `intrusion_logs`, moderation/review/status writes, admin reads across protected tables |
| System/server-only | `phone_otps`; notification/audit/intrusion inserts performed by trusted server paths |
| Financial / removal candidate | `wallets`, `transactions`, `escrow_orders`, `promotion_payments` |

`profiles` is intentionally not anonymous-readable because the active table
contains private fields such as contact and financial profile data. A safe
public-profile view should be designed separately before anonymous seller
profiles are exposed. Users can only read their own full profile.

Production uses `ad_images(ad_id, image_url, storage_path, sort_order,
is_primary, created_at)` with `ad_images.ad_id` referencing `ads.id`. The active
application already uses this table. `listing_images` is legacy schema/viewer
material and is not part of the active production model.

Production uses `escrow_orders` with `ad_id`, `buyer_id`, and `seller_id`
references. `escrow_transactions` is a legacy repository name and must not be
used by the active migration.

The application currently reads `system_configs` directly in a few client-side
paths. The canonical policy makes that table admin-only because production
contains an unsafe public-read policy. Any public feature flags must move to a
purpose-built safe public settings view/table; this phase does not expose raw
system configuration values.

## Unsafe policy inventory

The following policies from the initial schema and performance-fix migration were
identified as unsafe. The canonical `20240818000000_rls_reconciliation.sql`
migration drops all existing policies on the active tables before installing the
final policy set. The older migrations remain in history and are not edited.

Unsafe patterns removed:

`USING (true)` or `WITH CHECK (true)` behavior:

- `Public read profiles` / `Profiles read access`
- `System can insert notifications`
- `Anyone can report`
- The broad `FOR ALL` policies in `supabase/schema.sql` and the embedded
  `SqlSchemaViewer` SQL for users, listings, messages, notifications, wallets,
  transactions, escrow, reports, audit logs, and other tables.
- Overly permissive `FOR ALL` policies from the performance-fix migration that
  allowed users to tamper with financial records or system-controlled fields.

The legacy `users`/`listings` SQL model was not changed because its columns and
ownership relationships conflict with the active `profiles`/`ads` model. This
plan targets the active model only.

## Canonical policy matrix

This is a static policy review of the canonical migration. It is not evidence
that the migration has been applied or tested in staging.

| Table | RLS | Anonymous SELECT | Authenticated SELECT | User writes | Admin access | Sensitive |
|---|---|---|---|---|---|---|
| `profiles` | Yes | Denied | Own row | Own profile; role cannot change | Full | Yes |
| `ads` | Yes | Active rows | Active/own rows | Owner CRUD | Full | No |
| `categories`, `subcategories` | Yes | Active rows | Active rows | None | Full | No |
| `announcements`, `safe_spots`, `recent_deals` | Yes | Public active/read rows | Public active/read rows | None | Full | No |
| `reviews` | Yes | Approved rows | Approved rows | Buyer insert only | Full | No |
| `buyer_requests` | Yes | Open/own rows | Open/own rows | Owner CRUD | Full | No |
| `buyer_request_responses` | Yes | Denied | Seller/request owner rows | Seller insert | Full | Moderate |
| `favorites`, `search_alerts`, `user_settings`, `push_subscriptions` | Yes | Denied | Own rows | Own rows only | Full | Yes |
| `verification_requests`, `password_requests` | Yes | Denied | Own rows | Own insert only | Full | Yes |
| `conversations` | Yes | Denied | Participants only | Participant create/update; no ordinary delete | Full | Yes |
| `messages` | Yes | Denied | Participants only | Sender insert; no ordinary update/delete | Full | Yes |
| `notifications` | Yes | Denied | Recipient only | Recipient read-state update | Full | Yes |
| `reports`, `disputes` | Yes | Denied | Own rows | Own insert only | Full | Moderate |
| `promotion_payments` | Yes | Denied | Own rows | Own insert only | Full | Financial |
| `wallets`, `transactions` | Yes | Denied | Own financial rows | None | Full | Financial |
| `ad_images` | Yes | Active-ad images | Active-ad/own-ad images | Seller manages images for own ads | Full | No |
| `escrow_orders` | Yes | Denied | Buyer/seller rows | Buyer insert; no ordinary status changes | Full | Financial |
| `audit_logs`, `intrusion_logs` | Yes | Denied | Admin only | None | Admin read/write | Security |
| `system_configs` | Yes | Denied | Admin only | None | Full | Sensitive |
| `phone_otps` | Yes | Denied | Denied | None | Service-role only | Yes |
| `analytics_events`, `performance_metrics` | Yes | Denied | Denied | None | Admin read | Moderate |

## Expected tests

Run each test with anonymous, User A, User B, and an admin Supabase session in
staging. Use non-production records.

| Category | Test Case | Expected Result |
|---|---|---|
| **Anonymous Access** | Read active `ads`, `categories`, `announcements` | **Allowed** |
| | Read `profiles` table directly | **Denied** / Empty Result |
| | Read `notifications`, `messages`, `wallets`, `transactions`, `escrow_orders` | **Denied** / Empty Result |
| | Read active `ad_images` for public ads | **Allowed** |
| | Read `audit_logs`, `intrusion_logs`, `phone_otps` | **Denied** / Empty Result |
| | Insert into `reports` | **Denied** (Requires authentication) |
| **User A (Authenticated)** | Read User B's full profile from `profiles` table | **Denied** / Empty Result |
| | Read User A's own full profile | **Allowed** |
| | Read User B's `conversations` or `messages` | **Denied** / Empty Result |
| | Read User B's `notifications` | **Denied** / Empty Result |
| | Read User B's `wallets`, `transactions`, or `escrow_orders` | **Denied** / Empty Result |
| | Insert a message into a conversation where User A is not a participant | **Denied** |
| | Insert a message with `sender_id` as User B | **Denied** |
| | Insert a notification for User B | **Denied** |
| **Privilege Escalation** | User A updates their own profile `role` to 'admin' | **Denied** (RLS `WITH CHECK` fails) |
| | User A updates another user's profile | **Denied** |
| **Financial Tampering** | User A inserts a new row into `wallets` or `transactions` | **Denied** |
| | User A updates their own `wallets.balance` or `escrow_orders.status` | **Denied** |
| | User A deletes a row from `transactions` | **Denied** |
| **System/Admin Data** | User A reads `audit_logs` or `intrusion_logs` | **Denied** |
| | User A inserts into `audit_logs` | **Denied** |
| | User A reads `phone_otps` | **Denied** |
| **Admin User** | Read any user's profile, ad, report, or transaction | **Allowed** |
| | Update a user's `role` to 'admin' or 'seller' | **Allowed** |
| | Update the status of a `report` or `dispute` | **Allowed** |

Also verify that server-side service-role operations are the only path used for
system inserts and that RLS remains enabled on every listed table.

## Validation status

The policy matrix above is static review only. No migration has been applied and
no live staging RLS tests have been performed.
