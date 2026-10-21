<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReferralController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $referrals = Referral::where('referrer_id', $user->id)
            ->with('referee')
            ->get();

        $totalReward = $referrals->sum(function ($r) {
            return $r->status === 'rewarded' ? (float) $r->reward_amount : 0;
        });

        return response()->json([
            'data' => [
                'code' => $user->referral_code ?? Str::upper(Str::random(8)),
                'total_referrals' => $referrals->count(),
                'total_reward' => $totalReward,
                'referrals' => $referrals->map(function ($r) {
                    return [
                        'id' => $r->id,
                        'referee_id' => $r->referee_id,
                        'referee_name' => $r->referee?->name,
                        'code' => $r->code,
                        'status' => $r->status,
                        'reward_amount' => $r->reward_amount,
                        'created_at' => $r->created_at,
                    ];
                }),
            ],
        ]);
    }

    public function validate(Request $request): JsonResponse
    {
        $code = $request->query('code');

        if (! $code) {
            return response()->json(['valid' => false, 'message' => 'Referral code is required.'], 422);
        }

        $referral = Referral::where('code', $code)->first();

        if (! $referral) {
            return response()->json(['valid' => false, 'message' => 'Invalid referral code.'], 404);
        }

        return response()->json([
            'valid' => true,
            'code' => $referral->code,
            'referrer_id' => $referral->referrer_id,
        ]);
    }

    public function adminStats(Request $request): JsonResponse
    {
        $total = Referral::count();
        $rewarded = Referral::where('status', 'rewarded')->count();
        $pending = Referral::where('status', 'pending')->count();
        $totalReward = Referral::where('status', 'rewarded')->sum('reward_amount');

        return response()->json([
            'data' => [
                'total_referrals' => $total,
                'rewarded' => $rewarded,
                'pending' => $pending,
                'total_reward' => $totalReward,
            ],
        ]);
    }

    public function adminReferral(Request $request, string $userId): JsonResponse
    {
        $referrals = Referral::where('referrer_id', $userId)
            ->with('referee')
            ->get();

        return response()->json([
            'data' => $referrals->map(function ($r) {
                return [
                    'id' => $r->id,
                    'referee_id' => $r->referee_id,
                    'referee_name' => $r->referee?->name,
                    'code' => $r->code,
                    'status' => $r->status,
                    'reward_amount' => $r->reward_amount,
                    'created_at' => $r->created_at,
                ];
            }),
        ]);
    }

    public function grant(Request $request, string $userId): JsonResponse
    {
        $request->validate([
            'reward_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $referral = Referral::where('referrer_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (! $referral) {
            return response()->json(['message' => 'No pending referral found for this user.'], 404);
        }

        DB::transaction(function () use ($referral, $request) {
            $referral->update([
                'status' => 'rewarded',
                'reward_amount' => $request->input('reward_amount'),
                'rewarded_at' => now(),
            ]);

            // Credit the referrer's balance
            $user = User::find($referral->referrer_id);
            if ($user) {
                $user->increment('balance', $request->input('reward_amount'));
            }
        });

        return response()->json([
            'message' => 'Referral reward granted.',
            'data' => $referral->fresh(),
        ]);
    }

    public function reset(Request $request, string $userId): JsonResponse
    {
        $referral = Referral::where('referrer_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (! $referral) {
            return response()->json(['message' => 'No pending referral found for this user.'], 404);
        }

        $referral->delete();

        return response()->json([
            'message' => 'Referral reset.',
        ]);
    }
}
