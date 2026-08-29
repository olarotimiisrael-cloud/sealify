# MASTER API MIGRATION STATUS

## Original 97 Endpoints vs Express Endpoints

### AUTH (9 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| POST | `/api/auth/register` | src/api/auth.ts | server/routes/auth.ts | MIGRATED |
| POST | `/api/auth/admin-login` | src/api/auth.ts | server/routes/auth.ts | MIGRATED |
| POST | `/api/auth/login` | src/api/auth.ts | server/routes/auth.ts | MIGRATED |
| GET | `/api/auth/me` | src/api/auth.ts | server/routes/auth.ts | MIGRATED |
| PUT | `/api/auth/profile` | src/api/auth.ts | server/routes/auth.ts | MIGRATED |
| POST | `/api/auth/logout` | src/api/auth.ts | server/routes/auth.ts | MIGRATED |
| POST | `/api/auth/password/reset-request` | src/api/auth.ts | server/routes/auth.ts | MIGRATED |
| POST | `/api/auth/phone/otp` | src/api/auth.ts | server/routes/auth.ts | MIGRATED |
| POST | `/api/auth/phone/verify` | src/api/auth.ts | server/routes/auth.ts | MIGRATED |

### ADMIN (28 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/admin/stats` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/users` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| PUT | `/api/admin/users/:id` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| DELETE | `/api/admin/users/:id` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| POST | `/api/admin/users/bulk` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/listings` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/reports` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| PUT | `/api/admin/reports/:id` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/disputes` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| PUT | `/api/admin/disputes/:id` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/verifications` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| PUT | `/api/admin/verifications/:id` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/promotions` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| PUT | `/api/admin/promotions/:id` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/passwords` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| PUT | `/api/admin/passwords/:id` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/audit-logs` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/intrusion-logs` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/system-config` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| PUT | `/api/admin/system-config` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/ai-settings` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| PUT | `/api/admin/ai-settings` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| POST | `/api/admin/ai-settings/test` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/site-settings` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| PUT | `/api/admin/site-settings` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| POST | `/api/admin/broadcast` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| POST | `/api/admin/email-digest` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/backup` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |
| GET | `/api/admin/schema` | src/api/admin.ts | server/routes/admin.ts | MIGRATED |

### LISTINGS (7 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/listings/` | src/api/listings.ts | server/routes/listings.ts | MIGRATED |
| GET | `/api/listings/:id` | src/api/listings.ts | server/routes/listings.ts | MIGRATED |
| POST | `/api/listings/` | src/api/listings.ts | server/routes/listings.ts | MIGRATED |
| PUT | `/api/listings/:id` | src/api/listings.ts | server/routes/listings.ts | MIGRATED |
| DELETE | `/api/listings/:id` | src/api/listings.ts | server/routes/listings.ts | MIGRATED |
| POST | `/api/listings/:id/featured` | src/api/listings.ts | server/routes/listings.ts | MIGRATED |
| GET | `/api/listings/meta/categories` | src/api/listings.ts | server/routes/listings.ts | MIGRATED |

### CATEGORIES (7 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/categories/` | src/api/categories.ts | server/routes/categories.ts | MIGRATED |
| GET | `/api/categories/with-subcategories` | src/api/categories.ts | server/routes/categories.ts | MIGRATED |
| GET | `/api/categories/:id` | src/api/categories.ts | server/routes/categories.ts | MIGRATED |
| POST | `/api/categories/` | src/api/categories.ts | server/routes/categories.ts | MIGRATED |
| PUT | `/api/categories/:id` | src/api/categories.ts | server/routes/categories.ts | MIGRATED |
| DELETE | `/api/categories/:id` | src/api/categories.ts | server/routes/categories.ts | MIGRATED |
| GET | `/api/categories/:id/subcategories` | src/api/categories.ts | server/routes/categories.ts | MIGRATED |

### SEARCH (6 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/search/` | src/api/search.ts | server/routes/search.ts | MIGRATED |
| GET | `/api/search/suggestions` | src/api/search.ts | server/routes/search.ts | MIGRATED |
| GET | `/api/search/trending` | src/api/search.ts | server/routes/search.ts | MIGRATED |
| POST | `/api/search/alerts` | src/api/search.ts | server/routes/search.ts | MIGRATED |
| GET | `/api/search/alerts` | src/api/search.ts | server/routes/search.ts | MIGRATED |
| DELETE | `/api/search/alerts/:id` | src/api/search.ts | server/routes/search.ts | MIGRATED |

### USERS (6 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/users/` | src/api/users.ts | server/routes/users.ts | MIGRATED |
| GET | `/api/users/:id` | src/api/users.ts | server/routes/users.ts | MIGRATED |
| PUT | `/api/users/:id` | src/api/users.ts | server/routes/users.ts | MIGRATED |
| DELETE | `/api/users/:id` | src/api/users.ts | server/routes/users.ts | MIGRATED |
| GET | `/api/users/:id/listings` | src/api/users.ts | server/routes/users.ts | MIGRATED |
| GET | `/api/users/:id/reviews` | src/api/users.ts | server/routes/users.ts | MIGRATED |

### MESSAGES (4 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/messages/conversations` | src/api/messages.ts | server/routes/messages.ts | MIGRATED |
| GET | `/api/messages/conversations/:id/messages` | src/api/messages.ts | server/routes/messages.ts | MIGRATED |
| POST | `/api/messages/conversations` | src/api/messages.ts | server/routes/messages.ts | MIGRATED |
| PUT | `/api/messages/conversations/:id/read` | src/api/messages.ts | server/routes/messages.ts | MIGRATED |

### NOTIFICATIONS (4 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/notifications/` | src/api/notifications.ts | server/routes/notifications.ts | MIGRATED |
| PUT | `/api/notifications/:id/read` | src/api/notifications.ts | server/routes/notifications.ts | MIGRATED |
| PUT | `/api/notifications/read-all` | src/api/notifications.ts | server/routes/notifications.ts | MIGRATED |
| DELETE | `/api/notifications/:id` | src/api/notifications.ts | server/routes/notifications.ts | MIGRATED |

### REVIEWS (7 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/reviews/seller/:sellerId` | src/api/reviews.ts | server/routes/reviews.ts | MIGRATED |
| POST | `/api/reviews/` | src/api/reviews.ts | server/routes/reviews.ts | MIGRATED |
| PUT | `/api/reviews/:id` | src/api/reviews.ts | server/routes/reviews.ts | MIGRATED |
| DELETE | `/api/reviews/:id` | src/api/reviews.ts | server/routes/reviews.ts | MIGRATED |
| GET | `/api/reviews/admin/all` | src/api/reviews.ts | server/routes/reviews.ts | MIGRATED |
| PUT | `/api/reviews/admin/:id` | src/api/reviews.ts | server/routes/reviews.ts | MIGRATED |
| DELETE | `/api/reviews/admin/:id` | src/api/reviews.ts | server/routes/reviews.ts | MIGRATED |

### BUYER REQUESTS (5 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/buyer-requests/` | src/api/buyer-requests.ts | server/routes/buyer-requests.ts | MIGRATED |
| POST | `/api/buyer-requests/` | src/api/buyer-requests.ts | server/routes/buyer-requests.ts | MIGRATED |
| POST | `/api/buyer-requests/:id/respond` | src/api/buyer-requests.ts | server/routes/buyer-requests.ts | MIGRATED |
| PUT | `/api/buyer-requests/:id` | src/api/buyer-requests.ts | server/routes/buyer-requests.ts | MIGRATED |
| DELETE | `/api/buyer-requests/:id` | src/api/buyer-requests.ts | server/routes/buyer-requests.ts | MIGRATED |

### ANALYTICS (7 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/analytics/overview` | src/api/analytics.ts | server/routes/analytics.ts | MIGRATED |
| GET | `/api/analytics/users/growth` | src/api/analytics.ts | server/routes/analytics.ts | MIGRATED |
| GET | `/api/analytics/ads/performance` | src/api/analytics.ts | server/routes/analytics.ts | MIGRATED |
| GET | `/api/analytics/revenue` | src/api/analytics.ts | server/routes/analytics.ts | MIGRATED |
| GET | `/api/analytics/categories` | src/api/analytics.ts | server/routes/analytics.ts | MIGRATED |
| GET | `/api/analytics/events` | src/api/analytics.ts | server/routes/analytics.ts | MIGRATED |
| GET | `/api/analytics/performance` | src/api/analytics.ts | server/routes/analytics.ts | MIGRATED |

### PUSH (3 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| POST | `/api/push/subscribe` | src/api/push.ts | server/routes/push.ts | MIGRATED |
| POST | `/api/push/unsubscribe` | src/api/push.ts | server/routes/push.ts | MIGRATED |
| POST | `/api/push/admin/broadcast` | src/api/push.ts | server/routes/push.ts | MIGRATED |

### COPILOT (2 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/copilot/health` | src/api/copilot.ts | server/routes/copilot.ts | MIGRATED |
| POST | `/api/copilot/` | src/api/copilot.ts | server/routes/copilot.ts | MIGRATED |

### HEALTH (2 endpoints)

| Method | Path | Cloudflare | Express | Status |
|--------|------|------------|---------|--------|
| GET | `/api/health` | src/api/health.ts | server/routes/health.ts | MIGRATED |
| GET | `/api/health/db` | src/api/health.ts | server/routes/health.ts | MIGRATED |

## Summary

| Category | Count | Migrated | Remaining |
|----------|-------|----------|-----------|
| AUTH | 9 | 9 | 0 |
| ADMIN | 28 | 28 | 0 |
| LISTINGS | 7 | 7 | 0 |
| CATEGORIES | 7 | 7 | 0 |
| SEARCH | 6 | 6 | 0 |
| USERS | 6 | 6 | 0 |
| MESSAGES | 4 | 4 | 0 |
| NOTIFICATIONS | 4 | 4 | 0 |
| REVIEWS | 7 | 7 | 0 |
| BUYER_REQUESTS | 5 | 5 | 0 |
| ANALYTICS | 7 | 7 | 0 |
| PUSH | 3 | 3 | 0 |
| COPILOT | 2 | 2 | 0 |
| HEALTH | 2 | 2 | 0 |
| **TOTAL** | **97** | **97** | **0** |
