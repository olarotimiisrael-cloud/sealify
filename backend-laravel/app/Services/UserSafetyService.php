<?php

namespace App\Services;

use App\Models\Report;
use App\Models\SafetyReportAnalysis;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UserSafetyService
{
    /**
     * Risk thresholds (configurable)
     */
    const THRESHOLD_LOW = 0;
    const THRESHOLD_MEDIUM = 3;
    const THRESHOLD_HIGH = 7;
    const THRESHOLD_CRITICAL = 12;

    /**
     * Analyze a user's report frequency and calculate risk level
     */
    public function analyzeUserRisk($userId)
    {
        $cacheKey = "user_safety_risk_{$userId}";
        
        // Check cache first (refresh every 15 minutes)
        $cached = Cache::get($cacheKey);
        if ($cached && now()->diffInMinutes(Carbon::parse($cached['analyzed_at'])) < 15) {
            return $cached;
        }

        // Calculate report counts
        $reportsLast7Days = Report::where('reporter_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
            
        $reportsLast30Days = Report::where('reporter_id', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        // Calculate risk score
        $riskScore = $this->calculateRiskScore($reportsLast7Days, $reportsLast30Days);
        
        // Determine risk level
        $riskLevel = $this->determineRiskLevel($riskScore, $reportsLast30Days);
        
        // Collect report reasons for analysis
        $reportReasons = Report::where('reporter_id', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->pluck('reason')
            ->toArray();

        // Update or create safety analysis record
        $analysis = SafetyReportAnalysis::updateOrCreate(
            ['user_id' => $userId],
            [
                'report_count_7d' => $reportsLast7Days,
                'report_count_30d' => $reportsLast30Days,
                'risk_score' => $riskScore,
                'risk_level' => $riskLevel,
                'report_reasons' => json_encode(array_count_values($reportReasons)),
                'last_assessed_at' => now(),
            ]
        );

        // Cache the result
        $result = [
            'user_id' => $userId,
            'report_count_7d' => $reportsLast7Days,
            'report_count_30d' => $reportsLast30Days,
            'risk_score' => $riskScore,
            'risk_level' => $riskLevel,
            'report_reasons' => array_count_values($reportReasons),
            'analyzed_at' => now()->toIso8601String(),
        ];

        Cache::put($cacheKey, $result, now()->addMinutes(15));

        // Trigger safety alerts if thresholds are crossed
        $this->triggerSafetyAlerts($userId, $riskLevel);

        Log::info("Safety analysis for user {$userId}: Risk level = {$riskLevel}, score = {$riskScore}");

        return $result;
    }

    /**
     * Calculate risk score based on report counts and recency
     */
    private function calculateRiskScore($reportsLast7Days, $reportsLast30Days)
    {
        $score = 0;
        
        // Weight recent reports more heavily
        $score += $reportsLast7Days * 3;
        
        // Weight 30-day reports less
        $score += ($reportsLast30Days - $reportsLast7Days) * 1;
        
        // Cap the score at 100
        return min($score, 100);
    }

    /**
     * Determine risk level from score and report counts
     */
    private function determineRiskLevel($riskScore, $reportsLast30Days)
    {
        if ($riskScore >= self::THRESHOLD_CRITICAL) {
            return 'critical';
        }
        if ($riskScore >= self::THRESHOLD_HIGH) {
            return 'high';
        }
        if ($riskScore >= self::THRESHOLD_MEDIUM) {
            return 'medium';
        }
        return 'low';
    }

    /**
     * Trigger safety alerts for users who cross thresholds
     */
    private function triggerSafetyAlerts($userId, $riskLevel)
    {
        $user = User::find($userId);
        if (!$user) {
            return;
        }

        switch ($riskLevel) {
            case 'medium':
                // Send in-app warning notification
                $this->sendInAppWarning($userId, $riskLevel);
                break;
                
            case 'high':
                // Send in-app warning + email notification
                $this->sendInAppWarning($userId, $riskLevel);
                $this->sendEmailWarning($user->email, $riskLevel);
                break;
                
            case 'critical':
                // Send all warning types + flag for admin review
                $this->sendInAppWarning($userId, $riskLevel);
                $this->sendEmailWarning($user->email, $riskLevel);
                $this->flagForAdminReview($userId, $riskLevel);
                break;
        }
    }

    /**
     * Send an in-app warning notification
     */
    private function sendInAppWarning($userId, $riskLevel)
    {
        $messages = [
            'medium' => [
                'title' => 'Safety Advisory',
                'description' => 'Your account has received multiple reports. Please review our community guidelines.',
            ],
            'high' => [
                'title' => 'High Risk Account',
                'description' => 'Your account activity requires immediate attention. Continued violations may result in account suspension.',
            ],
            'critical' => [
                'title' => 'Account Under Review',
                'description' => 'Your account has been flagged for serious violations. It will be temporarily restricted while we investigate.',
            ],
        ];

        $message = $messages[$riskLevel] ?? null;
        if (!$message) {
            return;
        }

        \App\Models\Notification::create([
            'user_id' => $userId,
            'type' => 'safety_warning',
            'title' => $message['title'],
            'description' => $message['description'],
            'link_url' => '/safety-center',
        ]);
    }

    /**
     * Send an email warning to the user
     */
    private function sendEmailWarning($email, $riskLevel)
    {
        // In production, queue an email notification
        // dispatch(new \App\Mail\SendSafetyWarning($email, $riskLevel));
        Log::info("Safety warning email would be sent to {$email} for risk level: {$riskLevel}");
    }

    /**
     * Flag account for admin review
     */
    private function flagForAdminReview($userId, $riskLevel)
    {
        // Update user status for admin review
        User::where('id', $userId)->update([
            'status' => 'restricted',
            'restriction_reason' => "Account flagged for safety concerns (risk level: {$riskLevel})",
        ]);

        // Notify admins
        \App\Models\Notification::create([
            'user_id' => 1, // Admin user
            'type' => 'admin_safety_alert',
            'title' => 'Account Requires Review',
            'description' => "User ID {$userId} has been flagged with critical safety risk.",
            'link_url' => "/admin/users/{$userId}",
        ]);

        Log::alert("User {$userId} flagged for admin review at critical risk level");
    }

    /**
     * Get safety status for a user (used in API responses)
     */
    public function getUserSafetyStatus($userId)
    {
        $analysis = SafetyReportAnalysis::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$analysis) {
            // Run analysis if none exists
            return $this->analyzeUserRisk($userId);
        }

        return [
            'user_id' => $userId,
            'report_count' => $analysis->report_count_30d,
            'recent_reports' => $analysis->report_count_7d,
            'risk_level' => $analysis->risk_level,
            'risk_score' => $analysis->risk_score,
            'report_reasons' => json_decode($analysis->report_reasons, true) ?: [],
            'last_assessment' => $analysis->last_assessed_at,
        ];
    }

    /**
     * Check if a user's messages should be intercepted based on safety
     */
    public function shouldInterceptConversation($initiatorId, $targetId, $adId = null)
    {
        $initiatorStatus = $this->getUserSafetyStatus($initiatorId);
        $targetStatus = $this->getUserSafetyStatus($targetId);

        $warnings = [];

        // Check initiator risk
        if (in_array($initiatorStatus['risk_level'], ['high', 'critical'])) {
            $warnings[] = [
                'type' => 'initiator',
                'risk_level' => $initiatorStatus['risk_level'],
                'message' => $this->getRiskWarningMessage($initiatorStatus['risk_level']),
            ];
        }

        // Check target risk
        if (in_array($targetStatus['risk_level'], ['high', 'critical'])) {
            $warnings[] = [
                'type' => 'target',
                'risk_level' => $targetStatus['risk_level'],
                'message' => $this->getRiskWarningMessage($targetStatus['risk_level']),
            ];
        }

        return $warnings;
    }

    /**
     * Generate appropriate warning message based on risk level
     */
    private function getRiskWarningMessage($riskLevel)
    {
        $messages = [
            'high' => 'This user has been reported frequently. Proceed with caution.',
            'critical' => 'WARNING: This user has multiple reports and may be unsafe. Report any suspicious activity immediately.',
        ];

        return $messages[$riskLevel] ?? 'This account has low activity and appears safe.';
    }

    /**
     * Run periodic safety assessments for all users
     */
    public function runPeriodicAssessment()
    {
        $users = User::where('status', 'active')
            ->where('last_login_at', '>=', now()->subDays(30))
            ->pluck('id');

        $results = [];
        
        foreach ($users as $userId) {
            try {
                $results[] = $this->analyzeUserRisk($userId);
            } catch (\Exception $e) {
                Log::error("Failed to assess safety for user {$userId}: " . $e->getMessage());
            }
        }

        return $results;
    }
}