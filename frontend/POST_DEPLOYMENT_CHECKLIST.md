# Post-Deployment Checklist

## 1. Redis Extension
- [ ] Verify Redis PHP extension is installed and enabled (`php -m | grep redis`).
- [ ] If not available, install via `pecl install redis` or use Predis library as fallback.

## 2. MCP Transport & Routing
- [ ] Confirm `authHeader` in `callLaravelCopilot` uses valid Bearer token from `LARAVEL_API_TOKEN`.
- [ ] Ensure `handleMcpRequest` initializes MCP transport for all requests (not just initialize).
- [ ] Test MCP endpoints (`sealify_web_search`, `sealify_generate_image`, `sealify_copilot_query`, `sealify_marketplace_info`) for correct responses.

## 3. Supabase Reference Removal
- [ ] Remove all `import * as ... from '@/services/supabaseService'` statements from `src/context/SealifyContext.tsx`.
- [ ] Replace Supabase service calls in `SealifyContext.tsx` with Laravel API equivalents (e.g., `favoriteService` → Laravel `/api/favorites/toggle`).
- [ ] Verify no remaining Supabase imports or references in `src/lib/laravel-api.ts`, UI components, and other frontend files.
- [ ] Run a global search for `supabase` and confirm zero results in the frontend codebase.

## 4. Password Recovery Backend
- [ ] Implement `/api/auth/request-reset` endpoint (validate email, store token, return success).
- [ ] Implement `/api/auth/reset-password` endpoint (validate token, new password, update user record).
- [ ] Add migration and model changes for password reset tokens.
- [ ] Connect frontend password reset flow to new endpoints.
- [ ] Test password reset flow end-to-end.

## 5. CopilotService Cleanup
- [ ] Remove any remaining commented external API code (OpenAI, Gemini) from `backend-laravel/app/Services/CopilotService.php`.
- [ ] Ensure all references to external APIs are replaced with native Laravel AI logic.
- [ ] Run `php artisan test` (or equivalent) to verify CopilotService behavior.

## 6. API Documentation
- [ ] Generate or update API documentation (e.g., OpenAPI spec) for all new endpoints.
- [ ] Ensure Swagger UI is accessible at `/docs` or similar.
- [ ] Verify documentation reflects current endpoint signatures and responses.

## 7. Frontend Integration
- [ ] Confirm all Supabase references are removed from `src/SealifyContext.tsx`, `src/lib/laravel-api.ts`, and UI components.
- [ ] Verify authentication flow (login, signup, OTP, OAuth) works with Laravel Sanctum.
- [ ] Test image generation, web search, and Copilot query flows via frontend.

## 8. Testing & Validation
- [ ] Run full test suite (unit, integration, e2e) and ensure all pass.
- [ ] Perform smoke testing of critical user journeys: onboarding, listing creation, purchase, admin actions.
- [ ] Verify error handling and edge cases for all new endpoints.

## 9. Production Deployment
- [ ] Build and push Docker images (if used) or prepare deployment packages.
- [ ] Set production environment variables (`LARAVEL_API_URL`, `LARAVEL_API_TOKEN`, etc.).
- [ ] Configure SSL/TLS, domain routing, and CDN if applicable.
- [ ] Monitor logs and metrics after deployment for any runtime errors.