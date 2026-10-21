<?php

use Illuminate\Support\Facades\Route;

// Serve the built SPA for all frontend routes
$frontendRoutes = [
    '/', '/listings', '/listing/{id}', '/services', '/categories', '/categories/{slug}',
    '/search', '/how-it-works', '/contact', '/faq', '/help-center', '/market-insights',
    '/auth/login', '/auth/register', '/auth/verify', '/auth/reset-password', '/auth/otp',
    '/auth/callback', '/payments', '/promotions', '/kyc', '/referrals', '/notifications',
    '/settings', '/change-password', '/bank-accounts', '/profile', '/profile-complete',
    '/post-ad', '/messages', '/conversations', '/saved', '/saved-searches', '/my-ads',
    '/seller/{id}', '/vendors', '/community', '/safety', '/dispute', '/requests',
    '/admin', '/admin/users', '/admin/listings', '/admin/reports', '/admin/disputes',
    '/admin/verifications', '/admin/promotions', '/admin/system-config', '/admin/login',
    '/admin/ai-settings', '/admin/site-metadata',
];

foreach ($frontendRoutes as $route) {
    Route::get($route, function () {
        $file = public_path('index.html');
        if (file_exists($file)) {
            return response()->file($file);
        }

        return response()->json(['message' => 'Frontend not built. Run: cd ../sealify-frontend && pnpm run build'], 503);
    });
}

Route::get('/health', function () {
    try {
        DB::select('SELECT 1');
        $db = 'ok';
    } catch (Throwable $e) {
        $db = 'down';
    }

    return response()->json([
        'status' => $db === 'ok' ? 'ok' : 'degraded',
        'db' => $db,
        'time' => now()->toIso8601String(),
    ], $db === 'ok' ? 200 : 503);
});
