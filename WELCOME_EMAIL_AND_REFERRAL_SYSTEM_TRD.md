# Sealify — Automated Welcome Email & User Referral Program
## Technical Requirements Document (TRD)

| Field | Value |
|---|---|
| Document status | Draft for implementation |
| Version | 1.0 |
| Scope | Part 1 — Welcome email; Part 2 — Referral system |
| Target platform | Sealify Nigeria marketplace |
| Stack | React 19 + TypeScript (Vite 8), Hono 4 on Cloudflare Pages Functions, Supabase Postgres (PostgREST + Hyperdrive), Tailwind CSS + shadcn/ui, Zod |
| Verification gate | `npm run check` (ESLint `--max-warnings 0` + `tsc --noEmit`) |

---

## 0. Executive summary

Two features ship together because they are mutually dependent:

1. **Welcome email** — dispatched automatically the moment a profile row is
   committed at `POST /api/auth/register`. It personalises to the user, explains
   what Sealify is, states the "free until you subscribe to promo ads" value
   proposition, teaches the user how to drive sales and leads from the
   marketplace, and closes with the referral call-to-action.
2. **Referral program** — gives every user a permanent, unique referral link,
   surfaces a live referral counter on their dashboard, credits the referrer
   when a referred visitor completes signup, and gives the Admin Pane both a
   platform-wide referral ledger and a manual *grant-and-reset* control that
   closes a referral cycle once the free promotional ad month is awarded.

The welcome email is the top of the referral funnel, so the referral link must
exist before the first welcome email can be rendered. Implementation order is
therefore: schema → referral code issuance → referral capture → welcome email →
user UI → admin UI.

### 0.1 Existing system facts this design depends on

These were verified in the repository and must not be re-litigated during
implementation.

| Fact | Location |
|---|---|
| Signup handler creates the Supabase Auth user, then the `profiles` row, then `user_settings`, then writes an audit entry | `src/api/auth.ts:76-159` |
| Registration payload is validated by `registerSchema` (currently has **no** referral field) | `src/api/auth.ts:31-36` |
| Signup uses the service-role client, so `auth.signUp` returns a live session and auto-confirms | `src/api/auth.ts:85-109` |
| API routers are Hono instances exported as `default` and mounted by a `routeMap` in the Pages catch-all | `functions/api/[[path]].ts:41-62` |
| Email sending already exists, with Cloudflare `EMAIL` binding → REST fallback → dev simulation | `src/api/email.ts:516-548` |
| An HTML + plaintext template pair already exists as the house pattern | `src/api/email.ts:682-758` |
| The established pattern for triggering an email from an auth route is a best-effort `fetch` to this Worker's own `/api/email/*`, wrapped in try/catch so it can never fail the parent request | `src/api/auth.ts:616-638` |
| Brand gradient, support email `support@sealify.ng`, phone `+234 813 120 8468` | `src/api/email.ts:691-723` |
| `profiles` table shape (`id uuid` = Supabase Auth user id, `full_name`, `email`, `role`) | `supabase/migrations/20260820000000_canonical_sealify_schema.sql:24-61` |
| `requireAuth`, `requireAdmin`, `checkIsAdmin`, `sanitizeInput`, `auditLog` | `src/middleware/security.ts:41,124,71,153,239` |
| Admin authorization is decided **only** by `public.is_admin()`; never by a client-supplied role field | `src/middleware/security.ts:64-150` |
| `auditLog`'s `type` argument is a TypeScript union that currently lacks `"referral"` — it must be extended | `src/middleware/security.ts:244` |
| Admin user list endpoint (search / role / status / verified / limit / offset) | `src/api/admin.ts:162-259` |
| Admin dashboard tab registry (`activeTab` union + `tabs` array) | `src/pages/AdminDashboard.tsx:106,355` |
| User Settings page (1194 lines, `text-lg font-black text-white` section headings) | `src/pages/Settings.tsx` |
| Client routes live in one file | `src/App.tsx` |
| Realtime subscription hook already available | `src/hooks/useRealtime.ts` |
| Migrations are `supabase/migrations/YYYYMMDDHHMMSS_snake_case.sql` | latest: `20261001000000_site_metadata_and_branding.sql` |

**Greenfield confirmation:** a repository-wide search for `referral`,
`refer_code`, `invite_code`, `promo_ad`, `is_subscribed`, and `pro_user`
returned **no** application-level referral concept. Every `subscription` hit is a
browser Push API subscription. This feature is a clean addition with no legacy
migration risk, but also no existing code to reuse.

---

## Part 1 — Automated Welcome Email

### 1.1 Functional requirements

| ID | Requirement |
|---|---|
| W-1 | The email is triggered by successful signup at `POST /api/auth/register` and dispatched immediately after the profile row commits. |
| W-2 | Delivery must **never** delay, fail, or alter the `201` signup response. |
| W-3 | The email is personalised with the user's full name and account identifier. |
| W-4 | The email introduces Sealify and its value proposition in plain, warm language. |
| W-5 | The email states explicitly that Sealify is **completely free** until the user chooses to subscribe to promotional ad listings. |
| W-6 | The email contains a concise, actionable guide to using the marketplace to drive **sales, inquiries, leads, customers, and promotional ad subscriptions**. |
| W-7 | The email contains a referral call-to-action aimed at friends, family and college networks. |
| W-8 | The email discloses that referral rewards may qualify the user for **one (1) month of free promotional ad listings**, and that **final approval is at the sole discretion of the Root System Admin**. |
| W-9 | The email renders correctly in Outlook, Gmail (web + mobile), Apple Mail, and in dark mode. |
| W-10 | The email ships with a `text/plain` alternative part. |
| W-11 | Delivery is idempotent — at most one welcome email per user, ever. |

### 1.2 Security requirement overriding W-3 (read this before implementing)

The brief asks for the user's **"login credentials"** in the email. Sending a
plaintext password by email is not implementable as a secure requirement:

- Email is transmitted and stored unencrypted across SMTP relays, mailbox
  providers, spam filters and backup archives. A plaintext password would be a
  standing credential-exfiltration vector.
- Passwords are hashed by Supabase Auth and **are not retrievable** by the
  application at send time, so the plaintext would have to be re-injected into
  the render path — meaning the password would be held in Worker memory,
  logged in `auditLog` context, and exposed to anyone with log access.
- A password in an inbox is a permanent liability after the user changes it.

**Resolution — this document specifies a compliant substitute that still
delivers everything a user needs to log in:**

1. The user's **full name** and **email address** are shown plainly (these are
   the identifiers they will recognise).
2. The password is **never** transmitted. Instead the email states that the
   password is the one they chose at signup, and supplies a
   **"Set or change your password"** button pointing at
   `${APP_URL}/reset-password` — which uses the existing
   `POST /api/auth/password/reset-request` flow and a Supabase recovery link.
   This is strictly better UX than echoing a password: it also covers the very
   common case of a user who forgot the password between signup and opening the
   email.
3. If the user opted into email notifications (`profiles.email_notifications`,
   default `true`), a masked hint is included so they can confirm which account
   the email belongs to — e.g. `j•••@gmail.com`. Never a password fragment.

The template must implement this. Any implementation that interpolates
`password` into the email body or logs it is a P0 defect, not a style issue.

### 1.3 Delivery trigger and placement

Trigger site: `src/api/auth.ts`, immediately after the `user_settings` insert
and the existing `auditLog` call, before the `c.json(...)` return at
`src/api/auth.ts:140`.

Dispatch must use the established self-fetch pattern
(`src/api/auth.ts:616-638`): the register handler POSTs to
`/api/email/welcome` on its own origin, wrapped in try/catch, logging a warning
on failure and proceeding regardless.

```
// pseudocode — to be inserted after src/api/auth.ts:138
const baseUrl = c.req.url.replace(/\/api\/auth\/register$/, '');
try {
  const res = await fetch(`${baseUrl}/api/email/welcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      email,
      fullName: sanitizeInput(fullName),
      referralCode: <resolved code for this user>,
    }),
  });
  if (!res.ok) console.warn('Welcome email dispatch failed:', await res.text().catch(() => ''));
} catch (err) {
  console.warn('Welcome email dispatch error:', err);
}
```

Notes on the self-fetch approach:

- The base URL is derived by stripping the known suffix from `c.req.url`, exactly
  as `src/api/auth.ts:617` does. **Do not** hardcode a domain — a hardcoded
  domain silently sends to a site the user does not use.
- `internalFetch` is a loopback call inside the same Worker isolate, so it
  inherits `c.env` bindings without re-authentication.
- The inner route must be callable without a `Bearer` token because it is
  invoked by the signup handler itself, which holds no bearer token yet. Because
  of that, `/api/email/welcome` **must not** accept arbitrary `to`/`html` from
  the caller — it accepts only a `userId`, and looks up the recipient itself
  from the database. This prevents the route being abused as an open relay.

**Confirmation-gated case.** With the service-role client the account is
auto-confirmed and a session exists, so the simple path above holds. If the
deployment is ever switched to the anon key, `signUp` may return `user` with no
confirmed session; in that case the welcome email must still fire, but the
template's primary CTA becomes "Confirm your email" rather than "Go to my
dashboard". The template renderer therefore takes an `isConfirmed` flag.

### 1.4 Durability and delivery guarantee (W-2, W-11)

A best-effort in-process `fetch` can be lost if the Worker is evicted between
the signup commit and the send. To make W-2 and W-11 true rather than best
-effort, introduce a transactional outbox.

New table `email_outbox` (migration `20261005000000_referral_and_welcome_email.sql`):

```sql
CREATE TABLE public.email_outbox (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template      text NOT NULL,
  recipient     text NOT NULL,
  payload       jsonb NOT NULL DEFAULT '{}'::jsonb,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','sent','failed','suppressed')),
  attempts      integer NOT NULL DEFAULT 0,
  last_error    text,
  dedupe_key    text UNIQUE,
  scheduled_at  timestamptz NOT NULL DEFAULT now(),
  sent_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_outbox_pending
  ON public.email_outbox (scheduled_at)
  WHERE status = 'pending';

-- W-11: one welcome email per user, enforced by the database, not by app code.
CREATE UNIQUE INDEX uq_email_outbox_welcome_per_user
  ON public.email_outbox ((payload ->> 'userId'))
  WHERE template = 'welcome';
```

Flow:

1. `POST /api/auth/register` inserts an `email_outbox` row inside the same
   logical unit of work as the `profiles` insert, with
   `dedupe_key = 'welcome:' || userId`. A duplicate insert is swallowed by
   `ON CONFLICT DO NOTHING`, so a retried registration cannot double-send.
2. The handler returns `201` immediately — no SMTP in the request path.
3. After the response, the handler makes a best-effort attempt to deliver the
   pending row now (fast path: the common case is delivered within the same
   request).
4. A scheduled drain processes rows where `status = 'pending'` and
   `scheduled_at <= now()`, with exponential backoff up to 5 attempts
   (30s, 2m, 10m, 1h, 6h). This covers the eviction case.

The unique index on `(payload->>'userId') WHERE template='welcome'` is the
authoritative idempotency guarantee; the application-level check is a
belt-and-braces convenience.

**Implementation note:** the existing `sendEmailViaEnv` in `src/api/email.ts:516`
simulates success in development when no binding is configured
(`src/api/email.ts:543-547`). The outbox drain must record `sent` in that case
so local development does not accumulate a permanently pending backlog; in
production the binding is present and a thrown error marks `failed`.

### 1.5 Template specification

New module `src/server/emailTemplates/welcome.ts`, exported from
`src/server/emailTemplates/index.ts`. This location matches the existing
`src/server/siteMetadataStore.ts` convention for server-only modules and keeps
HTML out of the client bundle.

API:

```ts
export interface WelcomeEmailParams {
  fullName: string;
  email: string;
  maskedEmail: string;
  referralCode: string;
  referralLink: string;
  isConfirmed: boolean;
  siteUrl: string;
  appUrl: string;
  supportEmail: string;
  supportPhone: string;
}

export function renderWelcomeHtml(p: WelcomeEmailParams): string;
export function renderWelcomeText(p: WelcomeEmailParams): string;
export const WELCOME_SUBJECT = "Welcome to Sealify, {{firstName}} — here's how to start selling";
```

Subject line is a template so `{{firstName}}` resolves to the first token of
`fullName`, with a fallback to `there` for single-word or empty names.

#### 1.5.1 Visual design specification

Email clients do not support Tailwind, CSS variables, flexbox or grid. All
styling must be **inline `style` attributes on table-based markup**.

| Property | Specification |
|---|---|
| Layout | Nested `<table>`, `role="presentation"`, `width="100%"`, centred outer wrapper with a `max-width:600px` content table |
| Primary colour | Brand gradient `#667eea → #764ba2` (matches existing `generatePasswordResetHtml`, `src/api/email.ts:691`) |
| Accent | Warm highlight `#f59e0b` for the reward/CTA block, to convey the "warm, friendly" tone without breaking brand consistency |
| Body text | `#333333`, 16px, `line-height:1.6`, Arial/Helvetica sans stack |
| Background | `#f4f5f7` page wash, `#ffffff` content card, 8px corner radius |
| Buttons | Bulletproof VML `v:roundrect` button **plus** a live `<a>` fallback link underneath — Outlook desktop strips padding from `<a>`-only buttons |
| Dark mode | `<meta name="color-scheme" content="light dark">`, `<meta name="supported-color-schemes" content="light dark">`, and a `@media (prefers-color-scheme: dark)` block scoping only the two outermost wrappers |
| Images | Logo inlined via absolute HTTPS URL from `site_settings.logo_url`, with `alt="Sealify"`, explicit `width`/`height` to prevent layout shift, and a visible brand-coloured text wordmark fallback |
| Images total | ≤ 1 hero image. Referenced by absolute URL, never attached (blocking remote images must not break the email) |
| Preheader | Hidden preview text in a `display:none;max-height:0;overflow:hidden` div immediately after `<body>` |
| Accessibility | Semantic headings, sufficient contrast (≥4.5:1), `lang="en"`, `role="article"` on the content card, descriptive link text (never bare "click here") |
| Total size | Target < 100 KB HTML |

#### 1.5.2 Section map

| # | Section | Purpose |
|---|---|---|
| 0 | Preheader | Inbox preview line, hidden |
| 1 | Header band | Gradient, logo, wordmark |
| 2 | Hero greeting | "Welcome aboard, {{firstName}} 👋" + one-line promise |
| 3 | Your account | Personalisation + credential reminder + set/change-password button (see §1.2) |
| 4 | What Sealify is | Brand introduction, 3–4 sentences |
| 5 | Free until you choose to subscribe | Value proposition call-out box |
| 6 | Getting the most out of Sealify | Educational guide, 5 numbered blocks (see §1.5.4) |
| 7 | Primary CTA | "Post your first listing" button |
| 8 | Refer friends & earn | Referral link, share buttons, reward disclosure (see §1.5.5) |
| 9 | Secondary CTA | "Complete your profile" / "Go to dashboard" |
| 10 | Help footer | Support email, phone, links, unsubscribe/legal |

#### 1.5.3 Copy deck — Sections 0 to 5

**Preheader**
> You're in. Here's how to turn your Sealify listings into real sales — and how to earn a free month of promo ads by referring friends.

**Hero greeting**
> **Hi {{firstName}}, welcome to Sealify! 👋**
>
> Your account is live. In the next two minutes you'll learn what you can do here for free, how to turn a listing into a sale, and how your friends can earn you a free month of promoted listings.

**Your account**
> **Your Sealify account**
>
> Sign in with **{{email}}**
> Password: the one you chose when you signed up — we never email passwords, for good reason.
>
> `[ Set or change my password ]`
>
> Not you? You can safely ignore this email. No action is needed.

**What Sealify is**
> **What is Sealify?**
>
> Sealify is a marketplace that connects the people of Nigeria directly — buyers
> who are actively searching, and sellers who have real things to sell. Post a
> listing in under a minute, reach buyers in your area and beyond, and handle
> enquiries, offers and safe meetups in one place.
>
> Whether you're clearing stock, running a small business, or just finding a
> better deal, Sealify is built to make buying and selling feel safe, simple and
> local.

**Value proposition — the critical block**
> ### 🆓 Sealify is completely free — until you choose otherwise
>
> You can create your account, post listings, browse, message sellers and make
> sales **without paying anything at all.**
>
> The only time money comes into play is if **you** decide you want your ads
> promoted. Promoted listings are entirely optional — they're a way to put your
> ad in front of more buyers faster.
>
> **Sealify only costs you money if, and when, you choose to subscribe to
> promotional ad listings. Until then, it's yours at no cost.**

That block satisfies W-5 and must not be softened, abbreviated, or moved below
the referral section. It is the single most important claim in the email.

#### 1.5.4 Educational content — Section 6

Requirement W-6 asks for a concise guide to driving **sales, inquiries, leads,
customers, and promotional ad subscriptions**. Five blocks, each with a bold
lead-in, two sentences of body, and one micro-action:

> ## Turn Sealify into sales, leads and customers
>
> **1. Post one listing today — it takes a minute.**
> A complete listing with a real photo, a fair price and a clear description
> gets 5× more enquiries than a bare one. Add your location so nearby buyers can
> find you. *Micro-action: post your first ad now.*
>
> **2. Treat enquiries like conversations, not transactions.**
> Reply quickly — buyers often message three sellers. Ask a question, offer
> something small extra, and be straightforward about what's wrong with an item.
> Good-faith replies turn into completed deals. *Micro-action: reply to every
> message within an hour.*
>
> **3. Keep fresh listings at the top.**
> Renew and update your ads regularly. Fresh activity makes your shop look
> active and trustworthy, which brings more buyers back. *Micro-action: update
> your top ad today.*
>
> **4. Get found — locally and by buyers who want what you sell.**
> Use your full location and clear category. Sellers with complete profiles
> appear higher in results and in buyer searches, so finish your profile to
> appear in the shops directory. *Micro-action: complete your profile.*
>
> **5. Promote the ads that already work.**
> Start with your best-performing listing, subscribe to a promotional ad listing
> plan, and put it in front of more buyers. Only pay when a boost is already
> earning you attention — never to rescue a listing that nobody wants.
> *Micro-action: check your Ad Analytics to see which ad performs best.*

This maps to existing product surfaces that the links should point at:
`PostAd`, `Messages`, `MyAds`, the settings profile editor, and
`AdAnalyticsModal` (which already contains a "Flyer & Social Referral" section
at `src/components/AdAnalyticsModal.tsx:93` — worth cross-linking).

#### 1.5.5 Referral call-to-action — Section 8

Requirement W-7 and W-8. Must include the referral link, a share affordance,
and the exact reward disclosure.

> ## 👨‍👩‍👧‍👦 Refer friends, family and college mates — earn a free month
>
> You know people who'd love this. Share your personal invite link and when they
> join Sealify, it counts toward your referral total.
>
> **Your invite link:**
> `[ {{referralLink}} ]`  `[ Copy link ]`
>
> `[ Share on WhatsApp ]` `[ Share on X ]` `[ Share on Facebook ]`
>
> ### 🌟 Referrals may earn you 1 month of free promotional ad listings
>
> When your referrals reach the qualifying threshold, you may be eligible for
> **one (1) month of free promotional ad listings** — a full month of promoted
> visibility for your ads, on us.
>
> Every referral is reviewed before a reward is granted. **Final approval of any
> referral reward is at the sole discretion of the Root System Admin.** We verify
> each referral to keep the community fair and genuine, so rewards are not
> guaranteed or automatic.
>
> Track your progress any time from **Referrals** in your dashboard.

The two sentences "Final approval ... sole discretion of the Root System Admin"
and the anti-fraud caveat are **mandatory legal copy**. They must appear
verbatim in both the HTML and the plaintext part. They must not be removed when
the threshold is met, and they must not be presented as an entitlement.

#### 1.5.6 Copy deck — Section 10 footer

> Questions? Just reply to this email, or reach us at
> **support@sealify.ng** · **+234 813 120 8468**
>
> `[Go to your dashboard]` `[Post an ad]` `[Help Center]` `[Safety Centre]`
>
> © {{year}} Sealify Nigeria. All rights reserved.
> You're receiving this because you created a Sealify account.
> [Notification preferences]

`[Notification preferences]` must link to `${appUrl}/settings`, and the email
must respect `profiles.email_notifications`. If that flag is `false`, suppress
the outbox row at drain time rather than delivering against the user's stated
preference. (This flag governs marketing-category mail; it must not be used to
suppress transactional mail such as password resets.)

### 1.6 `POST /api/email/welcome`

New route in `src/api/email.ts`, following the file's existing conventions.

**Request** (internal; caller supplies `userId` only)

```jsonc
{
  "userId": "uuid",            // required — recipient resolved server-side
  "force": false               // optional — admin re-send, bypasses dedupe
}
```

**Server behaviour**

1. `requireAuth` **unless** invoked by the register handler. Implemented as an
   internal-secret check: the route accepts either a valid admin bearer token, or
   a matching `X-Internal-Token` header compared against `env.INTERNAL_API_TOKEN`
   using a constant-time comparison. This preserves the open-relay protection
   described in §1.3.
2. Load the profile by `userId`. 404 if absent.
3. Load or create the user's `referral_code` (Part 2). A user must never receive
   a welcome email containing a referral link before their code exists.
4. Respect `profiles.email_notifications`.
5. Insert into `email_outbox` with `dedupe_key = 'welcome:' || userId`; on
   conflict, no-op unless `force` is true (admin re-send, audited).
6. Attempt immediate delivery; update outbox status.
7. `auditLog(sql, userId, "Welcome Email Queued", ..., "user")`.
8. Return `202 { queued: true, deduped: boolean }`.

**Never** accept `to`, `subject`, `html`, `from`, `attachments` or `recipient`
from this route's caller. Contrast with the generic `POST /api/email/send`
(`src/api/email.ts:39`), which *does* accept arbitrary HTML and is therefore not
suitable as the model here.

**Rate limit:** the existing `emailRateLimit` (100/hour,
`src/api/email.ts:11`) is appropriate.

**Admin re-send:** `POST /api/email/admin/welcome-resend` guarded by
`requireAdmin`, accepting `{ userIds: string[] }`, reusing the fan-out loop
pattern from `src/api/email.ts:233-266`, and logging
`"Welcome Email Resent"` per recipient.

### 1.7 Provider configuration

`sendEmailViaEnv` (`src/api/email.ts:516`) resolves providers in this order:
Cloudflare `EMAIL` binding → `EMAIL_SERVICE_URL` + `EMAIL_API_KEY` REST →
development simulation.

`wrangler.toml` currently declares only a `[[hyperdrive]]` binding and `[vars]`.
Email is therefore currently falling through to the **development simulation**
in production. Adding a real provider is a prerequisite for this feature.

Preferred: **Cloudflare Email Sending**, via `send_email` binding in
`wrangler.toml` plus a verified destination domain and the required DNS records
(DKIM, SPF, and a DMARC `_reportonly` → `_reject` progression). See the
`cloudflare-email-service` skill.

```toml
# wrangler.toml — add
send_email = [
  { name = "EMAIL" }
]
```

Add to `.env.example`:

```
# Transactional email (welcome, password reset, admin broadcast)
EMAIL_SERVICE_PROVIDER=cloudflare
EMAIL_SERVICE_URL=
EMAIL_API_KEY=
EMAIL_DAILY_LIMIT=10000
WELCOME_EMAIL_FROM=noreply@sealify.ng
WELCOME_EMAIL_FROM_NAME=Sealify
INTERNAL_API_TOKEN=<random 32+ byte secret>
```

Also add `WELCOME_EMAIL_FROM` / `WELCOME_EMAIL_FROM_NAME` to
`.env.production.example`, and set `INTERNAL_API_TOKEN` as a Cloudflare Pages
**secret** (never in `[vars]` — the file explicitly forbids credential
placement, see `wrangler.toml` header comment).

Sender identity must pass SPF/DKIM/DMARC or the email will land in spam, which
would silently defeat the entire feature. Deliverability should be verified
against a seed inbox before launch.

---

## Part 2 — Referral System

### 2.1 Functional requirements

| ID | Requirement |
|---|---|
| R-1 | Every user has a unique, permanent referral code generated on account creation. |
| R-2 | The user's profile surfaces a referral link with one-click copy and share. |
| R-3 | The user dashboard displays a real-time referral count. |
| R-4 | A referral is credited when a referred visitor completes signup. |
| R-5 | Self-referral, duplicate referral, and re-referral of an already-attributed user are all impossible. |
| R-6 | The Admin Pane lists referral counts for every user, with search, filter, sort and pagination. |
| R-7 | An Admin can grant the reward and reset a user's referral count, starting a new referral cycle. |
| R-8 | Every grant/reset is written to `audit_logs` and to a dedicated `referral_rewards` ledger. |
| R-9 | Reset is atomic and cannot lose or corrupt historical referral records. |
| R-10 | The reward threshold is configurable by Admin without a deploy. |

### 2.2 Data model

All in one migration: `supabase/migrations/20261005000000_referral_and_welcome_email.sql`.

```sql
-- 1. Referral columns on profiles -----------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_count   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_cycle   integer NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.profiles.referral_code IS
  'Stable public referral code, e.g. SEALIFY-7K2M9Q. Never rotated.';
COMMENT ON COLUMN public.profiles.referral_count IS
  'Credited referrals in the CURRENT cycle only. Reset to 0 when a reward is granted.';

-- 2. Referral ledger (append-only source of truth) ------------------------
CREATE TABLE public.referrals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id   uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  cycle        integer NOT NULL DEFAULT 1,
  status       text NOT NULL DEFAULT 'credited'
                 CHECK (status IN ('credited','pending_review','revoked')),
  -- Optional anti-abuse signals. Recorded, never auto-rejected on their own.
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- R-5: a user can be referred by at most one person, and never by themselves.
-- referee_id UNIQUE enforces "at most one referrer" at the database level.
ALTER TABLE public.referrals
  ADD CONSTRAINT referrals_no_self_referral CHECK (referrer_id <> referee_id);

CREATE INDEX idx_referrals_referrer ON public.referrals (referrer_id, cycle, status);
CREATE INDEX idx_referrals_code     ON public.referrals (referral_code);

-- 3. Reward ledger --------------------------------------------------------
CREATE TABLE public.referral_rewards (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle        integer NOT NULL,
  referrals_at_reset integer NOT NULL,
  granted_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  -- One reward grant per user per cycle. Makes the reset operation idempotent.
  UNIQUE (user_id, cycle)
);

-- 4. Referral-click analytics (optional, cheap, supports fraud review) ----
CREATE TABLE public.referral_clicks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code       text NOT NULL,
  ip_address inet,
  user_agent text,
  landing_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_referral_clicks_code ON public.referral_clicks (code, created_at DESC);
```

#### 2.2.1 Row Level Security

This project runs RLS least-privilege policies per migration (see
`20240816000000_rls_least_privilege.sql` and
`20240818000000_rls_reconciliation.sql`). New tables must be enabled and
policed in the same migration — never left as a permissive default.

```sql
ALTER TABLE public.referrals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks  ENABLE ROW LEVEL SECURITY;

-- Referrers may read their own referral rows (and the referees' names, for the
-- "people you referred" list). Referees may read nothing: their attribution is
-- private and would enable enumeration.
CREATE POLICY referrals_referrer_read ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid());

-- Rewards are visible only to their owner and to admins via private.is_admin_for().
CREATE POLICY referral_rewards_owner_read ON public.referral_rewards
  FOR SELECT USING (user_id = auth.uid());

-- Clicks are insert-only from the service/server path; nobody reads them
-- through PostgREST.
CREATE POLICY referral_clicks_no_client_access ON public.referral_clicks
  AS RESTRICTIVE FOR ALL USING (false);

-- The three tables above are written exclusively by server code through the
-- service-role / Hyperdrive path, which bypasses RLS by design. No INSERT,
-- UPDATE or DELETE policies are granted to anon or authenticated roles.
```

Admin reads go through Hono + `requireAdmin` + the service-role client, so no
admin RLS policy is required. This matches how `src/api/admin.ts` already reads
`auth.users`.

#### 2.2.2 `profiles.referral_count` as a cached counter

`referrals` is the source of truth; `profiles.referral_count` is a denormalised
counter for the current cycle, updated in the **same transaction** as the
referral insert so the two can never drift.

```sql
CREATE OR REPLACE FUNCTION public.credit_referral(
  p_referee_id  uuid,
  p_referral_code text,
  p_ip           inet  DEFAULT NULL,
  p_user_agent   text  DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_referrer_id uuid;
  v_referrer_cycle integer;
  v_referral_id uuid;
BEGIN
  SELECT referred_by INTO v_referrer_id
    FROM public.profiles WHERE id = p_referee_id;

  -- Unattributed, or the user referred themselves.
  IF v_referrer_id IS NULL OR v_referrer_id = p_referee_id THEN
    RETURN NULL;
  END IF;

  SELECT referral_cycle INTO v_referrer_cycle
    FROM public.profiles WHERE id = v_referrer_id;

  INSERT INTO public.referrals
    (referrer_id, referee_id, referral_code, cycle, status, ip_address, user_agent)
  VALUES
    (v_referrer_id, p_referee_id, p_referral_code, v_referrer_cycle, 'credited', p_ip, p_user_agent)
  ON CONFLICT (referee_id) DO NOTHING          -- R-5: at most one referrer, ever
  RETURNING id INTO v_referral_id;

  IF v_referral_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.profiles
    SET referral_count = referral_count + 1,
        updated_at = now()
    WHERE id = v_referrer_id;

  RETURN v_referral_id;
END;
$$;
```

`SECURITY DEFINER` with a pinned `search_path` matches the hardened pattern
already used by `public.is_admin()` and documented in
`src/middleware/security.ts:64-120`. The `ON CONFLICT (referee_id) DO NOTHING`
plus the `referral_id IS NULL` guard makes concurrent double-credit impossible.

### 2.3 Referral code generation

Format: `SEALIFY-<6 chars>` from an unambiguous alphabet (no `0/O`, `1/I/L`,
`5/S`, `8/B`) — this matters because users will read these aloud or retype them.

Codes are **permanent** and never rotated. A rotated code would break links
already shared across a college network, which is precisely the audience R-2
targets.

```ts
// src/lib/referralCode.ts
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // 31 chars, no look-alikes

export function generateReferralCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let out = '';
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `SEALIFY-${out}`;
}
```

`crypto.getRandomValues` is available in Workers, in the browser and in
Node 22 — no import needed. Codes are stored uppercase-normalised.

**Backfill:** existing users have `referral_code = NULL`. Migration must
generate codes for them:

```sql
DO $$
DECLARE
  p record;
  v_code text;
BEGIN
  FOR p IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    LOOP
      v_code := 'SEALIFY-' ||
        upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE referral_code = v_code
      );
    END LOOP;
    UPDATE public.profiles SET referral_code = v_code WHERE id = p.id;
  END LOOP;
END $$;
```

(The production path should use the same 31-char alphabet as the app; if the
`md5` fallback above is used, the alphabet differs slightly but remains unique
by the uniqueness check. Replace with a `SECURITY DEFINER` function for
consistency before shipping.)

Then make the column effectively required:

```sql
ALTER TABLE public.profiles ALTER COLUMN referral_code SET NOT NULL;
```

If Supabase Realtime is used for the live counter (R-3), add `referrals` to the
`supabase_realtime` publication.

### 2.4 Referral capture flow

```
Land on  ${siteUrl}/?ref=SEALIFY-ABC123
   │
   ├─ src/pages/Index.tsx useEffect: read ?ref, validate /^SEALIFY-[A-Z0-9]{6}$/
   │    ├─ malformed → ignore silently
   │    └─ valid → POST /api/referrals/click { code }   (fire-and-forget)
   │               + sessionStorage.setItem('sealify_ref', code)  (30-day TTL)
   │
   ├─ src/components/RegisterForm.tsx reads sessionStorage on mount,
   │    shows "🎁 {{referrerFirstName}} invited you" banner
   │    and submits referralCode with the registration payload
   │
   ├─ POST /api/auth/register  (src/api/auth.ts:76)
   │    ├─ registerSchema gains optional referralCode
   │    ├─ after the profiles INSERT commits:
   │    │    SELECT public.credit_referral(userId, code, ip, ua)
   │    │    → referral row + referral_count increment, one transaction
   │    ├─ ensure the new user has their OWN referral_code (they can refer too)
   │    └─ dispatch welcome email (Part 1) with THEIR OWN code
   │
   └─ OAuth / magic-link path (src/pages/AuthCallback.tsx, ProfileComplete.tsx)
        └─ src/api/auth.ts profile-complete must ALSO accept and apply
           referralCode, otherwise every OAuth signup silently loses attribution
```

Two details that are easy to get wrong and must be covered:

- **`AuthModal`/`RegisterForm` are the only client entry points today.** Check
  `src/components/AuthModal.tsx` and `src/components/RegisterForm.tsx` for any
  secondary signup form (e.g. inline on `ProfileComplete.tsx`) and apply the
  same capture.
- **Attribution must survive a page reload between landing and signing up** —
  hence `sessionStorage` rather than component state. A user who bookmarks the
  site and registers days later still has a 30-day window to be credited.

`referral_clicks` are recorded so an Admin reviewing a suspicious reset can see
whether a code had organic traffic or was mass-shared to a single source.

### 2.5 API surface

New router `src/api/referrals.ts`, registered in the `routeMap` at
`functions/api/[[path]].ts:41-62`:

```ts
['/referrals', () => import('../../src/api/referrals')],
```

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/referrals/click` | none, `rateLimit` 30/hr | Record a landing click |
| `GET` | `/api/referrals/me` | `requireAuth` | Caller's own stats (below) |
| `GET` | `/api/referrals/validate?code=` | none | Pre-signup validation for the invite banner |
| `GET` | `/api/admin/referrals` | `requireAdmin` | Platform-wide ledger |
| `GET` | `/api/admin/referrals/:userId` | `requireAdmin` | One user's full referral history |
| `POST` | `/api/admin/referrals/:userId/grant` | `requireAdmin` | **Grant reward + reset count + new cycle** |
| `GET` | `/api/admin/referrals/stats` | `requireAdmin` | Aggregate counters |

#### 2.5.1 `GET /api/referrals/me` — R-3 payload

```jsonc
{
  "referralCode": "SEALIFY-ABC123",
  "referralLink": "https://sealify.ng/?ref=SEALIFY-ABC123",
  "referralCount": 4,          // current cycle — what the dashboard shows
  "lifetimeReferralCount": 11, // all cycles, for the "you've earned" line
  "cycle": 2,
  "rewardThreshold": 3,        // from system_configs
  "progressToReward": 1,       // max(0, threshold - referralCount)
  "nextRewardAt": 3,
  "referrals": [               // most recent first, max 25
    {
      "refereeId": "uuid",
      "refereeName": "Adebayo O.",
      "refereeAvatarUrl": "...",
      "cycle": 2,
      "createdAt": "2026-10-05T09:12:00Z"
    }
  ],
  "rewardHistory": [
    { "cycle": 1, "referralsAtGrant": 3, "grantedAt": "2026-09-30T11:00:00Z" }
  ]
}
```

Referrer name is truncated server-side (`LEFT(full_name, 40)`); the full value is
never exposed to the referrer. Returns `200` with a fully zeroed payload rather
than `404` when the caller has no code, so the client renders a stable layout.

#### 2.5.2 `POST /api/admin/referrals/:userId/grant` — R-7, the core admin action

One endpoint performs grant + reset + cycle advance, atomically, so the count
can never be zeroed without a corresponding recorded reward.

```sql
CREATE OR REPLACE FUNCTION public.grant_referral_reward(
  p_user_id uuid,
  p_granted_by uuid,
  p_note text DEFAULT NULL
) RETURNS TABLE (cycle integer, referrals_at_reset integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_cycle integer;
  v_count integer;
BEGIN
  SELECT referral_cycle, referral_count INTO v_cycle, v_count
    FROM public.profiles WHERE id = p_user_id FOR UPDATE;   -- serialises concurrent grants

  INSERT INTO public.referral_rewards (user_id, cycle, referrals_at_reset, granted_by, note)
  VALUES (p_user_id, v_cycle, v_count, p_granted_by, p_note)
  ON CONFLICT (user_id, cycle) DO NOTHING;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward already granted for cycle %', v_cycle
      USING ERRCODE = 'unique_violation';
  END IF;

  UPDATE public.profiles
    SET referral_count = 0,
        referral_cycle = v_cycle + 1,
        updated_at = now()
    WHERE id = p_user_id;

  RETURN QUERY SELECT v_cycle, v_count;
END;
$$;
```

`FOR UPDATE` plus the `UNIQUE (user_id, cycle)` constraint makes a
double-click or two concurrent admins safe: the second call raises and the route
returns `409`, rather than silently burning a cycle.

Handler requirements:

- `requireAdmin`. Authorization via `public.is_admin()` only
  (`src/middleware/security.ts:124`) — never trust a `role` field from the body.
- Optional confirmation body: `{ note?: string, confirm: true }`. `confirm: true`
  is required to guard against accidental invocation.
- Optional gate: reject with `400` if `referral_count < rewardThreshold`, unless
  `override: true` is passed. Admins should be able to award a good-faith
  exception, but it must be explicit and audited.
- On success: `auditLog(sql, c.get('user').id, "Referral Reward Granted",
  \`User ${id} | cycle ${v_cycle} | ${v_count} referrals | note: ${note}\`, "referral")`.
- Return `200 { success: true, cycle: n, referralsAtReset: n, newCount: 0 }`.

**`auditLog` requires a type change.** The `type` parameter is a TypeScript
union at `src/middleware/security.ts:244` that does not include `"referral"`.
Add it. The `audit_logs.type` column is a plain `text NOT NULL` with no CHECK
constraint (`20260820000000_canonical_sealify_schema.sql:310`), so **no database
migration is needed for this** — only the TS union must widen, otherwise the
build fails at `tsc --noEmit`.

#### 2.5.3 `GET /api/admin/referrals` — R-6

Follows the `GET /api/admin/users` pattern at `src/api/admin.ts:162-259`
(search / filter / limit / offset, `sql.unsafe` with positional `$n`
placeholders and an accumulating `paramIndex`).

| Query param | Default | Notes |
|---|---|---|
| `search` | — | Matches full name, email, or referral code |
| `cycle` | — | Filter by current cycle |
| `hasReferrals` | — | `true` / `false` |
| `minCount` | — | Sort/filter for reward-ready users |
| `sort` | `referral_count` | `referral_count`, `lifetime_count`, `created_at`, `full_name` |
| `order` | `desc` | `asc` / `desc` |
| `limit` / `offset` | `50` / `0` | `limit` capped at 200, matching `src/api/admin.ts:194` |

Row shape extends the existing admin user row with:

```jsonc
{
  "id": "uuid",
  "full_name": "...",
  "email": "...",
  "referralCode": "SEALIFY-ABC123",
  "referralCount": 4,
  "lifetimeReferralCount": 11,
  "referralCycle": 2,
  "rewardThreshold": 3,
  "rewardEligible": true,
  "lastRewardAt": "2026-09-30T11:00:00Z",
  "referredByCode": "SEALIFY-ZZZ999"
}
```

`referralCount` and `referralCycle` are carried on `profiles`, so the existing
admin user list can be extended with two extra selected columns. Where
`lifetimeReferralCount` and `lastRewardAt` are needed, `LEFT JOIN` against a
per-user aggregate subquery on `referrals` / `referral_rewards`.

#### 2.5.4 `GET /api/admin/referrals/stats` — R-6 dashboard header

```jsonc
{
  "totalReferrals": 412,
  "referringUsers": 188,      // users with lifetimeReferralCount > 0
  "rewardEligibleUsers": 23,  // current cycle count >= threshold
  "rewardsGranted": 41,
  "referralToSignupRate": 0.31,
  "topReferrers": [ { "userId": "uuid", "fullName": "...", "referralCode": "...", "lifetimeReferralCount": 12 } ]
}
```

### 2.6 Threshold configuration

Stored in the existing `system_configs` key/value table
(`20260820000000_canonical_sealify_schema.sql:334`):

```sql
INSERT INTO public.system_configs (key, value, description) VALUES
  ('referral_reward_threshold', '3'::jsonb,
   'Credited referrals required before a user may be granted the free promotional ad month.')
ON CONFLICT (key) DO UPDATE SET updated_at = now();
```

Read it in one place (`src/lib/referralConfig.ts`) with a cached fallback to
`3`, and expose it for edit in the Admin Pane alongside the existing
`/api/admin/system-config` GET/PUT routes (`src/api/admin.ts:648-670`). This
satisfies R-10 without a deploy.

### 2.7 Client UI

All components use shadcn/ui primitives plus Tailwind, per `AI_RULES.md`, and
are registered in `src/App.tsx` (which `AI_RULES.md` explicitly requires) if a
new route is introduced.

#### 2.7.1 `src/components/referral/ReferralCard.tsx` — R-2, profile integration

Placement: a new section on the **Settings** page (`src/pages/Settings.tsx`),
immediately after the profile/business section and before "Trust, Verification &
Password", following that file's existing section-heading idiom
(`text-lg font-black text-white flex items-center gap-2 pb-3 border-b border-slate-800`).
Profile is where the user manages their identity and where a shareable link
belongs; the dashboard card below handles progress.

Contents:

| Element | shadcn primitive | Notes |
|---|---|---|
| Section heading | — | `Gift` icon from `lucide-react` |
| Referral link readout | `Input` (`readOnly`) | Shows the full URL; selected on focus |
| Copy button | `Button` + `Copy` icon | `navigator.clipboard.writeText`; swaps to `Check` + "Copied" for 2s |
| Share buttons | `Button` (3) | WhatsApp, X, Facebook — `window.open` with prefilled text |
| Native share | `Button` | `navigator.share()` when `Share` API exists; hidden otherwise |
| Progress | `Progress` | `referralCount / rewardThreshold`, plus "N more to your free month" |
| Referred list | — | Up to 25 avatars + names + relative timestamps |
| Reward history | `Badge` | Cycles already granted |
| Disclaimer | `Alert` | Sole-discretion wording, matching the email verbatim |

All share links must URL-encode both the referral URL and the message text, and
open with `noopener,noreferrer`. The copy path needs a non-clipboard fallback
(`document.execCommand('copy')`) because clipboard access requires a secure
context and can be blocked by permissions policy.

#### 2.7.2 `src/components/referral/ReferralCountBadge.tsx` — R-3, dashboard

A real-time counter for the user dashboard. "Dashboard" here maps to the
signed-in home surface: `src/pages/Index.tsx` when a user is authenticated, and
`src/pages/MyAds.tsx` / `src/pages/Settings.tsx` as secondary placements.

Data flow:

1. `useQuery(['referral-me'])` → `GET /api/referrals/me` via `src/lib/api-client.ts`.
2. `refetchInterval: 30000` for a safety net.
3. **Real-time:** subscribe to `postgres_changes` on `referrals` filtered by
   `referrer_id = auth.uid()` through the existing `src/hooks/useRealtime.ts`;
   on any event, `queryClient.invalidateQueries({ queryKey: ['referral-me'] })`.
4. `@tanstack/react-query` is already a dependency
   (`package.json:55`), and `@supabase/supabase-js` exposes `channel()`.

Realtime is an enhancement, not a dependency: the 30s poll alone satisfies the
requirement, so a Realtime subscription failure degrades gracefully rather than
breaking the dashboard. The RLS policy at §2.2.1 guarantees the subscriber only
ever receives their own rows.

Display: a `Card` with `Users` icon, the count in `text-3xl font-black`, label
"People referred", a `Badge` reading `{count} to go` when a reward is pending,
and a link to the full referral card in Settings.

#### 2.7.3 Admin UI — R-6, R-7

1. **Extend `GET /api/admin/users`** (`src/api/admin.ts:202-247`) to also
   `SELECT p.referral_code, p.referral_count, p.referral_cycle`.
2. **Add two columns** to the existing users table: "Referrals" (count + cycle
   badge) and an actions menu with **"Grant reward & reset"**.
3. **New dedicated tab** in `src/pages/AdminDashboard.tsx`:
   - Extend the `activeTab` union at line 106 with `'referrals'`.
   - Add an entry to the `tabs` array at line 355 (lucide `Users` or `Gift`
     icon), matching the shape of the existing entries.
   - Add a `case 'referrals':` branch to the `switch (activeTab)` at line 626.
   - Render `src/components/admin/AdminReferralsPanel.tsx`: stat cards
     (§2.5.4), a searchable / sortable / paginated shadcn `Table` of users with
     referral data, and a reward-ready filter.

**Grant-and-reset dialog** (`src/components/admin/GrantReferralRewardDialog.tsx`):

- Built on `AlertDialog` — this is a consequential, irreversible action.
- Shows the user's name, current cycle, current count, threshold, and the exact
  consequence in plain language: *"This records a reward for cycle N, sets the
  referral count to 0, and starts cycle N+1. Referral history is retained."*
- Optional free-text `note`, stored on `referral_rewards.note`.
- Optional `override` checkbox when `count < threshold`, with its own warning.
- On success: `toast.success` (via `sonner`, already wired through
  `src/components/ToasterWrapper.tsx`), `refetch` the list and the stats, and
  optimistically update the affected row's count to `0` with an incremented
  cycle badge.
- On `409` (already granted): `toast.error("Reward already granted for this
  cycle")` and `refetch`.

Add the referral panel to the Admin quick-action grid at
`src/pages/AdminDashboard.tsx:670-676`, alongside "Manage Users".

**Reward fulfilment is deliberately not automated.** The spec makes the free
promo month discretionary to the Root System Admin, so granting the reset does
**not** itself create a promotion. The dialog must state that promotion remains a
separate manual step (existing `PUT /api/admin/promotions/:id`,
`src/api/admin.ts:541`), preventing an admin from assuming the reset applied the
discount.

### 2.8 Audit trail

Every referral-sensitive operation writes to `audit_logs`:

| Action | Type | When |
|---|---|---|
| `Referral Credited` | `referral` | On successful `credit_referral` |
| `Referral Click Tracked` | `user` | Click recorded (rate-limited, high volume) |
| `Referral Reward Granted` | `referral` | Admin grant + reset |
| `Welcome Email Queued` | `user` | Outbox insert |
| `Welcome Email Resent` | `broadcast` | Admin re-send |

Reminder: add `"referral"` to the union at `src/middleware/security.ts:244`.
`auditLog` itself is already failure-tolerant — it catches and logs
(`src/middleware/security.ts:252-255`) — so an audit failure never breaks a
signup or an admin action.

---

## 3. Implementation sequence

Ordered so each step is independently verifiable and the email never ships
before the referral link it depends on.

| # | Step | Deliverable | Verify |
|---|---|---|---|
| 1 | Migration | `20261005000000_referral_and_welcome_email.sql` — tables, indexes, RLS, `credit_referral()`, `grant_referral_reward()`, code backfill, `system_configs` seed | Apply to staging; `SELECT` code uniqueness |
| 2 | Audit union | Add `"referral"` to `src/middleware/security.ts:244` | `npm run check` |
| 3 | Code issuance | `src/lib/referralCode.ts`; ensure a code is minted in `/auth/register` and `/auth/profile-complete` | Sign up; confirm a code exists |
| 4 | Referral capture | `src/api/referrals.ts` + route registration + `?ref=` capture in `Index.tsx` + banner in `RegisterForm.tsx` | Land with `?ref=`, register, confirm credit |
| 5 | User APIs | `GET /api/referrals/me`, `/click`, `/validate` | `curl` with a user token |
| 6 | Email | `src/server/emailTemplates/welcome.ts`; outbox drain; `/api/email/welcome`; wire into `/auth/register`; provider config in `wrangler.toml` + `.env.example` | Sign up against staging; receive the email |
| 7 | User UI | `ReferralCard.tsx`, `ReferralCountBadge.tsx`, Settings section, dashboard placement | Visual + copy-check the disclaimer |
| 8 | Admin APIs | `GET /api/admin/referrals`, `/stats`, `/referrals/:userId`, `POST .../grant`; extend `/admin/users` columns | `curl` with an admin token |
| 9 | Admin UI | `AdminReferralsPanel.tsx`, `GrantReferralRewardDialog.tsx`, new tab, quick action | Grant → count resets, cycle increments |
| 10 | Hardening | Deliverability check, rate-limit tuning, RLS verification, audit review | Full pass below |

---

## 4. Acceptance criteria

### Welcome email

- **AC-W1** Registering a new user with no email binding configured returns `201` and still creates the profile and session — email failure is invisible to the client.
- **AC-W2** Simulating an SMTP failure during signup leaves registration fully successful, logs a warning, and leaves an `email_outbox` row in `pending`.
- **AC-W3** The delivered email contains the user's actual first name.
- **AC-W4** No rendered output, log line, `auditLog` entry or outbox `payload` contains the signup password. Verified by grepping the rendered HTML for the test password.
- **AC-W5** The email contains the phrase "completely free" and the explicit "only costs you money if, and when, you choose to subscribe to promotional ad listings" claim.
- **AC-W6** The email covers all five educational outcomes: **sales**, **inquiries**, **leads**, **customers**, **promotional ad subscriptions**.
- **AC-W7** The email targets friends, family and college networks, and renders the user's unique referral link matching `profiles.referral_code`.
- **AC-W8** The email states "one (1) month of free promotional ad listings" and the sole-discretion-of-the-Root-System-Admin disclaimer, verbatim, in both HTML and plaintext.
- **AC-W9** Renders without layout breakage in Outlook 2019+ desktop, Gmail web, Gmail mobile, Apple Mail, and Outlook.com.
- **AC-W10** Dark mode shows readable text with no white-on-white inversion.
- **AC-W11** `text/plain` alternative is present and contains every factual claim from the HTML.
- **AC-W12** No client-visible JS error; email HTML never reaches the client bundle.
- **AC-W13** Re-running the dispatch for the same user does not produce a second email (unique index enforced).

### Referral system

- **AC-R1** Every user — new and pre-existing — has a unique, uppercase `SEALIFY-XXXXXX` code; zero duplicates, zero nulls.
- **AC-R2** Two users never receive the same code across a 10,000-row generation run.
- **AC-R3** Landing on `/?ref=<valid>` then registering produces exactly one `referrals` row and increments the referrer's `referral_count` by exactly 1.
- **AC-R4** A user referring themselves yields no referral row.
- **AC-R5** The same visitor registering twice (second email address) still yields one row; re-submitting the same code yields no increment.
- **AC-R6** A user already attributed to referrer A cannot be re-attributed to referrer B.
- **AC-R7** Concurrent duplicate credits for one referee produce exactly one row and one increment.
- **AC-R8** The Settings referral link, when copied, pastes back exactly and, when opened in a logged-out browser, attributes the next signup.
- **AC-R9** `GET /api/referrals/me` returns the correct count, cycle, threshold and progress.
- **AC-R10** A new referral via Realtime updates the dashboard counter with no page reload, and within 30s even with Realtime unavailable.
- **AC-R11** `GET /api/referrals/me` returns `401` without a bearer token and never returns another user's data.
- **AC-R12** The admin list shows referral data for every user, supports search by name/email/code, and paginates correctly at total > 200.
- **AC-R13** Granting a reward sets `referral_count` to `0`, increments `referral_cycle`, and writes one `referral_rewards` row and one `audit_logs` row.
- **AC-R14** Granting twice in the same cycle returns `409` and changes nothing.
- **AC-R15** Two concurrent grants produce exactly one reward row.
- **AC-R16** Historical `referrals` rows survive a reset; `lifetimeReferralCount` is unchanged by a reset.
- **AC-R17** The grant dialog requires explicit confirmation and states that promotion remains a separate manual step.
- **AC-R18** `POST /api/admin/referrals/:userId/grant` returns `403` for a valid non-admin user and `401` for no token.
- **AC-R19** A referrer cannot read their referees' referral rows through Supabase PostgREST (`403`).
- **AC-R20** No client can insert into `referrals` or `referral_rewards` via the anon key.
- **AC-R21** `npm run check` passes with zero warnings; no new ESLint suppressions.
- **AC-R22** The referral-link query parameter survives an in-app navigation between landing and signup.

---

## 5. Testing approach

The repository has **no configured test runner** — `package.json` defines
`dev`, `build`, `preview`, `deploy`, `lint`, `typecheck`, `check`, and
`cf-typegen`, with no `test` script; the only test-named file is
`src/lib/env.test.ts`. This document therefore does **not** assume a harness.

- **Gate on every step:** `npm run check`.
- **Database logic:** execute the acceptance SQL directly against staging via
  `supabase` psql or Hyperdrive. `credit_referral()` and
  `grant_referral_reward()` are pure SQL and can be verified with explicit
  `BEGIN`/`ROLLBACK` blocks, which is the fastest way to prove AC-R4 through
  AC-R7 and AC-R15.
- **API:** `curl` against the Wrangler dev server (`npm run dev:pages`,
  proxying `/api` to `localhost:8788` per `vite.config.ts:73-79`) using a token
  from `/api/auth/login` and an admin token from `/api/auth/admin-login`.
- **Email:** render via `renderWelcomeHtml` in a scratch `tsx` script and
  inspect; for real delivery, send to a seed inbox and check SPF/DKIM/DMARC
  alignment.
- **UI:** manual verification against the acceptance list.

If the team wants durable coverage of `credit_referral` and
`grant_referral_reward`, the lowest-friction addition is a `supabase test pg`
(pgtap) suite — it needs no new npm dependency and runs against the same
migrations. Recommended as a follow-up, out of scope here.

---

## 6. Risks and mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Plaintext password in email | **Critical** | §1.2 — password never transmitted; secure reset link instead. Grep gate in AC-W4. |
| Welcome email hardcoded to a domain | High | Derive base URL by stripping the suffix from `c.req.url`, as `src/api/auth.ts:617` already does. |
| Email silently undelivered (no binding in `wrangler.toml`) | High | §1.7 — provider binding + DNS verification before launch; outbox makes failures visible. |
| `/api/email/welcome` abused as an open relay | High | Accept `userId` only; resolve recipient server-side; internal-token guard. |
| Signup latency or failure from email work | High | Outbox insert only in the request path; drain after response. |
| Referral self-farming | Medium | DB constraints (`referrals_no_self_referral`, `referee_id UNIQUE`), click analytics for review, `pending_review` status reserved. Reward remains discretionary by design. |
| Client bypass of admin checks | Medium | All admin routes behind `requireAdmin` → `public.is_admin()`; never trust body fields. |
| Double reward grant | Medium | `FOR UPDATE` + `UNIQUE (user_id, cycle)`; `409` on conflict. |
| Drift between `referrals` and `profiles.referral_count` | Medium | Both written in one `SECURITY DEFINER` transaction; periodic reconciliation query in the admin stats panel. |
| RLS omission leaves tables world-readable | Medium | §2.2.1 enables RLS and defines policies in the same migration; AC-R19/R20 verify. |
| Realtime blocked by RLS | Low | Poll fallback; referrer has an explicit SELECT policy. |
| Missing env var breaks the drain | Low | `.env.example` + `.env.production.example` updated; drain degrades to `pending` with a logged error. |
| `auditLog` type union causes a build break | Low | Step 2 in the sequence; caught by `npm run check`. |

---

## 7. Open questions

1. **Referral threshold.** The brief states a reward *may* be granted but gives
   no number. This document defaults to **3** via
   `system_configs.referral_reward_threshold`. Confirm.
2. **"Root System Admin" scope.** Does this mean *any* account for which
   `public.is_admin()` is true, or a narrower root tier? §2.5.2 assumes any
   `requireAdmin` principal may grant, and treats the Root System Admin as the
   final approving authority implied by the grant itself. If a narrower tier is
   intended, add `is_root_admin()` and gate the grant behind it — the surrounding
   logic is unchanged.
3. **Does a reset also apply the promotion?** Currently **no** (§2.7.3): the
   reset records the reward and opens a new cycle; promotion remains a separate
   admin action. Confirm, since silently free-granting a month of paid promo
   inventory would create direct revenue leakage.
4. **Attribution window.** No expiry on an unclaimed referral code. Accept, or
   cap `?ref=` validity (e.g. 30 days, enforced in `referral_clicks`)?
5. **OAuth coverage.** Are magic-link and social signups in scope for referral
   attribution? §2.4 assumes yes (`profile-complete` is updated). Confirm.
6. **Multi-user referral links.** Should a user be able to track separate links
   per channel (WhatsApp vs. X)? The current single permanent code cannot.
7. **Email sending frequency ceiling.** `emailRateLimit` is 100/hour
   (`src/api/email.ts:11`), and the admin broadcast loop at `src/api/email.ts:233`
   sends serially. Confirm a bulk re-send will not hit provider or rate limits.

---

## 8. Out of scope

- Automated granting of the free promotional ad month (discretionary by design).
- Multi-level or chain referrals.
- Referral leaderboards for end users.
- SMS / WhatsApp / push delivery of the referral CTA (the multi-channel
  primitives already exist in `src/api/email.ts`; adding them is a separate
  change).
- A/B testing of subject lines or email content.
- Migrating existing `nodemailer` usage (the dependency exists at
  `package.json:24` but is not used by the current Cloudflare Email Service path).
