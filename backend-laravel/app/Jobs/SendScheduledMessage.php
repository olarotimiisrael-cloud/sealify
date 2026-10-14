<?php

namespace App\Jobs;

use App\Models\Message;
use App\Models\ScheduledMessage;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendScheduledMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 60, 300]; // 10s, 1m, 5m
    public $timeout = 60;

    protected $scheduledMessageId;

    public function __construct($scheduledMessageId)
    {
        $this->scheduledMessageId = $scheduledMessageId;
    }

    public function handle()
    {
        $scheduledMessage = ScheduledMessage::find($this->scheduledMessageId);

        if (!$scheduledMessage) {
            Log::warning("Scheduled message not found: {$this->scheduledMessageId}");
            return;
        }

        if ($scheduledMessage->status !== 'pending') {
            Log::info("Scheduled message already processed: {$this->scheduledMessageId}");
            return;
        }

        // Check if send time has passed
        $now = now();
        $sendTime = \Carbon\Carbon::parse($scheduledMessage->send_at);

        if ($sendTime->isFuture()) {
            // Re-queue if time hasn't come yet
            $this->release(($sendTime->timestamp - $now->timestamp));
            return;
        }

        // Validate conversation and user access
        $conversation = Conversation::find($scheduledMessage->conversation_id);
        if (!$conversation) {
            Log::error("Conversation not found for scheduled message: {$this->scheduledMessageId}");
            $scheduledMessage->update(['status' => 'failed']);
            return;
        }

        // For simplicity, we'll use the conversation initiator as sender
        // In a real system, you'd track who scheduled it
        $senderId = $conversation->participant_1; // Simplified

        try {
            // Send the message
            $message = Message::create([
                'conversation_id' => $scheduledMessage->conversation_id,
                'sender_id' => $senderId,
                'receiver_id' => ($conversation->participant_1 == $senderId) ? $conversation->participant_2 : $conversation->participant_1,
                'ad_id' => $conversation->ad_id,
                'content' => $scheduledMessage->content,
                'status' => 'sent',
                'read' => false,
            ]);

            // Update conversation last message
            $conversation->update([
                'last_message' => $message->content,
                'last_message_time' => $message->created_at,
            ]);

            // Mark scheduled message as sent
            $scheduledMessage->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            Log::info("Scheduled message sent successfully: {$this->scheduledMessageId}");

        } catch (\Exception $e) {
            Log::error("Failed to send scheduled message: {$this->scheduledMessageId}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $scheduledMessage->increment('retry_count');
            if ($scheduledMessage->retry_count >= 3) {
                $scheduledMessage->update(['status' => 'failed']);
                throw $e;
            }

            throw $e; // Will trigger retry
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::error("Scheduled message permanently failed: {$this->scheduledMessageId}", [
            'error' => $exception->getMessage(),
        ]);

        $scheduledMessage = ScheduledMessage::find($this->scheduledMessageId);
        if ($scheduledMessage) {
            $scheduledMessage->update([
                'status' => 'failed',
            ]);
        }
    }
}