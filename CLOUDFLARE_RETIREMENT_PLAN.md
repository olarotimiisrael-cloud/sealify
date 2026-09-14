# Cloudflare Retirement Plan

## Current Cloudflare Services

| Service | Purpose | Status |
|---------|---------|--------|
| Cloudflare Pages | Frontend hosting | ACTIVE - Keep |
| Cloudflare Pages Functions | Backend API | ACTIVE - Keep |
| Cloudflare Hyperdrive | PostgreSQL connection pool | ACTIVE - Keep |
| Cloudflare Wrangler | Deployment tool | ACTIVE - Keep |

## Planned Rollout

This project uses a single Cloudflare Pages project (`sealify`) for both frontend and backend:

- Frontend static assets are built by Vite into `dist/`.
- Backend API routes are Pages Functions under `functions/api/`.
- Deployment uses `wrangler pages deploy dist --project-name=sealify --functions-dir=functions`.
- Local development uses `wrangler pages dev dist --functions-dir functions --port 8788`.

## Rollback Plan

If Pages Functions deployment fails:

1. Frontend remains on Cloudflare Pages.
2. Revert Pages Functions changes and redeploy `dist/` without `--functions-dir`.
3. Existing Pages Functions are still functional (not deleted).

## Future Considerations

1. Monitor Pages Functions performance and limits.
2. Verify Supabase Auth and Hyperdrive operations on Pages.
3. Set up custom domain and DNS records for Pages.
4. Review Cloudflare Pages pricing and limits.

## Verification Checklist Before Deployment

- [ ] Pages Functions build successfully with `--functions-dir=functions`
- [ ] All API endpoints working on Pages Functions
- [ ] Admin dashboard fully functional
- [ ] No critical errors in Pages Functions logs
- [ ] Frontend successfully connected to Pages Functions API URL
- [ ] CORS correctly configured
- [ ] Supabase Auth working
- [ ] Database operations working via Hyperdrive
- [ ] Performance acceptable
