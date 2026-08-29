# Cloudflare Retirement Plan

## Current Cloudflare Services

| Service | Purpose | Status |
|---------|---------|--------|
| Cloudflare Pages | Frontend hosting | ACTIVE - Keep for now |
| Cloudflare Pages Functions | Backend API | REPLACED by Express |
| Cloudflare Hyperdrive | PostgreSQL connection pool | REPLACED by direct connection |
| Cloudflare Wrangler | Deployment tool | NOT NEEDED for Render |

## What Render Replaces

| Cloudflare Component | Render Replacement |
|---------------------|-------------------|
| Pages Functions `/api/*` | Express server `/api/*` |
| Hyperdrive | `DATABASE_URL` direct connection |
| `functions/` directory | `server/` directory |
| `wrangler.toml` | `render.yaml` |
| `NEXT_PUBLIC_SUPABASE_URL` | `SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` |

## Rollback Plan

If Render deployment fails:

1. Frontend remains on Cloudflare Pages
2. Set `VITE_API_URL` back to Cloudflare Pages URL
3. Redeploy frontend to Cloudflare
4. Cloudflare backend is still functional (not deleted)

## Retirement Steps (Future)

1. Verify Render is stable for 30 days
2. Update DNS to point to Render (if moving frontend)
3. Remove Cloudflare Pages project
4. Remove Cloudflare environment variables
5. Delete `functions/` directory
6. Delete `wrangler.toml`
7. Delete `public/_headers`
8. Remove `@cloudflare/workers-types` from devDependencies
9. Remove `wrangler` from devDependencies

## DNS Changes Required (Future)

- Update `sealify.ng` A/AAAA records to Render IP
- Or use Render's custom domain feature
- Update `www.sealify.ng` CNAME to Render

## Verification Checklist Before Retirement

- [ ] Render backend stable for 30 days
- [ ] All API endpoints working on Render
- [ ] Admin dashboard fully functional
- [ ] No critical errors in Render logs
- [ ] Frontend successfully connected to Render
- [ ] CORS correctly configured
- [ ] Supabase Auth working
- [ ] Database operations working
- [ ] Performance acceptable
