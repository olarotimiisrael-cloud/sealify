<?php

use Illuminate\Support\Facades\Route;

Route::fallback(function () {
    $indexPath = public_path('index.html');

    if (! file_exists($indexPath)) {
        return response()->json([
            'error' => 'Frontend build not found. Copy the Vite dist contents into the public directory.',
        ], 404);
    }

    return response()->file($indexPath, [
        'Content-Type' => 'text/html',
    ]);
});
