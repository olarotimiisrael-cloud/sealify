<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VideoRoom;
use App\Models\VideoRoomParticipant;
use App\Models\VideoRecording;
use App\Models\User;
use App\Models\Listing;
use App\Services\VideoCallService;
use App\Services\VideoRecordingService;
use App\Services\UserSafetyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VideoController extends Controller
{
    protected $videoCallService;
    protected $videoRecordingService;

    public function __construct(
        VideoCallService $videoCallService,
        VideoRecordingService $videoRecordingService
    ) {
        $this->videoCallService = $videoCallService;
        $this->videoRecordingService = $videoRecordingService;
    }

    /**
     * Initiate a video call
     */
    public function initiateCall(Request $request)
    {
        $request->validate([
            'participant_id' => 'required|exists:users,id',
            'ad_id' => 'nullable|exists:ads,id',
            'call_type' => 'nullable|in:audio,video|default:video',
        ]);

        $user = $request->user();
        $initiatorId = $user->id;
        $participantId = $request->input('participant_id');
        $adId = $request->input('ad_id');

        // Check if users can interact (blocked users, etc.)
        $canInteract = $this->checkInteractionPermission($initiatorId, $participantId);
        if (!$canInteract['allowed']) {
            return response()->json([
                'error' => 'Cannot initiate call',
                'message' => $canInteract['reason']
            ], 403);
        }

        // Check safety status
        $safetyService = app(UserSafetyService::class);
        $safetyWarnings = $safetyService->shouldInterceptConversation($initiatorId, $participantId, $adId);

        // Create video room
        $room = $this->videoCallService->createRoom(
            $initiatorId,
            $participantId,
            $adId,
            ['call_type' => $request->input('call_type')]
        );

        return response()->json([
            'room' => $room->load(['initiator', 'participant', 'ad']),
            'participants' => $this->videoCallService->getParticipants($room->id),
            'router_capabilities' => $this->videoCallService->getRouterCapabilities($room->id),
            'safety_warnings' => $safetyWarnings,
        ], 201);
    }

    /**
     * Join a video call
     */
    public function joinCall(Request $request, $roomId)
    {
        $request->validate([
            'role' => 'nullable|in:presenter,viewer,moderator|default:viewer',
        ]);

        $user = $request->user();
        $userId = $user->id;
        $role = $request->input('role');

        // Validate room exists
        $room = VideoRoom::where('id', $roomId)->firstOrFail();

        // Check if user is allowed to join this room
        $canJoin = $this->checkRoomAccess($userId, $room);
        if (!$canJoin['allowed']) {
            return response()->json([
                'error' => 'Access denied',
                'message' => $canJoin['reason']
            ], 403);
        }

        // Join the room
        $participant = $this->videoCallService->joinRoom($roomId, $userId, $role);

        // Get updated room info
        $room->refresh();

        return response()->json([
            'room' => $room->load(['initiator', 'participant', 'ad']),
            'participant' => $participant->load('user'),
            'all_participants' => $this->videoCallService->getParticipants($room->id),
        ], 200);
    }

    /**
     * Leave a video call
     */
    public function leaveCall(Request $request, $roomId)
    {
        $user = $request->user();
        $userId = $user->id;

        $participant = $this->videoCallService->leaveRoom($roomId, $userId);

        return response()->json([
            'message' => 'Left video call',
            'participant' => $participant,
        ], 200);
    }

    /**
     * End a video call
     */
    public function endCall(Request $request, $roomId)
    {
        $user = $request->user();
        $userId = $user->id;

        $room = VideoRoom::where('id', $roomId)->firstOrFail();

        // Only initiator or admin can end call
        if ($room->initiator_id !== $userId && !$user->hasRole('admin')) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Only the call initiator can end the call'
            ], 403);
        }

        $this->videoCallService->endRoom($roomId);

        return response()->json([
            'message' => 'Video call ended',
        ], 200);
    }

    /**
     * Start recording a video call
     */
    public function startRecording(Request $request, $roomId)
    {
        $user = $request->user();
        $userId = $user->id;

        $room = VideoRoom::where('id', $roomId)->firstOrFail();

        // Check permissions
        $canRecord = $this->checkRecordingPermission($userId, $room);
        if (!$canRecord['allowed']) {
            return response()->json([
                'error' => 'Cannot start recording',
                'message' => $canRecord['reason']
            ], 403);
        }

        // Start recording
        $recording = $this->videoRecordingService->startSessionRecording(
            $roomId,
            $room->ad_id,
            $room->initiator_id
        );

        return response()->json([
            'recording' => $recording,
        ], 201);
    }

    /**
     * Stop recording a video call
     */
    public function stopRecording(Request $request, $recordingId)
    {
        $user = $request->user();
        $userId = $user->id;

        $recording = VideoRecording::where('id', $recordingId)->firstOrFail();

        // Check permissions
        $canStop = $this->checkRecordingPermission($userId, $recording->room);
        if (!$canStop['allowed']) {
            return response()->json([
                'error' => 'Cannot stop recording',
                'message' => $canStop['reason']
            ], 403);
        }

        // Stop recording
        $recording = $this->videoRecordingService->stopSessionRecording($recordingId);

        return response()->json([
            'recording' => $recording,
        ], 200);
    }

    /**
     * Get recording details and AI summary
     */
    public function getRecording(Request $request, $recordingId)
    {
        $user = $request->user();
        $userId = $user->id;

        $recording = VideoRecording::with(['room.initiator', 'room.participant', 'ad'])
            ->where('id', $recordingId)
            ->firstOrFail();

        // Check if user has access to this recording
        $hasAccess = $this->checkRecordingAccess($userId, $recording);
        if (!$hasAccess['allowed']) {
            return response()->json([
                'error' => 'Access denied',
                'message' => $hasAccess['reason']
            ], 403);
        }

        return response()->json([
            'recording' => $recording,
        ], 200);
    }

    /**
     * Get user's recent video calls
     */
    public function getUserCalls(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;
        $limit = $request->input('limit', 10);

        $calls = VideoRoom::where(function ($query) use ($userId) {
            $query->where('initiator_id', $userId)
                ->orWhere('participant_id', $userId);
        })
        ->orWhereHas('participants', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with(['initiator', 'participant', 'ad', 'recordings'])
        ->orderBy('created_at', 'desc')
        ->limit($limit)
        ->get();

        return response()->json([
            'calls' => $calls,
        ], 200);
    }

    /**
     * Check if users can interact
     */
    private function checkInteractionPermission($initiatorId, $participantId)
    {
        // Check if either user has blocked the other
        // Check if users are banned/suspended
        // For now, return allowed (implement based on your existing blocking system)
        
        return ['allowed' => true];
    }

    /**
     * Check if user can access a specific room
     */
    private function checkRoomAccess($userId, VideoRoom $room)
    {
        $isInitiator = $room->initiator_id === $userId;
        $isParticipant = $room->participant_id === $userId;
        
        // Check if user is in participants table
        $isInParticipants = $room->participants()
            ->where('user_id', $userId)
            ->exists();

        if ($isInitiator || $isParticipant || $isInParticipants) {
            return ['allowed' => true];
        }

        return [
            'allowed' => false,
            'reason' => 'You are not a participant in this video call'
        ];
    }

    /**
     * Check if user can control recording for a room
     */
    private function checkRecordingPermission($userId, VideoRoom $room)
    {
        // Typically only initiator can start/stop recording
        $isInitiator = $room->initiator_id === $userId;
        
        if ($isInitiator) {
            return ['allowed' => true];
        }

        return [
            'allowed' => false,
            'reason' => 'Only the call initiator can control recording'
        ];
    }

    /**
     * Check if user has access to a recording
     */
    private function checkRecordingAccess($userId, VideoRecording $recording)
    {
        $room = $recording->room;
        $isInitiator = $room->initiator_id === $userId;
        $isParticipant = $room->participant_id === $userId;
        $isInParticipants = $room->participants()
            ->where('user_id', $userId)
            ->exists();

        if ($isInitiator || $isParticipant || $isInParticipants) {
            return ['allowed' => true];
        }

        return [
            'allowed' => false,
            'reason' => 'You do not have access to this recording'
        ];
    }
}