<?php

namespace App\Jobs;

use App\Models\VideoRecording;
use App\Services\VideoRecordingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessVideoRecording implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 600]; // 1min, 5min, 10min
    public $timeout = 300; // 5 minutes max

    protected $recordingId;

    public function __construct($recordingId)
    {
        $this->recordingId = $recordingId;
    }

    public function handle(VideoRecordingService $videoRecordingService)
    {
        $recording = VideoRecording::find($this->recordingId);
        
        if (!$recording) {
            Log::error("Video recording not found: {$this->recordingId}");
            return;
        }

        try {
            Log::info("Processing video recording: {$this->recordingId}");
            
            $videoRecordingService->processVideoWithAI($this->recordingId);
            
            Log::info("Video recording processed successfully: {$this->recordingId}");
            
        } catch (\Exception $e) {
            Log::error("Failed to process video recording: {$this->recordingId}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e; // This will trigger retry
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::error("Video recording processing permanently failed: {$this->recordingId}", [
            'error' => $exception->getMessage(),
        ]);

        // Update recording status
        VideoRecording::where('id', $this->recordingId)->update([
            'processing_status' => 'failed',
            'status' => 'failed',
        ]);
    }
}