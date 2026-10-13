<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailOutbox;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class EmailController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'to' => 'required|email',
            'subject' => 'required|string|max:255',
            'html' => 'sometimes|string',
            'text' => 'sometimes|string',
            'from' => 'sometimes|email',
            'fromName' => 'sometimes|string',
            'attachments' => 'sometimes|array',
        ]);

        $from = $data['from'] ?? config('mail.from.address', 'admin@sealify.ng');
        $fromName = $data['fromName'] ?? config('mail.from.name', 'Sealify');

        try {
            Mail::send([], [], function ($message) use ($data, $from, $fromName) {
                $message->to($data['to'])
                    ->from($from, $fromName)
                    ->subject($data['subject']);

                if (!empty($data['html'])) {
                    $message->html($data['html']);
                }

                if (!empty($data['text'])) {
                    $message->text($data['text']);
                }

                if (!empty($data['attachments'])) {
                    foreach ($data['attachments'] as $attachment) {
                        $message->attach($attachment['path'], [
                            'as' => $attachment['name'] ?? basename($attachment['path']),
                            'mime' => $attachment['mime'] ?? 'application/octet-stream',
                        ]);
                    }
                }
            });

            // Log to email_outbox
            EmailOutbox::create([
                'to' => $data['to'],
                'from' => $from,
                'subject' => $data['subject'],
                'body' => $data['html'] ?? $data['text'] ?? '',
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            return response()->json(['success' => true, 'message' => 'Email sent successfully']);
        } catch (\Exception $e) {
            Log::error('Email send failed: ' . $e->getMessage());
            
            EmailOutbox::create([
                'to' => $data['to'],
                'from' => $from,
                'subject' => $data['subject'],
                'body' => $data['html'] ?? $data['text'] ?? '',
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Failed to send email', 'error' => $e->getMessage()], 500);
        }
    }

    public function bulk(Request $request)
    {
        $data = $request->validate([
            'recipients' => 'required|array|min:1|max:1000',
            'recipients.*.email' => 'required|email',
            'recipients.*.name' => 'sometimes|string',
            'subject' => 'required|string|max:255',
            'html' => 'required|string',
            'text' => 'sometimes|string',
        ]);

        $results = [];
        $failed = 0;

        foreach ($data['recipients'] as $recipient) {
            try {
                Mail::send([], [], function ($message) use ($data, $recipient) {
                    $message->to($recipient['email'], $recipient['name'] ?? '')
                        ->from(config('mail.from.address', 'admin@sealify.ng'), config('mail.from.name', 'Sealify'))
                        ->subject($data['subject'])
                        ->html($data['html']);

                    if (!empty($data['text'])) {
                        $message->text($data['text']);
                    }
                });

                $results[] = ['email' => $recipient['email'], 'status' => 'sent'];
            } catch (\Exception $e) {
                $results[] = ['email' => $recipient['email'], 'status' => 'failed', 'error' => $e->getMessage()];
                $failed++;
            }
        }

        return response()->json([
            'total' => count($data['recipients']),
            'sent' => count($data['recipients']) - $failed,
            'failed' => $failed,
            'results' => $results,
        ]);
    }

    public function queue(Request $request)
    {
        $data = $request->validate([
            'to' => 'required|email',
            'subject' => 'required|string|max:255',
            'html' => 'required|string',
            'text' => 'sometimes|string',
        ]);

        EmailOutbox::create([
            'to' => $data['to'],
            'from' => config('mail.from.address', 'admin@sealify.ng'),
            'subject' => $data['subject'],
            'body' => $data['html'],
            'text_body' => $data['text'] ?? null,
            'status' => 'queued',
        ]);

        return response()->json(['success' => true, 'message' => 'Email queued for sending']);
    }
}