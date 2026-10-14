<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallSignal implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $fromUserId;
    public $type;
    public $payload;

    public function __construct($roomId, $fromUserId, string $type, array $payload = [])
    {
        $this->roomId = $roomId;
        $this->fromUserId = $fromUserId;
        $this->type = $type;
        $this->payload = $payload;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('call.' . $this->roomId);
    }

    public function broadcastAs()
    {
        return 'CallSignal';
    }

    public function broadcastWith()
    {
        return [
            'room_id' => $this->roomId,
            'from_user_id' => $this->fromUserId,
            'type' => $this->type,
            'payload' => $this->payload,
        ];
    }
}
