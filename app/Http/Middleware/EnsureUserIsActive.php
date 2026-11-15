<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('sanctum')->user();

        if (! $user) {
            return $next($request);
        }

        if ($user->isBanned()) {
            return redirect()->route('banned');
        }

        if ($user->status === 'suspended') {
            return redirect()->route('banned');
        }

        return $next($request);
    }
}
