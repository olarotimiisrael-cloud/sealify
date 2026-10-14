<?php

namespace App\Services;

use App\Models\VideoRecording;
use App\Models\VideoRoom;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VideoRecordingService
{
    protected $ffmpegPath;
    protected $recordingStoragePath;
    protected $summarizer;

    public function __construct(RecordingSummarizer $summarizer)
    {
        $this->ffmpegPath = config('services.ffmpeg.path', '/usr/bin/ffmpeg');
        $this->recordingStoragePath = config('services.filesystems.default') === 's3'
            ? 's3://video-recordings'
            : storage_path('app/video-recordings');
        $this->summarizer = $summarizer;
    }

    public function startSessionRecording($roomId, $adId = null, $initiatorId = null)
    {
        $room = VideoRoom::where('id', $roomId)->firstOrFail();

        if (! in_array($room->status, ['active', 'waiting', 'recording'], true)) {
            throw new \RuntimeException('Cannot record an inactive room.');
        }

        $recordingPath = $this->generateRecordingPath($roomId);

        $recording = VideoRecording::create([
            'id' => Str::uuid(),
            'room_id' => $roomId,
            'ad_id' => $adId,
            'initiator_id' => $initiatorId,
            'status' => 'recording',
            'processing_status' => 'pending',
            'quality' => '1080p30fps',
            'recording_path' => $recordingPath,
            'started_at' => now(),
        ]);

        $room->update(['status' => 'recording']);

        Log::info("Video recording started for room: {$roomId}");

        return $recording;
    }

    public function stopSessionRecording($recordingId)
    {
        $recording = VideoRecording::where('id', $recordingId)->firstOrFail();

        $recording->update([
            'status' => 'processing',
            'ended_at' => now(),
            'duration_seconds' => $this->calculateDuration($recording->started_at, now()),
        ]);

        $thumbnailPath = $this->generateThumbnail($recording->recording_path);
        if ($thumbnailPath) {
            $recording->update(['thumbnail_path' => $thumbnailPath]);
        }

        dispatch(new \App\Jobs\ProcessVideoRecording($recording->id));

        Log::info("Video recording stopped and processing started: {$recordingId}");

        return $recording;
    }

    public function processVideoWithAI($recordingId)
    {
        $recording = VideoRecording::with('room')->findOrFail($recordingId);

        if (! in_array($recording->processing_status, ['pending', 'processing'], true)) {
            return $recording;
        }

        $recording->update(['processing_status' => 'processing']);

        try {
            $transcript = $this->getTranscript($recording->recording_path);
            $summaryData = $this->summarizer->summarize($transcript);

            $recording->update([
                'ai_summary' => $summaryData['summary'],
                'key_points' => $summaryData['key_points'],
                'action_items' => $summaryData['action_items'],
                'sentiment' => $summaryData['sentiment'],
                'processing_status' => 'completed',
                'status' => 'completed',
            ]);

            Log::info("Video recording processed successfully: {$recordingId}");
        } catch (\Throwable $e) {
            Log::error("Failed to process video recording: {$recordingId}", ['error' => $e->getMessage()]);

            $recording->update([
                'processing_status' => 'failed',
                'status' => 'failed',
            ]);

            throw $e;
        }

        return $recording;
    }

    protected function getTranscript($recordingPath)
    {
        $disk = config('filesystems.default', 'local');
        $path = (string) $recordingPath;

        try {
            if (Str::startsWith($path, 's3://')) {
                $path = ltrim(Str::after($path, 's3://'), '/');
                $disk = 's3';
            }

            if (Storage::disk($disk)->exists($path)) {
                $contents = Storage::disk($disk)->get($path);
                if (is_string($contents) && trim($contents) !== '') {
                    return $contents;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Could not read recording transcript: ' . $e->getMessage());
        }

        return 'Session recording transcript placeholder - connect a speech-to-text provider to generate transcripts automatically.';
    }

    protected function generateRecordingPath($roomId)
    {
        $timestamp = Carbon::now()->format('Ymd_His');

        return "recordings/{$roomId}/{$timestamp}.mp4";
    }

    protected function generateThumbnail($recordingPath)
    {
        try {
            if (! is_file((string) $recordingPath) && ! Str::startsWith((string) $recordingPath, 's3://')) {
                return $this->generateLocalThumbnailFromStorage((string) $recordingPath);
            }

            $tempThumbPath = storage_path('app/temp/thumb_' . Str::random(8) . '.jpg');
            if (! is_dir(dirname($tempThumbPath))) {
                mkdir(dirname($tempThumbPath), 0775, true);
            }

            $commands = [
                '-i', escapeshellarg((string) $recordingPath),
                '-ss', '00:00:01',
                '-vframes', '1',
                '-q:v', '2',
                escapeshellarg($tempThumbPath),
            ];

            $cmd = escapeshellcmd($this->ffmpegPath) . ' ' . implode(' ', $commands);
            exec($cmd, $output, $returnCode);

            if ($returnCode === 0 && is_file($tempThumbPath)) {
                $storagePath = 'thumbnails/' . basename($tempThumbPath);
                Storage::disk('local')->put($storagePath, file_get_contents($tempThumbPath));
                @unlink($tempThumbPath);

                return $storagePath;
            }
        } catch (\Throwable $e) {
            Log::warning('Could not generate thumbnail: ' . $e->getMessage());
        }

        return null;
    }

    protected function generateLocalThumbnailFromStorage($relativePath)
    {
        try {
            $disk = config('filesystems.default', 'local');
            if (! Storage::disk($disk)->exists($relativePath)) {
                return null;
            }

            $localPath = Storage::disk($disk)->path($relativePath);
            $tempThumbPath = storage_path('app/temp/thumb_' . Str::random(8) . '.jpg');
            if (! is_dir(dirname($tempThumbPath))) {
                mkdir(dirname($tempThumbPath), 0775, true);
            }

            $cmd = escapeshellcmd($this->ffmpegPath) . ' -i ' . escapeshellarg($localPath)
                . ' -ss 00:00:01 -vframes 1 -q:v 2 ' . escapeshellarg($tempThumbPath);
            exec($cmd, $output, $returnCode);

            if ($returnCode === 0 && is_file($tempThumbPath)) {
                $storagePath = 'thumbnails/' . basename($tempThumbPath);
                Storage::disk('local')->put($storagePath, file_get_contents($tempThumbPath));
                @unlink($tempThumbPath);

                return $storagePath;
            }
        } catch (\Throwable $e) {
            Log::warning('Could not generate thumbnail from storage: ' . $e->getMessage());
        }

        return null;
    }

    protected function calculateDuration($start, $end)
    {
        if (! $start) {
            return 0;
        }

        return (int) Carbon::parse($end)->diffInSeconds(Carbon::parse($start));
    }
}
