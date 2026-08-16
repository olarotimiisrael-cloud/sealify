# Sealify Phase 2 Security Blockers

This document records issues intentionally not redesigned during Phase 1.

## Admin authentication

The frontend admin flow uses Supabase password authentication and checks the
profile role. Admin routes now require the authenticated Supabase bearer token
and validate the profile role server-side.

The former `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_PIN` login path was
removed. These variables must not be configured for the application. Previously
exposed values still require rotation and any necessary history cleanup.

Phase 2 must verify that every admin UI action sends the authenticated
credential. Admin credentials must remain server-side and must never be
returned in API responses.

## Cloudflare API deployment

The current Vite build emits static assets to `dist`. It does not emit a
Cloudflare Pages `functions` directory or `_worker.js`, while API code exists
under `src/entry-server.tsx` and `server/`. Phase 2 must establish and test
one supported Pages Functions/Worker build path before production deployment.

The server code also references a Hyperdrive binding that is not declared in
the current `wrangler.toml`; this must be resolved or removed from the chosen
deployment architecture.

## Database authorization

The repository contains broad `FOR ALL USING (true)` RLS policies in the
canonical schema and in the admin schema viewer, including sensitive tables.
Phase 2 must replace these with least-privilege policies and validate them in
staging without disabling RLS.

## AI settings persistence

Admin Copilot settings are stored in process memory by `setRuntimeAiConfig`.
Phase 2 must persist configuration through an approved server-side secret or
database mechanism and verify behavior across Worker isolates.
