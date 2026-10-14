<?php

namespace App\Services;

use App\Models\VideoRoom;
use App\Models\VideoRoomParticipant;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VideoCallService
{
    /**
     * Create a new video call room
     */
    public function createRoom($initiatorId, $participantId = null, $adId = null, $settings = [])
    {
        // Validate users exist
        $initiator = User::findOrFail($initiatorId);
        
        if ($participantId) {
            $participant = User::findOrFail($participantId);
        }
        
        if ($adId) {
            $ad = Listing::findOrFail($adId);
        }

        // Create the room
        $room = VideoRoom::create([
            'id' => Str::uuid(),
            'ad_id' => $adId,
            'initiator_id' => $initiatorId,
            'participant_id' => $participantId,
            'status' => 'waiting',
            'quality_settings' => $this->getDefaultQualitySettings($settings),
            'metadata' => $settings,
        ]);

        // Add initiator as participant
        VideoRoomParticipant::create([
            'id' => Str::uuid(),
            'room_id' => $room->id,
            'user_id' => $initiatorId,
            'role' => 'presenter',
            'connection_status' => 'disconnected',
            'media_settings' => [
                'audio_muted' => false,
                'video_muted' => false,
                'screen_sharing' => false,
            ]
        ]);

        // Add participant if provided
        if ($participantId) {
            VideoRoomParticipant::create([
                'id' => Str::uuid(),
                'room_id' => $room->id,
                'user_id' => $participantId,
                'role' => 'viewer',
                'connection_status' => 'disconnected',
                'media_settings' => [
                    'audio_muted' => true, // Start muted for privacy
                    'video_muted' => true,
                    'screen_sharing' => false,
                ]
            ]);
        }

        Log::info("Video room created: {$room->id} between users {$initiatorId}" . ($participantId ? " and {$participantId}" : ""));

        return $room;
    }

    /**
     * Join a user to a video room
     */
    public function joinRoom($roomId, $userId, $role = 'viewer')
    {
        $room = VideoRoom::where('id', $roomId)->firstOrFail();
        $user = User::findOrFail($userId);

        // Check if user is already in the room
        $existingParticipant = VideoRoomParticipant::where('room_id', $roomId)
            ->where('user_id', $userId)
            ->first();

        if ($existingParticipant) {
            // Update connection status
            $existingParticipant->update([
                'connection_status' => 'connected',
                'joined_at' => now(),
            ]);

            return $existingParticipant;
        }

        // Add new participant
        $participant = VideoRoomParticipant::create([
            'id' => Str::uuid(),
            'room_id' => $roomId,
            'user_id' => $userId,
            'role' => $role,
            'connection_status' => 'connected',
            'joined_at' => now(),
            'media_settings' => [
                'audio_muted' => ($role === 'viewer'), // Viewers start muted
                'video_muted' => ($role === 'viewer'),
                'screen_sharing' => false,
            ]
        ]);

        // Update room status if needed
        if ($room->status === 'waiting' && $this->getParticipantCount($roomId) >= 2) {
            $room->update([
                'status' => 'active',
                'started_at' => now(),
            ]);
        }

        Log::info("User {$userId} joined video room {$roomId} as {$role}");

        return $participant;
    }

    /**
     * Leave a video room
     */
    public function leaveRoom($roomId, $userId)
    {
        $participant = VideoRoomParticipant::where('room_id', $roomId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $participant->update([
            'connection_status' => 'disconnected',
            'left_at' => now(),
        ]);

        // Check if room should be ended
        $room = VideoRoom::where('id', $roomId)->firstOrFail();
        $activeParticipants = $this->getActiveParticipantCount($roomId);
        if ($activeParticipants === 0) {
            $this->endRoom($roomId);
        } elseif ($activeParticipants === 1 && $room->participant_id !== null) {
            // If only initiator remains in a 1:1 call, end it
            $room->update([
                'status' => 'ended',
                'ended_at' => now(),
            ]);
        }

        Log::info("User {$userId} left video room {$roomId}");

        return $participant;
    }

    /**
     * End a video room
     */
    public function endRoom($roomId)
    {
        $room = VideoRoom::where('id', $roomId)->firstOrFail();
        
        $room->update([
            'status' => 'ended',
            'ended_at' => now(),
        ]);

        // Mark all participants as disconnected
        VideoRoomParticipant::where('room_id', $roomId)
            ->where('connection_status', 'connected')
            ->update([
                'connection_status' => 'disconnected',
                'left_at' => now(),
            ]);

        Log::info("Video room {$roomId} ended");

        return $room;
    }

    /**
     * Get participant count for a room
     */
    public function getParticipantCount($roomId)
    {
        return VideoRoomParticipant::where('room_id', $roomId)
            ->where('connection_status', 'connected')
            ->count();
    }

    /**
     * Get active participant count (excluding disconnected)
     */
    public function getActiveParticipantCount($roomId)
    {
        return $this->getParticipantCount($roomId);
    }

    /**
     * Get room participants
     */
    public function getParticipants($roomId)
    {
        return VideoRoomParticipant::where('room_id', $roomId)
            ->where('connection_status', 'connected')
            ->with('user')
            ->get();
    }

    /**
     * Get default quality settings
     */
    private function getDefaultQualitySettings($settings = [])
    {
        $default = [
            'video' => [
                'width' => 1280,
                'height' => 720,
                'frameRate' => 30,
            ],
            'audio' => [
                'sampleRate' => 48000,
                'channelCount' => 2,
                'echoCancellation' => true,
            ],
            'bandwidth' => [
                'video' => 1500, // kbps
                'audio' => 128,  // kbps
            ]
        ];

        return array_merge($default, $settings);
    }

    /**
     * Generate MediaSoup router capabilities for a room
     */
    public function getRouterCapabilities($roomId)
    {
        $room = VideoRoom::where('id', $roomId)->firstOrFail();
        
        return [
            'mediaCodecs' => [
                [
                    'kind' => 'audio',
                    'mimeType' => 'audio/opus',
                    'clockRate' => 48000,
                    'channels' => 2,
                ],
                [
                    'kind' => 'video',
                    'mimeType' => 'video/VP8',
                    'clockRate' => 90000,
                ],
                [
                    'kind' => 'video',
                    'mimeType' => 'video/VP9',
                    'clockRate' => 90000,
                ],
                [
                    'kind' => 'video',
                    'mimeType' => 'video/h264',
                    'clockRate' => 90000,
                    'parameters' => [
                        'packetization-mode' => 1,
                        'level-asymmetry-allowed' => 1,
                        'x-google-start-bitrate' => 1000,
                    ],
                ],
            ],
        ];
    }
}