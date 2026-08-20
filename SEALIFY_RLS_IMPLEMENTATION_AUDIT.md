# SEALIFY RLS IMPLEMENTATION AUDIT

**Audit mode:** read-only repository/schema audit. No migration was applied, no production or staging data was changed, and no application code was changed. This report is the only artifact created for this audit.

**Important limitation:** the repository does not contain a reliable single canonical representation of the deployed Supabase database. The initial migration is incomplete/truncated at the beginning, `supabase/schema.sql` describes a conflicting legacy model, and the existing RLS migration is not a live catalog dump. Phase 2F read-only production inspection has now confirmed that the active image table is `ad_images`, the active escrow table is `escrow_orders`, and RLS is enabled on the inspected sensitive tables. Policy definitions, grants, and function metadata remain production-catalog facts rather than repository facts.

**Phase 2F production alignment:** Production currently contains overlapping policies, including unsafe public SELECT policies on `ad_images`, `profiles`, and `system_configs`. The canonical reconciliation migration is repository-only and remains unapplied.

## A. Current schema inventory

### A.1 Repository schema sources

| Source | Status | Model indicated |
|---|---|---|
| `supabase/migrations/20240101000000_initial_schema.sql` | Incomplete at its beginning; defines/references the active model and many tables | `profiles`, `ads`, `categories`, `subcategories`, application security/financial tables |
| `supabase/migrations/20240127000001_rls_performance_fixes.sql` | Follow-up policy/index migration | Replaces selected policies on the active model |
| `supabase/migrations/20240816000000_rls_least_privilege.sql` | Unapplied proposal from Phase 2B | Proposed least-privilege policy model; not evidence of deployed state |
| `supabase/schema.sql` | Legacy/conflicting schema document | `users`, `listings`, `listing_images`, and related tables |
| `server/db/schema.sql` | Server telemetry schema | `analytics_events`, `performance_metrics` |
| `supabase/storage-policies.sql` | Storage policy script | `storage.objects` buckets |
| `src/components/SqlSchemaViewer.tsx`, `src/admin/pages/SqlSchemaViewer.tsx` | UI-embedded legacy SQL/documentation | Mostly the `users`/`listings`/`listing_images` model; not a migration |

The SQL embedded in UI schema viewers must not be treated as an authoritative migration source.

### A.2 Active-model tables found in migrations

The initial migration references or defines the following active-model tables. Exact deployed columns cannot be certified until the database catalog is queried.

| Table | Primary key / ownership evidence in repository | Sensitive or authorization-relevant fields | RLS in active migration sources |
|---|---|---|---|
| `profiles` | `id`, tied to `auth.users.id` | email/contact data, role, verification/status fields | Enabled |
| `ads` | `id`; `seller_id` owner | seller ownership, status, listing data | Enabled |
| `categories` | `id` | public taxonomy/configuration | Not enabled in initial policy block |
| `subcategories` | `id`; category relation indicated | public taxonomy/configuration | Not enabled |
| `announcements` | `id` | active/published/admin fields | Enabled |
| `site_settings` | `id`/key indicated by legacy model | site-wide configuration | Not enabled in initial policy block |
| `promotion_plans` | `id` | prices, limits, enabled state | Not enabled |
| `safe_spots` | `id` | location and moderation state | Enabled |
| `recent_deals` | `id` | transaction/listing summary | Not enabled |
| `reviews` | `id`; `buyer_id`, seller/ad relationship indicated | ratings, moderation/status | Enabled |
| `buyer_requests` | `id`; `user_id`/request owner | request status and response counters | Enabled |
| `buyer_request_responses` | `id`; request/user references | response ownership | Not enabled |
| `favorites` | `id`; `user_id` owner | user activity | Enabled |
| `search_alerts` | `id`; `user_id` owner | saved searches and notification settings | Enabled |
| `user_settings` | `id`/`user_id` indicated | private preferences | Not enabled |
| `push_subscriptions` | `id`; user reference | push endpoint/token material | Not enabled |
| `verification_requests` | `id`; `user_id` owner | identity/KYC status and documents | Enabled |
| `password_requests` | `id`; `user_id` owner | password/reset and identity-request fields | Enabled |
| `promotion_payments` | `id`; user/ad/plan references | payment amount/status/reference | Enabled |
| `disputes` | `id`; buyer/seller/transaction references | dispute evidence/status | Enabled |
| `conversations` | `id`; participant fields | cross-user communication membership | Enabled |
| `messages` | `id`; conversation/sender fields | message content and sender identity | Enabled |
| `notifications` | `id`; `user_id` recipient | private notifications | Enabled |
| `system_configs` | `id`/key | platform controls | Not enabled |
| `audit_logs` | `id`; actor/user fields | security/audit trail | Not enabled |
| `intrusion_logs` | `id` | attempted identity, device/IP/security data | Not enabled |
| `phone_otps` | `id`; phone/user reference | OTP material and verification state | Not enabled |
| `wallets` | `id`; unique `user_id` | balances and withdrawal totals | Enabled |
| `transactions` | `id`; `wallet_id` foreign key | amount, type, status, references | Enabled |
| `escrow_orders` | `id`; buyer/ad references | amount, escrow state, parties | Enabled |
| `reports` | `id`; reporter reference | abuse reports and moderation state | Enabled |
| `ad_images` | Production-confirmed; `ad_id` references `ads.id` | image URL, storage path, sort order, primary flag | Enabled in production |
| `listing_images` | Legacy repository-only model; not found in production inspection | legacy listing image fields | Not active |

Foreign keys are only reported where the repository explicitly showed them or the relationship is clear from policy/query code. The incomplete initial migration prevents a trustworthy complete PK/FK/column inventory. A pre-implementation catalog query is mandatory.

### A.3 Legacy schema tables

`supabase/schema.sql` defines a separate `users`/`listings` model with: `users`, `listings`, `listing_images`, `favorites`, `messages`, `conversations`, `notifications`, `verification_requests`, `password_requests`, `promotion_payments`, `disputes`, `reports`, `audit_logs`, `reviews`, `buyer_requests`, `search_alerts`, `announcements`, `system_configs`, `site_settings`, `promotion_plans`, `safe_spots`, `intrusion_logs`, and `recent_deals`.

Its `users` table includes highly sensitive fields such as email, phone, bank details, account details, and a password field. That model must not be exposed or used as a public fallback.

## B. Current RLS status

### B.1 Active migration status

`20240101000000_initial_schema.sql` enables RLS on:

`profiles`, `ads`, `conversations`, `messages`, `notifications`, `favorites`, `wallets`, `transactions`, `escrow_transactions`, `verification_requests`, `password_requests`, `promotion_payments`, `reports`, `disputes`, `reviews`, `buyer_requests`, `search_alerts`, `safe_spots`, and `announcements`.

It does not enable RLS in its visible policy block for `categories`, `subcategories`, `site_settings`, `promotion_plans`, `recent_deals`, `audit_logs`, `user_settings`, `buyer_request_responses`, `push_subscriptions`, `phone_otps`, `system_configs`, or the image tables. This is a repository finding, not proof of deployed state.

`server/db/schema.sql` enables RLS for `analytics_events` and `performance_metrics`.

The legacy `supabase/schema.sql` enables RLS on its legacy tables but then creates public `FOR ALL USING (true)` policies, which does not provide meaningful protection.

### B.2 Target-role interpretation

Most policies in the initial migration, performance migration, legacy schema, storage script, and embedded SQL omit `TO`. PostgreSQL therefore treats them as applying to `PUBLIC`, which includes anonymous and authenticated database roles. The policies do not become safe merely because the caller is authenticated.

## C. Complete policy inventory from repository sources

### C.1 Initial migration policies

| Table | Policy/action | USING | WITH CHECK | Target |
|---|---|---|---|---|
| `profiles` | Public read / SELECT | `true` | — | PUBLIC |
| `profiles` | Users update / UPDATE | `auth.uid() = id` | omitted | PUBLIC |
| `profiles` | Admins full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `ads` | Public active read / SELECT | `status = 'active'` | — | PUBLIC |
| `ads` | Owner insert / INSERT | — | `auth.uid() = seller_id` | PUBLIC |
| `ads` | Owner update / UPDATE | `auth.uid() = seller_id` | omitted | PUBLIC |
| `ads` | Owner delete / DELETE | `auth.uid() = seller_id` | — | PUBLIC |
| `ads` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `conversations` | Participant read / SELECT | participant membership | — | PUBLIC |
| `conversations` | Start conversation / INSERT | — | caller equals one participant | PUBLIC |
| `conversations` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `messages` | Participant read / SELECT | conversation membership | — | PUBLIC |
| `messages` | Participant send / INSERT | — | sender and membership checks | PUBLIC |
| `messages` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `notifications` | Own read / SELECT | `auth.uid() = user_id` | — | PUBLIC |
| `notifications` | Own update / UPDATE | `auth.uid() = user_id` | omitted | PUBLIC |
| `notifications` | System insert / INSERT | — | `true` | PUBLIC |
| `notifications` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `favorites` | Own / ALL | `auth.uid() = user_id` | omitted | PUBLIC |
| `favorites` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `wallets`, `transactions` | Owner read / SELECT | relation to caller-owned wallet | — | PUBLIC |
| `wallets`, `transactions` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `escrow_transactions` | Parties read / SELECT | buyer/seller party check | — | PUBLIC |
| `escrow_transactions` | Buyer insert / INSERT | — | `auth.uid() = buyer_id` | PUBLIC |
| `escrow_transactions` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `verification_requests`, `password_requests`, `promotion_payments`, `disputes` | Own SELECT/INSERT variants | owner/party checks | owner checks on insert | PUBLIC |
| `reports` | Anyone insert / INSERT | — | `true` | PUBLIC |
| `reports` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `reviews` | Approved public read / SELECT | approved status | — | PUBLIC |
| `reviews` | Buyer insert / INSERT | — | `auth.uid() = buyer_id` | PUBLIC |
| `reviews` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `buyer_requests` | Open public read / SELECT | open status | — | PUBLIC |
| `buyer_requests` | Own insert/update | owner checks; update lacks check | owner check on insert only | PUBLIC |
| `buyer_requests` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `search_alerts` | Own / ALL | `auth.uid() = user_id` | omitted | PUBLIC |
| `search_alerts` | Admin full / ALL | `public.is_admin()` | omitted | PUBLIC |
| `safe_spots` | Active public read / SELECT | active status | — | PUBLIC |
| `safe_spots`, `announcements` | Admin / ALL | `public.is_admin()` | omitted | PUBLIC |

### C.2 Performance-fix migration policies

`20240127000001_rls_performance_fixes.sql` replaces several policies but retains material risks:

- `profiles`: SELECT remains `USING (true)`. `Profiles write access` is `FOR ALL` with owner/admin `USING` and `WITH CHECK`, but an ordinary user can still write their own `role` unless the role column is explicitly protected.
- `ads`: owner/admin `FOR ALL` has both predicates and is structurally better, but field-level ownership/status protection is not shown.
- `messages`: participant `FOR ALL`/INSERT membership does not reliably require `sender_id = auth.uid()`, permitting sender impersonation if the column is client writable.
- `conversations`: participant checks do not sufficiently constrain creation of a conversation involving another user; participant fields need immutable/controlled semantics.
- `notifications`: owner/admin `FOR ALL` permits an ordinary user to insert or rewrite their own system notifications.
- `favorites`: owner `FOR ALL` includes owner `USING` and `WITH CHECK`; this is the closest to a sound user-owned CRUD policy, subject to immutable owner fields.
- `wallets`: owner/admin `FOR ALL` lets the owner write balance and withdrawal fields.
- `transactions`: owner/admin `FOR ALL` lets the owner insert, update, or delete financial ledger records.
- `verification_requests`, `reports`, `disputes`, `reviews`, `buyer_requests`, and `search_alerts`: owner `FOR ALL` allows users to modify fields that should generally be server/admin controlled, including moderation/status fields; DELETE is also broader than required.
- `audit_logs` and `intrusion_logs`: admin SELECT only; no ordinary-client insert policy is present, which is appropriate if server-only writes are enforced.

### C.3 Legacy `supabase/schema.sql` and embedded SQL policies

The legacy schema and UI-embedded SQL contain public `FOR ALL USING (true)` policies for essentially every listed legacy table, including `users`, `listings`, `listing_images`, `favorites`, `messages`, `conversations`, `notifications`, `verification_requests`, `password_requests`, `promotion_payments`, `disputes`, `reports`, `audit_logs`, `reviews`, `buyer_requests`, `search_alerts`, `announcements`, `system_configs`, `site_settings`, `promotion_plans`, `safe_spots`, `intrusion_logs`, `recent_deals`, and in the embedded viewer also wallets, transactions, escrow, categories, and subcategories. These are catastrophic if executed against a real database.

### C.4 Server telemetry policies

`server/db/schema.sql` has:

```sql
CREATE POLICY "System can insert analytics"
  ON public.analytics_events FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "System can insert performance"
  ON public.performance_metrics FOR INSERT WITH CHECK (TRUE);
```

The server routes receive these writes, but the database policy itself does not distinguish a trusted server from an arbitrary authenticated/anonymous client. If direct PostgREST access is available, the policy is too broad.

### C.5 Storage policies

`supabase/storage-policies.sql` allows public SELECT for `profile-media`, `ad-images`, and `ad-videos`. Upload/update/delete policies constrain the first storage path segment to `auth.uid()`. Documents are private to the owner or `public.is_admin()`.

The storage helper redefines `public.is_admin()` as `SECURITY DEFINER` without an explicit `SET search_path`. The same pattern exists in the initial migration. It needs database-owner review and hardening before use. No new `SECURITY DEFINER` helper should be introduced as a shortcut.

## D. Unsafe policy findings

| Finding | Current policy/source | Why unsafe | Intended replacement |
|---|---|---|---|
| Public profile exposure | `profiles` SELECT `USING(true)`; legacy `users` ALL `true` | Exposes private contact/verification/admin fields | Public SELECT only on explicitly public columns/view; private profile SELECT by self/admin |
| Self-admin escalation | Profile owner UPDATE/ALL with no protected-role mechanism | User can change role/admin/status fields in their own row | Self UPDATE only non-privileged fields; role/status changes admin/server-only; UPDATE needs ownership `USING` and protected `WITH CHECK` |
| Public arbitrary writes | Legacy `FOR ALL USING(true)` policies | Anonymous callers can read/write/delete records | Split by operation and use `TO anon` only for explicitly public SELECT, `TO authenticated` with owner checks, admin/server for control data |
| Notification forgery | Initial `INSERT WITH CHECK(true)`; performance `FOR ALL` owner | Users can manufacture or rewrite system notifications | Server/service-only INSERT; recipient `SELECT`; recipient UPDATE only `read`/read timestamp |
| Financial ledger tampering | Wallet/transaction owner `FOR ALL` | User can alter balances, amounts, status, or delete ledger history | User SELECT own rows; server/service-only INSERT/UPDATE/DELETE; admin read/control only |
| Client KYC/moderation tampering | Verification/reports/disputes/reviews owner `FOR ALL` | Status, evidence, decisions, and moderation fields may be client-editable | User INSERT own request/report/review; limited self UPDATE only where explicitly intended; status/admin fields server/admin-only; no user DELETE for evidence |
| Audit/intrusion writes | Legacy public ALL; embedded public ALL | Security records can be forged or erased | Server/service-only INSERT; admin SELECT; no ordinary UPDATE/DELETE |
| Cross-user messaging risk | Message write does not consistently bind sender to auth user | A participant may impersonate another sender | INSERT `WITH CHECK (sender_id = auth.uid() AND participant membership)`; no client UPDATE/DELETE unless narrowly specified |
| Ownership reassignment | Several UPDATE policies omit `WITH CHECK` | New row can change owner fields | UPDATE `USING` old ownership and `WITH CHECK` new owner remains caller, or make owner immutable |
| Public system configuration | Missing RLS or legacy public ALL | Feature flags/site controls can be changed publicly | Public SELECT only for explicitly public settings; admin/server-only writes |
| OTP exposure | `phone_otps` lacks visible RLS policy | Default privileges/deployment drift could expose OTP data | No anon/authenticated policies; server/service-only access; never return OTP secrets |

## E. Cross-user access risks

The principal risks are public profile SELECT, legacy public ALL policies, conversation creation with unconstrained participant fields, sender impersonation in messages, and any policy that checks only `authenticated` rather than ownership. Notifications, push subscriptions, search alerts, favorites, verification records, password requests, disputes, and reports must be keyed to `auth.uid()` and must not allow a caller to submit a different owner/user ID.

The active application uses server routes for several message/notification operations, but direct Supabase client services also exist. RLS remains the final boundary and cannot rely on UI hiding.

## F. Admin authorization risks

Admin checks use `profiles.role` through server-side `requireAdmin`/SQL and the existing `public.is_admin()` function. No authorization use of `raw_user_meta_data` or `user_metadata` was found; user metadata is used for display fields only.

However, profile write policies do not clearly protect `role`, and the current helper is `SECURITY DEFINER` without a hardened search path. The repository also contains an unapplied Phase 2B proposal that adds further `SECURITY DEFINER` helpers. That proposal must not be applied as-is without reviewing the actual deployed schema and database-owner authorization model.

Admin policy access should be explicit and should protect role assignment itself. Do not infer admin authorization from the `authenticated` role or from client state.

## G. Financial-data risks

The repository contains `wallets`, `transactions`, `escrow_transactions`, and `promotion_payments`, plus wallet UI and server escrow code. The performance migration's owner `FOR ALL` policies are not acceptable for financial records: users must not write balances, ledger amounts, transaction status, escrow state, payment references, or historical records.

The active client code contains direct wallet/transaction writes in `src/context/SealifyContext.tsx` and `src/lib/api-client.ts`. Server escrow code also writes notifications and transactions through SQL. Before implementation, decide whether wallet/escrow functionality is being retained or removed; until then, lock all financial writes to trusted server/service paths and preserve an immutable ledger design.

## H. Server-only/system-operation risks

Observed trusted server-side writes include audit/intrusion logs in `src/middleware/security.ts`, notification creation in server API routes, and escrow/transaction writes in `server/routes/api/escrow.post.ts`.

Observed or risky client-side paths include notification creation through `src/services/supabaseService.ts`, direct wallet/transaction operations in client context/API code, and UI-level system configuration operations. These need to be routed through authenticated server endpoints or made read-only for ordinary clients.

`SUPABASE_SERVICE_ROLE_KEY` is referenced by `src/db/supabase.ts`, `server/db/supabase.ts`, and `src/lib/supabase.ts`. These modules are marked/server-intended and no browser import of the service-role key was found in the repository search. Nevertheless, `src/lib/supabase.ts` exports `supabaseAdmin` and aliases it as `supabase`, which is an import-boundary hazard. Build tooling must guarantee it is never bundled into browser code. Browser code should use only the anon client from `src/integrations/supabase/client.ts`.

No view or materialized-view definition was found in repository SQL. Deployed views must still be checked because a view can expose protected data depending on its security/invoker configuration and grants.

## I. `ad_images` vs `listing_images` determination

The active application uses `ad_images`: `src/services/supabaseService.ts` selects `ad_images(image_url, sort_order)` and inserts rows with `ad_id`, `image_url`, and `sort_order`. Active application code also uses `ads`, not `listings`.

`listing_images` belongs to the legacy `users`/`listings` model in `supabase/schema.sql` and the embedded schema viewers. Read-only production inspection confirmed that `ad_images` exists and `listing_images` was not found among the relevant production tables. Therefore:

1. Active application intent is `ads` + `ad_images`.
2. Legacy documentation intent is `listings` + `listing_images`.
3. Production `ad_images` has `ad_id`, `image_url`, `storage_path`, `sort_order`, `is_primary`, and `created_at`.
4. Do not create, rename, delete, or alter either table; the repository migration now targets only `ad_images`.

## J. Recommended policy architecture

1. Enable RLS on every application table, including configuration, image, telemetry, OTP, audit, and system tables.
2. Use explicit `TO anon`, `TO authenticated`, and trusted server/admin roles. Never rely on the `authenticated` role as authorization.
3. Decompose `FOR ALL` into separate SELECT/INSERT/UPDATE/DELETE policies.
4. Public SELECT must expose only intentionally public rows and columns. Do not public-select raw `profiles`/`users`.
5. For every user-owned UPDATE, include both an old-row `USING` predicate and a new-row `WITH CHECK` predicate. Make owner IDs immutable where possible.
6. Keep role/admin, moderation, financial, audit, intrusion, OTP, and system-control writes server/admin-only.
7. Use narrow field/API contracts for self-service updates; RLS alone cannot prevent a user from updating a permitted row's privileged columns.
8. Keep service-role use in server-only modules and add a build/import boundary test.
9. Prefer a public-safe profile projection or separate public profile table rather than exposing private columns through a broad table policy.
10. Do not introduce new `SECURITY DEFINER` functions as a shortcut. Any existing helper must be reviewed, have a fixed search path, restricted EXECUTE grants, and a clear reason to exist.

## K. Exact migration changes required — proposed SQL only

The following is an implementation blueprint, not executed SQL. Names and columns must be adjusted after catalog verification.

```sql
-- Preconditions: confirm every table/column and inspect pg_policies first.
-- Do not run this block until the deployed schema is reconciled.

-- Every protected table must have RLS enabled.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intrusion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- Replace broad profile access with explicit, column-safe access.
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles read access" ON public.profiles;
CREATE POLICY profiles_self_select ON public.profiles
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);
CREATE POLICY profiles_public_select ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (is_public = true); -- only if this column exists and only after a safe projection is confirmed
CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id AND role = (SELECT role FROM public.profiles WHERE id = (select auth.uid())));
-- Better: expose only non-privileged columns through an RPC/server endpoint and revoke direct role-column updates.

-- Owner-controlled ads must retain ownership.
CREATE POLICY ads_owner_update ON public.ads
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = seller_id)
  WITH CHECK ((select auth.uid()) = seller_id);
CREATE POLICY ads_owner_delete ON public.ads
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = seller_id);

-- Notifications: recipient read/read-state only; system inserts server-side.
CREATE POLICY notifications_recipient_select ON public.notifications
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);
CREATE POLICY notifications_recipient_update ON public.notifications
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
-- No anon/authenticated INSERT, and no ordinary DELETE. Add a separate trusted server policy only if the deployment role supports it.

-- Financial tables: user read only; all writes are trusted server/admin operations.
CREATE POLICY wallets_owner_select ON public.wallets
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);
CREATE POLICY transactions_owner_select ON public.transactions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.wallets w WHERE w.id = wallet_id AND w.user_id = (select auth.uid())));
CREATE POLICY escrow_party_select ON public.escrow_transactions
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = buyer_id OR (select auth.uid()) = seller_id);
-- Deliberately no ordinary-client INSERT/UPDATE/DELETE policies.

-- System/security records: admin read; trusted server writes; no ordinary client writes.
CREATE POLICY audit_logs_admin_select ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY intrusion_logs_admin_select ON public.intrusion_logs
  FOR SELECT TO authenticated USING (public.is_admin());
-- No ordinary-client policies for INSERT/UPDATE/DELETE.
-- phone_otps: no anon/authenticated policies at all.

-- Messaging: bind sender and participants.
CREATE POLICY messages_participant_insert ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND ((select auth.uid()) = c.participant_1 OR (select auth.uid()) = c.participant_2)
    )
  );
```

The placeholder `is_public` and `seller_id`/`buyer_id` references must be replaced only after catalog verification. A safe public profile projection may require a new view/table decision; do not expose all profile columns through a table policy.

Before any SQL is applied, drop/replace every legacy `Public * All` policy and every `WITH CHECK (true)` policy, including telemetry, then add only the required operation-specific policies. The existing unapplied `20240816000000_rls_least_privilege.sql` must be treated as a draft, not applied wholesale: it references uncertain tables and introduces new `SECURITY DEFINER` helpers contrary to this audit constraint.

## L. Application-code changes required, if any

These are required follow-up changes, not performed in this audit:

- Route notification creation through trusted server code; retain client access only for recipient read and read-state updates.
- Remove or replace direct browser wallet/transaction writes. Financial mutations must be server-side and validated against the authenticated user and transaction state.
- Bind message sender identity on the server and/or database; do not accept a client-supplied sender ID.
- Make audit, intrusion, OTP, and system-control writes server-only.
- Replace raw profile reads with a public-safe projection and self/admin private reads.
- Enforce immutable owner fields and protect moderation/status/admin columns in API validation as well as RLS.
- Keep service-role modules out of the browser dependency graph; add a CI/build check for service-key imports in client entry points.
- Resolve whether wallet/financial features remain in scope before implementing the final policy set.

## M. Verification/test plan

### M.1 Catalog verification before migration

Run in the target Supabase SQL editor with results reviewed, without printing secrets:

```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT n.nspname AS schema_name, c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname IN ('public', 'storage') AND c.relkind IN ('r','p');

SELECT schemaname, tablename, policyname, permissive, roles,
       cmd, qual, with_check
FROM pg_policies
WHERE schemaname IN ('public','storage')
ORDER BY schemaname, tablename, policyname;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

SELECT table_name, constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_name;

SELECT schemaname, viewname, definition
FROM pg_views
WHERE schemaname NOT IN ('pg_catalog','information_schema');
```

### M.2 Negative/positive RLS tests

Use two ordinary users, one admin, and an anonymous client. Assert:

- Anonymous users can only read approved public projections/rows.
- User A cannot select, insert, update, or delete User B's profiles, favorites, alerts, notifications, requests, messages, documents, or private records.
- User A cannot change any owner ID, role, admin flag, moderation status, financial amount, balance, ledger status, OTP, audit, or intrusion field.
- User A cannot impersonate a message sender or create a conversation that violates the intended participant workflow.
- User A can only update notification read state for User A.
- Ordinary users cannot write wallets, transactions, escrow, payment, audit, intrusion, or OTP tables.
- Admin operations succeed only for a trusted admin role and fail for an ordinary authenticated user.
- Logged-out requests fail on every protected API route.
- Storage documents are private; public media exposure is limited to intended buckets.

### M.3 Application/build checks

- Search client dependency graph for `SUPABASE_SERVICE_ROLE_KEY` and `supabaseAdmin`.
- Verify server routes validate Supabase access tokens and enforce ownership/admin authorization.
- Test profile, marketplace, messaging, notifications, admin, and financial UI with network requests inspected.
- Run `npm run check` and `npm run build` after follow-up code changes.
- Confirm no new migration is applied until catalog snapshots and RLS tests pass.

## N. Items requiring human confirmation before implementation

1. Which Supabase project/environment is the target for remediation?
2. Is the deployed schema the `profiles`/`ads` model, the legacy `users`/`listings` model, or a transitional mixture?
3. Which image table is deployed and authoritative: `ad_images` or `listing_images`?
4. Which profile fields are intentionally public?
5. What is the trusted admin authorization source and who is allowed to change roles?
6. Are wallets, transactions, escrow, promotion payments, and disputes being retained, frozen, or removed?
7. Which system writes are executed with the server database role versus Supabase PostgREST?
8. Are public telemetry inserts required? If yes, what validation, rate limiting, and retention rules apply?
9. Which storage buckets are public and which are private?
10. Are any deployed views, triggers, functions, grants, or external jobs absent from the repository?
11. Can the legacy SQL/schema viewer be removed from operational documentation after the canonical schema is confirmed?

## Audit conclusion

The repository is **not ready for an RLS remediation migration without catalog reconciliation**. The highest-priority blockers are the conflicting/incomplete schema sources, public `FOR ALL USING(true)` legacy policies, public profile exposure, self-editable admin/role risk, client/owner financial write policies, and the uncertain image-table deployment. The safest next action is to capture the target Supabase catalog using the read-only queries in section M.1, map it to the active application queries, and then review a corrected migration that contains only confirmed tables and columns.
