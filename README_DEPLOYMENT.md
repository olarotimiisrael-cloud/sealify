# 🚀 Sealify Nigeria - Complete Deployment Guide

## Overview
This guide covers deploying Sealify Nigeria to **Cloudflare Pages** with **Supabase** backend, including CI/CD pipeline, environment configuration, and production hardening.

---

## 📋 Prerequisites

- [ ] GitHub/GitLab repository
- [ ] Cloudflare account
- [ ] Supabase account
- [ ] Domain name (optional but recommended)

---

## 🗄️ Phase 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose organization, name: `sealify-nigeria-prod`
3. Set database password (save securely!)
4. Region: **Europe (Frankfurt)** or closest to Nigeria

### 1.2 Run Migrations
1. Go to **SQL Editor** → New Query
2. Copy contents of `supabase/migrations/20240101000000_initial_schema.sql`
3. Run → Verify 30+ tables created
4. Run `supabase/db/schema.sql` for analytics tables
5. Run `src/admin/seed-production.ts` content for seed data

### 1.3 Configure Authentication
**Authentication → Settings:**
- Site URL: `https://your-domain.pages.dev` (or custom domain)
- Redirect URLs: `https://your-domain.pages.dev/**`
- Enable: Email/Password, Phone (if using)
- Email templates: Customize if needed

### 1.4 Create Storage Buckets
**Storage → Create bucket (all PUBLIC):**

| Bucket | Purpose | Policies |
|--------|---------|----------|
| `profile-media` | Avatars, covers, verification docs | See below |
| `ad-images` | Classified ad images | See below |
| `documents` | Verification docs, receipts | See below |

**Run in SQL Editor for each bucket:**
```sql
-- profile-media
CREATE POLICY "Public avatars are viewable" ON storage.objects FOR SELECT USING (bucket_id = 'profile-media');
CREATE POLICY "Users can upload their own profile media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own profile media" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own profile media" ON storage.objects FOR DELETE USING (bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ad-images
CREATE POLICY "Public ad images are viewable" ON storage.objects FOR SELECT USING (bucket_id = 'ad-images');
CREATE POLICY "Sellers can upload ad images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Sellers can update their ad images" ON storage.objects FOR UPDATE USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Sellers can delete their ad images" ON storage.objects FOR DELETE USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- documents
CREATE POLICY "Users can upload their own documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND public.is_admin());
```

### 1.5 Enable Realtime
**Database → Replication:**
- Enable for: `messages`, `notifications`, `conversations`, `ads`, `escrow_orders`
- Publication: `supabase_realtime`

### 1.6 Get API Keys
**Settings → API:**
- Project URL: `https://xxxxx.supabase.co`
- Anon/Public Key: `eyJhbGciOiJIUzI1NiIs...`
- Service Role Key: `eyJhbGciOiJIUzI1NiIs...` (⚠️ Keep secret!)

---

## ☁️ Phase 2: Cloudflare Pages Setup

### 2.1 Create Project
1. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages**
2. Connect to Git → Select repository
3. Project name: `sealify-nigeria`

### 2.2 Build Configuration
| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (leave empty) |
| Node version | `20` (in Environment Variables) |

### 2.3 Environment Variables (Production)
**Settings → Environment variables → Add:**

| Variable | Value | Type |
|----------|-------|------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Secret |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Secret |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Secret |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Secret |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Secret |
| `NODE_VERSION` | `20` | Plain text |
| `NODE_ENV` | `production` | Plain text |

### 2.4 Custom Domain (Recommended)
1. **Custom domains** → Add domain: `sealify.ng`
2. Add DNS records as shown (CNAME for www, A for apex)
3. Enable **Always Use HTTPS**
4. Enable **Automatic HTTPS Rewrites**

---

## 🔄 Phase 3: CI/CD Pipeline (GitHub Actions)

### 3.1 Add Repository Secrets
**GitHub Repository → Settings → Secrets → Actions → New repository secret:**

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (Account scope) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

**To create Cloudflare API Token:**
1. Cloudflare Dashboard → **My Profile** → **API Tokens** → **Create Token**
2. Template: **Custom token**
3. Permissions: **Account** → **Cloudflare Pages** → **Edit**
3. Account Resources: **Include** → **All accounts**

### 3.2 Workflow Files (Already Created)
- `.github/workflows/ci.yml` - Main CI/CD
- `.github/workflows/dependency-review.yml` - Security scanning

### 3.3 Branch Protection
**Settings → Branches → Add rule for `main`:**
- ✅ Require pull request reviews
- ✅ Require status checks: `lint-and-typecheck`, `test`, `build`
- ✅ Require branches up to date
- ✅ Include administrators

---

## ✅ Phase 4: Post-Deploy Verification

### 4.1 Route Testing
Test these return React app (not blank/404):

| Route | Expected |
|-------|----------|
| `/` | Homepage with listings |
| `/login` | Auth modal opens |
| `/post-ad` | Post ad wizard |
| `/my-ads` | Redirects to login or dashboard |
| `/settings` | Redirects to login or settings |
| `/admin/login` | Admin terminal |
| `/messages` | Redirects to login |
| `/saved` | Redirects to login |
| `/seller/:id` | Vendor profile |
| `/listing/:id` | Ad detail page |

### 4.2 Functional Tests
- [ ] Sign up → Verify email → Login works
- [ ] Post ad with images → Appears on homepage
- [ ] Search/filter → Results update
- [ ] Save/unsave → Heart toggles
- [ ] Chat → Send message → Real-time works
- [ ] Admin login → Dashboard loads
- [ ] PWA install prompt on mobile

### 4.3 Admin Terminal
1. Go to `/admin/login`
2. Use credentials (change immediately!):
   - Email: `admin@sealify.ng`
   - Password: `sealify2024`
   - PIN: `123456`
3. Navigate to Settings → Root Credentials → Update all three

---

## 🔧 Phase 5: Production Hardening

### 5.1 Security Headers (Already in `public/_headers`)
- CSP, HSTS, X-Frame-Options, etc.

### 5.2 Rate Limiting
Add to Cloudflare **Security → WAF → Custom Rules:**
```
(http.request.uri.path contains "/api/" and http.request.method eq "POST")
→ Rate Limit: 30 requests/minute per IP
```

### 5.3 Bot Protection
**Security → Bots → Managed Challenge** for:
- `/admin*`
- `/api/auth*`
- `/post-ad`

### 5.4 Cache Rules
**Caching → Configuration:**
- Browser Cache TTL: 1 hour
- Edge Cache TTL: 4 hours (for static assets)

### 5.5 Analytics & Monitoring
- **Sentry**: Add DSN to env vars for error tracking
- **PostHog**: Add key for product analytics
- **Cloudflare Analytics**: Enable in dashboard

---

## 📱 Phase 6: PWA Verification

### 6.1 Test Installation
1. Open on mobile Chrome
2. Menu → **Install App** / **Add to Home Screen**
3. Verify: Opens full-screen, no browser UI

### 6.2 Test Offline
1. Install PWA
2. Disconnect network
3. Open app → Cached pages load
4. Try actions → Queued for sync

### 6.3 Push Notifications
1. Allow notifications in browser
2. Admin → Broadcast → Send test
3. Verify received on device

---

## 💰 Cost Estimate (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Cloudflare Pages | Free | $0 |
| Cloudflare Workers | Free (100k/day) | $0 |
| Supabase | Free (500MB DB, 2GB bandwidth) | $0 |
| Supabase Pro | If needed | $25/mo |
| Custom Domain | Cloudflare Registrar | ~$8/yr |
| **Total** | | **$0-25/mo** |

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank page on subroutes | Verify `public/_redirects` exists: `/* /index.html 200` |
| "Module not found" | Check `vite.config.ts` has `base: "/"` |
| Supabase auth redirect fails | Verify Site URL & Redirect URLs in Supabase Auth |
| Images not uploading | Check storage bucket policies, CORS |
| Real-time not working | Enable Replication in Supabase Database |
| Admin login fails | Check localStorage for admin credentials |
| Build fails on Cloudflare | Check Node version (20), build command |

---

## 📞 Support Contacts

- **Cloudflare**: Dashboard → Support → Enterprise/Community
- **Supabase**: Dashboard → Support → Discord/GitHub Issues
- **GitHub Actions**: Repository → Actions tab → Failed run logs
- **Domain/DNS**: Your registrar (Namecheap, GoDaddy, Cloudflare)

---

## 🎯 Launch Checklist

- [ ] Supabase project created & migrated
- [ ] Storage buckets with policies
- [ ] Realtime enabled for key tables
- [ ] Cloudflare Pages project connected
- [ ] Environment variables set (both envs)
- [ ] Custom domain configured + HTTPS
- [ ] GitHub Actions secrets added
- [ ] Branch protection enabled
- [ ] All routes tested post-deploy
- [ ] Admin credentials changed
- [ ] PWA installs on mobile
- [ ] Offline mode works
- [ ] Push notifications work
- [ ] Analytics connected
- [ ] Error tracking (Sentry) connected

---

**🎉 You're live at `https://sealify.ng`!**

The marketplace is now serving Ogbomosoland with verified sellers, safe meetup spots, AI pricing, and real-time chat.