<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CopilotService;
use Illuminate\Http\Request;

class CopilotController extends Controller
{
    public function ask(Request $request, CopilotService $copilot)
    {
        $data = $request->validate([
            'message' => 'required|string|min:1|max:1600',
            'conversation' => 'sometimes|array|max:12',
            'conversation.*.role' => 'required_with:conversation|in:user,assistant',
            'conversation.*.content' => 'required_with:conversation|string|max:8000',
            'marketplaceContext' => 'sometimes|in:buyer,seller,admin,none',
        ]);

        $response = $copilot->ask(
            $data['message'],
            $data['conversation'] ?? [],
            ['marketplaceContext' => $data['marketplaceContext'] ?? 'none']
        );

        return response()->json([
            'message' => $response['text'],
            'citations' => $response['citations'],
            'usedWebSearch' => $response['usedWebSearch'],
            'provider' => $response['provider'],
            'model' => $response['model'],
        ]);
    }
}
