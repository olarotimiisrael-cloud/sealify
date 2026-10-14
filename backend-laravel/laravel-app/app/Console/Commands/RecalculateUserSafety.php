<?php

namespace App\Console\Commands;

use App\Models\Report;
use App\Services\UserSafetyService;
use Illuminate\Console\Command;

class RecalculateUserSafety extends Command
{
    protected $signature = 'safety:recalculate';

    protected $description = 'Recompute safety risk for accounts reported within the last 90 days';

    public function handle(UserSafetyService $service): int
    {
        $ids = Report::query()
            ->whereNotNull('reported_id')
            ->where(function ($query) {
                $query->whereNull('created_at')->orWhere('created_at', '>=', now()->subDays(90));
            })
            ->distinct()
            ->pluck('reported_id');

        foreach ($ids as $id) {
            $service->analyzeUserRisk($id);
        }

        $this->info("Recalculated safety for {$ids->count()} account(s).");

        return self::SUCCESS;
    }
}
