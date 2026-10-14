<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserSafetyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SafetyController extends Controller
{
    protected $safetyService;

    public function __construct(UserSafetyService $safetyService)
    {
        $this->safetyService = $safetyService;
    }

    /**
     * Check user's safety status
     */
    public function checkUserSafety(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;

        $safetyStatus = $this->safetyService->getUserSafetyStatus($userId);

        return response()->json([
            'safety_status' => $safetyStatus,
            'requires_attention' => $this->requiresImmediateAttention($safetyStatus),
            'warnings' => $this->generateUserWarnings($safetyStatus),
        ], 200);
    }

    /**
     * Check safety between two users before starting a conversation
     */
    public function checkConversationSafety(Request $request, $participantId)
    {
        $user = $request->user();
        $userId = $user->id;

        $safetyWarnings = $this->safetyService->shouldInterceptConversation($userId, $participantId);

        return response()->json([
            'safety_warnings' => $safetyWarnings,
            'can_proceed' => empty($safetyWarnings) || collect($safetyWarnings)->contains(function ($warning) {
                return $warning['risk_level'] !== 'critical';
            }),
        ], 200);
    }

    /**
     * Get conversation safety information
     */
    public function getConversationSafety(Request $request, $participantId)
    {
        $user = $request->user();
        $userId = $user->id;

        $initiatorStatus = $this->safetyService->getUserSafetyStatus($userId);
        $targetStatus = $this->safetyService->getUserSafetyStatus($participantId);

        return response()->json([
            'initiator' => $initiatorStatus,
            'target' => $targetStatus,
            'target_warnings' => $this->generateUserWarnings($targetStatus),
        ], 200);
    }

    /**
     * Report a user (adds to report system)
     */
    public function reportUser(Request $request, $userId)
    {
        $request->validate([
            'reason' => 'required|string|in:spam,inappropriate,fraud,harassment,other',
            'details' => 'nullable|string',
            'ad_id' => 'nullable|exists:ads,id',
        ]);

        // Create report record
        $report = \App\Models\Report::create([
            'reporter_id' => $request->user()->id,
            'reason' => $request->input('reason'),
            'details' => $request->input('details'),
            'ad_id' => $request->input('ad_id'),
            'status' => 'pending',
        ]);

        // Trigger safety reassessment for the reported user
        dispatch(new \App\Jobs\ReassessUserSafety($request->user()->id, $userId, $report->reason));

        Log::info("User " . $request->user()->id . " reported user " . $userId . " for reason: " . $request->input('reason'));

        return response()->json([
            'message' => 'Report submitted successfully',
            'report_id' => $report->id,
        ], 201);
    }

    /**
     * Get safety center information
     */
    public function getSafetyCenterInfo(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user_safety' => $this->safetyService->getUserSafetyStatus($user->id),
            'platform_stats' => $this->getPlatformStats(),
            'safety_guidelines' => $this->getSafetyGuidelines(),
        ], 200);
    }

    /**
     * Check if user requires immediate attention
     */
    private function requiresImmediateAttention(array $safetyStatus)
    {
        return in_array($safetyStatus['risk_level'], ['high', 'critical']);
    }

    /**
     * Generate warnings for a user
     */
    private function generateUserWarnings(array $safetyStatus)
    {
        $warnings = [];

        switch ($safetyStatus['risk_level']) {
            case 'high':
                $warnings[] = [
                    'type' => 'warning',
                    'title' => 'Account Safety Notice',
                    'message' => 'Your account has been reported multiple times. Review your activity to maintain account safety.',
                ];
                break;
            case 'critical':
                $warnings[] = [
                    'type' => 'alert',
                    'title' => 'Account Restricted',
                    'message' => 'Your account has been restricted due to safety concerns. Contact support for assistance.',
                ];
                break;
        }

        return $warnings;
    }

    /**
     * Get platform-wide safety statistics
     */
    private function getPlatformStats()
    {
        return [
            'total_users' => \App\Models\User::count(),
            'blocked_users' => \App\Models\User::where('status', 'restricted')->count(),
            'reports_24h' => \App\Models\Report::where('created_at', '>=', now()->subHours(24))->count(),
            'safety_checks_performed' => SafetyReportAnalysis::count(),
        ];
    }

    /**
     * Get safety guidelines for the platform
     */
    private function getSafetyGuidelines()
    {
        return [
            'never_share_payment_details',
            'always_use_safe_meetup_spots',
            'report_suspicious_activity',
            'never_send_money_to_strangers',
            'verify_item_before_payment',
        ];
    }
}