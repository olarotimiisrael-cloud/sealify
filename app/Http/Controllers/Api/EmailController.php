<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Email service is not configured.',
        ], 503);
    }

    public function adminSend(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Email broadcast service is not configured.',
            'total' => 0,
            'successful' => 0,
            'failed' => 0,
        ], 503);
    }

    public function passwordReset(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Multi-channel password reset is not configured.',
            'channels' => [],
            'attempted' => [],
        ], 503);
    }

    public function sms(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'SMS service is not configured.',
            'total' => 0,
            'successful' => 0,
            'failed' => 0,
        ], 503);
    }

    public function whatsapp(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'WhatsApp service is not configured.',
            'total' => 0,
            'successful' => 0,
            'failed' => 0,
        ], 503);
    }

    public function uploadAttachment(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Email attachment upload is not configured.',
        ], 503);
    }
}
