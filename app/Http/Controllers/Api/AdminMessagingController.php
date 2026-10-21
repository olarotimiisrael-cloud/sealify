<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMessagingController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Admin messaging service is not configured.',
            'target' => $request->input('target', 'all'),
            'total' => 0,
            'successful' => 0,
            'failed' => 0,
        ], 503);
    }

    public function broadcast(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Admin broadcast service is not configured.',
            'broadcast_id' => null,
            'target' => $request->input('target', 'all'),
            'total' => 0,
            'sent' => 0,
            'delivered' => 0,
            'failed' => 0,
        ], 503);
    }

    public function messages(Request $request): JsonResponse
    {
        return response()->json([
            'messages' => [],
            'total' => 0,
            'limit' => $request->integer('limit', 50),
            'offset' => $request->integer('offset', 0),
        ]);
    }

    public function broadcasts(Request $request): JsonResponse
    {
        return response()->json([
            'broadcasts' => [],
            'total' => 0,
            'limit' => $request->integer('limit', 50),
            'offset' => $request->integer('offset', 0),
        ]);
    }

    public function config(): JsonResponse
    {
        return response()->json([
            'email' => false,
            'sms' => false,
            'whatsapp' => false,
            'push' => false,
        ]);
    }
}
