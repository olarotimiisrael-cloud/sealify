# Sealify Nigeria - Cloudflare Pages Deployment Checklist

## ✅ Pre-Deployment (Local)

- [ ] Run `npm run build` locally - verify no TypeScript errors
- [ ] Test all routes locally: `/login`, `/post-ad`, `/my-ads`, `/settings`, `/admin/login`
- [ ] Verify `_redirects` file exists in `public/_redirects` with content: `/* /index.html 200`
- [ ] Verify `wrangler.toml` has correct configuration
- [ ] Commit and push to GitHub/GitLab

## ☁️ Cloudflare Pages Dashboard Setup

### 1. Create Project
- [ ] Go to Cloudflare Dashboard → Pages → Create a project
- [ ] Connect Git repository (GitHub/GitLab)
- [ ] Project name: `sealify-nigeria`

### 2. Build Configuration
| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (empty) |
| Node version | `18` or `20` (set in Environment Variables) |

### 3. Environment Variables (Production)
Add in **Settings → Environment variables**:

| Variable | Value | Type |
|----------|-------|------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Secret |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Secret |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Secret |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Secret |
| `NODE_VERSION` | `20` | Plain text |

### 4. Custom Domain (Optional)
- [ ] Add custom domain: `sealify.ng` or `app.sealify.ng`
- [ ] Configure DNS records as instructed by Cloudflare
- [ ] Enable "Always Use HTTPS"

## 🗄️ Supabase Production Setup

### 1. Authentication Settings
Go to **Authentication → Settings**:
- [ ] **Site URL**: `https://your-domain.pages.dev` (or custom domain)
- [ ] **Redirect URLs**: Add `https://your-domain.pages.dev/**`
- [ ] Enable Email/Password provider
- [ ] Configure email templates (optional)

### 2. Storage Buckets
Go to **Storage → Create bucket** (all public):

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `profile-media` | ✅ Yes | Avatars, cover photos, verification docs |
| `ad-images` | ✅ Yes | Classified ad images |
| `documents` | ✅ Yes | Verification documents, receipts |

### 3. Storage Policies (SQL Editor)
Run these for each bucket:

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

### 3. Enable Realtime
**Database → Replication:**
- Enable for: `messages`, `notifications`, `conversations`, `ads`, `escrow_orders`

### 4. Database Migration
Go to **SQL Editor → New Query** → Paste contents of `supabase/migrations/20240101000000_initial_schema.sql` → Run

### 5. Verify Tables Created
Run in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
Should show 30+ tables.

## 🚀 Deploy

### Option A: Automatic (Git Push)
- [ ] Push to main branch
- [ ] Cloudflare auto-builds and deploys
- [ ] Check build logs for errors

### Option B: Manual (Wrangler CLI)
```bash
npm install -g wrangler
wrangler login
npm run deploy
```

## ✅ Post-Deploy Verification

Test these URLs return the React app (not blank/404):

| Route | Expected |
|-------|----------|
| `https://your-domain.pages.dev/` | Homepage with listings |
| `https://your-domain.pages.dev/login` | Auth modal opens |
| `https://your-domain.pages.dev/post-ad` | Post ad wizard |
| `https://your-domain.pages.dev/my-ads` | Redirects to login or shows dashboard |
| `https://your-domain.pages.dev/settings` | Redirects to login or shows settings |
| `https://your-domain.pages.dev/admin/login` | Admin terminal |
| `https://your-domain.pages.dev/messages` | Redirects to login |
| `https://your-domain.pages.dev/saved` | Redirects to login |

### Functional Tests
- [ ] Sign up new account → Verify email → Login works
- [ ] Post a new ad with images → Appears on homepage
- [ ] Search/filter listings → Results update
- [ ] Save/unsave listing → Heart icon toggles
- [ ] Open chat → Send message → Real-time works
- [ ] Admin login with credentials → Admin dashboard loads
- [ ] PWA install prompt appears on mobile

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page on subroutes | Verify `public/_redirects` exists with `/* /index.html 200` |
| "Module not found" errors | Check `vite.config.ts` has `base: "/"` |
| Supabase auth redirect fails | Verify Site URL and Redirect URLs in Supabase Auth settings |
| Images not uploading | Check storage bucket policies, CORS settings |
| Real-time not working | Enable Replication for tables in Supabase → Database → Replication |
| Admin login fails | Verify `admin@sealify.ng` / `sealify2024` / `123456` in localStorage or context |

## 📱 PWA Verification
- [ ] Visit on mobile Chrome → "Add to Home Screen" prompt appears
- [ ] Install → Opens full-screen without browser UI
- [ ] Offline: Disconnect network → Cached pages still load
- [ ] Push notifications: Allow → Test from Admin → Broadcast

## 📞 Support Contacts
- **Cloudflare Pages**: Dashboard → Support
- **Supabase**: Dashboard → Support → Discord/GitHub
- **Domain/DNS**: Your registrar (Namecheap, GoDaddy, etc.)

---

**Estimated deployment time**: 15-30 minutes
**Cost**: Free tier on Cloudflare Pages + Supabase Free Tier