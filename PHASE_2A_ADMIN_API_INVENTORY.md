# PHASE 2A — ADMIN API INVENTORY

## Endpoint Classification

| Method | Path | Category | Auth | Admin | DB | Used By Frontend |
|--------|------|----------|------|-------|----|------------------|
| POST | `/api/auth/admin-login` | AUTH | No | Verifies | Yes | AdminLogin.tsx |
| GET | `/api/admin/stats` | ADMIN | Bearer | Yes | Yes | AdminDashboard.tsx |
| GET | `/api/admin/users` | ADMIN | Bearer | Yes | Yes | AdminDashboard.tsx |
| PUT | `/api/admin/users/:id` | ADMIN | Bearer | Yes | Yes | AdminDashboard.tsx |
| DELETE | `/api/admin/users/:id` | ADMIN | Bearer | Yes | Yes | AdminDashboard.tsx |
| POST | `/api/admin/users/bulk` | ADMIN | Bearer | Yes | Yes | AdminDashboard.tsx |
| GET | `/api/admin/listings` | ADMIN | Bearer | Yes | Yes | AdminDashboard.tsx |
| GET | `/api/admin/reports` | MODERATION | Bearer | Yes | Yes | AdminDashboard.tsx |
| PUT | `/api/admin/reports/:id` | MODERATION | Bearer | Yes | Yes | SealifyContext.tsx |
| GET | `/api/admin/disputes` | MODERATION | Bearer | Yes | Yes | AdminDashboard.tsx |
| PUT | `/api/admin/disputes/:id` | MODERATION | Bearer | Yes | Yes | SealifyContext.tsx |
| GET | `/api/admin/verifications` | MODERATION | Bearer | Yes | Yes | AdminDashboard.tsx |
| PUT | `/api/admin/verifications/:id` | MODERATION | Bearer | Yes | Yes | SealifyContext.tsx |
| GET | `/api/admin/promotions` | MODERATION | Bearer | Yes | Yes | AdminDashboard.tsx |
| PUT | `/api/admin/promotions/:id` | MODERATION | Bearer | Yes | Yes | SealifyContext.tsx |
| GET | `/api/admin/passwords` | MODERATION | Bearer | Yes | Yes | AdminDashboard.tsx |
| PUT | `/api/admin/passwords/:id` | MODERATION | Bearer | Yes | Yes | AdminDashboard.tsx |
| GET | `/api/admin/audit-logs` | ADMIN | Bearer | Yes | Yes | AdminDashboard.tsx |
| GET | `/api/admin/intrusion-logs` | ADMIN | Bearer | Yes | Yes | AdminDashboard.tsx |
| GET | `/api/admin/system-config` | SETTINGS | Bearer | Yes | Yes | SealifyContext.tsx, DatabaseTest.tsx |
| PUT | `/api/admin/system-config` | SETTINGS | Bearer | Yes | Yes | SealifyContext.tsx |
| GET | `/api/admin/ai-settings` | SETTINGS | Bearer | Yes | No | AdminAiSettings.tsx |
| PUT | `/api/admin/ai-settings` | SETTINGS | Bearer | Yes | No | AdminAiSettings.tsx |
| POST | `/api/admin/ai-settings/test` | SETTINGS | Bearer | Yes | No | AdminAiSettings.tsx |
| GET | `/api/admin/site-settings` | SETTINGS | Bearer | Yes | Yes | AdminDashboard.tsx |
| PUT | `/api/admin/site-settings` | SETTINGS | Bearer | Yes | Yes | AdminDashboard.tsx |
| POST | `/api/admin/broadcast` | NOTIFICATIONS | Bearer | Yes | Yes | SealifyContext.tsx |
| POST | `/api/admin/email-digest` | NOTIFICATIONS | Bearer | Yes | Yes | SealifyContext.tsx |
| GET | `/api/admin/backup` | ADMIN | Bearer | Yes | Yes | AdminDashboard.tsx |
| GET | `/api/admin/schema` | ADMIN | Bearer | Yes | Yes | DatabaseDiagramViewer.tsx |

## Summary

| Category | Count |
|----------|-------|
| AUTH | 1 |
| ADMIN | 8 |
| MODERATION | 10 |
| SETTINGS | 7 |
| NOTIFICATIONS | 2 |
| **TOTAL** | **28** |

## Frontend API Calls (adminFetch)

| Endpoint | File | Line |
|----------|------|------|
| `/api/admin/broadcast` | SealifyContext.tsx | 1092 |
| `/api/admin/email-digest` | SealifyContext.tsx | 1111 |
| `/api/admin/verifications/:id` | SealifyContext.tsx | 1162 |
| `/api/admin/promotions/:id` | SealifyContext.tsx | 1182 |
| `/api/admin/reports/:id` | SealifyContext.tsx | 1227 |
| `/api/admin/disputes/:id` | SealifyContext.tsx | 1249 |
| `/api/admin/system-config` | SealifyContext.tsx | 1459, 1507 |
| `/api/admin/ai-settings` | AdminAiSettings.tsx | 60, 112, 147 |
| `/api/admin/schema` | DatabaseDiagramViewer.tsx | 25 |
| `/api/admin/system-config` | DatabaseTest.tsx | 73 |

## Porting Priority

### Priority 1 — Required for Admin Login
- `POST /api/auth/admin-login` ✅ Already ported

### Priority 2 — Required for Dashboard
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/listings`

### Priority 3 — Required for Moderation
- `PUT /api/admin/verifications/:id`
- `PUT /api/admin/promotions/:id`
- `PUT /api/admin/reports/:id`
- `PUT /api/admin/disputes/:id`

### Priority 4 — Required for Settings
- `GET /api/admin/system-config`
- `PUT /api/admin/system-config`
- `GET /api/admin/site-settings`
- `PUT /api/admin/site-settings`

### Priority 5 — Required for Notifications
- `POST /api/admin/broadcast`
- `POST /api/admin/email-digest`

### Priority 6 — Remaining Admin
- All remaining admin endpoints
