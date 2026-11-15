<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($title ?? 'Sealify Nigeria'); ?> — Nigeria's Trusted Local Marketplace</title>
    <meta name="description" content="Buy, sell, and connect locally in Ogbomosoland, Oyo State, and across Nigeria. Verified sellers, safe meetup zones, and instant trading.">
    <link rel="icon" type="image/png" href="<?php echo e(asset('logo.png')); ?>">
    <meta name="theme-color" content="#10b981">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Sealify Nigeria">
    <meta property="og:title" content="<?php echo e($title ?? 'Sealify Nigeria'); ?>">
    <meta property="og:description" content="Everything you need in one place. Cars, real estate, electronics, fashion and more. Buy • Sell • Connect.">
    <meta property="og:image" content="<?php echo e(asset('og-image.png')); ?>">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo e($title ?? 'Sealify Nigeria'); ?>">
    <meta name="twitter:image" content="<?php echo e(asset('og-image.png')); ?>">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="<?php echo e(asset('manifest.json')); ?>">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Sealify">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <?php echo $__env->yieldPushContent('styles'); ?>
</head>
<body class="bg-white text-slate-900 font-sans antialiased">
    <?php echo $__env->make('partials.navbar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <main class="min-h-screen">
        <?php echo $__env->yieldContent('content'); ?>
    </main>

    <?php echo $__env->make('partials.footer', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

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
    <?php
        $settings = \App\Models\SiteSetting::first();
        $gaId = $settings ? $settings->google_analytics_id : null;
        $gtmId = $settings ? $settings->google_tag_manager_id : null;
        $fbPixelId = $settings ? $settings->facebook_pixel_id : null;
        $adsenseEnabled = $settings ? $settings->adsense_enabled : false;
        $adsenseClientId = $settings ? $settings->adsense_client_id : null;
        $adsenseAutoAds = $settings ? $settings->adsense_auto_ads : false;
    ?>

    <?php if($gaId): ?>
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo e($gaId); ?>"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '<?php echo e($gaId); ?>');
        </script>
    <?php endif; ?>

    <?php if($gtmId): ?>
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','<?php echo e($gtmId); ?>');</script>
    <?php endif; ?>

    <?php if($fbPixelId): ?>
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
            fbq('init', '<?php echo e($fbPixelId); ?>');
            fbq('track', 'PageView');
        </script>
    <?php endif; ?>

    <?php if($adsenseEnabled && $adsenseClientId): ?>
        <!-- Google AdSense -->
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=<?php echo e($adsenseClientId); ?>"
                crossorigin="anonymous"></script>
        <?php if($adsenseAutoAds): ?>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({
                    google_ad_client: "<?php echo e($adsenseClientId); ?>",
                    enable_page_level_ads: true
                });
            </script>
        <?php endif; ?>
    <?php endif; ?>
    <?php echo $__env->yieldPushContent('scripts'); ?>
</body>
</html>
<?php /**PATH C:\Users\THE~SEAL CW LTD\dyad-apps\sealify\resources\views/layouts/app.blade.php ENDPATH**/ ?>