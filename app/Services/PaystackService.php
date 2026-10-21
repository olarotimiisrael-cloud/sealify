<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    protected string $baseUrl = 'https://api.paystack.co';

    protected string $secret;

    public function __construct()
    {
        $this->secret = (string) config('services.paystack.secret');
    }

    public function listBanks(string $country = 'nigeria'): array
    {
        return Cache::remember("paystack_banks_{$country}", now()->addDay(), function () use ($country) {
            $response = $this->client()->get('/bank', [
                'country' => $country,
                'perPage' => 200,
            ]);

            if (! $response->successful()) {
                Log::error('Paystack listBanks failed', ['body' => $response->body()]);

                return [];
            }

            return collect($response->json('data', []))
                ->map(fn ($b) => [
                    'name' => $b['name'],
                    'code' => $b['code'],
                    'slug' => $b['slug'] ?? null,
                    'currency' => $b['currency'] ?? 'NGN',
                ])
                ->sortBy('name')
                ->values()
                ->all();
        });
    }

    public function resolveAccount(string $accountNumber, string $bankCode): ?array
    {
        $response = $this->client()->get('/bank/resolve', [
            'account_number' => $accountNumber,
            'bank_code' => $bankCode,
        ]);

        if (! $response->successful()) {
            Log::warning('Paystack resolveAccount failed', [
                'account_number' => $accountNumber,
                'bank_code' => $bankCode,
                'body' => $response->body(),
            ]);

            return null;
        }

        $data = $response->json('data');

        return [
            'account_name' => $data['account_name'] ?? null,
            'account_number' => $data['account_number'] ?? $accountNumber,
        ];
    }

    public function createTransferRecipient(string $name, string $accountNumber, string $bankCode): ?string
    {
        $response = $this->client()->post('/transferrecipient', [
            'type' => 'nuban',
            'name' => $name,
            'account_number' => $accountNumber,
            'bank_code' => $bankCode,
            'currency' => 'NGN',
        ]);

        if (! $response->successful()) {
            Log::error('Paystack createTransferRecipient failed', ['body' => $response->body()]);

            return null;
        }

        return $response->json('data.recipient_code');
    }

    protected function client()
    {
        return Http::baseUrl($this->baseUrl)
            ->withToken($this->secret)
            ->acceptJson()
            ->timeout(15);
    }

    public function initializeTransaction(
        string $email,
        float $amount,
        string $reference,
        string $callbackUrl,
        array $metadata = []
    ): ?array {
        $response = $this->client()->post('/transaction/initialize', [
            'email' => $email,
            'amount' => (int) round($amount * 100), // convert NGN to kobo
            'reference' => $reference,
            'callback_url' => $callbackUrl,
            'metadata' => $metadata,
            'currency' => 'NGN',
        ]);

        if (! $response->successful()) {
            Log::error('Paystack initializeTransaction failed', [
                'reference' => $reference,
                'body' => $response->body(),
            ]);

            return null;
        }

        return $response->json('data');
    }

    public function verifyTransaction(string $reference): ?array
    {
        $response = $this->client()->get("/transaction/verify/{$reference}");

        if (! $response->successful()) {
            Log::warning('Paystack verifyTransaction failed', [
                'reference' => $reference,
                'body' => $response->body(),
            ]);

            return null;
        }

        return $response->json('data');
    }

    public function verifyWebhookSignature(string $rawBody, string $signature): bool
    {
        $computed = hash_hmac('sha512', $rawBody, $this->secret);

        return hash_equals($computed, $signature);
    }
}
