# SEALIFY — BACKEND MIGRATION AUDIT REPORT

## Cloudflare Pages Functions → Node.js + Express on Render

**Date:** 2026-08-29
**Repository:** olarotimiisrael-cloud/sealify
**Current main commit:** 65c28a5

---

## CURRENT ARCHITECTURE

Sealify currently uses a **hybrid serverless architecture**:

```
                     SEALIFY
                        │
             ┌──────────┴──────────┐
             │                     │
        React + Vite          Cloudflare Pages
         Frontend               Functions
             │                     │
             │    ┌────────────────┤
             │    │                │
             └───┬┴───────────────┬┘
                 │                │
              Supabase         Hyperdrive
         ┌───────┴────────┐       │
         │                │       │
     PostgreSQL      Supabase    PostgreSQL
                        Auth     (connection
                                  pooling)
```

### Key Components

| Component | Technology | Location |
|-----------|-----------|----------|
| Frontend | React + Vite | `src/` |
| API Routes | Hono (Cloudflare Workers) | `src/api/*.ts` |
| API Entry | Pages Functions | `functions/api/[[path]].ts` |
| SSR Handler | Hono | `src/entry-server.tsx` |
| Database | Hyperdrive (PostgreSQL) | `src/db/hyperdrive.ts` |
| Auth | Supabase Auth | `src/integrations/supabase/client.ts` |
| Server Supabase | Supabase JS | `src/lib/supabase.ts` |
| Config | Wrangler | `wrangler.toml` |

### Dual Server Architecture

The codebase contains **TWO** server architectures:

1. **Cloudflare Pages Functions** (`functions/` + `src/entry-server.tsx`) — Hono-based, uses Hyperdrive
2. **Nitro Server** (`server/` + `nitro.config.ts`) — Also Cloudflare-oriented, uses `event.context.cloudflare?.env`

Both are Cloudflare-specific and must be replaced.

---

## TARGET ARCHITECTURE

```
                     SEALIFY
                        │
             ┌──────────┴──────────┐
             │                     │
        React + Vite          Node + Express
         Frontend               Backend API
             │                     │
             └──────────┬──────────┘
                        │
                     Supabase
                ┌───────┴────────┐
                │                │
             PostgreSQL      Supabase Auth
```

### Key Components

| Component | Technology | Location |
|-----------|-----------|----------|
| Frontend | React + Vite | `src/` (modified) |
| API Routes | Express + TypeScript | `server/routes/*.ts` |
| API Entry | Express App | `server/app.ts` |
| Database | Supabase JS + PostgreSQL | `server/db/*.ts` |
| Auth | Supabase Auth | `src/integrations/supabase/client.ts` (unchanged) |
| Config | package.json + `.env` | Root |

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
| `hono` | All `src/api/*.ts` | **REPLACED** | Replace with Express |
| `hono/cors` | `functions/api/[[path]].ts` | **REPLACED** | Replace with `cors` package |
| `hono/http-exception` | `src/middleware/security.ts` | **REPLACED** | Replace with standard HTTP errors |
| `hono/cloudflare-pages` | `src/entry-server.tsx` | **REMOVED** | Cloudflare Pages adapter |
| `@cloudflare/workers-types` | `package.json` | **REMOVED** | Workers type definitions |
| `wrangler` | `package.json` | **REMOVED** | Cloudflare CLI |
| `wrangler.toml` | Root | **REMOVED** | Cloudflare Pages config |
| `functions/[[path]].ts` | Root | **REMOVED** | Pages Functions entry |
| `functions/api/[[path]].ts` | Root | **REMOVED** | Pages Functions API entry |
| `HYPERDRIVE` binding | `src/db/hyperdrive.ts` | **REPLACED** | Use `DATABASE_URL` env var |
| `event.context.cloudflare?.env` | `server/routes/*.ts` | **REMOVED** | Cloudflare runtime context |
| `nitro` / `nitro.config.ts` | Root + `server/` | **REPLACED** | Replace with Express |
| `cf-connecting-ip` header | `src/middleware/security.ts` | **REPLACED** | Use `x-forwarded-for` |
| `public/_headers` | `public/` | **REMOVED** | Cloudflare Pages headers |
| `c.env`, `c.req`, `c.json` | All `src/api/*.ts` | **REPLACED** | Express req/res |
| `HTTPException` | `src/middleware/security.ts` | **REPLACED** | Standard error handling |

---

## SUPABASE DEPENDENCIES

| Component | Usage | Migration Action |
|-----------|-------|------------------|
| **Supabase Auth** | `signInWithPassword`, `signUp`, `signOut`, `getSession`, `getUser` | **KEEP** — Works unchanged |
| **Supabase JS Client** | Frontend client (`src/integrations/supabase/client.ts`) | **KEEP** — Works unchanged |
| **Server Supabase Client** | `src/lib/supabase.ts`, `src/db/supabase.ts` | **KEEP** — Works with `process.env` |
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

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `server/app.ts` | Express application entry point |
| `server/index.ts` | Server bootstrap (listen on PORT) |
| `server/routes/auth.ts` | Auth routes (register, login, admin-login, etc.) |
| `server/routes/admin.ts` | Admin routes |
| `server/routes/listings.ts` | Listing routes |
| `server/routes/users.ts` | User routes |
| `server/routes/messages.ts` | Message routes |
| `server/routes/notifications.ts` | Notification routes |
| `server/routes/categories.ts` | Category routes |
| `server/routes/buyer-requests.ts` | Buyer request routes |
| `server/routes/reviews.ts` | Review routes |
| `server/routes/search.ts` | Search routes |
| `server/routes/analytics.ts` | Analytics routes |
| `server/routes/push.ts` | Push notification routes |
| `server/routes/health.ts` | Health check routes |
| `server/routes/copilot.ts` | Copilot routes |
| `server/middleware/auth.ts` | Supabase Bearer <REDACTED> verification |
| `server/middleware/admin.ts` | Admin authorization middleware |
| `server/middleware/cors.ts` | CORS configuration |
| `server/middleware/error-handler.ts` | Global error handler |
| `server/middleware/rate-limit.ts` | Rate limiting |
| `server/services/auth-service.ts` | Auth business logic |
| `server/services/admin-service.ts` | Admin business logic |
| `server/services/listing-service.ts` | Listing business logic |
| `server/db/supabase.ts` | Server Supabase client |
| `server/db/postgres.ts` | PostgreSQL connection pool |
| `server/types/index.ts` | Server-side TypeScript types |

---

## FILES TO MODIFY

| File | Change |
|------|--------|
| `package.json` | Add Express scripts, remove Cloudflare deps |
| `src/lib/env.ts` | Add `VITE_API_URL` for frontend API base |
| `src/lib/api-client.ts` | Update `API_BASE` to use `VITE_API_URL` |
| `src/context/SealifyContext.tsx` | Update API calls to use new base URL |
| `src/admin/pages/AdminLogin.tsx` | No change (already calls `/api/auth/admin-login`) |
| `src/pages/AdminLogin.tsx` | No change |
| `src/integrations/supabase/client.ts` | Remove Cloudflare-specific comments |
| `src/entry-server.tsx` | Remove or replace (no longer needed for SSR) |

---

## FILES TO RETIRE (DO NOT DELETE)

| File | Reason |
|------|--------|
| `functions/[[path]].ts` | Cloudflare Pages Functions entry |
| `functions/api/[[path]].ts` | Cloudflare Pages Functions API |
| `src/entry-server.tsx` | Hono SSR handler |
| `src/db/hyperdrive.ts` | Cloudflare Hyperdrive |
| `src/middleware/security.ts` | Hono-based security middleware |
| `src/api/auth.ts` | Hono auth routes |
| `src/api/admin.ts` | Hono admin routes |
| `src/api/listings.ts` | Hono listing routes |
| `src/api/users.ts` | Hono user routes |
| `src/api/messages.ts` | Hono message routes |
| `src/api/notifications.ts` | Hono notification routes |
| `src/api/categories.ts` | Hono category routes |
| `src/api/buyer-requests.ts` | Hono buyer request routes |
| `src/api/reviews.ts` | Hono review routes |
| `src/api/search.ts` | Hono search routes |
| `src/api/analytics.ts` | Hono analytics routes |
| `src/api/push.ts` | Hono push routes |
| `src/api/health.ts` | Hono health routes |
| `src/api/copilot.ts` | Hono copilot routes |
| `server/routes/api/health.get.ts` | Nitro route |
| `server/routes/api/conversations.post.ts` | Nitro route |
| `nitro.config.ts` | Nitro configuration |
| `wrangler.toml` | Cloudflare Pages config |
| `public/_headers` | Cloudflare Pages headers |

---

## PACKAGE CHANGES

### Dependencies to Add

| Package | Purpose |
|---------|---------|
| `express` | Web framework (already in devDependencies, move to dependencies) |
| `cors` | CORS middleware (already installed) |
| `helmet` | Security headers |
| `morgan` | HTTP request logging |
| `compression` | Response compression |
| `express-rate-limit` | Rate limiting |

### Dependencies to Remove

| Package | Reason |
|---------|--------|
| `hono` | Replaced by Express |
| `@cloudflare/workers-types` | Cloudflare-specific |
| `wrangler` | Cloudflare deployment |
| `nitro` | Replaced by Express |

### Dependencies to Keep

| Package | Reason |
|---------|--------|
| `@supabase/supabase-js` | Works anywhere |
| `postgres` | Standard PostgreSQL client |
| `zod` | Validation |
| All React/frontend deps | Unchanged |

---

## ENVIRONMENT VARIABLES

### Frontend Variables (Vite)

| Variable | Purpose | Local | Production |
|----------|---------|-------|------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Same Supabase project | Same |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Same | Same |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` | `https://sealify-api.onrender.com` |

### Backend Variables (Render)

| Variable | Purpose | Local | Production |
|----------|---------|-------|------------|
| `PORT` | Server port | `3000` | Render-assigned |
| `NODE_ENV` | Environment | `development` | `production` |
| `SUPABASE_URL` | Supabase project URL | Same | Same |
| `SUPABASE_ANON_KEY` | Supabase anon key | Same | Same |
| `DATABASE_URL` | PostgreSQL connection string | Local Supabase | Render Supabase |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` | `https://sealify.ng,...` |
| `AI_PROVIDER` | AI provider (copilot) | Optional | Optional |
| `OPENAI_API_KEY` | OpenAI API key | Optional | Optional |
| `GEMINI_API_KEY` | Gemini API key | Optional | Optional |
| `VAPID_PRIVATE_KEY` | Web Push VAPID key | Optional | Optional |

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

### Phase A: Backend Foundation
1. Create `server/app.ts` and `server/index.ts`
2. Set up Express with CORS, body parsing, error handling
3. Create `server/db/supabase.ts` and `server/db/postgres.ts`
4. Create `server/middleware/auth.ts` and `server/middleware/admin.ts`

### Phase B: Authentication
1. Port `src/api/auth.ts` to `server/routes/auth.ts`
2. Ensure `admin-login` calls `signInWithPassword()` before `getSql()`
3. Test all auth endpoints

### Phase C: Admin API
1. Port `src/api/admin.ts` to `server/routes/admin.ts`
2. Ensure all admin routes use `requireAdmin` middleware
3. Test admin dashboard functionality

### Phase D: Marketplace APIs
1. Port listings, categories, search, reviews, buyer-requests
2. Test all marketplace functionality

### Phase E: Communication APIs
1. Port messages, notifications, push
2. Test real-time features

### Phase F: Frontend API Switch
1. Add `VITE_API_URL` to `src/lib/env.ts`
2. Update `src/lib/api-client.ts`
3. Update `src/context/SealifyContext.tsx`
4. Test all frontend API calls

### Phase G: Local Testing
1. Run backend locally with `npm run serve`
2. Run frontend locally with `npm run dev`
3. Test all features

### Phase H: Render Deployment
1. Create Render Web Service
2. Configure environment variables
3. Deploy and verify

### Phase I: Production Verification
1. Verify all endpoints work
2. Verify admin login works
3. Verify CORS is correct
4. Monitor for errors

### Phase J: Cloudflare Retirement
1. Only after Render is fully tested
2. Remove Cloudflare files
3. Update DNS if needed

---

## LOCAL DEVELOPMENT DESIGN

```text
Frontend:
  http://localhost:5173
  npm run dev

Backend:
  http://localhost:3000
  npm run serve

Supabase:
  Existing Sealify production project
  (or local Supabase for development)
```

### package.json Scripts

```json
{
  "dev": "vite",
  "dev:full": "concurrently \"npm:dev\" \"npm:serve\"",
  "serve": "tsx server/index.ts",
  "build": "vite build",
  "start": "node dist/server/index.js"
}
```

---

## RENDER DEPLOYMENT DESIGN

| Setting | Value |
|---------|-------|
| **Service Type** | Web Service |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm start` |
| **Node Version** | 20 |
| **Health Check Path** | `/api/health` |
| **Port** | `process.env.PORT` |

### Render Environment Variables

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | Same Supabase project URL |
| `SUPABASE_ANON_KEY` | Same Supabase anon key |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `CORS_ORIGINS` | `https://sealify.ng,https://www.sealify.ng,...` |

---

## SECURITY REQUIREMENTS

### Authentication
- Supabase Auth remains the authentication authority
- `signInWithPassword()` for credential verification
- `setSession()` for session establishment

### Authorization
- Admin authorization remains `private.is_admin()`
- Server-side only — never trust client-provided role
- `profiles.role = 'admin'` is the authority

### Secrets
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend
- Only public Supabase configuration (`URL`, `ANON_KEY`) is client-side
- Database credentials are server-only

### CORS
- Whitelist only approved Sealify frontend origins
- Do NOT use `Access-Control-Allow-Origin: *` for authenticated APIs
- Allow: `https://sealify.ng`, `https://www.sealify.ng`, `http://localhost:5173`

### Sessions
- No localStorage admin tokens
- No custom authorization tokens
- No hard-coded sessions
- Use Supabase session management

---

## SUMMARY

| Item | Value |
|------|-------|
| **Current endpoints** | 97 |
| **Files to create** | ~25 |
| **Files to modify** | ~8 |
| **Files to retire** | ~22 |
| **Dependencies to add** | ~3 |
| **Dependencies to remove** | ~4 |
| **Overall risk** | **MEDIUM** |
| **Estimated effort** | 3-5 days |

---

## APPROVAL REQUIRED BEFORE IMPLEMENTATION

This audit is complete. Awaiting approval to begin implementation.

**DO NOT modify Supabase production.**
**DO NOT delete Cloudflare files yet.**
**DO NOT create Render service yet.**
