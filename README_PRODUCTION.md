# 🚀 SEALIFY NIGERIA - PRODUCTION DEPLOYMENT GUIDE

## QUICK START (15 minutes)

### 1. SUPABASE SETUP
```bash
# 1. Create project at supabase.com
# 2. Run migrations in SQL Editor:
#    - supabase/migrations/20240101000000_initial_schema.sql
#    - server/db/schema.sql
# 3. Enable Realtime for: messages, notifications, conversations, ads, escrow_orders
# 4. Create 3 PUBLIC storage buckets: profile-media, ad-images, documents
# 5. Run storage policies (see PRODUCTION_SETUP.md)
```

### 2. CLOUDFLARE PAGES
```bash
# 1. Connect GitHub repo to Cloudflare Pages
# 2. Build command: npm run build
# 3. Output directory: dist
# 4. Add environment variables (see .env.production.example)
```

### 3. DNS & DOMAIN
```
Type: CNAME
Name: www
Target: sealify-ng.pages.dev
Proxy: ✅ On

Type: A
Name: @
Target: 104.21.x.x (Cloudflare IP)
Proxy: ✅ On
```

---

## CRITICAL FIXES FOR USER COMPLAINTS

| Complaint | Fix |
|-----------|-----|
| "Can't login" | Fix Supabase Auth Site URL + Redirect URLs |
| "Images won't upload" | Create storage buckets + policies |
| "Chat not real-time" | Enable Realtime on messages table |
| "PWA won't install" | Fix service worker registration |
| "Notifications not working" | Enable Realtime + fix notification policies |
| "Admin panel denied" | Ensure admin user exists in profiles table |
| "Search broken" | Run full migration with indexes |

---

## ENVIRONMENT VARIABLES (Cloudflare Pages)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Same as above (for Workers) |
| `SUPABASE_ANON_KEY` | ✅ | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role (SECRET!) |
| `NODE_VERSION` | ✅ | `20` |
| `NODE_ENV` | ✅ | `production` |

---

## API ENDPOINTS (Cloudflare Workers)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/listings` | List ads (with filters) |
| POST | `/api/listings` | Create ad |
| GET | `/api/listings/:id` | Get ad |
| PUT | `/api/listings/:id` | Update ad |
| DELETE | `/api/listings/:id` | Delete ad |
| GET | `/api/conversations` | User conversations |
| POST | `/api/conversations` | Start conversation |
| GET | `/api/conversations/:id/messages` | Get messages |
| GET | `/api/notifications` | User notifications |
| PUT | `/api/notifications/read-all` | Mark all read |
| POST | `/api/escrow` | Create escrow |
| POST | `/api/escrow/:id/release` | Release escrow |

---

## DATABASE TABLES (30+ tables)

Core: `profiles`, `ads`, `categories`, `subcategories`
Messaging: `conversations`, `messages`
Payments: `wallets`, `transactions`, `escrow_orders`
Moderation: `reports`, `disputes`, `verification_requests`, `password_requests`
Engagement: `notifications`, `favorites`, `reviews`, `buyer_requests`
System: `system_configs`, `site_settings`, `audit_logs`, `intrusion_logs`

---

## DEPLOYMENT COMMANDS

```bash
# Local development
npm run dev

# Production build
npm run build

# Preview build
npm run build:dev

# Deploy to Cloudflare Pages
npm run deploy

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## MONITORING & DEBUGGING

### Health Checks
- `GET /api/health` - Basic health
- `GET /api/health/db` - Database connectivity

### Logs
- Cloudflare Workers: Dashboard → Workers → Logs
- Supabase: Dashboard → Logs → Database/Realtime/Auth

### Common Issues
1. **CORS errors** - Check `_headers` file
2. **Auth redirect loops** - Fix Supabase Site URL
3. **Realtime not working** - Enable Replication in Supabase
4. **Images 404** - Check storage bucket policies
5. **PWA not installing** - Verify `manifest.json` + `sw.js`

---

## SUPPORT CONTACTS

- **Supabase**: Dashboard → Support → Discord
- **Cloudflare**: Dashboard → Support
- **GitHub Actions**: Repo → Actions tab