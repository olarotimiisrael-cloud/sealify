<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kyc\SubmitKycRequest;
use App\Models\KycVerification;
use App\Services\BytidService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KycController extends Controller
{
    public function __construct(private BytidService $bytid) {}

    public function submit(SubmitKycRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if ($user->isKycVerified()) {
            return response()->json([
                'message' => 'Your identity is already verified.',
                'kyc_verified_at' => $user->kyc_verified_at,
                'kyc_type' => $user->kyc_type,
            ], 409);
        }

        // Reject if there's a pending submission within the cooldown window
        $pending = KycVerification::where('user_id', $user->id)
            ->where('status', 'pending')
            ->where('created_at', '>', now()->subMinutes(5))
            ->first();

        if ($pending) {
            return response()->json([
                'message' => 'You already have a pending verification. Please wait a moment.',
            ], 429);
        }

        $reference = 'KYC-'.strtoupper($data['type']).'-'.$user->id.'-'.now()->timestamp;

        // Call Bytid
        try {
            $raw = $data['type'] === 'cac'
                ? $this->bytid->verifyCac($data['id_number'], $reference)
                : $this->bytid->verifyIdentity(
                    type: $data['type'],
                    idNumber: $data['id_number'],
                    firstName: $data['first_name'] ?? null,
                    lastName: $data['last_name'] ?? null,
                    dob: $data['date_of_birth'] ?? null,
                    reference: $reference,
                );
        } catch (\Throwable $e) {
            \Log::error('KYC provider call failed', [
                'user_id' => $user->id,
                'type' => $data['type'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Verification provider is temporarily unavailable. Please try again.',
            ], 503);
        }

        $result = $this->bytid->normalise($raw);

        $verification = null;

        // Persist record (never store the full ID number)
        $verification = DB::transaction(function () use ($user, $data, $reference, $result) {
            $record = KycVerification::create([
                'user_id' => $user->id,
                'type' => $data['type'],
                'id_number_last4' => substr($data['id_number'], -4),
                'id_number_hash' => hash('sha256', $data['id_number']),
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'status' => $result['ok']
                    ? ($result['status'] === 'verified' ? 'verified' : ($result['status'] === 'not_found' ? 'rejected' : 'failed'))
                    : 'failed',
                'provider' => 'bytid',
                'provider_reference' => $result['reference'] ?? $reference,
                'provider_response' => $result['raw'],
                'rejection_reason' => $result['ok'] && $result['status'] === 'not_found'
                    ? 'No record found for the provided details.'
                    : ($result['ok'] ? null : ($result['reason'] ?? null)),
                'verified_at' => $result['ok'] && $result['status'] === 'verified' ? now() : null,
                'rejected_at' => $result['ok'] && in_array($result['status'], ['not_found', 'failed'], true) ? now() : null,
            ]);

            if ($record->status === 'verified') {
                $user->forceFill([
                    'is_verified_seller' => true,
                    'kyc_verified_at' => now(),
                    'kyc_type' => $data['type'],
                ])->save();
            }

            return $record;
        });

        return response()->json([
            'data' => [
                'id' => $verification->id,
                'type' => $verification->type,
                'status' => $verification->status,
                'verified' => $verification->status === 'verified',
                'rejection_reason' => $verification->rejection_reason,
                'verified_at' => $verification->verified_at,
            ],
            'message' => match ($verification->status) {
                'verified' => 'Identity verified successfully. You are now a verified seller.',
                'rejected' => 'No record found for the provided details. Check the number and try again.',
                'failed' => 'Verification failed. Please try again later.',
                default => 'Verification submitted.',
            },
        ], $verification->status === 'verified' ? 200 : 422);
    }

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        $latest = $user->kycVerifications()
            ->latest('id')
            ->first();

        return response()->json([
            'data' => [
                'is_verified' => $user->isKycVerified(),
                'kyc_verified_at' => $user->kyc_verified_at,
                'kyc_type' => $user->kyc_type,
                'latest_submission' => $latest ? [
                    'id' => $latest->id,
                    'type' => $latest->type,
                    'status' => $latest->status,
                    'rejection_reason' => $latest->rejection_reason,
                    'created_at' => $latest->created_at,
                ] : null,
            ],
        ]);
    }

    public function history(Request $request)
    {
        $records = $request->user()
            ->kycVerifications()
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json(['data' => $records]);
    }
}
