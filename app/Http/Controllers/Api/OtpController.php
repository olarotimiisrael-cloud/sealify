<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OtpController extends Controller
{
    public function request(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'OTP service is not configured. Use email and password authentication.',
        ], 503);
    }

    public function verify(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'OTP verification is not configured.',
        ], 503);
    }

    public function resend(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'OTP resend is not configured.',
        ], 503);
    }
}
