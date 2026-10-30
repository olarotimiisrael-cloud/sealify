# Sealify — Render Staging Deployment (Combined Frontend + Laravel)

This document covers deploying Sealify to Render as a single Docker-based web
service that serves both the React/Vite frontend and the Laravel backend from
the `main` branch.

## Repository / branch

- Repository: `olarotimiisrael-cloud/sealify`
- Branch: `main`
- Dockerfile: `/Dockerfile` (repository root)
- Entrypoint: `/docker-entrypoint.sh`
- Docker ignore: `/.dockerignore`

## Architecture (single Render web service)

| Layer | Technology | Where it runs |
|-------|-----------|---------------|
| Frontend | React 19 + Vite 8 + TypeScript | Built at image-build time into Laravel `public/` |
| Backend | Laravel 13 (PHP 8.4) | Same container, Apache + PHP (mod_php via `php:8.4-apache`) |
| Database | SQLite (`database/database.sqlite`) | Local filesystem within the container |
| Storage | Local filesystem (`storage/app/public`) | Ephemeral within the container |

The frontend and backend share the same origin, so all API calls use same-origin
`/api` paths (no cross-origin production URL is embedded in the bundle).

## Render service setup

1. Create a new **Web Service** on Render connected to this repo,
   branch `main`.
2. Runtime: **Docker** (Dockerfile at repo root).
3. **SQLite note:** Render's free tier has an ephemeral filesystem — SQLite
   data (`database/database.sqlite`) will be reset on each deploy. For
   persistent data, attach a **Render Disk** to the web service and mount it
   at `/var/www/html/database`, then set `DB_DATABASE=/var/www/html/database/database.sqlite`.
4. Add the environment variables below in Render's "Environment" settings.
   Never commit `.env` or secret values.

## Environment variables (Render → staging service)

Set these in Render's web-service environment settings. Values marked
**secret** must never be committed to Git.

| Variable | Purpose | Staging value | Secret? |
|----------|---------|---------------|---------|
| `APP_ENV` | Application environment | `staging` | No |
| `APP_DEBUG` | Debug stack traces (disable in staging) | `false` | No |
| `APP_KEY` | Laravel encryption key | Generate fresh with `php artisan key:generate`; do NOT reuse production key | Yes |
| `APP_URL` | Canonical staging app URL | Set to the Render service URL after creation (e.g. `https://sealify-staging.onrender.com`) | No |
| `FRONTEND_URLS` | CORS allowed origins | Same as `APP_URL` (staging origin) | No |
| `SANCTUM_STATEFUL_DOMAINS` | SPA domain for Sanctum cookies | Staging origin host (no scheme) | No |
| `SESSION_SECURE_COOKIE` | HTTPS-only session cookie | `true` (Render serves HTTPS) | No |
| `SESSION_DRIVER` | Session storage | `database` | No |
| `SESSION_LIFETIME` | Session minutes | `120` | No |
| `DB_CONNECTION` | Database driver | `sqlite` | No |
| `DB_DATABASE` | SQLite database file path | `database/database.sqlite` (or mounted disk path) | No |
| `QUEUE_CONNECTION` | Queue driver | `database` | No |
| `CACHE_STORE` | Cache driver | `database` | No |
| `FILESYSTEM_DISK` | File storage disk | `local` | No |
| `BROADCAST_CONNECTION` | Real-time driver | `log` (degrades gracefully) | No |
| `MAIL_MAILER` | Mail driver | `log` (staging; no real email) | No |
| `MAIL_FROM_ADDRESS` | Sender address | `hello@sealify-staging.example` | No |
| `PAYSTACK_SECRET_KEY` | Paystack secret (server-side) | Paystack **sandbox/test** key only | Yes |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | Paystack sandbox/test key | No |
| `PAYSTACK_WEBHOOK_SECRET` | Paystack webhook HMAC secret | Paystack webhook secret | Yes |
| `BYTID_API_KEY` | Bytid KYC provider key | Staging/test key, or unset to degrade gracefully | Yes |
| `VITE_API_BASE` | Frontend API base path | `/api` (same-origin) | No |
| `VITE_PUSHER_APP_KEY` | Pusher public key (optional) | Staging key, or unset | No |
| `VITE_PUSHER_HOST` | Pusher host (optional) | Staging host, or unset | No |
| `VITE_PUSHER_PORT` | Pusher port (optional) | `443` | No |
| `VITE_PUSHER_SCHEME` | Pusher scheme (optional) | `https` | No |
| `PORT` | Container listen port | Render injects automatically | No |

### Notes

- **`APP_KEY`**: Generate a new key locally (`php artisan key:generate --show`) and paste it into Render. Do not copy the production `APP_KEY`.
- **`VITE_API_BASE=/api`**: Ensures the frontend calls the same-origin staging API. Do not set this to `https://api.sealify.ng` or any production URL.
- **Paystack**: Use sandbox/test credentials for staging. Never enable live keys on staging.
- **Bytid / Pusher**: Optional. The app degrades gracefully when these are unset.
- **Mail**: `log` driver in staging so no real email is sent.
- **SQLite persistence**: Without a Render Disk, the SQLite database is recreated on each deploy. Attach a Render Disk mounted at `/var/www/html/database` and set `DB_DATABASE=/var/www/html/database/database.sqlite` for persistent data across deploys.

## Session / cache / queue drivers

Staging uses database-backed `SESSION_DRIVER`, `CACHE_STORE`, and
`QUEUE_CONNECTION`. The required tables (`sessions`, `cache`, `cache_locks`,
`jobs`) are all created by the committed migrations, so no driver change is
needed for SQLite.

## Database (migrations)

- Migrations are SQLite-compatible (all `up()` changes are additive).
- Do **NOT** run migrations automatically in the container entrypoint. The
  entrypoint intentionally does not migrate.
- Run migrations once against the SQLite database after the service
  is created, e.g. via a Render shell / one-off deploy:
  `php artisan migrate --force`
- Never run `migrate:fresh`, `migrate:refresh`, `db:wipe`, or destructive SQL.

## Health checks

Render health-check path: `/up` (Laravel built-in) and `/health` (reports DB
connectivity). Both return `200 OK` when the app and database are reachable.

## Port

The entrypoint configures Apache to listen on Render's `$PORT`. Do not hardcode
a different port in Render's service settings.

## What is NOT in the image

- `.env` and any secret values (provided at runtime via Render)
- `node_modules` / `vendor` (installed during image build)
- `.git` directory
- `tests/` (not required to run the app)
- `public/assets` (rebuilt at image-build time from the frontend source)
- `database/database.sqlite` (created at runtime via migrations)

## Rollback

Roll back by redeploying the previous image tag / commit on Render. Database
schema rollbacks (`migrate:rollback`) revert structure only and do not restore
deleted data — back up the staging database before migrating.
