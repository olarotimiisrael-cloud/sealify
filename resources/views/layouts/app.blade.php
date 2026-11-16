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
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="{{ asset('manifest.json') }}">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Sealify">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    
    <script src="https://cdn.tailwindcss.com"></script>
    @stack('styles')
</head>
<body class="bg-white text-slate-900 font-sans antialiased">
    @include('partials.navbar')

    <main class="min-h-screen pb-20 lg:pb-0">
        @yield('content')
    </main>

    @include('partials.footer')
    @include('partials.bottom-nav')

    <!-- PWA Install Script -->
    <script>
        // Service Worker Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // PWA Install Prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            document.getElementById('install-app-btn').classList.remove('hidden');
        });

        function installApp() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install');
                    }
                    deferredPrompt = null;
                    document.getElementById('install-app-btn').classList.add('hidden');
                });
            } else {
                // Fallback: show download info or open app store link
                alert('To install Sealify:\n• Chrome/Android: Tap "Add to Home Site" in browser menu\n• iPhone/iPad: Tap "Share" → "Add to Home Screen"\n• Desktop: The app is available as a PWA — use your browser\'s install option.');
            }
        }
    </script>

    <!-- Google Analytics -->
    @php
        $settings = \App\Models\SiteSetting::first();
        $gaId = $settings ? $settings->google_analytics_id : null;
        $gtmId = $settings ? $settings->google_tag_manager_id : null;
        $fbPixelId = $settings ? $settings->facebook_pixel_id : null;
        $adsenseEnabled = $settings ? $settings->adsense_enabled : false;
        $adsenseClientId = $settings ? $settings->adsense_client_id : null;
        $adsenseAutoAds = $settings ? $settings->adsense_auto_ads : false;
    @endphp

    @if($gaId)
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '{{ $gaId }}');
        </script>
    @endif

    @if($gtmId)
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','{{ $gtmId }}');</script>
    @endif

    @if($fbPixelId)
        <!-- Facebook Pixel Code -->
        <script>
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '{{ $fbPixelId }}');
            fbq('track', 'PageView');
        </script>
    @endif

    @if($adsenseEnabled && $adsenseClientId)
        <!-- Google AdSense -->
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ $adsenseClientId }}"
                crossorigin="anonymous"></script>
        @if($adsenseAutoAds)
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({
                    google_ad_client: "{{ $adsenseClientId }}",
                    enable_page_level_ads: true
                });
            </script>
        @endif
    @endif
    @stack('scripts')
</body>
</html>
