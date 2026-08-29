# PHASE 2B — MARKETPLACE API INVENTORY

## Endpoint Classification

| Method | Path | Category | Auth | Owner Check | DB | Status |
|--------|------|----------|------|-------------|----|--------|
| GET | `/api/listings/` | LISTINGS | No | No | Yes | MIGRATED |
| GET | `/api/listings/:id` | LISTINGS | No | No | Yes | MIGRATED |
| POST | `/api/listings/` | LISTINGS | Yes | No | Yes | MIGRATED |
| PUT | `/api/listings/:id` | LISTINGS | Yes | Yes | Yes | MIGRATED |
| DELETE | `/api/listings/:id` | LISTINGS | Yes | Yes | Yes | MIGRATED |
| POST | `/api/listings/:id/featured` | LISTINGS | Yes | Yes | Yes | MIGRATED |
| GET | `/api/listings/meta/categories` | LISTINGS | No | No | Yes | MIGRATED |
| GET | `/api/categories/` | CATEGORIES | No | No | Yes | MIGRATED |
| GET | `/api/categories/with-subcategories` | CATEGORIES | No | No | Yes | MIGRATED |
| GET | `/api/categories/:id` | CATEGORIES | No | No | Yes | MIGRATED |
| POST | `/api/categories/` | CATEGORIES | Yes (Admin) | No | Yes | MIGRATED |
| PUT | `/api/categories/:id` | CATEGORIES | No | No | Yes | MIGRATED |
| DELETE | `/api/categories/:id` | CATEGORIES | No | No | Yes | MIGRATED |
| GET | `/api/categories/:id/subcategories` | CATEGORIES | No | No | Yes | MIGRATED |
| GET | `/api/search/` | SEARCH | No | No | Yes | MIGRATED |
| GET | `/api/search/suggestions` | SEARCH | No | No | Yes | MIGRATED |
| GET | `/api/search/trending` | SEARCH | No | No | Yes | MIGRATED |
| POST | `/api/search/alerts` | SEARCH | Yes | No | Yes | MIGRATED |
| GET | `/api/search/alerts` | SEARCH | Yes | No | Yes | MIGRATED |
| DELETE | `/api/search/alerts/:id` | SEARCH | Yes | Yes | Yes | MIGRATED |
| GET | `/api/reviews/seller/:sellerId` | REVIEWS | No | No | Yes | MIGRATED |
| POST | `/api/reviews/` | REVIEWS | Yes | No | Yes | MIGRATED |
| PUT | `/api/reviews/:id` | REVIEWS | Yes | Yes | Yes | MIGRATED |
| DELETE | `/api/reviews/:id` | REVIEWS | Yes | Yes | Yes | MIGRATED |
| GET | `/api/reviews/admin/all` | REVIEWS | Yes (Admin) | No | Yes | MIGRATED |
| PUT | `/api/reviews/admin/:id` | REVIEWS | Yes (Admin) | No | Yes | MIGRATED |
| DELETE | `/api/reviews/admin/:id` | REVIEWS | Yes (Admin) | No | Yes | MIGRATED |
| GET | `/api/buyer-requests/` | BUYER_REQUESTS | No | No | Yes | MIGRATED |
| POST | `/api/buyer-requests/` | BUYER_REQUESTS | Yes | No | Yes | MIGRATED |
| POST | `/api/buyer-requests/:id/respond` | BUYER_REQUESTS | Yes | No | Yes | MIGRATED |
| PUT | `/api/buyer-requests/:id` | BUYER_REQUESTS | Yes | Yes | Yes | MIGRATED |
| DELETE | `/api/buyer-requests/:id` | BUYER_REQUESTS | Yes | Yes | Yes | MIGRATED |

## Summary

| Category | Count |
|----------|-------|
| LISTINGS | 7 |
| CATEGORIES | 7 |
| SEARCH | 6 |
| REVIEWS | 7 |
| BUYER_REQUESTS | 5 |
| **TOTAL** | **32** |
