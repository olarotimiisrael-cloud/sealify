<?php

namespace App\Jobs;

use App\Models\AdPromotion;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PromotionSchedulerJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $promotionId;

    public function __construct($promotionId)
    {
        $this->promotionId = $promotionId;
    }

    public function handle()
    {
        $promotion = AdPromotion::find($this->promotionId);

        if (!$promotion) {
            Log::warning("Promotion not found for scheduling: {$this->promotionId}");
            return;
        }

        // Handle promotion expiration
        $this->handleExpiration($promotion);

        // Handle promotion re-activation (for contracts that can be renewed)
        $this->handleReActivation($promotion);
    }

    private function handleExpiration(AdPromotion $promotion)
    {
        if ($promotion->status === 'active' && $promotion->expires_at && $promotion->expires_at->isPast()) {
            // Notify the seller before expiration
            if ($promotion->expires_at->diffInHours(now()) <= 24) {
                $this->notifyExpirationWarning($promotion);
            }

            // Mark as expired
            $promotion->update([
                'status' => 'expired',
                'expires_at' => now(),
            ]);

            // Notify seller
            $this->notifySeller($promotion, 'expired', [
                'expired_at' => now(),
                'can_renew' => $promotion->promotion_plan_name !== 'enterprise',
            ]);
        }
    }

    private function handleReActivation(AdPromotion $promotion)
    {
        // Check if promotion can be renewed (for certain plans)
        if ($promotion->status === 'expired' && $promotion->promotion_plan_name === 'enterprise') {
            // Enterprise promotions can be automatically renewed
            $promotion->update([
                'status' => 'pending',
                'created_at' => now(),
                'approved_at' => now(),
                'started_at' => now(),
                'expires_at' => now()->addMonths($promotion->duration_months),
            ]);

            // Send notification
            $this->notifySeller($promotion, 'renewed', [
                'auto_renewal' => true,
                'new_expiry' => $promotion->expires_at,
            ]);
        }
    }

    private function notifyExpirationWarning(AdPromotion $promotion)
    {
        $ad = $promotion->ad;
        if (!$ad || !$ad->seller) {
            return;
        }

        Notification::create([
            'user_id' => $ad->seller->id,
            'type' => 'promotion_expiring_soon',
            'title' => 'Promotion Expires Soon',
            'description' => "Your promotion for \"{$ad->title}\" will expire in 24 hours. Renew now to continue promoting.",
            'link_url' => "/seller/ads/{$ad->id}/promote",
        ]);
    }

    private function notifySeller(AdPromotion $promotion, $event, $extraData = [])
    {
        $ad = $promotion->ad;
        if (!$ad || !$ad->seller) {
            return;
        }

        $messages = [
            'pending' => 'Your promotion request is pending admin approval',
            'approved' => 'Your promotion has been approved and is now active',
            'active' => 'Your promotion is currently active',
            'expired' => 'Your promotion has expired',
            'renewed' => 'Your promotion has been automatically renewed',
            'terminated' => 'Your promotion has been terminated',
            'rejected' => 'Your promotion request has been rejected',
        ];

        $message = $messages[$event] ?? "Promotion status changed to {$event}";

        Notification::create([
            'user_id' => $ad->seller->id,
            'type' => 'promotion_' . $event,
            'title' => 'Promotion Update',
            'description' => "Your promotion for \"{$ad->title}\" - {$message}",
            'link_url' => "/seller/ads/{$ad->id}/promote",
            'data' => $extraData,
        ]);
    }
}