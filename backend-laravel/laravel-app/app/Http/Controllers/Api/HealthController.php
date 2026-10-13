<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HealthController extends Controller
{
    public function check(Request $request)
    {
        $checks = [
            'app' => $this->checkApp(),
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
            'storage' => $this->checkStorage(),
        ];

        $allHealthy = collect($checks)->every(fn($check) => $check['healthy'] === true);

        return response()->json([
            'status' => $allHealthy ? 'healthy' : 'degraded',
            'checks' => $checks,
            'timestamp' => now()->toISOString(),
        ], $allHealthy ? 200 : 503);
    }

    protected function checkApp(): array
    {
        return [
            'healthy' => true,
            'version' => config('app.version', '1.0.0'),
            'environment' => app()->environment(),
        ];
    }

    protected function checkDatabase(): array
    {
        try {
            \DB::connection()->getPdo();
            return ['healthy' => true, 'driver' => config('database.default')];
        } catch (\Exception $e) {
            return ['healthy' => false, 'error' => $e->getMessage()];
        }
    }

    protected function checkRedis(): array
    {
        try {
            if (!extension_loaded('redis')) {
                return ['healthy' => false, 'error' => 'Redis extension not installed'];
            }
            return ['healthy' => true, 'note' => 'Redis extension available'];
        } catch (\Exception $e) {
            return ['healthy' => false, 'error' => $e->getMessage()];
        }
    }

    protected function checkStorage(): array
    {
        try {
            $testFile = 'health_check_' . time() . '.tmp';
            \Storage::disk('public')->put($testFile, 'test');
            \Storage::disk('public')->delete($testFile);
            return ['healthy' => true];
        } catch (\Exception $e) {
            return ['healthy' => false, 'error' => $e->getMessage()];
        }
    }
}