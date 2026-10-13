<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class CopilotService
{
    public function ask(string $message, array $conversation = [], array $userContext = []): array
    {
        $provider = env('AI_PROVIDER', 'openai');

        if ($provider === 'openai' && env('OPENAI_API_KEY')) {
            return $this->callOpenAI($message, $conversation);
        }

        if ($provider === 'gemini' && env('GEMINI_API_KEY')) {
            return $this->callGemini($message, $conversation);
        }

        return [
            'text' => 'Sealify Copilot is not configured yet. Set AI_PROVIDER and the provider API key.',
            'citations' => [],
            'usedWebSearch' => false,
            'provider' => 'none',
            'model' => $provider,
        ];
    }

    private function callOpenAI(string $message, array $conversation): array
    {
        $model = env('OPENAI_MODEL', 'gpt-4o-mini');
        $messages = [
            ['role' => 'system', 'content' => $this->systemPrompt()],
        ];

        foreach ($conversation as $item) {
            $messages[] = [
                'role' => $item['role'] === 'assistant' ? 'assistant' : 'user',
                'content' => $item['content'] ?? '',
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 1200,
        ];

        if (env('AI_WEB_SEARCH_ENABLED', true)) {
            $payload['tools'] = [['type' => 'web_search_preview']];
        }

        $response = Http::withToken(env('OPENAI_API_KEY'))
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', $payload);

        if (! $response->successful()) {
            return $this->error('openai', $model);
        }

        $data = $response->json();
        $text = $data['choices'][0]['message']['content'] ?? 'I could not generate a response.';

        return [
            'text' => $text,
            'citations' => [],
            'usedWebSearch' => env('AI_WEB_SEARCH_ENABLED', true),
            'provider' => 'openai',
            'model' => $model,
        ];
    }

    private function callGemini(string $message, array $conversation): array
    {
        $model = env('GEMINI_MODEL', 'gemini-2.5-flash');
        $contents = [];

        foreach ($conversation as $item) {
            $contents[] = [
                'role' => ($item['role'] ?? 'user') === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $item['content'] ?? '']],
            ];
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $message]],
        ];

        $payload = [
            'systemInstruction' => ['parts' => [['text' => $this->systemPrompt()]]],
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 1200,
            ],
        ];

        if (env('AI_WEB_SEARCH_ENABLED', true)) {
            $payload['tools'] = [['googleSearch' => new \stdClass()]];
        }

        $response = Http::timeout(60)->post(
            'https://generativelanguage.googleapis.com/v1beta/models/'.$model.':generateContent?key='.env('GEMINI_API_KEY'),
            $payload
        );

        if (! $response->successful()) {
            return $this->error('gemini', $model);
        }

        $text = $response->json('candidates.0.content.parts.0.text') ?? 'I could not generate a response.';

        return [
            'text' => $text,
            'citations' => [],
            'usedWebSearch' => env('AI_WEB_SEARCH_ENABLED', true),
            'provider' => 'gemini',
            'model' => $model,
        ];
    }

    private function systemPrompt(): string
    {
        return 'You are Sealify Copilot, a marketplace and safety assistant for Sealify Nigeria.';
    }

    private function error(string $provider, string $model): array
    {
        return [
            'text' => 'Sealify Copilot is temporarily unavailable. Please try again shortly.',
            'citations' => [],
            'usedWebSearch' => false,
            'provider' => $provider,
            'model' => $model,
        ];
    }
}
