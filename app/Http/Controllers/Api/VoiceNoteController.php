<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVoiceNoteRequest;
use App\Http\Resources\MessageAttachmentResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\VoiceNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class VoiceNoteController extends Controller
{
    public function store(StoreVoiceNoteRequest $request, Conversation $conversation): JsonResponse
    {
        Gate::authorize('sendMessage', $conversation);

        $user = $request->user();
        $file = $request->file('voice');
        $duration = (int) $request->input('duration_seconds', 0);

        $mime = $file->getMimeType() ?: 'audio/ogg';
        $size = (int) $file->getSize();
        $ext = strtolower($file->extension() ?: 'ogg');
        $name = "voice-{$conversation->id}-".time().'-'.uniqid().".{$ext}";
        $path = $file->storeAs("voice-notes/{$conversation->id}", $name, 'public');

        $result = DB::transaction(function () use ($conversation, $user, $file, $path, $mime, $size, $duration) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'body' => null,
                'type' => 'voice',
            ]);

            $attachment = MessageAttachment::create([
                'message_id' => $message->id,
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $mime,
                'size_bytes' => $size,
                'duration_seconds' => $duration > 0 ? $duration : null,
            ]);

            VoiceNote::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'message_id' => $message->id,
                'file_path' => $path,
                'duration_seconds' => $duration > 0 ? $duration : 0,
            ]);

            $conversation->forceFill(['last_message_at' => now()])->save();

            ConversationParticipant::where('conversation_id', $conversation->id)
                ->where('user_id', $user->id)
                ->update(['last_read_at' => now()]);

            return [$message, $attachment];
        });

        [$message, $attachment] = $result;

        $message->load(['sender', 'attachments']);

        return response()->json([
            'data' => new MessageResource($message),
            'attachment' => new MessageAttachmentResource($attachment),
            'message' => 'Voice note sent.',
        ], 201);
    }
}
