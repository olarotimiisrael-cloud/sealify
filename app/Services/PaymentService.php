<?php

namespace App\Services;

use App\Models\Listing;
use App\Models\Promotion;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use KenDeNigerian\PayZephyr\Facades\Payment;

class PaymentService
{
    public function initiate(User $user, float $amount, string $purpose, array $metadata = []): array
    {
        $reference = $this->generateReference($purpose);

        $callbackUrl = rtrim(config('app.url'), '/')
            .'/api/payments/callback?reference='.$reference;

        $transaction = Transaction::create([
            'reference' => $reference,
            'provider' => config('payments.default', 'paystack'),
            'user_id' => $user->id,
            'amount' => $amount,
            'currency' => 'NGN',
            'purpose' => $purpose,
            'status' => 'pending',
            'metadata' => $metadata,
            'expires_at' => now()->addHour(),
        ]);

        try {
            $redirect = Payment::amount($amount)
                ->email($user->email)
                ->reference($reference)
                ->callback($callbackUrl)
                ->metadata(array_merge($metadata, [
                    'user_id' => $user->id,
                    'purpose' => $purpose,
                    'reference' => $reference,
                ]))
                ->redirect();
        } catch (\Throwable $e) {
            $transaction->forceFill([
                'status' => 'failed',
                'failed_at' => now(),
                'error_message' => $e->getMessage(),
            ])->save();

            Log::error('PayZephyr initiate failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);

            throw new \RuntimeException('Could not initialize payment. Please try again.');
        }

        $transaction->forceFill([
            'provider_reference' => $reference,
            'provider_response' => ['redirect_url' => $redirect->getTargetUrl()],
        ])->save();

        return [
            'transaction' => $transaction->fresh(),
            'authorization_url' => $redirect->getTargetUrl(),
            'access_code' => null,
            'reference' => $reference,
        ];
    }

    public function verify(string $reference): Transaction
    {
        $transaction = Transaction::where('reference', $reference)->firstOrFail();

        // Idempotent short-circuit ONLY for confirmed success.
        if ($transaction->status === 'success') {
            return $transaction;
        }

        // Always ask Paystack — they are the source of truth for payment status.
        // Local status (pending/abandoned/failed) is only a hint.
        try {
            $verification = Payment::verify($reference);
        } catch (\Throwable $e) {
            Log::warning('PayZephyr verify failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);

            return $transaction;
        }

        $success = $verification->isSuccessful();

        if ($success) {
            // Paystack confirms payment — flip to success regardless of
            // prior local status (pending / abandoned / failed / expired).
            return $this->applyVerificationResult($transaction, [
                'status' => 'success',
                'message' => $verification->message ?? null,
                'data' => method_exists($verification, 'toArray')
                    ? $verification->toArray()
                    : (array) $verification,
            ]);
        }

        // Paystack says not successful. Only now do we consult local expiry.
        if ($transaction->isPending()
            && $transaction->expires_at
            && $transaction->expires_at->isPast()) {
            $transaction->forceFill([
                'status' => 'abandoned',
                'failed_at' => now(),
                'error_message' => 'Payment expired before completion.',
            ])->save();
        }

        return $transaction;
    }

    public function handleWebhook(string $rawBody, ?string $signature): ?Transaction
    {
        $payload = json_decode($rawBody, true);

        if (! is_array($payload)) {
            return null;
        }

        $reference = $payload['data']['reference']
            ?? $payload['reference']
            ?? null;

        if (! $reference) {
            return null;
        }

        $transaction = Transaction::where('reference', $reference)->first();

        if (! $transaction) {
            return null;
        }

        // Even if already success, this is a no-op thanks to verify() idempotency.
        return $this->verify($reference);
    }

    protected function applyVerificationResult(Transaction $transaction, array $result): Transaction
    {
        return DB::transaction(function () use ($transaction, $result) {
            $fresh = Transaction::lockForUpdate()->find($transaction->id);

            // Idempotent: already successful, nothing to do.
            if ($fresh->status === 'success') {
                return $fresh;
            }

            if ($result['status'] === 'success') {
                // Flip to success regardless of prior status and clear prior failure markers.
                $fresh->forceFill([
                    'status' => 'success',
                    'provider_reference' => $fresh->reference,
                    'provider_response' => $result,
                    'paid_at' => now(),
                    'failed_at' => null,
                    'error_message' => null,
                ])->save();

                $this->onSuccess($fresh);
            } else {
                // Only record as failed if we haven't already recorded success.
                $fresh->forceFill([
                    'status' => 'failed',
                    'provider_response' => $result,
                    'failed_at' => now(),
                    'error_message' => $result['message'] ?? null,
                ])->save();
            }

            return $fresh;
        });
    }

    protected function onSuccess(Transaction $transaction): void
    {
        match ($transaction->purpose) {
            'promotion_boost' => $this->activatePromotion($transaction),
            default => null,
        };
    }

    protected function activatePromotion(Transaction $transaction): void
    {
        $listingId = $transaction->metadata['listing_id'] ?? null;
        $days = (int) ($transaction->metadata['days'] ?? config('promotions.duration_days', 7));

        if (! $listingId) {
            Log::warning('promotion_boost transaction missing listing_id', [
                'transaction_id' => $transaction->id,
            ]);

            return;
        }

        // Guard against duplicates (callback + webhook both firing).
        if (Promotion::where('transaction_id', $transaction->id)->exists()) {
            return;
        }

        $listing = Listing::find($listingId);
        if (! $listing) {
            Log::warning('promotion_boost listing not found', [
                'transaction_id' => $transaction->id,
                'listing_id' => $listingId,
            ]);

            return;
        }

        Promotion::create([
            'listing_id' => $listing->id,
            'user_id' => $transaction->user_id,
            'transaction_id' => $transaction->id,
            'starts_at' => now(),
            'ends_at' => now()->addDays($days),
            'is_free_trial' => false,
            'status' => 'active',
        ]);
    }

    protected function generateReference(string $purpose): string
    {
        return strtoupper($purpose).'-'.Str::random(16);
    }
}
