<?php

namespace App\Jobs;

use App\Models\Report;
use App\Models\User;
use App\Services\UserSafetyService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ReassessUserSafety implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $initiatorId;
    protected $targetId;
    protected $reportReason;

    public function __construct($initiatorId, $targetId, $reportReason)
    {
        $this->initiatorId = $initiatorId;
        $this->targetId = $targetId;
        $this->reportReason = $reportReason;
    }

    public function handle(UserSafetyService $safetyService)
    {
        Log::info("Reassessing safety for user: {$this->targetId} (reported by: {$this->initiatorId})")
            ;

        try {
            $safetyStatus = $safetyService->analyzeUserRisk($this->targetId);

            // Check if user should be automatically restricted
            if (in_array($safetyStatus['risk_level'], ['high', 'critical'])) {
                $this->applyAutomaticRestrictions($this->targetId, $safetyStatus);
            }

            Log::info("Safety reassessment completed for user {$this->targetId}: " . $safetyStatus['risk_level']);

        } catch (\Exception $e) {
            Log::error("Failed to reassess safety for user {$this->targetId}: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    private function applyAutomaticRestrictions($userId, $safetyStatus)
    {
        $user = User::find($userId);
        if (!$user) {
            return;
        }

        switch ($safetyStatus['risk_level']) {
            case 'high':
                $user->update([
                    'status' => 'restricted',
                    'restriction_reason' => 'Multiple user reports detected',
                ]);
                break;

            case 'critical':
                $user->update([
                    'status' => 'banned',
                    'ban_reason' => 'Severe safety violations',
                    'ban_expires_at' => now()->addDays(30),
                ]);
                break;
        }
    }
}