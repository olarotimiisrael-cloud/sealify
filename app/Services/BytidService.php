<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BytidService
{
    protected string $baseUrl;

    protected string $key;

    public function __construct()
    {
        $this->baseUrl = (string) config('services.bytid.base_url', 'https://api.bytid.com/v1');
        $this->key = (string) config('services.bytid.key');
    }

    /**
     * Verify an identity document.
     * $type is one of: nin, bvn, drivers_license, voters_card.
     * CAC goes through verifyCac() below.
     */
    public function verifyIdentity(
        string $type,
        string $idNumber,
        ?string $firstName = null,
        ?string $lastName = null,
        ?string $dob = null,
        ?string $reference = null
    ): array {
        $path = match ($type) {
            'nin' => '/identity/nin',
            'bvn' => '/identity/bvn',
            'drivers_license' => '/identity/drivers-license',
            'voters_card' => '/identity/voters-card',
            default => throw new \InvalidArgumentException("Unsupported identity type: {$type}"),
        };

        return $this->post($path, array_filter([
            'id_number' => $idNumber,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'dob' => $dob,
            'reference' => $reference,
        ]));
    }

    public function verifyCac(string $rcNumber, ?string $reference = null): array
    {
        return $this->post('/business/cac', array_filter([
            'id_number' => $rcNumber,
            'reference' => $reference,
        ]));
    }

    protected function post(string $path, array $payload): array
    {
        $response = Http::baseUrl($this->baseUrl)
            ->withToken($this->key)
            ->acceptJson()
            ->timeout(20)
            ->post($path, $payload);

        $body = $response->json() ?? [];

        if (! $response->successful() && empty($body['error'])) {
            Log::error('Bytid request failed', [
                'path' => $path,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }

        return $body;
    }

    /**
     * Normalise Bytid's envelope into a stable shape for our service.
     */
    public function normalise(array $raw): array
    {
        if (empty($raw['success']) || ! isset($raw['data'])) {
            return [
                'ok' => false,
                'status' => 'failed',
                'reason' => $raw['error']['message'] ?? 'Verification provider error.',
                'error_code' => $raw['error']['code'] ?? null,
                'raw' => $raw,
            ];
        }

        $d = $raw['data'];

        return [
            'ok' => true,
            'status' => $d['status'] ?? 'unknown',   // verified | not_found | failed
            'reference' => $d['reference'] ?? null,
            'provider_id' => $d['id'] ?? null,
            'id_number_masked' => $d['id_number'] ?? null,
            'field_matches' => $d['field_matches'] ?? null,
            'record' => $d['data'] ?? null,
            'amount_charged' => $d['amount_charged'] ?? null,
            'raw' => $raw,
        ];
    }
}
