<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use App\Models\ReferralClick;
use App\Models\ReferralReward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReferralsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $referrals = Referral::with(['referrer', 'referred'])
            ->where('referrer_id', $user->id)
            ->orWhere('referred_id', $user->id)
            ->latest()
            ->paginate(20);

        return response()->json($referrals);
    }

    public function myCode(Request $request)
    {
        $user = $request->user();
        
        $referral = Referral::firstOrCreate(
            ['referrer_id' => $user->id],
            ['code' => $this->generateCode(), 'status' => 'active']
        );

        $stats = [
            'total_referrals' => Referral::where('referrer_id', $user->id)->count(),
            'successful_referrals' => Referral::where('referrer_id', $user->id)->where('status', 'completed')->count(),
            'pending_referrals' => Referral::where('referrer_id', $user->id)->where('status', 'pending')->count(),
            'total_rewards' => ReferralReward::where('user_id', $user->id)->sum('amount'),
            'code' => $referral->code,
            'link' => config('app.url') . '/register?ref=' . $referral->code,
        ];

        return response()->json($stats);
    }

    public function trackClick(Request $request, string $code)
    {
        $data = $request->validate([
            'visitor_id' => 'sometimes|string',
            'referrer' => 'sometimes|string',
        ]);

        $referral = Referral::where('code', $code)->firstOrFail();

        ReferralClick::create([
            'referral_id' => $referral->id,
            'visitor_id' => $data['visitor_id'] ?? $request->ip(),
            'referrer' => $data['referrer'] ?? $request->header('referer'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['success' => true]);
    }

    public function claim(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string',
        ]);

        $referral = Referral::where('code', $data['code'])
            ->where('status', 'pending')
            ->first();

        if (!$referral) {
            return response()->json(['message' => 'Invalid or expired referral code'], 404);
        }

        if ($referral->referred_id) {
            return response()->json(['message' => 'Referral code already used'], 400);
        }

        $referral->update([
            'referred_id' => $request->user()->id,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Create reward for referrer
        $rewardAmount = config('referral.reward_amount', 1000); // ₦1000 default
        
        ReferralReward::create([
            'user_id' => $referral->referrer_id,
            'referral_id' => $referral->id,
            'amount' => $rewardAmount,
            'type' => 'referral_bonus',
        ]);

        // Create reward for referred user
        ReferralReward::create([
            'user_id' => $request->user()->id,
            'referral_id' => $referral->id,
            'amount' => $rewardAmount,
            'type' => 'welcome_bonus',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Referral claimed successfully',
            'reward' => $rewardAmount,
        ]);
    }

    public function rewards(Request $request)
    {
        $user = $request->user();

        $rewards = ReferralReward::where('user_id', $user->id)
            ->with('referral.referrer', 'referral.referred')
            ->latest()
            ->paginate(20);

        return response()->json($rewards);
    }

    protected function generateCode(): string
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $code = '';
        for ($i = 0; $i < 8; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $code;
    }
}