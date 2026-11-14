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
    <script src="https://cdn.tailwindcss.com"></script>
    <?php echo $__env->yieldPushContent('styles'); ?>
</head>
<body class="bg-white text-slate-900 font-sans antialiased">
    <?php echo $__env->make('partials.navbar', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <main class="min-h-screen">
        <?php echo $__env->yieldContent('content'); ?>
    </main>

    <?php echo $__env->make('partials.footer', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <?php echo $__env->yieldPushContent('scripts'); ?>
</body>
</html>
<?php /**PATH C:\Users\THE~SEAL CW LTD\dyad-apps\sealify\resources\views/layouts/app.blade.php ENDPATH**/ ?>