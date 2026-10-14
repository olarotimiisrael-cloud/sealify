<?php

namespace App\Services;

use Illuminate\Support\Str;

class RecordingSummarizer
{
    public function summarize(string $transcript): array
    {
        if ($this->providerConfigured()) {
            try {
                return $this->summarizeWithProvider($transcript);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Recording summary provider failed, using local summarizer: ' . $e->getMessage());
            }
        }

        return $this->summarizeLocally($transcript);
    }

    protected function providerConfigured(): bool
    {
        return filled(config('services.openai.api_key')) && filled(config('services.openai.base_url'));
    }

    protected function summarizeWithProvider(string $transcript): array
    {
        $response = \Illuminate\Support\Facades\Http::withToken(config('services.openai.api_key'))
            ->timeout(60)
            ->post(rtrim((string) config('services.openai.base_url'), '/') . '/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'temperature' => config('services.openai.temperature', 0.3),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Summarize the session transcript. Return strict JSON with keys summary (string), key_points (array of strings), action_items (array of strings), sentiment (one of positive, neutral, negative).',
                    ],
                    [
                        'role' => 'user',
                        'content' => $transcript,
                    ],
                ],
            ])
            ->throw()
            ->json();

        $content = data_get($response, 'choices.0.message.content', '{}');
        $decoded = json_decode($this->stripCodeFences((string) $content), true);

        return $this->normalize(is_array($decoded) ? $decoded : [], $transcript);
    }

    protected function summarizeLocally(string $transcript): array
    {
        $sentences = collect(preg_split('/(?<=[.!?])\s+/', trim($transcript)) ?: [])
            ->map(fn ($sentence) => trim((string) $sentence))
            ->filter()
            ->values();

        $stopWords = collect(config('sealify.stopwords', ['the', 'and', 'that', 'have', 'for', 'not', 'you', 'with', 'this', 'but']));

        $frequency = Str::of($transcript)
            ->lower()
            ->matchAll('/[a-z][a-z\']*/')
            ->filter(fn ($word) => Str::length($word) > 3 && ! $stopWords->contains($word))
            ->countBy()
            ->sortDesc();

        $scored = $sentences->map(function ($sentence, $index) use ($frequency) {
            $words = Str::of($sentence)->lower()->matchAll('/[a-z][a-z\']*/');
            $score = $words->sum(fn ($word) => $frequency[$word] ?? 0) / max(1, Str::wordCount($sentence));

            return ['index' => $index, 'sentence' => $sentence, 'score' => $score];
        });

        $top = $scored->sortByDesc('score')->take(5)->sortBy('index');

        return [
            'summary' => $top->pluck('sentence')->implode(' '),
            'key_points' => $top->pluck('sentence')->take(5)->values()->all(),
            'action_items' => [],
            'sentiment' => $this->detectSentiment($transcript),
        ];
    }

    protected function normalize(array $data, string $transcript): array
    {
        $summary = trim((string) ($data['summary'] ?? ''));
        if ($summary === '') {
            $summary = Str::limit(strip_tags($transcript), 400, '...');
        }

        return [
            'summary' => $summary,
            'key_points' => array_values((array) ($data['key_points'] ?? [])),
            'action_items' => array_values((array) ($data['action_items'] ?? [])),
            'sentiment' => in_array($data['sentiment'] ?? null, ['positive', 'neutral', 'negative'], true)
                ? $data['sentiment']
                : $this->detectSentiment($transcript),
        ];
    }

    protected function stripCodeFences(string $content): string
    {
        $content = trim($content);
        if (Str::startsWith($content, '```')) {
            $content = (string) preg_replace('/^```[a-zA-Z]*\s*/', '', $content);
            $content = (string) preg_replace('/\s*```$/', '', $content);
        }

        return $content;
    }

    protected function detectSentiment(string $transcript): string
    {
        $positive = ['agree', 'confirm', 'accept', 'deal', 'great', 'excellent', 'happy', 'thanks'];
        $negative = ['disagree', 'deny', 'reject', 'problem', 'issue', 'difficult', 'angry', 'refund'];

        $text = Str::lower($transcript);
        $positiveCount = collect($positive)->sum(fn ($word) => substr_count($text, $word));
        $negativeCount = collect($negative)->sum(fn ($word) => substr_count($text, $word));

        if ($positiveCount > $negativeCount) {
            return 'positive';
        }
        if ($negativeCount > $positiveCount) {
            return 'negative';
        }

        return 'neutral';
    }
}
