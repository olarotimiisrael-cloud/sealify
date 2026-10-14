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
     * Analyze a user's report frequency and calculate risk level (Phase 1: Marketplace Analytics)
     */
    public function analyzeUserRisk($userId)
    {
        $cacheKey = "marketplace_safety_risk_{$userId}";
        
        // Check cache first (refresh every 15 minutes)
        $cached = Cache::get($cacheKey);
        if ($cached && now()->diffInMinutes(Carbon::parse($cached['analyzed_at'])) < 15) {
            return $cached;
        }

        // Calculate report counts (for content moderation & marketplace fraud detection)
        $reportsLast7Days = Report::where('reporter_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
            
        $reportsLast30Days = Report::where('reporter_id', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        // Calculate risk score with enhanced weights for marketplace fraud
        $riskScore = $this->calculateMarketRiskScore($reportsLast7Days, $reportsLast30Days);
        
        // Determine risk level for marketplace operations
        $riskLevel = $this->determineMarketRiskLevel($riskScore, $reportsLast30Days);
        
        // Collect detailed report reasons for market analytics
        $reportDetails = $this->collectMarketRiskDetails($userId);

        // Update or create market analysis record (reusing SafetyReportAnalysis table)
        $analysis = SafetyReportAnalysis::updateOrCreate(
            ['user_id' => $userId],
            [
                'report_count_7d' => $reportsLast7Days,
                'report_count_30d' => $reportsLast30Days,
                'risk_score' => $riskScore,
                'risk_level' => $riskLevel,
                'report_reasons' => json_encode($reportDetails['reasons']),
                'last_assessed_at' => now(),
            ]
        );

        // Enhanced caching for market analytics
        $result = [
            'user_id' => $userId,
            'report_count_7d' => $reportsLast7Days,
            'report_count_30d' => $reportsLast30Days,
            'risk_score' => $riskScore,
            'risk_level' => $riskLevel,
            'risk_category' => $reportDetails['category'],
            'report_reasons' => $reportDetails['reasons'],
            'marketplace_insights' => $this->generateMarketplaceInsights($userId, $reportDetails),
            'analyzed_at' => now()->toIso8601String(),
        ];

        Cache::put($cacheKey, $result, now()->addMinutes(15));

        // Trigger enhanced marketplace alerts
        $this->triggerMarketAlerts($userId, $riskLevel, $reportDetails);

        Log::info("Marketplace safety analysis for user {$userId}: Risk level = {$riskLevel}, score = {$riskScore}");

        return $result;
    }

    /**
     * Enhanced risk scoring for marketplace fraud detection
     */
    private function calculateMarketRiskScore($reportsLast7Days, $reportsLast30Days)
    {
        $score = 0;
        
        // Heavy weight for marketplace fraud patterns
        $score += $reportsLast7Days * 5;  // Higher weight for recent marketplace fraud
        
        // Medium weight for historical marketplace issues
        $score += ($reportsLast30Days - $reportsLast7Days) * 2;
        
        // Additional risk factors for marketplace operations
        if ($reportsLast7Days >= 3) {
            $score += 20; // Multiple reports in short timeframe
        }
        
        // Cap the score at 100
        return min($score, 100);
    }

    /**
     * Enhanced risk levels for marketplace operations
     */
    private function determineMarketRiskLevel($riskScore, $reportsLast30Days)
    {
        if ($riskScore >= self::THRESHOLD_CRITICAL) {
            return 'blocked';
        }
        if ($riskScore >= self::THRESHOLD_HIGH) {
            return 'suspended';
        }
        if ($riskScore >= self::THRESHOLD_MEDIUM) {
            return 'caution';
        }
        return 'verified';
    }

    /**
     * Collect detailed marketplace risk information for analytics
     */
    private function collectMarketRiskDetails($userId)
    {
        $reports = Report::where('reporter_id', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->get();
            
        $reasons = [];
        $categories = [];
        $patternAnalysis = [];
        
        foreach ($reports as $report) {
            $category = $this->categorizeMarketReport($report->reason);
            $categories[] = $category;
            $reasons[$category] = ($reasons[$category] ?? 0) + 1;
        }
        
        // Analyze patterns for fraud detection
        $patternAnalysis = $this->analyzeMarketRiskPatterns($userId, $reports);
        
        return [
            'reasons' => $reasons,
            'categories' => array_count_values($categories),
            'pattern_analysis' => $patternAnalysis,
            'category' => $this->determinePrimaryRiskCategory($reasons),
        ];
    }

    /**
     * Categorize reports for marketplace content moderation
     */
    private function categorizeMarketReport($reason)
    {
        $reason = strtolower($reason);
        
        if (str_contains($reason, 'fraud') || str_contains($reason, 'scam')) {
            return 'fraud';
        }
        if (str_contains($reason, 'spam') || str_contains($reason, 'fake')) {
            return 'spam';
        }
        if (str_contains($reason, 'inappropriate') || str_contains($reason, 'illegal')) {
            return 'inappropriate_content';
        }
        if (str_contains($reason, 'price') || str_contains($reason, 'price violation')) {
            return 'pricing_fraud';
        }
        if (str_contains($reason, 'identity') || str_contains($reason, 'identity_theft')) {
            return 'identity_theft';
        }
        
        return 'other';
    }

    /**
     * Analyze marketplace risk patterns using ML-like heuristics
     */
    private function analyzeMarketRiskPatterns($userId, $reports)
    {
        $patterns = [];
        
        // Temporal patterns
        $reportsByHour = [];
        foreach ($reports as $report) {
            $hour = now()->parse($report->created_at)->hour;
            $reportsByHour[$hour] = ($reportsByHour[$hour] ?? 0) + 1;
        }
        
        $patterns['temporal_analysis'] = [
            'reports_per_hour' => $reportsByHour,
            'peak_activity_hour' => $this->findPeakActivity($reportsByHour),
            'pattern_type' => $this->identifyActivityPattern($reportsByHour),
        ];
        
        // Pattern-based risk indicators
        $patterns['risk_indicators'] = [
            'multiple_reports_same_hour' => $this->hasMultipleReportsSameHour($reports),
            'rapid_report_sequence' => $this->hasRapidReportSequence($reports),
            'coordination_patterns' => $this->detectCoordinationPatterns($reports),
        ];
        
        return $patterns;
    }

    /**
     * Generate marketplace insights for business intelligence
     */
    private function generateMarketplaceInsights($userId, $reportDetails)
    {
        $insights = [
            'risk_assessment' => $this->assessMarketplaceRisk($userId, $reportDetails),
            'behavior_pattern' => $this->analyzeUserBehaviorPattern($userId, $reportDetails),
            'recommended_actions' => $this->suggestMarketplaceActions($userId, $reportDetails),
            'impact_score' => $this->calculateMarketImpactScore($reportDetails),
        ];
        
        return $insights;
    }

    /**
     * Enhanced marketplace alert system
     */
    private function triggerMarketAlerts($userId, $riskLevel, $reportDetails)
    {
        switch ($riskLevel) {
            case 'blocked':
                // Immediate account suspension
                $this->executeAccountBlock($userId, 'marketplace_security_violation');
                break;
                
            case 'suspended':
                // Temporary suspension with review
                $this->executeAccountSuspend($userId, 'marketplace_safety_concern');
                $this->notifyMarketSecurityTeam($userId, 'suspension_required');
                break;
                
            case 'caution':
                // Warning with enhanced monitoring
                $this->sendMarketWarning($userId, 'marketplace_cautionary_alert');
                $this->enableEnhancedMonitoring($userId);
                break;
                
            case 'verified':
                // Normal operations continue
                $this->logMarketActivity('account_verified', $userId, $reportDetails);
                break;
        }
    }

    /**
     * Enhanced marketplace analytics
     */
    public function analyzeMarketplaceAnalytics($days = 30)
    {
        $startDate = now()->subDays($days);
        
        // Aggregate marketplace risk data
        $totalReports = Report::where('created_at', '>=', $startDate)->count();
        $uniqueReporters = Report::where('created_at', '>=', $startDate)
            ->where('reporter_id', '!=', null)
            ->distinct()
            ->count('reporter_id');
        
        // Categorize risk types
        $fraudReports = Report::where('created_at', '>=', $startDate)
            ->where('reason', 'like', '%fraud%')
            ->orWhere('reason', 'like', '%scam%')
            ->count();
            
        $spamReports = Report::where('created_at', '>=', $startDate)
            ->where('reason', 'like', '%spam%')
            ->orWhere('reason', 'like', '%fake%')
            ->count();
        
        // Risk trends analysis
        $dailyReports = Report::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date');
        
        return [
            'total_reports' => $totalReports,
            'unique_reporters' => $uniqueReporters,
            'report_rate_per_day' => $totalReports / $days,
            'fraud_risk_level' => $this->calculateFraudRiskLevel($fraudReports, $totalReports),
            'spam_level' => $this->calculateSpamLevel($spamReports, $totalReports),
            'daily_trends' => $dailyReports->toArray(),
            'peak_moderation_hours' => $this->identifyPeakModerationHours(),
            'market_insights' => $this->generateDailyMarketInsights($dailyReports),
        ];
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