<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->hasParticipant($user->id);
    }

    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $user->isActive() && $conversation->hasParticipant($user->id);
    }

    public function update(User $user, Conversation $conversation): bool
    {
        return false;
    }

    public function delete(User $user, Conversation $conversation): bool
    {
        return false;
    }
}
