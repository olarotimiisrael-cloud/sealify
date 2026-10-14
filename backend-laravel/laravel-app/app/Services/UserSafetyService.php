<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Report;
use App\Models\SafetyReportAnalysis;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UserSafetyService
{
    public function analyzeUserRisk($userId)
    {
        $cacheKey = "user_safety_risk_{$userId}";

        $cached = Cache::get($cacheKey);
        if ($cached && Carbon::parse($cached['analyzed_at'])->diffInMinutes(now()) < 15) {
            return $cached;
        }

        $reportsLast7Days = $this->recentReports($userId, 7)->count();
        $reportsLast30Days = $this->recentReports($userId, 30)->count();
        $distinctReporters30d = $this->recentReports($userId, 30)->distinct()->count('reporter_id');

        $riskScore = $this->calculateRiskScore($reportsLast7Days, $reportsLast30Days, $distinctReporters30d);
        $riskLevel = $this->determineRiskLevel($riskScore);

        $reasons = $this->recentReports($userId, 30)
            ->selectRaw('reason, COUNT(*) as aggregate')
            ->groupBy('reason')
            ->pluck('aggregate', 'reason')
            ->toArray();

        $analysis = SafetyReportAnalysis::firstOrNew(['user_id' => $userId]);
        if (! $analysis->exists) {
            $analysis->id = (string) Str::uuid();
        }
        $analysis->fill([
            'report_count_7d' => $reportsLast7Days,
            'report_count_30d' => $reportsLast30Days,
            'risk_score' => $riskScore,
            'risk_level' => $riskLevel,
            'report_reasons' => json_encode($reasons),
            'last_assessed_at' => now(),
        ]);
        $analysis->save();

        $result = [
            'user_id' => $userId,
            'report_count_7d' => $reportsLast7Days,
            'report_count_30d' => $reportsLast30Days,
            'distinct_reporters_30d' => $distinctReporters30d,
            'risk_score' => $riskScore,
            'risk_level' => $riskLevel,
            'report_reasons' => $reasons,
            'analyzed_at' => now()->toIso8601String(),
        ];

        Cache::put($cacheKey, $result, now()->addMinutes(15));

        $this->triggerSafetyAlerts($userId, $riskLevel);

        Log::info("Safety analysis for user {$userId}: level={$riskLevel}, score={$riskScore}");

        return $result;
    }

    public function getUserSafetyStatus($userId)
    {
        $analysis = SafetyReportAnalysis::where('user_id', $userId)
            ->orderByDesc('last_assessed_at')
            ->first();

        if (!$analysis) {
            return $this->analyzeUserRisk($userId);
        }

        $distinctReporters30d = Report::where('reported_id', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->distinct()
            ->count('reporter_id');

        return [
            'user_id' => $userId,
            'report_count' => $analysis->report_count_30d,            'recent_reports' => $analysis->report_count_7d,
            'distinct_reporters' => $distinctReporters30d,
            'risk_level' => $analysis->risk_level,
            'risk_score' => $analysis->risk_score,
            'report_reasons' => json_decode($analysis->report_reasons, true) ?: [],
            'last_assessment' => $analysis->last_assessed_at,
        ];
    }

    public function shouldInterceptConversation($initiatorId, $targetId, $adId = null)
    {
        $targetStatus = $this->getUserSafetyStatus($targetId);

        $warnings = [];

        if (in_array($targetStatus['risk_level'], ['medium', 'high', 'critical'])) {
            $warnings[] = [
                'type' => 'target',
                'risk_level' => $targetStatus['risk_level'],
                'report_count_30d' => $targetStatus['report_count'],
                'message' => $this->getRiskWarningMessage($targetStatus['risk_level']),
            ];
        }

        return $warnings;
    }

    public function getConversationSafetyInfo($viewerId, $otherId)
    {
        $other = $this->getUserSafetyStatus($otherId);

        return [
            'other_user_id' => (int) $otherId,
            'risk_level' => $other['risk_level'],
            'report_count_30d' => $other['report_count'],
            'recent_reports' => $other['recent_reports'],
            'distinct_reporters' => $other['distinct_reporters'] ?? 0,
            'should_warn' => in_array($other['risk_level'], ['medium', 'high', 'critical']),
            'message' => $this->getRiskWarningMessage($other['risk_level']),
        ];
    }

    private function recentReports($userId, int $days)
    {
        $since = now()->subDays($days);

        return Report::where('reported_id', $userId)->where(function ($query) use ($since) {
            $query->whereNull('created_at')->orWhere('created_at', '>=', $since);
        });
    }

    private function calculateRiskScore($reportsLast7Days, $reportsLast30Days, $distinctReporters30d)
    {
        $score = ($reportsLast7Days * 3)
            + (max(0, $reportsLast30Days - $reportsLast7Days) * 1)
            + ($distinctReporters30d * 2);

        return min($score, 100);
    }

    private function determineRiskLevel($riskScore)
    {
        if ($riskScore >= (int) config('services.safety.risk_score_critical', 12)) {
            return 'critical';
        }
        if ($riskScore >= (int) config('services.safety.risk_score_high', 7)) {
            return 'high';
        }
        if ($riskScore >= (int) config('services.safety.risk_score_medium', 3)) {
            return 'medium';
        }

        return 'low';
    }

    private function triggerSafetyAlerts($userId, $riskLevel)
    {
        $user = User::find($userId);
        if (!$user) {
            return;
        }

        switch ($riskLevel) {
            case 'medium':
                $this->sendInAppWarning($userId, $riskLevel);
                break;

            case 'high':
                $this->sendInAppWarning($userId, $riskLevel);
                $this->sendEmailWarning($user->email, $riskLevel);
                break;

            case 'critical':
                $this->sendInAppWarning($userId, $riskLevel);
                $this->sendEmailWarning($user->email, $riskLevel);
                $this->flagForAdminReview($userId, $riskLevel);
                break;
        }
    }

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

        Notification::create([
            'user_id' => $userId,
            'type' => 'safety_warning',
            'title' => $message['title'],
            'description' => $message['description'],
            'link_url' => '/safety-center',
        ]);
    }

    private function sendEmailWarning($email, $riskLevel)
    {
        if (! config('services.safety.warning_email_enabled', true)) {
            return;
        }

        Log::info("Safety warning email queued for {$email} (risk level: {$riskLevel})");
    }

    private function flagForAdminReview($userId, $riskLevel)
    {
        User::where('id', $userId)->update([
            'status' => 'restricted',
            'restriction_reason' => "Account flagged for safety concerns (risk level: {$riskLevel})",
        ]);

        Notification::create([
            'user_id' => 1,
            'type' => 'admin_safety_alert',
            'title' => 'Account Requires Review',
            'description' => "User ID {$userId} has been flagged with critical safety risk.",
            'link_url' => "/admin/users/{$userId}",
        ]);

        Log::alert("User {$userId} flagged for admin review at critical risk level");
    }

    private function getRiskWarningMessage($riskLevel)
    {
        $messages = [
            'medium' => 'This account has received a few reports recently. Please be cautious.',
            'high' => 'This user has been reported frequently. Proceed with caution.',
            'critical' => 'WARNING: This user has multiple reports and may be unsafe. Report any suspicious activity immediately.',
        ];

        return $messages[$riskLevel] ?? 'This account has low activity and appears safe.';
    }

    public function runPeriodicAssessment()
    {
        $users = User::where('status', 'active')
            ->where('last_login_at', '>=', now()->subDays(30))
            ->pluck('id');

        $results = [];

        foreach ($users as $userId) {
            try {
                $results[] = $this->analyzeUserRisk($userId);
            } catch (\Throwable $e) {
                Log::error("Failed to assess safety for user {$userId}: " . $e->getMessage());
            }
        }

        return $results;
    }
}
