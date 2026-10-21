<?php

use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\EnsureUserIsActive;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Single alias block — covers every custom middleware used in routes/api.php
        $middleware->alias([
            'verified' => EnsureEmailIsVerified::class,
            'admin' => EnsureIsAdmin::class,
            'active' => EnsureUserIsActive::class,
        ]);

        // Prevent auth middleware from trying to redirect to a non-existent 'login' route on API paths
        $middleware->redirectGuestsTo(function (Request $request) {
            return $request->is('api/*') ? null : route('login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // All /api/* requests render JSON — browsers hitting API endpoints get JSON, not 500 HTML
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();
