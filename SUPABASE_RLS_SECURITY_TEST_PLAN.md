# Sealify RLS security test plan

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
| Financial / removal candidate | `wallets`, `transactions`, `escrow_transactions`, `promotion_payments` |

`profiles` is intentionally not anonymous-readable because the active table
contains private fields such as contact and financial profile data. A safe
public-profile view should be designed separately before anonymous seller
profiles are exposed.

The application references `ad_images`, but the repository migrations only
reference `listing_images` and do not define either table completely. Its
ownership columns and deployed name require manual schema verification before
adding an image-table policy.

## Unsafe policy inventory

The following active-schema policies were unsafe because they used unrestricted
`USING (true)` or `WITH CHECK (true)` behavior:

- `Public read profiles` / `Profiles read access`
- `System can insert notifications`
- `Anyone can report`
- The broad `FOR ALL` policies in `supabase/schema.sql` and the embedded
  `SqlSchemaViewer` SQL for users, listings, messages, notifications, wallets,
  transactions, escrow, reports, audit logs, and other tables

The legacy `users`/`listings` SQL model was not changed because its columns and
ownership relationships conflict with the active `profiles`/`ads` model.

## Expected tests

Run each test with anonymous, User A, User B, and an admin Supabase session in
staging. Use non-production records.

| Test | Expected result |
|---|---|
| Anonymous reads active ads/categories/announcements | Allowed |
| Anonymous reads profiles, notifications, messages, wallets | Denied or empty result |
| User A reads User B's profile-private records | Denied or empty result |
| User A reads User B's conversation/messages | Denied or empty result |
| User A reads User B's notifications | Denied or empty result |
| User A changes their profile role to `admin` | Denied |
| User A reads or writes system/admin data | Denied |
| Admin reads legitimate admin data | Allowed |
| Non-admin inserts audit/intrusion records | Denied |
| User A reads User B's wallet/transactions/escrow | Denied or empty result |
| User A writes wallet/transaction/escrow status | Denied |

Also verify that server-side service-role operations are the only path used for
system inserts and that RLS remains enabled on every listed table.
