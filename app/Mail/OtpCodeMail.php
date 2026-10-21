<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $purpose,   // 'email_verification' | 'password_reset'
        public string $name,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->purpose === 'password_reset'
            ? 'Reset your Sealify password'
            : 'Verify your Sealify email';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.otp-code');
    }
}
