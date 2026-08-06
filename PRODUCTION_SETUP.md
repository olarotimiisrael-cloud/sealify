# 🚨 SEALIFY NIGERIA - PRODUCTION FIX CHECKLIST

## IMMEDIATE ACTIONS (Do these FIRST - 30 mins)

### 1. SUPABASE AUTH CONFIGURATION (Fixes: "Can't login", "Redirect loops", "Email not received")
**Go to Supabase Dashboard → Authentication → Settings:**

| Setting | Value |
|---------|-------|
| **Site URL** | `https://sealify.ng` (your actual domain) |
| **Redirect URLs** | `https://sealify.ng/**`, `https://www.sealify.ng/**` |
| **Enable Email Confirmations** | ✅ ON |
| **Enable Phone Confirmations** | ✅ ON (if using SMS) |
| **Secure password requirements** | ✅ ON |
| **Email Template - Confirm signup** | Customize with your branding |
| **Email Template - Magic Link** | Customize with your branding |
| **SMTP Settings** | Use Resend/SendGrid (not Supabase default) |

### 2. STORAGE BUCKETS (Fixes: "Images won't upload", "Avatar not saving")
**Go to Storage → Create these 3 PUBLIC buckets:**

```sql
-- Run in SQL Editor for EACH bucket:

-- 1. profile-media (avatars, covers, KYC docs)
-- 2. ad-images (listing photos)
-- 3. documents (receipts, KYC, verification)

-- POLICIES (run for each bucket):
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'profile-media');
CREATE POLICY "Authenticated upload own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Authenticated update own" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Authenticated delete own" ON storage.objects FOR DELETE USING (bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. REALTIME (Fixes: "Chat not real-time", "Notifications delayed")
**Database → Replication → Enable for these tables:**
- `messages`
- `notifications`
- `conversations`
- `ads` (listings)
- `escrow_orders`
- `favorites`
- `wallets`

Publication: `supabase_realtime`

### 4. CLOUDFLARE PAGES ENV VARS (Fixes: "API not working", "Build fails")
**Settings → Environment Variables (Production):**

| Variable | Value | Type |
|----------|-------|------|
| `VITE_SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` | Secret |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Secret |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` | Secret |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Secret |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Secret |
| `NODE_VERSION` | `20` | Plain |
| `NODE_ENV` | `production` | Plain |
| `VITE_SITE_URL` | `https://sealify.ng` | Plain |

### 5. RUN PRODUCTION MIGRATIONS (Fixes: "Database errors", "Missing tables")
**SQL Editor → Run in order:**
1. `supabase/migrations/20240101000000_initial_schema.sql`
2. `server/db/schema.sql` (analytics tables)
3. `src/admin/seed-production.ts` content

---

## COMMON COMPLAINT → ROOT CAUSE → FIX

| User Complaint | Root Cause | Fix |
|---|---|---|
| "Can't login / stuck on loading" | Auth redirect URL mismatch | Fix #1 above |
| "Images won't upload" | Storage bucket missing/policies | Fix #2 above |
| "Chat doesn't update in real-time" | Realtime not enabled | Fix #3 above |
| "Admin panel shows 'Access Denied'" | Admin user not in profiles table | Run seed script |
| "PWA won't install" | Service worker / manifest issue | Check `public/sw.js`, `public/manifest.json` |
| "Push notifications don't work" | VAPID keys missing | Add to env vars |
| "Search returns no results" | Missing indexes / RLS blocking | Run migration #5 |
| "Can't post ad" | RLS policy too strict | Check `ads` table policies |
| "Escrow/payment fails" | Edge functions not deployed | Deploy Cloudflare Workers |
| "Notifications not showing" | RLS on notifications table | Enable realtime + fix policies |
| "Saved items disappear" | Favorites RLS policy | Fix `favorites` table policy |
| "Profile won't save" | Profiles RLS policy | Check `profiles` update policy |
| "Verified badge not showing" | Verification request flow broken | Check `verification_requests` table |
| "Price guard shows wrong data" | Market stats not seeded | Run seed script |
| "Map view empty" | Safe spots not seeded | Run seed script |

---

## VERIFICATION COMMANDS (Run after fixes)

```bash
# 1. Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" https://YOUR-PROJECT.supabase.co/rest/v1/profiles?select=count

# 2. Test Auth
curl -X POST https://YOUR-PROJECT.supabase.co/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Test Storage
curl -X POST https://YOUR-PROJECT.supabase.co/storage/v1/object/profile-media/test.txt \
  -H "Authorization: Bearer USER_JWT" \
  -F "file=@test.txt"

# 4. Test Realtime (in browser console)
const channel = supabase.channel('test').on('postgres_changes', {event:'*', schema:'public'}, console.log).subscribe()

# 5. Test Cloudflare Workers
curl https://sealify.ng/api/health
```

---

## MONITORING SETUP (Prevent future complaints)

### 1. Sentry (Error Tracking)
```bash
# Add to Cloudflare Pages env vars
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 2. Supabase Logs
**Dashboard → Logs → Database → Filter by ERROR**

### 3. Cloudflare Analytics
**Dashboard → Analytics → Workers/Pages → Enable**

### 4. Uptime Monitoring
- UptimeRobot / BetterUptime: `https://sealify.ng/api/health`
- Alert on: 5xx errors, latency > 2s

---

## ROLLBACK PLAN

If deployment breaks:
1. Cloudflare Pages → Deployments → Click "..." → "Promote to production" on last working build
2. Supabase → Database → Backups → Restore to point-in-time
3. DNS: Point back to previous working deployment

---

## CONTACT FOR HELP

If still broken after all fixes:
- **Supabase Discord**: #support channel
- **Cloudflare Community**: Workers/Pages category
- **GitHub Issues**: Your repo → Issues

**Most issues are fixed by: Correct Auth URLs + Storage Policies + Realtime + Proper Env Vars**