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

class ExpirePromotion implements ShouldQueue
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
            Log::warning("Promotion not found for expiration: {$this->promotionId}");
            return;
        }

        // Only expire if still active
        if ($promotion->status === 'active') {
            $promotion->update([
                'status' => 'expired',
                'expires_at' => now(),
            ]);

            // Notify the seller
            $ad = $promotion->ad;
            if ($ad && $ad->seller) {
                Notification::create([
                    'user_id' => $ad->seller->id,
                    'type' => 'promotion_expired',
                    'title' => 'Ad Promotion Expired',
                    'description' => "Your promotion for \"{$ad->title}\" has expired. You can renew it to continue promoting.",
                    'link_url' => "/seller/ads/{$ad->id}/promote",
                ]);
            }

            Log::info("Promotion expired: {$this->promotionId}");
        }
    }
}