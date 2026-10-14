<?php

namespace App\Services;

use App\Models\VideoRoom;
use App\Models\VideoRecording;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class VideoRecordingService
{
    protected $ffmpegPath;
    protected $recordingStoragePath;

    public function __construct()
    {
        $this->ffmpegPath = config('services.ffmpeg.path', '/usr/bin/ffmpeg');
        $this->recordingStoragePath = config('filesystems.default') === 's3' 
            ? 's3://video-recordings' 
            : storage_path('app/video-recordings');
    }

    /**
     * Start recording a video session
     */
    public function startSessionRecording($roomId, $adId = null, $initiatorId = null)
    {
        $room = VideoRoom::where('id', $roomId)->firstOrFail();
        
        // Check if room is active
        if ($room->status !== 'active' && $room->status !== 'waiting') {
            throw new \Exception('Cannot record an inactive room.');
        }

        $recordingPath = $this->generateRecordingPath($roomId);
        
        $recording = VideoRecording::create([
            'id' => Str::uuid(),
            'room_id' => $roomId,
            'ad_id' => $adId,
            'initiator_id' => $initiatorId,
            'status' => 'recording',
            'quality' => '1080p30fps',
            'recording_path' => $recordingPath,
            'started_at' => now(),
        ]);

        // Update room to mark recording started
        $room->update(['status' => 'recording']);

        Log::info("Video recording started for room: {$roomId}");

        return $recording;
    }

    /**
     * Stop recording and process the video
     */
    public function stopSessionRecording($recordingId)
    {
        $recording = VideoRecording::where('id', $recordingId)->firstOrFail();
        
        // Update recording status
        $recording->update([
            'status' => 'processing',
            'ended_at' => now(),
            'duration_seconds' => $this->calculateDuration(
                $recording->started_at, 
                now()
            ),
        ]);

        // Generate thumbnail
        $thumbnailPath = $this->generateThumbnail($recording->recording_path);
        $recording->update(['thumbnail_path' => $thumbnailPath]);

        // Trigger AI processing asynchronously
        dispatch(new \App\Jobs\ProcessVideoRecording($recording->id));

        Log::info("Video recording stopped and processing started: {$recordingId}");

        return $recording;
    }

    /**
     * Process video with AI and generate summary
     */
    public function processVideoWithAI($recordingId)
    {
        $recording = VideoRecording::with('room')->findOrFail($recordingId);
        
        if ($recording->processing_status !== 'pending' && $recording->processing_status !== 'processing') {
            return $recording;
        }

        try {
            // Get transcription (would integrate with Whisper API or similar)
            $transcript = $this->getTranscript($recording->recording_path);
            
            // Generate AI summary
            $summaryData = $this->generateAISummary($transcript);
            
            $recording->update([
                'ai_summary' => $summaryData['summary'],
                'key_points' => $summaryData['key_points'],
                'action_items' => $summaryData['action_items'],
                'sentiment' => $summaryData['sentiment'],
                'processing_status' => 'completed',
                'status' => 'completed',
            ]);

            Log::info("Video recording processed successfully: {$recordingId}");
            
        } catch (\Exception $e) {
            Log::error("Failed to process video recording: {$recordingId}", [
                'error' => $e->getMessage()
            ]);
            
            $recording->update([
                'processing_status' => 'failed',
                'status' => 'failed',
            ]);
            
            throw $e;
        }

        return $recording;
    }

    /**
     * Get transcript from video file
     */
    private function getTranscript($videoPath)
    {
        // In production, integrate with OpenAI Whisper or Google Speech-to-Text
        // This is a placeholder implementation
        
        try {
            // Check if file exists
            if (Str::startsWith($videoPath, 's3://')) {
                // For S3, use AWS SDK to download temporary file
                $tempFile = Storage::disk('local')->path('temp/temp_video.mp4');
                Storage::disk('s3')->getDriver()->getAggregator()->retrieveObject(
                    str_replace('s3://', '', $videoPath),
                    $tempFile
                );
            } else {
                $tempFile = $videoPath;
            }
            
            // Call Whisper API
            $transcript = $this->callWhisperAPI($tempFile);
            
            return $transcript;
            
        } catch (\Exception $e) {
            Log::warning("Could not get transcript, using placeholder");
            
            // Return placeholder for testing
            return "Session summary placeholder - actual transcription would be generated here.";
        }
    }

    /**
     * Generate AI summary from transcript
     */
    private function generateAISummary($transcript)
    {
        $openaiClient = \OpenAI::client(config('services.openai.api_key'));
        
        $response = $openaiClient->chat()->create([
            'model' => 'gpt-4',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a professional meeting assistant. Analyze the conversation and extract:
                    1. Main topics discussed
                    2. Key decisions made  
                    3. Action items and responsibilities
                    4. Overall sentiment (positive, neutral, negative)
                    5. Any important dates or deadlines mentioned'
                ],
                [
                    'role' => 'user',
                    'content' => "Conversation transcript:\n\n{$transcript}"
                ]
            ],
            'temperature' => 0.3,
            'max_tokens' => 500,
        ]);

        $summaryText = $response->choices[0]->message->content;
        
        // Parse the response
        return [
            'summary' => $this->extractBetween($summaryText, '1.', '2.'),
            'key_points' => json_encode([
                'main_topics' => $this->extractBetween($summaryText, '2.', '3.'),
                'decisions' => $this->extractBetween($summaryText, '3.', '4.'),
            ]),
            'action_items' => json_encode([
                'items' => $this->extractActionItems($summaryText),
            ]),
            'sentiment' => $this->extractSentiment($summaryText),
        ];
    }

    /**
     * Extract text between numbered sections
     */
    private function extractBetween($text, $start, $end)
    {
        $pattern = "/" . preg_quote($start, '/') . "\s*(.*?)\s*" . preg_quote($end, '/') . "/s";
        if (preg_match($pattern, $text, $matches)) {
            return trim($matches[1]);
        }
        return '';
    }

    /**
     * Extract action items from summary
     */
    private function extractActionItems($text)
    {
        $items = [];
        $lines = explode("\n", $text);
        
        foreach ($lines as $line) {
            if (preg_match('/action\s*(item|steps?)/i', $line)) {
                $items[] = trim($line);
            }
        }
        
        return $items;
    }

    /**
     * Determine sentiment from text
     */
    private function extractSentiment($text)
    {
        $positiveWords = ['positive', 'agree', 'confirm', 'accept', 'deal', 'great', 'excellent'];
        $negativeWords = ['negative', 'disagree', 'disapprove', 'concern', 'problem', 'issue', 'difficult'];
        
        $textLower = strtolower($text);
        $positiveCount = 0;
        $negativeCount = 0;
        
        foreach ($positiveWords as $word) {
            $positiveCount += substr_count($textLower, $word);
        }
        
        foreach ($negativeWords as $word) {
            $negativeCount += substr_count($textLower, $word);
        }
        
        if ($positiveCount > $negativeCount) {
            return 'positive';
        } elseif ($negativeCount > $positiveCount) {
            return 'negative';
        }
        return 'neutral';
    }

    /**
     * Generate recording storage path
     */
    private function generateRecordingPath($roomId)
    {
        $timestamp = Carbon::now()->format('Ymd_His');
        return "recordings/{$roomId}/{$timestamp}.mp4";
    }

    /**
     * Generate thumbnail from video
     */
    private function generateThumbnail($videoPath)
    {
        try {
            $tempThumbPath = storage_path('app/temp/thumb.jpg');
            $commands = [
                '-i', $videoPath,
                '-ss', '00:00:01',
                '-vframes', '1',
                '-q:v', '2',
                $tempThumbPath
            ];
            
            $cmd = $this->ffmpegPath . ' ' . implode(' ', $commands);
            exec($cmd, $output, $returnCode);
            
            if ($returnCode === 0) {
                $storagePath = "thumbnails/{$videoPath}.jpg";
                Storage::disk('local')->put($storagePath, file_get_contents($tempThumbPath));
                unlink($tempThumbPath);
                
                return $storagePath;
            }
        } catch (\Exception $e) {
            Log::warning("Could not generate thumbnail");
        }
        
        return null;
    }

    /**
     * Calculate duration in seconds
     */
    private function calculateDuration($start, $end)
    {
        return $end->diffInSeconds($start);
    }

    /**
     * Call Whisper API for transcription (simplified)
     */
    private function callWhisperAPI($file)
    {
        // In production, use OpenAI Whisper API
        // This is a placeholder
        return "Transcription placeholder";
    }
}