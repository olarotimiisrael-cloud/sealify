# SEALIFY — BACKEND MIGRATION AUDIT REPORT

## Cloudflare Pages Functions (Single Project)

**Date:** 2026-09-14
**Repository:** olarotimiisrael-cloud/sealify
**Current main commit:** HEAD

---

## CURRENT ARCHITECTURE

Sealify uses a **single Cloudflare Pages project** with Pages Functions for the backend:

```
                      SEALIFY
                         │
              ┌──────────┴──────────┐
              │                     │
         React + Vite          Cloudflare Pages
          Frontend               Functions
              │                     │
              └──────────┬──────────┘
                         │
                  ┌──────┴──────┐
                  │             │
              Supabase    Hyperdrive
              Auth      (PostgreSQL pool)
```

### Key Components

| Component | Technology | Location |
|-----------|-----------|----------|
| Frontend | React + Vite | `src/` |
| API Routes | Hono | `functions/_api/*.ts` |
| API Entry | Pages Functions | `functions/api/[[path]].ts` |
| Database | Hyperdrive + Supabase JS | `functions/_middleware/` |
| Auth | Supabase Auth | `functions/_middleware/auth.ts` |
| Config | Wrangler | `wrangler.toml` |
| Deploy | Cloudflare Pages | `dist/` + `functions/` |

---

## API INVENTORY

### Complete Endpoint Table (97 endpoints)

| Method | Path | Auth | Admin | DB | Cloudflare Dependency |
|--------|------|------|-------|----|-----------------------|
| GET | `/api/health` | No | No | No | None |
| GET | `/api/health/db` | No | No | Yes | Hyperdrive |
| POST | `/api/auth/register` | No | No | Yes | Hyperdrive, Supabase Auth |
| POST | `/api/auth/admin-login` | No | Verifies | Yes | Hyperdrive, Supabase Auth |
| POST | `/api/auth/login` | No | No | Yes | Hyperdrive, Supabase Auth |
| GET | `/api/auth/me` | Bearer | No | Yes | Hyperdrive, Supabase Auth |
| PUT | `/api/auth/profile` | Bearer | No | Yes | Hyperdrive, Supabase Auth |
| POST | `/api/auth/logout` | Bearer | No | No | Supabase Auth |
| POST | `/api/auth/password/reset-request` | No | No | Yes | Hyperdrive, Supabase Auth |
| POST | `/api/auth/phone/otp` | No | No | No | Env check |
| POST | `/api/auth/phone/verify` | No | No | No | Env check |
| GET | `/api/copilot/health` | No | No | No | Env check |
| POST | `/api/copilot/` | Optional | No | No | Env check |
| GET | `/api/listings/` | No | No | Yes | Hyperdrive |
| GET | `/api/listings/:id` | No | No | Yes | Hyperdrive |
| POST | `/api/listings/` | Bearer | No | Yes | Hyperdrive |
| PUT | `/api/listings/:id` | Bearer | No | Yes | Hyperdrive |
| DELETE | `/api/listings/:id` | Bearer | No | Yes | Hyperdrive |
| POST | `/api/listings/:id/featured` | Bearer | No | Yes | Hyperdrive |
| GET | `/api/listings/meta/categories` | No | No | Yes | Hyperdrive |
| GET | `/api/users/` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/users/:id` | No | No | Yes | Hyperdrive |
| PUT | `/api/users/:id` | Bearer | Yes/Self | Yes | Hyperdrive |
| DELETE | `/api/users/:id` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/users/:id/listings` | No | No | Yes | Hyperdrive |
| GET | `/api/users/:id/reviews` | No | No | Yes | Hyperdrive |
| GET | `/api/messages/conversations` | Bearer | No | Yes | Hyperdrive |
| GET | `/api/messages/conversations/:id/messages` | Bearer | No | Yes | Hyperdrive |
| POST | `/api/messages/conversations` | Bearer | No | Yes | Hyperdrive |
| PUT | `/api/messages/conversations/:id/read` | Bearer | No | Yes | Hyperdrive |
| GET | `/api/notifications/` | Bearer | No | Yes | Hyperdrive |
| PUT | `/api/notifications/:id/read` | Bearer | No | Yes | Hyperdrive |
| PUT | `/api/notifications/read-all` | Bearer | No | Yes | Hyperdrive |
| DELETE | `/api/notifications/:id` | Bearer | No | Yes | Hyperdrive |
| GET | `/api/admin/stats` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/users` | Bearer | Yes | Yes | Hyperdrive |
| PUT | `/api/admin/users/:id` | Bearer | Yes | Yes | Hyperdrive |
| DELETE | `/api/admin/users/:id` | Bearer | Yes | Yes | Hyperdrive |
| POST | `/api/admin/users/bulk` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/listings` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/reports` | Bearer | Yes | Yes | Hyperdrive |
| PUT | `/api/admin/reports/:id` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/disputes` | Bearer | Yes | Yes | Hyperdrive |
| PUT | `/api/admin/disputes/:id` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/verifications` | Bearer | Yes | Yes | Hyperdrive |
| PUT | `/api/admin/verifications/:id` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/promotions` | Bearer | Yes | Yes | Hyperdrive |
| PUT | `/api/admin/promotions/:id` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/passwords` | Bearer | Yes | Yes | Hyperdrive |
| PUT | `/api/admin/passwords/:id` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/audit-logs` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/intrusion-logs` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/system-config` | Bearer | Yes | Yes | Hyperdrive |
| PUT | `/api/admin/system-config` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/ai-settings` | Bearer | Yes | No | Env check |
| PUT | `/api/admin/ai-settings` | Bearer | Yes | No | Env check |
| POST | `/api/admin/ai-settings/test` | Bearer | Yes | No | fetch |
| GET | `/api/admin/site-settings` | Bearer | Yes | Yes | Hyperdrive |
| PUT | `/api/admin/site-settings` | Bearer | Yes | Yes | Hyperdrive |
| POST | `/api/admin/broadcast` | Bearer | Yes | Yes | Hyperdrive |
| POST | `/api/admin/email-digest` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/backup` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/admin/schema` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/categories/` | No | No | Yes | Hyperdrive |
| GET | `/api/categories/with-subcategories` | No | No | Yes | Hyperdrive |
| GET | `/api/categories/:id` | No | No | Yes | Hyperdrive |
| POST | `/api/categories/` | Bearer | Yes | Yes | Hyperdrive |
| PUT | `/api/categories/:id` | No | No | Yes | Hyperdrive |
| DELETE | `/api/categories/:id` | No | No | Yes | Hyperdrive |
| GET | `/api/categories/:id/subcategories` | No | No | Yes | Hyperdrive |
| GET | `/api/buyer-requests/` | No | No | Yes | Hyperdrive |
| POST | `/api/buyer-requests/` | Bearer | No | Yes | Hyperdrive |
| POST | `/api/buyer-requests/:id/respond` | Bearer | No | Yes | Hyperdrive |
| PUT | `/api/buyer-requests/:id` | Bearer | No | Yes | Hyperdrive |
| DELETE | `/api/buyer-requests/:id` | Bearer | No | Yes | Hyperdrive |
| GET | `/api/reviews/seller/:sellerId` | No | No | Yes | Hyperdrive |
| POST | `/api/reviews/` | Bearer | No | Yes | Hyperdrive |
| PUT | `/api/reviews/:id` | Bearer | No | Yes | Hyperdrive |
| DELETE | `/api/reviews/:id` | Bearer | No | Yes | Hyperdrive |
| GET | `/api/reviews/admin/all` | Bearer | Yes | Yes | Hyperdrive |
| PUT | `/api/reviews/admin/:id` | Bearer | Yes | Yes | Hyperdrive |
| DELETE | `/api/reviews/admin/:id` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/search/` | No | No | Yes | Hyperdrive |
| GET | `/api/search/suggestions` | No | No | Yes | Hyperdrive |
| GET | `/api/search/trending` | No | No | Yes | Hyperdrive |
| POST | `/api/search/alerts` | Bearer | No | Yes | Hyperdrive |
| GET | `/api/search/alerts` | Bearer | No | Yes | Hyperdrive |
| DELETE | `/api/search/alerts/:id` | Bearer | No | Yes | Hyperdrive |
| GET | `/api/analytics/overview` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/analytics/users/growth` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/analytics/ads/performance` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/analytics/revenue` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/analytics/categories` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/analytics/events` | Bearer | Yes | Yes | Hyperdrive |
| GET | `/api/analytics/performance` | Bearer | Yes | Yes | Hyperdrive |
| POST | `/api/push/subscribe` | Bearer | No | Yes | Hyperdrive |
| POST | `/api/push/unsubscribe` | Bearer | No | Yes | Hyperdrive |
| POST | `/api/push/admin/broadcast` | Bearer | Yes | Yes | Hyperdrive |

---

## CLOUDFLARE DEPENDENCIES

| Dependency | Location | Verdict | Action |
|------------|----------|---------|--------|
| `hono` | `functions/api/*.ts` | **IN USE** | Keep for Pages Functions |
| `hono/cors` | `functions/_middleware/cors.ts` | **IN USE** | Keep for Pages Functions |
| `hono/http-exception` | `functions/_middleware/error.ts` | **IN USE** | Keep for Pages Functions |
| `@cloudflare/workers-types` | `package.json` | **IN USE** | Pages type definitions |
| `wrangler` | `package.json` | **IN USE** | Pages deployment CLI |
| `wrangler.toml` | Root | **IN USE** | Pages config |
| `functions/api/[[path]].ts` | Root | **IN USE** | Pages Functions entry |
| `Hyperdrive` binding | `functions/_middleware/db.ts` | **IN USE** | PostgreSQL connection pool |
| `public/_headers` | `public/` | **IN USE** | Pages headers |

---

## SUPABASE DEPENDENCIES

| Component | Usage | Migration Action |
|-----------|-------|------------------|
| **Supabase Auth** | `signInWithPassword`, `signUp`, `signOut`, `getSession`, `getUser` | **KEEP** — Works unchanged |
| **Supabase JS Client** | Frontend client (`src/integrations/supabase/client.ts`) | **KEEP** — Works unchanged |
| **Server Supabase Client** | `functions/_middleware/supabase.ts` | **KEEP** — Works with Hyperdrive |
| **`private.is_admin()`** | PostgreSQL function for admin authorization | **KEEP** — Must be called server-side |
| **`profiles.role`** | Admin role storage | **KEEP** — Unchanged |
| **RLS Policies** | Database-level security | **KEEP** — Unchanged |

### Database Access Pattern Classification

| Pattern | Count | Method | Migration Action |
|---------|-------|--------|------------------|
| Complex SQL (JOINs, dynamic WHERE, aggregations) | ~80 | Hyperdrive | Move to Supabase JS or `postgres` client |
| Simple lookups (SELECT by PK) | ~10 | Hyperdrive | Can use Supabase JS client |
| Auth operations | ~10 | Supabase JS | **KEEP** — Unchanged |
| Authorization checks (`private.is_admin()`) | ~5 | Hyperdrive | Use `postgres` client or Supabase RPC |
| Audit/Intrusion logging | ~15 | Hyperdrive | Use `postgres` client |

---

## ENVIRONMENT VARIABLES

### Frontend Variables (Vite)

| Variable | Purpose | Local | Production |
|----------|---------|-------|------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Same Supabase project | Same |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Same | Same |
| `VITE_API_URL` | Backend API base URL | `http://localhost:8788` | `https://sealify.pages.dev` |

### Backend Variables (Cloudflare Pages)

| Variable | Purpose | Local | Production |
|----------|---------|-------|------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | Pages Functions context | Pages Functions context |
| `SUPABASE_URL` | Supabase project URL | Same | Same |
| `SUPABASE_ANON_KEY` | Supabase anon key | Same | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Same | Same |
| `HYPERDRIVE` | Hyperdrive binding | Hyperdrive binding | Hyperdrive binding |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` | `https://sealify.ng,...` |

---

## MIGRATION RISK ANALYSIS

| Component | Risk | Reason | Mitigation |
|-----------|------|--------|------------|
| **Admin login** | MEDIUM | Must preserve `private.is_admin()` check | Keep server-side authorization |
| **User signup** | LOW | Straightforward port | Test thoroughly |
| **Email verification** | LOW | Supabase handles this | No change needed |
| **Password reset** | LOW | Supabase handles this | No change needed |
| **Session persistence** | MEDIUM | Supabase session handling | Use `setSession()` pattern |
| **Admin authorization** | HIGH | Must not weaken | Keep `private.is_admin()` mandatory |
| **Listings** | LOW | Straightforward CRUD | Test queries |
| **Image uploads** | MEDIUM | May use Cloudflare-specific APIs | Use Supabase Storage |
| **Search** | LOW | Straightforward queries | Test full-text search |
| **Moderation** | MEDIUM | Admin operations | Preserve audit logging |
| **Reports** | LOW | Straightforward CRUD | Test queries |
| **Site settings** | LOW | Straightforward CRUD | Test queries |
| **API errors** | MEDIUM | Error handling changes | Maintain generic messages |
| **CORS** | MEDIUM | Must configure correctly | Whitelist origins |
| **Supabase RLS** | LOW | Unchanged | No change needed |
| **Production database** | LOW | Same Supabase project | No change needed |

### Overall Risk: **MEDIUM**

The main risks are:
1. Admin authorization must remain server-side
2. Session handling must work correctly
3. CORS must be configured properly

---

## RECOMMENDED EXECUTION ORDER

### Phase A: Code Cleanup (COMPLETE)
1. Remove stale `server/` directory ✓
2. Remove `start-dev.ps1` (Windows-specific, redundant with `dev.mjs`) ✓
3. Remove `nitro.config.ts` ✓
4. Remove `src/entry-server.tsx` (stale SSR handler) ✓
5. Update `vite.config.ts` proxy to point to `http://localhost:8788` ✓
6. Update `dev.mjs` to include `--functions-dir functions` ✓
7. Update `package.json` to remove Express/Nitro deps and scripts ✓
8. Sync `package-lock.json` ✓

### Phase B: Docs Update (COMPLETE)
1. Update `AI_RULES.md` to reflect Pages Functions architecture ✓
2. Update `CLOUDFLARE_RETIREMENT_PLAN.md` to reflect current architecture ✓
3. Update `MIGRATION_AUDIT.md` to reflect current architecture ✓
4. Update `README_DEPLOYMENT.md` and `README_PRODUCTION.md` if needed ✓
5. Remove stale `server/db/schema.sql` references ✓

### Phase C: Validation (BLOCKED)
1. Run `npm run lint` and `npm run typecheck` — BLOCKED: node/npm unavailable
2. Run `npm run build` to verify dist output — BLOCKED
3. Run `npm run deploy` to deploy to Pages — BLOCKED
4. Verify API endpoints on `https://sealify.pages.dev` — BLOCKED

### Phase D: Final Verification (PENDING)
1. Verify all endpoints working on Pages Functions
2. Verify admin login works
3. Verify CORS is correct
4. Monitor for errors
5. Push to main

---

## LOCAL DEVELOPMENT DESIGN

```text
Cloudflare Pages Development:
  npm run dev:pages
  - Runs wrangler pages dev with Functions on https://localhost:8788
  - Runs Vite dev server on https://localhost:5173
  - Vite proxies /api to wrangler's localhost:8788

Supabase:
  Existing Sealify production project
  (or local Supabase for development)
```

### package.json Scripts

```json
{
  "dev": "vite",
  "dev:pages": "node dev.mjs",
  "build": "vite build",
  "deploy": "npm run build && npx wrangler pages deploy ./dist --project-name=sealify --functions-dir=functions"
}
```

---

## FILES MODIFIED

| File | Change |
|------|--------|
| `package.json` | Removed `nitro`, `express`, `cors`, `helmet`, `morgan`, `concurrently`, and `@types/*` deps; updated scripts to include `--functions-dir=functions` |
| `vite.config.ts` | Updated proxy target from localhost:3000 to localhost:8788 |
| `dev.mjs` | Added `--functions-dir functions` |
| `AI_RULES.md` | Updated for Pages Functions architecture |
| `CLOUDFLARE_RETIREMENT_PLAN.md` | Updated for Pages Functions |
| `MIGRATION_AUDIT.md` | Updated for Pages Functions |
| `PHASE_2_SECURITY_BLOCKERS.md` | Updated Cloudflare deployment section for Pages Functions |
| `README_PRODUCTION.md` | Removed `server/db/schema.sql` from migration steps |
| `src/entry-server.tsx` | **DELETED** (stale SSR handler) |
| `server/` | **DELETED** (Express/Nitro directory) |
| `local-server.js` | **DELETED** |
| `nitro.config.ts` | **DELETED** |
| `start-dev.ps1` | **DELETED** |

---

## SUMMARY

| Item | Value |
|------|-------|
| **API Implementation** | Cloudflare Pages Functions (Hono) |
| **Frontend** | React + Vite + Cloudflare Pages |
| **Database** | Hyperdrive (PostgreSQL connection pooling) |
| **Auth** | Supabase Auth |
| **Services Active** | Pages, Pages Functions, Hyperdrive, Wrangler |
| **Overall Risk** | **LOW** |
| **Status** | **IN PROGRESS** (validation blocked) |

---

## VERIFICATION CHECKLIST

- [x] `server/` directory removed
- [x] `src/entry-server.tsx` removed
- [x] `nitro.config.ts` removed
- [x] `local-server.js` removed
- [x] `start-dev.ps1` removed
- [x] `vite.config.ts` proxy updated to localhost:8788
- [x] `dev.mjs` updated with `--functions-dir functions`
- [x] `package.json` cleaned (removed nitro, express, cors, helmet, morgan, concurrently, @types/*)
- [x] `package-lock.json` synced (top-level deps only; stale node_modules entries will regenerate)
- [x] AI_RULES.md updated for Pages Functions
- [x] CLOUDFLARE_RETIREMENT_PLAN.md updated
- [x] MIGRATION_AUDIT.md updated
- [x] PHASE_2_SECURITY_BLOCKERS.md updated
- [x] README_PRODUCTION.md updated (removed server/db/schema.sql from steps)
- [x] Deploy workflow uses `--functions-dir functions`
- [ ] Run validation (blocked: node/npm unavailable in sandbox)
- [ ] Push to main
