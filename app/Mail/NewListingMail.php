<?php

namespace App\Mail;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewListingMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Listing $listing,
        public User $follower,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New listing from '.$this->listing->user->name.' on '.config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new-listing');
    }
}
