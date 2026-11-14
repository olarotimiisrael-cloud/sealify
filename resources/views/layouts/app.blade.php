<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Sealify Nigeria' }} — Nigeria's Trusted Local Marketplace</title>
    <meta name="description" content="Buy, sell, and connect locally in Ogbomosoland, Oyo State, and across Nigeria. Verified sellers, safe meetup zones, and instant trading.">
    <link rel="icon" type="image/png" href="{{ asset('logo.png') }}">
    <meta name="theme-color" content="#10b981">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Sealify Nigeria">
    <meta property="og:title" content="{{ $title ?? 'Sealify Nigeria' }}">
    <meta property="og:description" content="Everything you need in one place. Cars, real estate, electronics, fashion and more. Buy • Sell • Connect.">
    <meta property="og:image" content="{{ asset('og-image.png') }}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $title ?? 'Sealify Nigeria' }}">
    <meta name="twitter:image" content="{{ asset('og-image.png') }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://cdn.tailwindcss.com"></script>
    @stack('styles')
</head>
<body class="bg-white text-slate-900 font-sans antialiased">
    @include('partials.navbar')

    <main class="min-h-screen">
        @yield('content')
    </main>

    @include('partials.footer')

    @stack('scripts')
</body>
</html>
