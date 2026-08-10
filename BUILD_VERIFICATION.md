# ✅ BUILD & DEPLOYMENT VERIFICATION

## Pre-Deployment Verification (Local)

```bash
# 1. Clean install
rm -rf node_modules package-lock.json dist
npm install

# 2. Run all checks
npm run lint        # ESLint - should pass with 0 errors
npm run typecheck   # TypeScript - should pass with 0 errors
npm run build       # Production build - should generate dist/

# 3. Verify build output
ls -la dist/
# Should contain: index.html, assets/, _headers, _redirects, manifest.json, sw.js
```

## Expected Build Output Structure

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other chunks]
├── _headers
├── _redirects
├── manifest.json
├── sw.js
├── logo.png
└── og-image.png
```

## CI/CD Pipeline Verification

### GitHub Actions (Check each job)

| Job | Expected Status | Key Checks |
|-----|----------------|------------|
| `lint-and-typecheck` | ✅ PASS | ESLint 0 errors, `tsc --noEmit` 0 errors |
| `build` | ✅ PASS | `npm ci`, `npm run build` succeeds, artifacts uploaded |
| `deploy-preview` | ✅ PASS | Preview URL generated for PR |
| `deploy-production` | ✅ PASS | Deploys to `sealify.pages.dev` |

### GitHub Actions Logs to Verify

```yaml
# lint-and-typecheck
Run npm run lint
# Should show: "✓ 0 problems"

Run npm run typecheck  
# Should show: "OK" or no output (0 errors)

# build
Run npm ci
# Should complete without "package-lock.json not found"

Run npm run build
# Should show: "✓ built in Xms"
# Should upload dist/ artifact

# deploy-production
# Should show: "✅ Deployment successful!"
# Should show: "🌐 Live at: https://sealify.pages.dev"
```

## Cloudflare Pages Verification

### Dashboard Checks

1. **Project:** `sealify-nigeria`
2. **Production Branch:** `main`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Node Version:** `20` (in Environment Variables)

### Environment Variables (Production)

| Variable | Status |
|----------|--------|
| `VITE_SUPABASE_URL` | ✅ Set |
| `VITE_SUPABASE_ANON_KEY` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set |
| `SUPABASE_ANON_KEY` | ✅ Set |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set (Secret) |
| `ADMIN_EMAIL` | ✅ Set (Secret) |
| `ADMIN_PASSWORD` | ✅ Set (Secret) |
| `ADMIN_PIN` | ✅ Set (Secret) |
| `NODE_VERSION` | `20` |
| `NODE_ENV` | `production` |

### Custom Domain (if configured)
- `sealify.ng` → DNS records configured
- HTTPS: Enabled
- Always Use HTTPS: Enabled

## Production Deployment Verification

### Step-by-Step Validation

```bash
# 1. Push to main
git push origin main

# 2. Watch GitHub Actions
# Go to: https://github.com/<owner>/<repo>/actions

# 3. Verify each job completes
# - lint-and-typecheck: ~2-3 min
# - build: ~3-5 min
# - deploy-production: ~2-3 min

# 4. Check Cloudflare Pages dashboard
# https://dash.cloudflare.com/<account>/pages/view/sealify-nigeria

# 4. Verify production URL
curl -I https://sealify.pages.dev
# Should return: 200 OK
# Content-Type: text/html

# 5. Verify content is latest commit
curl -s https://sealify.pages.dev | grep -o 'commit-[a-f0-9]\{7\}'
# Or check for new feature/change in UI
```

### Smoke Tests on Production

| Test | Expected Result |
|------|----------------|
| Homepage loads | ✅ 200 OK, React app mounts |
| `/listing/:id` works | ✅ Shows listing detail |
| `/post-ad` redirects to login | ✅ Auth modal opens |
| `/my-ads` redirects to login | ✅ Auth modal opens |
| `/admin/login` loads | ✅ Admin terminal UI |
| `/vendors` works | ✅ Shows vendor directory |
| `/market-insights` works | ✅ Shows price index |
| PWA install prompt | ✅ Appears on mobile |
| Real-time chat | ✅ Messages send/receive |
| Search works | ✅ Filters listings |

## Verification Checklist

```markdown
## Local Build
- [ ] `npm ci` succeeds
- [ ] `npm run lint` → 0 errors
- [ ] `npm run typecheck` → 0 errors  
- [ ] `npm run build` → dist/ generated
- [ ] dist/ contains all required files

## GitHub Actions
- [ ] lint-and-typecheck: PASS
- [ ] build: PASS + artifacts uploaded
- [ ] deploy-production: PASS (on main push)

## Cloudflare Pages
- [ ] Build succeeds
- [ ] Deploy succeeds
- [ ] Environment variables set
- [ ] Custom domain works (if configured)
- [ ] HTTPS enforced

## Production URL
- [ ] https://sealify.pages.dev returns 200
- [ ] Contains latest commit changes
- [ ] All routes work (no 404 on SPA routes)
- [ ] PWA manifest accessible
- [ ] Service worker registers

## Security
- [ ] No .env files in repo
- [ ] Secrets in Cloudflare/GitHub only
- [ ] CSP headers present
- [ ] Admin credentials rotated
```

## Rollback Plan

If deployment fails or introduces regression:

```bash
# 1. Cloudflare Pages → Deployments → Click "..." on last working build → "Promote to production"
# 2. Or: git revert <bad-commit> && git push origin main
# 3. DNS: Point back to previous working deployment if needed
```

## Final Sign-Off

**Deployment is production-ready when:**
- ✅ All checklist items PASS
- ✅ https://sealify.pages.dev shows latest commit
- ✅ No console errors in production
- ✅ All critical user flows work
- ✅ No sensitive data in repo
- ✅ CI/CD pipeline green