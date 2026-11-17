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
    
    <link rel="preload" as="style" href="{{ asset('css/app.css') }}">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    <script>
        tailwind = { config: { darkMode: 'class' } };
    </script>
    <script>
        (function () {
            try {
                var saved = localStorage.getItem('sealify-theme');
                var prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'dark' || (!saved && prefers)) {
                    document.documentElement.classList.add('dark');
                }
            } catch (e) {}
        })();
    </script>
    @stack('styles')
    <style>
        /* Favorite (love) button */
        .fav-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:#fff;color:#f43f5e;box-shadow:0 2px 10px rgba(0,0,0,.18);transition:transform .18s ease,color .18s ease,background .18s ease;}
        .fav-btn:hover{transform:scale(1.12);color:#e11d48;background:#fff;}
        .fav-btn:active{transform:scale(.9);}
        .fav-btn.is-fav{color:#f43f5e;background:#fff;}
        .fav-btn.is-fav svg{fill:#f43f5e;}
        .fav-btn.is-fav svg path{animation:favpop .4s ease;}
        @keyframes favpop{0%{transform:scale(1)}40%{transform:scale(1.4)}70%{transform:scale(.9)}100%{transform:scale(1)}}
        .dark .fav-btn{background:#0f172a;color:#fb7185;}
    </style>
</head>
<body class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
    @include('partials.navbar')

    <main class="min-h-screen pb-20">
        @yield('content')
    </main>

    @include('partials.footer')
    @include('partials.feedback-button')

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
    <script>
        function toggleTheme() {
            var html = document.documentElement;
            var isDark = html.classList.toggle('dark');
            try { localStorage.setItem('sealify-theme', isDark ? 'dark' : 'light'); } catch (e) {}
            syncThemeUI(isDark);
        }

        function syncThemeUI(isDark) {
            document.querySelectorAll('[data-theme-icon]').forEach(function (el) {
                el.textContent = isDark ? '☀️' : '🌙';
            });
            document.querySelectorAll('[data-theme-label]').forEach(function (el) {
                el.textContent = isDark ? 'Light' : 'Dark';
            });
            var meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', isDark ? '#0f172a' : '#10b981');
        }

        document.addEventListener('DOMContentLoaded', function () {
            syncThemeUI(document.documentElement.classList.contains('dark'));
        });
        syncThemeUI(document.documentElement.classList.contains('dark'));
    </script>
</body>
</html>
