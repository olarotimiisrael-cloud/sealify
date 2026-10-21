<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PromotionResource;
use App\Models\Listing;
use App\Models\Promotion;
use App\Models\Transaction;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    public function __construct(private PaymentService $payments) {}

    public function eligibility(Request $request): JsonResponse
    {
        $user = $request->user();

        $activePromotions = Promotion::active()
            ->where('user_id', $user->id)
            ->count();

        return response()->json([
            'data' => [
                'has_free_trial' => ! $user->has_used_free_promotion,
                'active_promotions' => $activePromotions,
                'price' => (float) config('promotions.price', 500),
                'duration_days' => (int) config('promotions.duration_days', 7),
                'currency' => 'NGN',
            ],
        ]);
    }

    public function promote(Request $request, Listing $listing): JsonResponse
    {
        $user = $request->user();

        if ($listing->user_id !== $user->id) {
            abort(403, 'You can only promote your own listings.');
        }

        if ($listing->status !== 'active') {
            return response()->json([
                'message' => 'Only active listings can be promoted.',
            ], 422);
        }

        $alreadyActive = Promotion::active()
            ->where('listing_id', $listing->id)
            ->exists();

        if ($alreadyActive) {
            return response()->json([
                'message' => 'This listing is already promoted.',
            ], 422);
        }

        // Reuse pending transaction if user already initiated a paid promotion
        $pending = Transaction::where('user_id', $user->id)
            ->where('purpose', 'promotion_boost')
            ->where('status', 'pending')
            ->where('created_at', '>', now()->subHour())
            ->first();

        if ($pending && $pending->isPending()) {
            $url = $pending->provider_response['redirect_url'] ?? null;

            if ($url) {
                return response()->json([
                    'data' => [
                        'activated' => false,
                        'authorization_url' => $url,
                        'reference' => $pending->reference,
                        'price' => $pending->amount,
                        'days' => $pending->metadata['days'] ?? config('promotions.duration_days', 7),
                    ],
                    'message' => 'You have a pending promotion payment. Complete it to activate.',
                ]);
            }
        }

        $days = (int) config('promotions.duration_days', 7);
        $price = (float) config('promotions.price', 500);

        // --- Free trial path ---
        if (! $user->has_used_free_promotion) {
            $promotion = DB::transaction(function () use ($user, $listing, $days) {
                $locked = User::lockForUpdate()->find($user->id);

                if ($locked->has_used_free_promotion) {
                    return null; // Race lost — someone else just used it
                }

                $promotion = Promotion::create([
                    'listing_id' => $listing->id,
                    'user_id' => $user->id,
                    'transaction_id' => null,
                    'starts_at' => now(),
                    'ends_at' => now()->addDays($days),
                    'is_free_trial' => true,
                    'status' => 'active',
                ]);

                $locked->forceFill(['has_used_free_promotion' => true])->save();

                return $promotion;
            });

            if ($promotion === null) {
                return response()->json([
                    'message' => 'Free trial was already used. Please try again.',
                ], 409);
            }

            $promotion->load('listing');

            return response()->json([
                'data' => [
                    'activated' => true,
                    'promotion' => new PromotionResource($promotion),
                ],
                'message' => 'Your free promotion is now active for '.$days.' days!',
            ], 201);
        }

        // --- Paid path ---
        try {
            $result = $this->payments->initiate(
                user: $user,
                amount: $price,
                purpose: 'promotion_boost',
                metadata: [
                    'listing_id' => $listing->id,
                    'days' => $days,
                ],
            );
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => [
                'activated' => false,
                'authorization_url' => $result['authorization_url'],
                'reference' => $result['reference'],
                'price' => $price,
                'days' => $days,
            ],
            'message' => 'Complete payment to activate your promotion.',
        ], 201);
    }

    public function index(Request $request)
    {
        $promotions = $request->user()
            ->promotions()
            ->with('listing')
            ->orderByDesc('id')
            ->paginate(20);

        return PromotionResource::collection($promotions);
    }

    public function cancel(Request $request, Promotion $promotion): JsonResponse
    {
        if ($promotion->user_id !== $request->user()->id) {
            abort(403);
        }

        if (! $promotion->isActive()) {
            return response()->json([
                'message' => 'This promotion is not active.',
            ], 422);
        }

        $promotion->forceFill([
            'status' => 'cancelled',
            'ends_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Promotion cancelled. (No refund — the promotion ends immediately.)',
        ]);
    }
}
