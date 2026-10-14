<?php

use App\Models\Conversation;
use App\Models\VideoRoom;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);

    return $conversation && in_array((int) $user->id, [
        (int) $conversation->participant_1,
        (int) $conversation->participant_2,
    ], true);
});

Broadcast::channel('call.{roomId}', function ($user, $roomId) {
    $room = VideoRoom::find($roomId);

    if (! $room) {
        return false;
    }

    return (int) $user->id === (int) $room->initiator_id
        || (int) $user->id === (int) $room->participant_id
        || $room->participants()->where('user_id', $user->id)->exists();
});
