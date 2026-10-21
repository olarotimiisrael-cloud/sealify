<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureKycVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('sanctum')->user();

        if ($user && ! $user->isKycVerified()) {
            return response()->json([
                'message' => 'Complete identity verification to use this feature.',
                'kyc_required' => true,
            ], 403);
        }

        return $next($request);
    }
}
