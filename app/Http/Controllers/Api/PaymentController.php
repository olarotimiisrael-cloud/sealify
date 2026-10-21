<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InitiatePaymentRequest;
use App\Http\Resources\TransactionResource;
use App\Services\PaymentService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $payments) {}

    public function initiate(InitiatePaymentRequest $request): JsonResponse
    {
        $user = $request->user();

        try {
            $result = $this->payments->initiate(
                user: $user,
                amount: (float) $request->input('amount'),
                purpose: $request->input('purpose'),
                metadata: $request->input('metadata', []),
            );
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => [
                'transaction' => new TransactionResource($result['transaction']),
                'authorization_url' => $result['authorization_url'],
                'access_code' => $result['access_code'],
                'reference' => $result['reference'],
            ],
            'message' => 'Payment initialized. Redirect the user to authorization_url.',
        ], 201);
    }

    public function callback(Request $request)
    {
        // Paystack redirects here after the user completes payment.
        // The reference is in the query string.
        $reference = $request->query('reference');

        if (! $reference) {
            return response()->json(['message' => 'Missing reference.'], 400);
        }

        try {
            $transaction = $this->payments->verify($reference);
        } catch (\Throwable $e) {
            Log::error('Payment callback verify failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Could not verify payment.'], 500);
        }

        // Best practice: redirect the browser to a frontend page that shows status.
        // For now, return JSON — the frontend can consume this.
        return response()->json([
            'data' => new TransactionResource($transaction),
            'message' => $transaction->isSuccess()
                ? 'Payment successful.'
                : 'Payment not completed.',
        ]);
    }

    public function verify(string $reference): JsonResponse
    {
        try {
            $transaction = $this->payments->verify($reference);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Transaction not found.'], 404);
        } catch (\Throwable $e) {
            Log::error('Payment verify failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Could not verify payment.'], 500);
        }

        // Non-owner can see the transaction status but not the metadata
        $user = auth('sanctum')->user();
        if ($user && $transaction->user_id !== $user->id) {
            return response()->json([
                'data' => [
                    'reference' => $transaction->reference,
                    'status' => $transaction->status,
                ],
            ]);
        }

        return response()->json([
            'data' => new TransactionResource($transaction),
        ]);
    }

    public function index(Request $request)
    {
        $query = $request->user()->transactions()->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('purpose')) {
            $query->where('purpose', $request->string('purpose'));
        }

        return TransactionResource::collection($query->paginate(20));
    }

    public function webhook(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();
        $signature = $request->header('x-paystack-signature');

        try {
            $this->payments->handleWebhook($rawBody, $signature);
        } catch (\Throwable $e) {
            Log::error('Paystack webhook processing failed', [
                'error' => $e->getMessage(),
            ]);
            // Paystack expects 200 to stop retrying even on internal errors.
            // We log the failure but return 200 so it doesn't spam retries.
        }

        return response()->json(['status' => 'ok']);
    }
}
