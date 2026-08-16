# SEALIFY AUTH LOCALSTORAGE AUDIT

**Scope:** Step 2C read-only audit only.

No files, database objects, RLS policies, Supabase configuration, Cloudflare configuration, or deployment state were changed. Credential values were not printed or copied into this report.

## A. Authentication architecture currently in use

The repository currently contains two overlapping client authentication paths:

1. The intended/current path is Supabase Auth through `src/integrations/supabase/client.ts`. It enables `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: true`, and PKCE.
2. A legacy `ApiClient` path in `src/lib/api-client.ts` creates another Supabase client and manually mirrors access and refresh tokens into browser `localStorage` under `sb-*` keys.

The main application context in `src/context/SealifyContext.tsx` also uses the intended Supabase client directly for login, signup, admin login, session hydration, auth state changes, and logout. Several pages and `AuthProvider` still use `src/lib/api-client.ts`, so the legacy path is not dead code.

The backend/API path receives a bearer token from the request, validates it with Supabase Auth using `supabase.auth.getUser(token)` or the Supabase `/auth/v1/user` endpoint, and then performs authorization checks. Server-only clients using the service-role key have session persistence disabled.

## B. Every localStorage/sessionStorage authentication reference

### B.1 Confirmed authentication-token storage

`src/lib/api-client.ts` contains the legacy token persistence:

| File | Storage key | Operation | Data |
|---|---|---|---|
| `src/lib/api-client.ts` | `sb-access-token` | `getItem`, `setItem`, `removeItem` | Supabase access token |
| `src/lib/api-client.ts` | `sb-refresh-token` | `getItem`, `setItem`, `removeItem` | Supabase refresh token |
| `src/lib/api-client.ts` | `sb-token-expiry` | `getItem`, `setItem`, `removeItem` | Locally calculated expiry timestamp |

The class loads these values in its constructor, writes them on every Supabase auth state change, refreshes using the stored refresh token, places the access token into an `Authorization: Bearer` header, and clears the keys on logout/401/session failure.

This is the legacy mechanism Step 2C must remove or replace.

### B.2 Other localStorage usage that is not authentication-token storage

| File | Key/category | Assessment |
|---|---|---|
| `src/context/AppContext.tsx` | `sealify_listings`, `sealify_saved`, `sealify_messages` | Legacy/local application data; not an auth token, but should not be confused with server session state |
| `src/utils/csrf.ts` | `csrf_token` | CSRF token, not Supabase authentication; it is also mirrored to a non-HttpOnly cookie |
| `src/utils/offline.ts` | `sealify_offline_queue` | Queued actions can contain user-provided data; not a token, but must not be trusted as authorization |
| `src/hooks/useLocalStorage.ts` | caller-supplied keys | Generic persistence helper; audit all callers before changing it |
| `src/components/MagicSearch.tsx` | `sealify_search_history` | Search UX data |
| `src/pages/Settings.tsx` | `sealify_biometric` | UI preference only; it does not authenticate the user |

No `sessionStorage` authentication references were found in `src`, `server`, or `supabase`.

No localStorage key containing a manually stored user ID, role, or admin flag was found. The application keeps `user`, `isAdmin`, and related state in React memory, derived from Supabase Auth and the `profiles` row; this state is not itself a trusted authorization boundary.

### B.3 Supabase's own persistence

The normal Supabase browser client has `persistSession: true`. Supabase JS therefore owns its normal session persistence mechanism. The exact generated storage key is library-managed and should not be manually cleared or duplicated by application code.

The separate client constructed inside `src/lib/api-client.ts` does not explicitly configure the auth persistence options, so Supabase JS also has its own persistence behavior there, in addition to the explicit `sb-*` mirror. This is the central duplication risk.

## C. Every cookie-based authentication reference

No application authentication/session cookie was found.

Cookie references are:

- `src/utils/csrf.ts`: writes and clears a `csrf_token` cookie. This is a CSRF value, not a login/session credential. It is readable by JavaScript and is not `HttpOnly`.
- `src/components/ui/sidebar.tsx`: writes a UI sidebar preference cookie. It is not authentication.
- `document.cookie` is not used to store a Supabase access token, refresh token, JWT, user ID, role, or admin flag.

The repository does not show an HttpOnly application session cookie. Supabase Auth is browser-persisted by the Supabase client rather than by an application-created cookie.

## D. Supabase Auth usage

### Browser/client usage

- `src/integrations/supabase/client.ts`: canonical browser client; normal persistence and automatic refresh enabled.
- `src/context/SealifyContext.tsx`: `getSession`, `onAuthStateChange`, `signInWithPassword`, `signUp`, `signOut`, `getUser`, `updateUser`.
- `src/hooks/useAuth.ts`: a second React hook using the canonical client directly for session hydration, auth events, sign-in, sign-up, and sign-out.
- `src/hooks/useAdmin.ts`: calls `getUser`, then checks the current user's `profiles.role`.
- `src/components/DatabaseTest.tsx`: reads the current session for diagnostics.
- `src/components/AiShoppingAssistantModal.tsx`: obtains the current session access token for its Copilot request.
- `src/lib/admin-api.ts`: obtains the current Supabase session access token for protected admin requests.
- `src/lib/api-client.ts`: creates a second Supabase client, signs in/up/out, calls `getSession`, `getUser`, listens to auth changes, and manually refreshes/stores tokens.

### Server/API usage

The following server/API modules parse an incoming `Authorization` header, require the `Bearer` scheme, and validate the token with Supabase Auth. The audit found this pattern in authentication, middleware, admin, ads, conversations, notifications, wallets, escrow, users, search, reviews, push, buyer requests, categories, analytics, and Copilot-related routes.

Representative files include:

- `src/middleware/security.ts`
- `src/api/auth.ts`
- `src/api/admin.ts`
- `src/api/messages.ts`
- `src/api/notifications.ts`
- `src/api/users.ts`
- `src/api/wallet.ts`
- `src/api/reviews.ts`
- `src/api/search.ts`
- `src/api/push.ts`
- `src/api/buyer-requests.ts`
- `src/api/categories.ts`
- `src/api/analytics.ts`
- `src/api/copilot.ts`
- `server/routes/api/ads.post.ts`
- `server/routes/api/ads/[id].put.ts`
- `server/routes/api/ads/[id].delete.ts`
- `server/routes/api/conversations.post.ts`
- `server/routes/api/notifications.patch.ts`
- `server/routes/api/escrow.post.ts`
- `server/routes/api/escrow/[id]/release.post.ts`

The server-side Supabase clients in `src/db/supabase.ts`, `server/db/supabase.ts`, and `src/lib/supabase.ts` use the service-role environment variable and set `persistSession: false`. They must remain server-only.

## E. Frontend authentication flow

### Main Sealify context

`SealifyContext` uses the canonical Supabase browser client. On hydration it calls `supabase.auth.getSession()`, reads the profile for the authenticated user, derives `isAdmin` from `profiles.role`, and subscribes to `onAuthStateChange`. Login and admin login both use `signInWithPassword`; admin login additionally requires the profile role to be `admin`, otherwise it calls `supabase.auth.signOut()`.

Logout calls Supabase `signOut()`, clears in-memory user/admin state, and reloads the application state. It does not manually clear the `sb-*` keys because that context does not own them.

### Legacy ApiClient flow

`AuthProvider` imports `api` from `src/lib/api-client.ts` and uses its `getSession`, `getUser`, auth state listener, sign-in, sign-up, and sign-out methods. The `ApiClient` writes its own token mirror and all API requests use its manually selected token.

Pages still importing hooks from `src/lib/api-client.ts` include:

- `src/pages/Index.tsx`
- `src/pages/ListingDetail.tsx`
- `src/pages/MyAds.tsx`
- `src/pages/Messages.tsx`

This means removing only the localStorage lines from `ApiClient` without changing its token acquisition/request path could break these pages' API calls.

## F. Backend/API authentication flow

There are two normal bearer-token construction paths:

1. `src/lib/api-client.ts` obtains a token from its manually maintained in-memory/localStorage values and constructs `Authorization: Bearer ...` for generic API requests.
2. `src/lib/admin-api.ts` calls the canonical Supabase client's `getSession()` and constructs an `Authorization: Bearer ...` header for admin requests. `src/components/AiShoppingAssistantModal.tsx` does the same for Copilot.

The backend validates bearer tokens rather than trusting a client-provided user ID. However, `server/routes/api/offline/[type].post.ts` accepts `userId` in the request payload for offline actions; this is an authorization risk independent of token storage and requires a separate review. It must not be treated as proof of identity.

API routes also construct provider-specific Authorization headers for server-side AI calls, including OpenAI/Gemini provider requests. Those are not user-session storage mechanisms. Actual provider key values were not printed.

## G. Admin authentication flow

Admin login in both `src/pages/AdminLogin.tsx` and `src/admin/pages/AdminLogin.tsx` calls the `adminLogin` function from `SealifyContext`. That function:

1. Calls Supabase `signInWithPassword`.
2. Loads the matching `profiles` record by the Supabase user ID.
3. Requires `profile.role === 'admin'`.
4. Signs out immediately when the role check fails.
5. Stores only in-memory React state for `isAdmin` and `adminEmail`.

Protected admin API requests use `src/lib/admin-api.ts`, which reads the current canonical Supabase session and sends its access token. `src/api/admin.ts` applies server-side admin authorization via the authenticated user/profile path.

The frontend `isAdmin` state controls UI visibility only. It must never replace backend authorization.

No localStorage role/admin flag was found. No application authentication decision was found to use raw user metadata. `user_metadata` is used for display/fallback fields such as a full name, not as the admin authorization source.

## H. Legacy authentication mechanisms identified

### H.1 Confirmed legacy mechanism: explicit `sb-*` localStorage mirror

`src/lib/api-client.ts` is the confirmed legacy implementation. It duplicates Supabase Auth by:

- loading access and refresh tokens from localStorage;
- persisting new tokens from `onAuthStateChange`;
- refreshing with a manually supplied refresh token;
- maintaining a separate expiry timestamp;
- constructing bearer headers from the mirror;
- clearing the mirror on 401/logout/error.

### H.2 Duplicate client/auth abstractions

- `src/integrations/supabase/client.ts` and the client constructed inside `src/lib/api-client.ts` are separate browser Supabase clients.
- `src/context/SealifyContext.tsx`, `src/components/AuthProvider.tsx`, and `src/hooks/useAuth.ts` are overlapping auth state abstractions.
- The main application appears to use `SealifyContext`, while several pages and `AuthProvider` still use `ApiClient` hooks.

These cannot be removed blindly because the page imports show that the legacy `ApiClient` still supplies data-fetching hooks and API calls.

## I. Security risks

1. Access and refresh tokens are directly readable by any JavaScript executing in the origin through `localStorage`.
2. Two persistence paths can diverge after refresh, sign-out, multiple tabs, expired sessions, or auth events.
3. Removing the `sb-*` writes without replacing `ApiClient` token retrieval will break API requests from pages that still depend on it.
4. The generic `ApiClient` may send a stale token unless its session source is changed to the canonical client.
5. The service-role client exports in `src/lib/supabase.ts` are explicitly marked server-only but are located under `src/`; a future client import could expose the service role. The audit found no current browser import of the service-role key, but this boundary should be enforced.
6. The CSRF token is intentionally not authentication, but it is stored in localStorage and a JavaScript-readable cookie. It must not be reused as an authentication credential.
7. Offline queue payloads and local application data may contain user-related content. They must never be accepted by the server as identity or authorization.
8. `src/api/auth.ts` returns a session from registration/login responses, and the client receives session objects in memory. This is expected Supabase Auth behavior, but responses must not be copied into custom storage.
9. The legacy API route and frontend route stacks need one canonical session strategy before the token mirror is removed.

## J. Files that must be changed for Step 2C

These are recommendations only; no files were changed in this audit.

### Required primary change

- `src/lib/api-client.ts`: remove the `sb-*` localStorage load/set/remove implementation and manual refresh-token handling. Make its request layer obtain the current session/access token from the canonical `src/integrations/supabase/client.ts`, or migrate its consumers to a shared authenticated request helper that does so.

### Likely dependent changes

- `src/components/AuthProvider.tsx`: migrate off the legacy `api` auth implementation or make it a thin adapter over the canonical Supabase client.
- `src/pages/Index.tsx`
- `src/pages/ListingDetail.tsx`
- `src/pages/MyAds.tsx`
- `src/pages/Messages.tsx`

These page imports must be migrated or explicitly verified before deleting the legacy token code.

- `src/hooks/useApi.ts`: verify whether its exported `AuthProvider`/`useAuth` remains needed after consolidation.
- `src/hooks/useAuth.ts`: consolidate duplicate auth state only after checking all consumers.

### Conditional cleanup

- Any test, documentation, or environment references to `sb-access-token`, `sb-refresh-token`, or `sb-token-expiry` should be removed after the code migration.
- `src/utils/csrf.ts` should not be changed as part of token migration unless a separate CSRF decision is approved.

## K. Files that must NOT be changed for Step 2C

Do not change these as part of localStorage token removal:

- Supabase migrations, schema, RLS policies, or database data.
- Wallet, transaction, escrow, promotion-payment, or financial feature code.
- Copilot provider/persistence behavior, except for verifying its canonical session header path.
- Cloudflare Pages/Wrangler/deployment configuration.
- Server-side service-role clients, except to enforce import boundaries if separately authorized.
- Non-auth localStorage features such as search history, UI preferences, offline queue, and local app cache.
- Admin authorization rules or the database role model.

## L. Recommended migration approach

1. Inventory all imports and runtime consumers of `api` and the React Query hooks in `src/lib/api-client.ts`.
2. Preserve the public `ApiClient` method/hook interfaces temporarily, but replace its private token storage with the canonical Supabase client session mechanism.
3. For each API request, obtain the current session/access token from the canonical client or a single shared authenticated request helper. Do not read or write any custom token key.
4. Remove only the three `sb-*` storage keys and manual refresh-token state after all callers use the canonical path.
5. Consolidate `AuthProvider`/`useAuth` only after verifying that no route depends on its separate state lifecycle.
6. Keep admin requests on `src/lib/admin-api.ts` or another single helper that obtains the current Supabase session and sends a bearer header.
7. Keep server validation unchanged during this step; the server should continue validating bearer tokens with Supabase Auth.
8. Test multi-tab sign-in, refresh, logout, expired-session recovery, admin access, and API requests before removing compatibility code.
9. Search again for the exact keys and for `localStorage`/`sessionStorage` token patterns. The expected result is no application-managed auth-token storage.

## M. Verification/test plan

### Static checks

- `rg -n "sb-access-token|sb-refresh-token|sb-token-expiry" src server supabase`
- `rg -n -i "localStorage|sessionStorage" src server`
- `rg -n -i "Authorization|Bearer|access_token|refresh_token|supabase\.auth" src server`
- Verify there is no `localStorage` or `sessionStorage` key for access token, refresh token, JWT, user ID, role, or admin status.
- Verify no browser bundle imports `src/lib/supabase.ts`, `src/db/supabase.ts`, or `server/db/supabase.ts`.

### Browser tests

1. Start with empty site storage and verify logged-out homepage loads.
2. Sign up/sign in and confirm the canonical Supabase session is available.
3. Confirm no custom `sb-*` keys are created.
4. Confirm authenticated marketplace, messages, profile, notifications, and API requests still work.
5. Reload the page and confirm Supabase persistence restores the session.
6. Open a second tab, sign out, and confirm the other tab observes the auth change.
7. Expire or refresh the session and confirm Supabase automatic refresh works without a manually stored refresh token.
8. Log out and confirm `supabase.auth.getSession()` returns no active session and protected routes/API requests fail.
9. Confirm ordinary users cannot reach protected admin APIs, while an admin can.
10. Confirm Copilot requests still send the current session token when authenticated and remain unauthenticated otherwise.

### Build checks

After implementation, run `npm run check` and `npm run build`, then inspect the generated client bundle for service-role names and custom token keys. Do not use build success alone as proof of session correctness.

## N. Human confirmation required

Human review is required before implementation because:

1. `src/lib/api-client.ts` is still used by active page imports, so deleting its token code directly can break API calls.
2. There are multiple auth providers/hooks and two browser Supabase clients; the desired canonical abstraction must be confirmed.
3. The exact behavior of `appEnv.apiBase` and the deployment runtime must be confirmed before changing request construction.
4. The CSRF localStorage/cookie mechanism is separate from authentication and should not be removed accidentally.
5. The legacy offline queue includes a server route that accepts client payload identity fields; this is outside Step 2C but should be tracked for a separate authorization review.

## Final status

**HUMAN REVIEW REQUIRED**

The audit is complete and the safe migration path is identified, but Step 2C should not be implemented by simply deleting localStorage calls. The legacy `ApiClient` still has active consumers and must first be migrated to the canonical Supabase session mechanism while preserving login, signup, logout, protected routes, admin access, and API behavior.
