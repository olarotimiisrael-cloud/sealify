<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New listing from {{ $listing->user->name }}</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:8px; padding:32px;">
        <h2 style="margin:0 0 12px; color:#111;">New listing from {{ $listing->user->name }}</h2>

        <p style="color:#444; line-height:1.5;">
            Hi {{ $follower->name }},<br>
            {{ $listing->user->name }} just posted a new listing you might like.
        </p>

        <div style="margin:24px 0;">
            <h3 style="margin:0 0 8px; color:#111; font-size:18px;">{{ $listing->title }}</h3>
            <p style="color:#666; margin:0 0 12px;">{{ $listing->description }}</p>
            <p style="color:#111; font-weight:bold;">{{ $listing->price }} &middot; {{ $listing->location }}</p>
        </div>

        <a href="{{ config('app.url') }}/listings/{{ $listing->slug }}"
           style="display:inline-block; background:#111; color:#fff; text-decoration:none;
                  padding:12px 24px; border-radius:6px; font-weight:bold;">
            View listing
        </a>

        <p style="color:#888; font-size:13px; line-height:1.5; margin-top:24px;">
            You received this because you follow {{ $listing->user->name }} on {{ config('app.name') }}.
            Turn off new-post emails in your notification settings anytime.
        </p>
    </div>
</body>
</html>
