<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\ScheduledMessage;
use App\Models\User;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SmartMessagingService
{
    /**
     * Generate smart reply suggestions
     */
    public function generateSmartReplies($message, $conversationContext)
    {
        // Analyze conversation history
        $recentMessages = $conversationContext['recent_messages'] ?? collect([]);
        $userId = $conversationContext['user_id'] ?? null;
        $conversationId = $conversationContext['conversation_id'] ?? null;

        // Extract topics and intent from recent messages
        $context = $this->analyzeContext($recentMessages);

        // Get user's communication style from profile
        $userStyle = $userId ? $this->getUserStyle($userId) : [];

        // Generate reply suggestions
        $suggestions = $this->generateSuggestions($message, $context, $userStyle);

        return $this->formatSuggestions($suggestions);
    }

    /**
     * Analyze conversation context
     */
    private function analyzeContext($recentMessages)
    {
        $context = [
            'topics' => [],
            'previous_actions' => [],
            'pending_topics' => [],
            'conversation_flow' => [],
        ];

        foreach ($recentMessages as $msg) {
            $content = $msg->content;
            
            // Detect common patterns
            if (stripos($content, 'price') !== false || stripos($content, 'cost') !== false) {
                $context['topics'][] = 'pricing';
            }
            if (stripos($content, 'meet') !== false || stripos($content, 'inspect') !== false) {
                $context['topics'][] = 'meetup';
            }
            if (stripos($content, 'offer') !== false) {
                $context['topics'][] = 'offer';
            }
            if (stripos($content, 'trade') !== false || stripos($content, 'swap') !== false) {
                $context['topics'][] = 'swap';
            }
            if (stripos($content, 'delivery') !== false) {
                $context['topics'][] = 'delivery';
            }
        }

        return $context;
    }

    /**
     * Get user's communication style
     */
    private function getUserStyle($userId)
    {
        // In production, this would query user preferences
        // For now, return default style
        return [
            'preferred_tone' => 'professional',
            'common_topics' => [],
            'recent_interests' => [],
        ];
    }

    /**
     * Generate reply suggestions based on context
     */
    private function generateSuggestions($inputMessage, $context, $userStyle)
    {
        $suggestions = [];

        // Based on detected topics, suggest relevant replies
        foreach ($context['topics'] as $topic) {
            switch ($topic) {
                case 'pricing':
                    $suggestions[] = [
                        'text' => 'What\'s your best price?',
                        'confidence' => 0.85,
                        'category' => 'pricing',
                        'preamble' => '�',
                    ];
                    $suggestions[] = [
                        'text' => 'Is the price negotiable?',
                        'confidence' => 0.78,
                        'category' => 'pricing',
                    ];
                    break;
                    
                case 'meetup':
                    $suggestions[] = [
                        'text' => 'Where should we meet?',
                        'confidence' => 0.92,
                        'category' => 'meetup',
                    ];
                    $suggestions[] = [
                        'text' => 'Which safe spot do you recommend?',
                        'confidence' => 0.88,
                        'category' => 'meetup',
                    ];
                    break;
                    
                case 'offer':
                    $suggestions[] = [
                        'text' => 'How much are you offering?',
                        'confidence' => 0.82,
                        'category' => 'pricing',
                    ];
                    $suggestions[] = [
                        'text' => 'I can do ₦50,000',
                        'confidence' => 0.75,
                        'category' => 'pricing',
                    ];
                    break;
                    
                case 'swap':
                    $suggestions[] = [
                        'text' => 'What would you trade?',
                        'confidence' => 0.79,
                        'category' => 'swap',
                    ];
                    break;
            }
        }

        // Add generic suggestions
        $suggestions[] = [
            'text' => 'Can you send more photos?',
            'confidence' => 0.65,
            'category' => 'general',
        ];
        $suggestions[] = [
            'text' => 'Is this still available?',
            'confidence' => 0.81,
            'category' => 'general',
        ];

        // Sort by confidence
        usort($suggestions, function($a, $b) {
            return $b['confidence'] <=> $a['confidence'];
        });

        return $suggestions;
    }

    /**
     * Format suggestions for API response
     */
    private function formatSuggestions($suggestions)
    {
        return array_values(array_map(function($s) {
            return [
                'text' => $s['text'],
                'category' => $s['category'],
                'preamble' => $s['preamble'] ?? '',
            ];
        }, $suggestions));
    }

    /**
     * Schedule a message to be sent later
     */
    public function scheduleMessage($conversationId, $message, $sendTime)
    {
        // Convert send time to Carbon
        $sendAt = Carbon::parse($sendTime);

        // Create scheduled message
        $scheduledMessage = ScheduledMessage::create([
            'id' => Str::uuid(),
            'conversation_id' => $conversationId,
            'content' => $message,
            'send_at' => $sendAt->toDateTimeString(),
            'status' => 'pending',
            'retry_count' => 0,
        ]);

        // Dispatch job to send scheduled message
        dispatch(new \App\Jobs\SendScheduledMessage($scheduledMessage->id))
            ->delay($sendAt);

        return $scheduledMessage;
    }

    /**
     * Cancel a scheduled message
     */
    public function cancelScheduledMessage($scheduledMessageId)
    {
        $scheduledMessage = ScheduledMessage::find($scheduledMessageId);

        if ($scheduledMessage) {
            $scheduledMessage->update([
                'status' => 'cancelled',
            ]);

            return $scheduledMessage;
        }

        return null;
    }

    /**
     * Get available message templates
     */
    public function getTemplates()
    {
        return [
            ['id' => 'greeting', 'template' => 'Hi! How can I help you today?'],
            ['id' => 'interest', 'template' => 'I\'m interested in your item. Could you send more photos?'],
            ['id' => 'price', 'template' => 'What is your price for this item?'],
            ['id' => 'meetup', 'template' => 'Where would you like to meet for inspection?'],
            ['id' => 'offer', 'template' => 'I can offer ₦{price} for this item.'],
            ['id' => 'close', 'template' => 'Thank you! Let me think about it.'],
        ];
    }
}