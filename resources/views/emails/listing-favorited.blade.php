<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Someone favorited your ad</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:8px; padding:32px;">
        <h2 style="margin:0 0 12px; color:#111;">Someone saved your ad!</h2>

        <p style="color:#444; line-height:1.5;">
            Hi {{ $seller->name }},<br>
            <strong>{{ $favoritedBy->name }}</strong> added your ad to their favorites.
        </p>

        <div style="margin:24px 0; padding:16px; background:#f9fafb; border-radius:8px;">
            <h3 style="margin:0 0 8px; color:#111; font-size:18px;">{{ $listing->title }}</h3>
            <p style="color:#666; margin:0 0 12px;">₦{{ number_format((float) $listing->price, 0) }} &middot; {{ $listing->location }}</p>
        </div>

        <h3 style="color:#111; font-size:15px; margin:20px 0 8px;">Favorited by</h3>
        <div style="margin-bottom:20px; padding:14px; background:#f9fafb; border-radius:8px;">
            <p style="margin:0 0 4px; color:#111; font-weight:bold;">{{ $favoritedBy->name }}</p>
            @if($favoritedBy->phone_number)
                <p style="margin:0; color:#666;">Phone: {{ $favoritedBy->phone_number }}</p>
            @endif
            <p style="margin:4px 0 0; color:#666;">Email: {{ $favoritedBy->email }}</p>
            <p style="margin:4px 0 0; color:#666;">
                Profile: {{ config('app.url') }}/profile/{{ $favoritedBy->username }}
            </p>
        </div>

        <p style="color:#666; line-height:1.5;">
            You can start a conversation with {{ $favoritedBy->name }} to discuss the item.
            Contact details are also visible in your in-app notifications.
        </p>

        <a href="{{ config('app.url') }}/listings/{{ $listing->slug }}"
           style="display:inline-block; background:#111; color:#fff; text-decoration:none;
                  padding:12px 24px; border-radius:6px; font-weight:bold;">
            View your ad
        </a>
        <br><br>
        <a href="{{ config('app.url') }}/notifications"
           style="display:inline-block; color:#111; text-decoration:none; font-weight:bold;">
            View notifications in app
        </a>

        <p style="color:#888; font-size:13px; line-height:1.5; margin-top:24px;">
            You received this because someone saved your ad on {{ config('app.name') }}.
            Turn off email notifications in your settings anytime.
        </p>
    </div>
</body>
</html>