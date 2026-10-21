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

        if ($user->status === 'banned') {
            return response()->json([
                'message' => 'This account has been permanently banned. Contact support if you believe this is a mistake.',
                'account_status' => 'banned',
            ], 403);
        }

        if ($user->status === 'suspended') {
            return response()->json([
                'message' => 'This account is temporarily suspended. Contact support for assistance.',
                'account_status' => 'suspended',
            ], 403);
        }

        return $next($request);
    }
}
