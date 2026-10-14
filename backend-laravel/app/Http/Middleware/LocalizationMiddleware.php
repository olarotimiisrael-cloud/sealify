<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\LocalizationService;

class LocalizationMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $localizationService = app(LocalizationService::class);
        
        // Detect and set locale
        $locale = $localizationService->detectLocale($request);
        $localizationService->setLocale($locale);
        
        // Add locale to request headers for API responses
        app()->singleton('current.locale', function () use ($locale) {
            return $locale;
        });
        
        return $next($request);
    }
}