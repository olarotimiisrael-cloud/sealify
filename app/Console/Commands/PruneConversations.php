<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PruneConversations extends Command
{
    protected $signature = 'chat:prune {--days=30 : Age in days before a conversation is pruned}';

    protected $description = 'Delete conversations and their attachments older than the given days.';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $conversations = Conversation::where(function ($q) use ($cutoff) {
            $q->where('last_message_at', '<', $cutoff)
                ->orWhereNull('last_message_at');
        })->get();

        $pruned = 0;
        $attachmentsRemoved = 0;

        foreach ($conversations as $conversation) {
            // Remove attachment files from disk.
            foreach ($conversation->messages as $message) {
                foreach ($message->attachments as $attachment) {
                    if (Storage::disk('public')->exists($attachment->path)) {
                        Storage::disk('public')->delete($attachment->path);
                        $attachmentsRemoved++;
                    }
                }
            }

            $conversation->delete();
            $pruned++;
        }

        $this->info("Pruned {$pruned} conversation(s) older than {$days} day(s).");
        $this->info("Removed {$attachmentsRemoved} attachment file(s) from storage.");

        return self::SUCCESS;
    }
}
