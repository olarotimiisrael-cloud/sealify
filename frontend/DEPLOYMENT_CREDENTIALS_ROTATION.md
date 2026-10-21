# 🔴 CREDENTIAL ROTATION REQUIRED - PRODUCTION SECURITY INCIDENT

## Incident Summary
**Date Discovered:** 2024-01-27
**Severity:** CRITICAL
**Root Cause:** `.env` and `.env.production` files were committed to Git repository
**Exposure Duration:** Unknown (since files were committed)

## Compromised Credentials (MUST ROTATE ALL)

| Credential | Service | Rotation Status | Notes |
|------------|---------|-----------------|-------|
| `VITE_SUPABASE_ANON_KEY` | Supabase | 🔴 PENDING | Public anon key - low risk but rotate anyway |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | 🔴 PENDING | **CRITICAL** - Full database admin access |
| `SUPABASE_URL` | Supabase | 🔴 PENDING | Project reference |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_PIN` | Legacy Admin Auth | 🔴 ROTATE/REMOVE | No longer used; rotate previously exposed values and remove runtime configuration |
| `VAPID_PRIVATE_KEY` | Push Notifications | 🔴 PENDING | Web Push signing key |
| `VITE_VAPID_PUBLIC_KEY` | Push Notifications | 🔴 PENDING | Public key - low risk |

## Immediate Actions Required

### 1. Supabase (HIGHEST PRIORITY)
```bash
# 1. Go to Supabase Dashboard → Settings → API
# 2. Click "Rotate" on service_role key
# 3. Update Cloudflare Pages env var: SUPABASE_SERVICE_ROLE_KEY
# 4. Update local .env files
```

### 2. Legacy Admin Credentials
```bash
# 1. Rotate any previously exposed legacy admin password/PIN
# 2. Remove ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_PIN from runtime configuration
# 3. Clear browser sessions
```

### 3. VAPID Keys
```bash
# Generate new VAPID key pair:
npx web-push generate-vapid-keys

# Update Cloudflare Pages:
# - VAPID_PRIVATE_KEY (secret)
# - VITE_VAPID_PUBLIC_KEY (public)
```

### 4. Cloudflare API Token
```bash
# If CLOUDFLARE_API_TOKEN was in repo:
# 1. Go to Cloudflare → My Profile → API Tokens
# 2. Revoke compromised token
# 3. Create new token with Pages:Edit permissions
# 4. Update GitHub Secrets: CLOUDFLARE_API_TOKEN
```

## Verification Checklist
- [ ] All credentials rotated
- [ ] Cloudflare Pages environment variables updated
- [ ] GitHub Secrets updated
- [ ] Local .env files updated
- [ ] Admin terminal accessible with new credentials
- [ ] Push notifications working with new VAPID keys
- [ ] CI/CD pipeline deploying successfully
- [ ] No old credentials in git history (consider BFG repo-cleaner)

## Post-Rotation Monitoring
- Monitor Supabase logs for unauthorized access attempts
- Check Cloudflare Pages deployments
- Verify admin terminal login works
- Test push notifications end-to-end

## Prevention
1. ✅ Updated `.gitignore` to exclude `.env*`
2. ✅ Created `.env.example` and `.env.production.example` with placeholders only
3. ✅ Use Cloudflare Pages secrets for production credentials
4. ✅ Use GitHub Secrets for CI/CD credentials
5. ⏳ Consider using `git-filter-repo` or BFG Repo-Cleaner to purge credentials from git history
