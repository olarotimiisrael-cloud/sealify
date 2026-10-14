<?php

use Illuminate\Support\Facades\Route;

Route::fallback(function () {
    // API misses must stay JSON; the SPA is only a fallback for browser routes.
    if (request()->is('api/*')) {
        return response()->json(['error' => 'Not found'], 404);
    }

    $indexPath = public_path('index.html');

    if (! file_exists($indexPath)) {
        return response()->json([
            'error' => 'Frontend build not found. Run `npm run build` to build the SPA into the Laravel public directory.',
        ], 404);
    }

    return response()->file($indexPath, [
        'Content-Type' => 'text/html',
    ]);
});
