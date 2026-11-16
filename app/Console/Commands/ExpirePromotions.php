<?php

namespace App\Console\Commands;

use App\Models\Promotion;
use Illuminate\Console\Command;

class ExpirePromotions extends Command
{
    protected $signature = 'promotions:expire';

    protected $description = 'Mark expired promotions as expired automatically';

    public function handle(): int
    {
        $expiredCount = Promotion::query()
            ->where('status', 'active')
            ->where('ends_at', '<=', now())
            ->update(['status' => 'expired']);

        $this->info("Expired {$expiredCount} promotion(s).");

        return Command::SUCCESS;
    }
}