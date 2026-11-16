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

class ListingFavoritedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Listing $listing,
        public User $seller,
        public User $favoritedBy,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->favoritedBy->name.' favorited your ad "'.$this->listing->title.'" on '.config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.listing-favorited');
    }
}