# Sealify Step 4 — Cloudflare Backend/API Deployment Audit

## Audit scope

This is a read-only deployment audit. No application source, Cloudflare resource, deployment, Supabase configuration, database, RLS policy, authentication flow, or Copilot behavior was changed. The only new file is this report.

## A. Current deployment architecture

The repository is primarily configured as a Vite React single-page application deployed to Cloudflare Pages. `npm run build` produces a static `dist/` directory, and `npm run deploy` runs `wrangler pages deploy dist`.

There is also a separate Hono/React Router server design in `src/entry-server.tsx`. It imports the API route modules and exports a Pages-style `onRequest` handler. However, that file is under `src/`, not under a Cloudflare Pages `functions/` directory, and the Vite build output contains no Worker/API bundle. The repository therefore does not currently demonstrate a connected production API deployment.

The project also contains a Nitro configuration pointing at `./server`, but the package scripts do not run Nitro and the Cloudflare deploy script does not deploy Nitro output. This creates a second, unused server convention.

## B. Cloudflare configuration

`wrangler.toml` contains:

- Pages project name: `sealify`
- `compatibility_date = "2024-01-01"`
- `pages_build_output_dir = "dist"`
- Production `NODE_VERSION` metadata

It does not define a Worker entry point, Pages Functions directory, HYPERDRIVE binding, service bindings, or Node compatibility flags. Pages environment variables can be supplied in the dashboard, but the current file alone does not bind the database/runtime resources required by the API.

`public/_redirects` contains `/* /index.html 200`, which supports SPA navigation but does not register backend API handlers. `public/_headers` exists for static response headers.

The GitHub workflow also deploys only `dist/` with `cloudflare/pages-action`. It does not build or deploy a Worker/API artifact.

## C. Frontend deployment

The frontend entry is the Vite application beginning at `index.html` and the React source under `src/`. The production output directory is `dist/`. SPA fallback is configured through `public/_redirects`.

The frontend can call Supabase directly through `src/integrations/supabase/client.ts`, and it can call same-origin `/api` paths. Same-origin `/api` calls will only work in production if a Pages Function or Worker is actually attached to those paths.

## D. Backend/API deployment

The intended API source is the Hono route collection imported by `src/entry-server.tsx`. It registers routes under `/api` and then delegates non-API requests to the React Router server build.

That handler is not located in a standard Pages Functions path, is not referenced by the Vite build, and is not deployed by `wrangler pages deploy dist`. The `server/routes/api/*.ts` files are separate Nitro-style route files and are not imported by `src/entry-server.tsx`.

Conclusion: the source contains API implementations, but the current Pages deployment command is static-only. Production API availability is a blocker until one coherent Cloudflare API deployment path is selected and wired.

## E. API route inventory

The following Hono route groups are imported and mounted by `src/entry-server.tsx`:

| Method | Path pattern | Source | Auth/deployment observation |
|---|---|---|---|
| GET/POST/PUT | `/api/auth/*` | `src/api/auth.ts` | Public register/login/reset; bearer validation for protected profile/me operations; not currently deployed by static Pages output |
| GET/POST/PUT/DELETE | `/api/listings/*` | `src/api/listings.ts` | Public reads; bearer ownership checks for writes and featured action; deployment blocker remains |
| GET/POST/PUT | `/api/users/*` | `src/api/users.ts` | Bearer validation in handlers; deployment blocker remains |
| GET/POST/PUT | `/api/messages/*` | `src/api/messages.ts` | Bearer validation in handlers; deployment blocker remains |
| GET/PUT/DELETE | `/api/notifications/*` | `src/api/notifications.ts` | Bearer validation in handlers; deployment blocker remains |
| GET/POST/PUT/DELETE | `/api/categories/*` | `src/api/categories.ts` | Public reads and authenticated/admin mutations as implemented; deployment blocker remains |
| GET/POST/PUT/DELETE | `/api/buyer-requests/*` | `src/api/buyer-requests.ts` | Bearer validation in handlers; deployment blocker remains |
| GET/POST/PUT/DELETE | `/api/reviews/*` | `src/api/reviews.ts` | Bearer validation in handlers; deployment blocker remains |
| GET/POST/DELETE | `/api/search/*` | `src/api/search.ts` | Public search/trending plus bearer-protected alerts; deployment blocker remains |
| POST | `/api/push/*` | `src/api/push.ts` | Bearer validation; admin broadcast path also exists; deployment blocker remains |
| GET | `/api/health`, `/api/health/db` | `src/api/health.ts` | Health route is mounted under `/api`; DB health requires HYPERDRIVE |
| GET/POST | `/api/copilot/*` | `src/api/copilot.ts` | `/health` public; POST accepts optional bearer and uses provider secrets server-side; deployment blocker remains |
| GET | `/api/analytics/*` | `src/api/analytics.ts` | Module-level admin bearer/profile check; deployment blocker remains |
| GET/POST/PUT/DELETE | `/api/admin/*` | `src/api/admin.ts` | Module-level Supabase bearer plus trusted `profiles.role = 'admin'`; deployment blocker remains |

The mounted route list contains no active wallet or escrow routes. The deleted Step 3A wallet/escrow files are not included as active functionality.

There are additional files under `server/routes/api/` such as ads, conversations, and notification handlers. They are not imported by the Hono entry and appear to be orphaned Nitro/server-route implementations. Their existence does not make them reachable in the current Pages deployment.

## F. API base URL analysis

`src/lib/env.ts` defines:

- `appEnv.apiBase = import.meta.env.VITE_API_BASE || '/api'`

`src/lib/api-client.ts` resolves that base against `window.location.origin`. Admin requests use same-origin paths through `src/lib/admin-api.ts`, and the Copilot UI directly posts to `/api/copilot`. Other direct fetches also use `/api/...`.

Therefore:

- Local development: browser uses same-origin `/api`; Vite alone does not mount the Hono API, so API behavior depends on an external/dev server or proxy not present in `vite.config.ts`.
- Preview: browser still uses same-origin `/api` unless `VITE_API_BASE` is explicitly supplied; static Pages preview has no API handler from the current build path.
- Production: browser uses same-origin `/api` by default. This requires a Pages Function/Worker route at `/api`; otherwise requests will fall through to the SPA redirect or return unavailable API responses.

No hardcoded production API URL was found in the client API construction. A separate API hostname would require a configured `VITE_API_BASE` and matching CORS policy.

## G. Supabase server-client analysis

The browser client is `src/integrations/supabase/client.ts` and uses `VITE_SUPABASE_URL` plus `VITE_SUPABASE_ANON_KEY`. It is appropriate for browser use.

Server-role client implementations exist in:

- `src/lib/supabase.ts`
- `src/db/supabase.ts`
- `server/db/supabase.ts`

They read `SUPABASE_SERVICE_ROLE_KEY`, disable `autoRefreshToken`, and set `persistSession: false`. No imports of these service-role modules into client components were found in the audited source. The service-role key name is not printed in this report.

The mounted Hono API generally creates request-scoped Supabase clients with the anon key and validates bearer tokens through `supabase.auth.getUser(token)`. The server-role modules are not part of the demonstrated Pages bundle.

Compatibility issue: the server-role modules use `process.env`, while Cloudflare Workers/Pages Functions provide bindings through `c.env`/`env`, not a Node process environment. They are therefore not ready to be assumed compatible with the Hono Cloudflare runtime. The API also uses `postgres` through `src/db/hyperdrive.ts`, which requires a real HYPERDRIVE binding and Cloudflare-compatible connection strategy.

## H. Authentication deployment flow

The intended flow is conceptually correct:

1. Browser Supabase client owns the canonical session.
2. `api-client`, `admin-api`, and Copilot obtain the current Supabase session and send its access token as `Authorization: Bearer ...`.
3. Hono handlers validate the token with Supabase Auth using `supabase.auth.getUser(token)`.
4. Admin routes additionally load `profiles.role` and require `admin`.

No legacy application token storage is part of this Step 4 audit. The deployment blocker is route/runtime availability, not a requested authentication redesign.

## I. CORS analysis

`src/entry-server.tsx` allows:

- `https://sealify.ng`
- `https://www.sealify.ng`
- `http://localhost:5173`

It allows `Content-Type` and `Authorization`, methods GET/POST/PUT/DELETE/OPTIONS, and credentials. `src/middleware/security.ts` has a second CORS implementation that also allows `http://127.0.0.1:5173`.

Risks and gaps:

- The production API domain is not separately configurable in the source. If the API is deployed on another hostname, its origin must be added through a reviewed configuration change.
- The CORS middleware is duplicated and may diverge depending on which server path is deployed.
- `credentials: true` is unnecessary for bearer-only requests unless cookies are intentionally introduced later; it is not itself a credential leak.
- OPTIONS handling exists in the middleware implementation, but it is irrelevant until the handler is actually mounted.

## J. Environment-variable name inventory

Only names are listed; no values were read into this report.

### Client-safe

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE` (URL/configuration only)
- `VITE_SITE_URL`
- `VITE_VAPID_PUBLIC_KEY`

### Cloudflare/server-only

- `NEXT_PUBLIC_SUPABASE_URL` (server-side name in this codebase; the `NEXT_PUBLIC_` prefix is misleading and should be reviewed)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HYPERDRIVE`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `OPENAI_MODEL`
- `GEMINI_MODEL`
- `AI_PROVIDER`
- `AI_WEB_SEARCH_ENABLED`
- `AI_CONFIG`
- `SECRET_AI_CONFIG`
- `COPILOT_AI_CONFIG`
- `AI_DAILY_LIMIT`
- `AI_MAX_REQUEST_LENGTH`
- `AI_PER_USER_RATE_LIMIT`
- `AI_FALLBACK_ENABLED`
- `VAPID_PRIVATE_KEY`
- `ARKESEL_API_KEY`
- `TERMII_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `RESEND_API_KEY`
- `APP_URL`
- `PUBLIC_SITE_URL`

### Build/platform configuration

- `NODE_VERSION`
- `NODE_ENV`
- `CLOUDFLARE_API_TOKEN` (CI/deployment secret, not runtime client configuration)
- `CLOUDFLARE_ACCOUNT_ID` (CI/deployment configuration)

### Present in environment examples or legacy production configuration and requiring review

- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_PIN`
- `FLUTTERWAVE_PUBLIC_KEY`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_ENCRYPTION_KEY`
- `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`
- `MONNIFY_API_KEY`, `MONNIFY_CONTRACT_CODE`, `MONNIFY_SECRET_KEY`
- `RESEND_FROM_EMAIL`
- `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`
- `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- `POSTHOG_KEY`, `POSTHOG_HOST`
- `CSP_NONCE_ENABLED`, `RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW_MS`

The production environment file contains a broader legacy variable set than the example files. Values were not exposed. Legacy admin/payment names must not be treated as evidence of active functionality or placed in browser-exposed variables.

## K. Cloudflare runtime compatibility

The following are deployment risks:

- `process.env` is used by server Supabase clients; Cloudflare bindings use `env`.
- `src/db/hyperdrive.ts` imports `postgres` and maintains a module-level connection object. This requires explicit Cloudflare Hyperdrive compatibility and binding configuration.
- The project has Node-oriented server assumptions while the selected `wrangler.toml` is Pages-oriented and does not enable or configure a server runtime.
- No `functions/` directory or Worker entry was found for the Pages deployment.
- In-memory rate-limit maps in `src/middleware/security.ts` and `src/api/copilot.ts` are instance-local and not durable or globally consistent across isolates.
- The static Vite build does not emit a server bundle.

No `fs`, `child_process`, or Node HTTP server usage was found in the audited active API source. The absence of those imports does not resolve the process-environment, database-driver, or deployment-entry issues.

## L. Server entry-point analysis

Locally, `npm run dev` starts Vite only. It does not start the Hono handler from `src/entry-server.tsx`, and no Vite proxy is configured for `/api`.

The intended Cloudflare entry is the `onRequest` export in `src/entry-server.tsx`, but it is not in a Pages Functions location and is not emitted by `vite build`. Nitro points to `server/`, but no package script or Cloudflare deployment step invokes Nitro.

The project therefore has no single verified local-to-Cloudflare server entry path.

## M. Build output analysis

`npm run build` emits a Vite static build to `dist/`. It does not emit a Worker bundle or a Pages Functions bundle. The build completes successfully, with the existing large-chunk warning only.

The current `npm run deploy` command deploys only `dist/`. Under the current configuration, frontend pages may deploy while `/api/*` remains unavailable or is handled by SPA fallback. This is the primary production blocker.

## N. Deployment command analysis

Declared commands:

- Local frontend: `npm run dev` → `vite`
- Static production build: `npm run build` → `vite build`
- Static preview: `npm run preview` → `vite preview`
- Current deployment: `npm run deploy` → `wrangler pages deploy dist`
- Cloudflare type generation: `npm run cf-typegen` → `wrangler types --env-interface CloudflareEnv`

No `wrangler deploy` command, Worker entry, Pages Functions build step, or Nitro deployment command is present. The current deployment command is valid for the static frontend only, not the complete backend/API requirement.

## O. Security findings

1. **Blocking — API deployment is not connected.** Static Pages deployment does not include the Hono API.
2. **Blocking — database binding/runtime is not configured.** `HYPERDRIVE` is required by API handlers but absent from `wrangler.toml`.
3. **High — runtime environment mismatch.** Server Supabase clients read `process.env`, which is not the reviewed Cloudflare binding model.
4. **High — duplicate server implementations.** `src/entry-server.tsx` and `server/routes/api/*` represent different route systems, increasing the chance of deploying the wrong one.
5. **Medium — CORS configuration is duplicated.** Production API origin configuration is not centralized.
6. **Medium — in-memory rate limits are not durable across Cloudflare isolates.** This weakens abuse control for Copilot and API routes in production.
7. **Review required — environment files contain legacy credential/provider variable names.** Values were not printed; production secrets must be managed only in approved secret stores and legacy values must be rotated/removed according to the existing security roadmap.
8. **Review required — admin API profile queries.** The intended admin check uses the authenticated Supabase user ID and `profiles.role`, which is conceptually aligned with Step 2A, but it still depends on the API actually running and the database/RLS design being deployed consistently.

No service-role key value was exposed. No browser import of the audited service-role client modules was found.

## P. Copilot deployment path

The browser component `AiShoppingAssistantModal` posts to same-origin `/api/copilot` and attaches the current Supabase access token when available. The Hono endpoint is `src/api/copilot.ts`.

The endpoint validates an optional bearer token, applies an in-memory rate limit, validates input, and calls `askSealifyCopilot` with server-side provider configuration. Provider keys are read from the server environment by the AI implementation and are not intended for the browser.

Copilot is not deployable through the current static-only Pages command because `/api/copilot` is not bundled or mounted. Required server configuration includes the selected provider and its server-side key, but exact provider activation must be configured in the eventual Worker/Pages Function environment.

## Q. Blocking issues

- No verified Cloudflare API/Worker/Pages Functions entry is deployed by the current build/deploy path.
- No verified HYPERDRIVE binding is configured for the API.
- Server-side environment access is inconsistent with Cloudflare runtime bindings.
- The project has competing Hono and Nitro route conventions with no selected deployment path.
- Same-origin `/api` client calls have no deployed target under the current static-only configuration.

## R. Recommended fixes (not implemented)

1. Choose one backend architecture: Cloudflare Pages Functions or a dedicated Cloudflare Worker. Do not maintain two competing route systems.
2. Move/register the chosen Hono entry in the exact Cloudflare-supported location and add an explicit API deployment/build path.
3. Configure the required Hyperdrive binding and adapt database access to the selected runtime’s supported API.
4. Replace server `process.env` reads with the selected Cloudflare runtime binding mechanism where the code runs at the edge.
5. Decide whether API remains same-origin or gets a separate hostname; then set `VITE_API_BASE` and one centralized CORS policy accordingly.
6. Reconcile and remove orphaned Nitro route files or explicitly make them the deployed source after review.
7. Move production rate limiting to an appropriate Cloudflare durable/global mechanism.
8. Configure only the required server secrets in Cloudflare and remove/rotate legacy credential names according to the security roadmap.
9. Deploy a review environment and test every route group, including unauthenticated, authenticated, unauthorized, admin, database, promotion, and Copilot cases, before production.

## S. Files that would need modification in a future implementation

Likely files include `wrangler.toml`, `package.json`, the chosen Cloudflare entry/function file, the chosen database client (`src/db/hyperdrive.ts` or replacement), server Supabase clients, environment examples, CORS middleware, and deployment workflow configuration. Exact edits should wait for the architecture decision.

## T. Files that must not be modified for this audit

No Supabase migrations, RLS policies, database tables/data, authentication/session storage, Copilot product behavior, Cloudflare resources, or production deployment were modified.

## U. Exact next implementation sequence

1. Human review and approval of Pages Functions versus dedicated Worker architecture.
2. Inventory and confirm required Cloudflare bindings and server environment names.
3. Wire one server entry and remove/retire the competing route convention.
4. Make Supabase and Hyperdrive access compatible with the selected runtime.
5. Configure API base URL and centralized CORS.
6. Build a non-production API preview.
7. Run authenticated and unauthorized route tests, promotion workflow tests, and Copilot tests.
8. Only after verification, deploy production.

**STEP 4 AUDIT COMPLETE — HUMAN REVIEW REQUIRED**
