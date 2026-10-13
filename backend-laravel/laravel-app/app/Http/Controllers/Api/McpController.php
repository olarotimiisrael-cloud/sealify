<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CopilotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class McpController extends Controller
{
    public function handle(Request $request, CopilotService $copilot)
    {
        $method = $request->method();
        $path = $request->path();

        // MCP initialize request
        if ($request->headers->has('mcp-protocol-version')) {
            return $this->handleInitialize($request);
        }

        // MCP tool execution
        if ($request->isMethod('POST') || $request->isMethod('GET')) {
            $tool = $request->query('tool') ?? $request->header('mcp-tool') ?? '';

            switch ($tool) {
                case 'sealify_web_search':
                    return $this->handleWebSearch($request, $copilot);
                case 'sealify_copilot_query':
                    return $this->handleCopilotQuery($request, $copilot);
                case 'sealify_marketplace_info':
                    return $this->handleMarketplaceInfo($request, $copilot);
                default:
                    return $this->handleUnknownTool($request);
            }
        }

        return response()->json(['error' => 'MCP endpoint not found'], 404);
    }

    protected function handleInitialize(Request $request)
    {
        return response()->json([
            'protocolVersion' => '2024-11-05',
            'capabilities' => {
                'tools': {}
            },
            'serverInfo' => [
                'name' => 'sealify-copilot',
                'version' => '1.0.0'
            ]
        ]);
    }

    protected function handleWebSearch(Request $request, CopilotService $copilot)
    {
        $query = $request->query('query') ?? '';
        
        if (empty($query)) {
            return response()->json([
                'error' => 'Missing query parameter'
            ], 400);
        }

        $response = $copilot->ask(
            'Provide web search results for: "' . $query . '". Return the top 5 relevant results with their titles, URLs, and brief descriptions. Format as: Title — URL | Snippet',
            [],
            ['marketplaceContext' => 'none']
        );

        $results = [];
        $text = $response['text'] ?? '';

        // Parse the response to extract structured search results
        $lines = preg_split('/\r\n|\r/', $text);
        foreach ($lines as $line) {
            if (preg_match('/https?:\/\/[^\s\)\]\},]+/', $line, $urlMatch)) {
                $url = $urlMatch[0];
                $lineWithoutUrl = preg_replace('/https?:\/\/[^\s\)\]\},]+/', '', $line);
                $title = trim(explode('—', $lineWithoutUrl)[0] ?? '');
                $snippet = trim($lineWithoutUrl);
                
                if ($title && $url) {
                    $results[] = [
                        'title' => $title,
                        'url' => $url,
                        'snippet' => strlen($snippet) > 200 ? substr($snippet, 0, 200) . '...' : $snippet
                    ];
                }
            }
        }

        // If no structured results found, wrap the full text
        if (empty($results)) {
            $results = [
                [
                    'title' => 'Search Results',
                    'url' => '#',
                    'snippet' => strlen($text) > 500 ? substr($text, 0, 500) . '...' : $text
                ]
            ];
        }

        return response()->json([
            'results' => array_slice($results, 0, 5)
        ]);
    }

    protected function handleCopilotQuery(Request $request, CopilotService $copilot)
    {
        $data = $request->validate([
            'message' => 'required|string|min:1|max:8000',
            'conversation' => 'sometimes|array|max:12',
            'conversation.*.role' => 'required_with:conversation|in:user,assistant',
            'conversation.*.content' => 'required_with:conversation|string|max:8000',
            'marketplaceContext' => 'sometimes|in:buyer,seller,admin,none',
        ]);

        $context = $data['marketplaceContext'] ?? 'none';

        $response = $copilot->ask(
            $data['message'],
            $data['conversation'] ?? [],
            ['marketplaceContext' => $context]
        );

        return response()->json([
            'text' => $response['text'] ?? '',
            'citations' => $response['citations'] ?? [],
            'usedWebSearch' => $response['usedWebSearch'] ?? false,
            'provider' => $response['provider'] ?? 'sealify-native',
            'model' => $response['model'] ?? 'sealify-native-v1',
        ]);
    }

    protected function handleMarketplaceInfo(Request $request, CopilotService $copilot)
    {
        $query = $request->query('query') ?? '';

        if (empty($query)) {
            return response()->json([
                'error' => 'Missing query parameter'
            ], 400);
        }

        $response = $copilot->ask(
            'You are Sealify Marketplace Assistant. Provide information about: ' . $query . '. Include relevant details about products, pricing, and features.',
            [],
            ['marketplaceContext' => 'none']
        );

        return response()->json([
            'text' => $response['text'] ?? ''
        ]);
    }

    protected function handleUnknownTool(Request $request)
    {
        return response()->json([
            'error' => 'Unknown MCP tool. Available tools: sealify_web_search, sealify_copilot_query, sealify_marketplace_info'
        ], 400);
    }
}