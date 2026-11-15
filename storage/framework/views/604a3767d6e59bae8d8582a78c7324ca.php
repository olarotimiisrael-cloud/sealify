
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($title ?? 'Sealify'); ?> — Sealify Nigeria</title>
    <meta name="theme-color" content="#10b981">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { @apply bg-slate-50 text-slate-900 font-sans antialiased; }
    </style>
    <?php echo $__env->yieldPushContent('styles'); ?>
</head>
<body>
    <nav class="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div class="relative">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
            <div class="max-w-7xl mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                    <a href="<?php echo e(route('home')); ?>" class="flex items-center gap-2">
                        <img src="<?php echo e(asset('logo.png')); ?>" alt="Sealify" class="h-8 w-auto">
                        <span class="text-emerald-600 font-black text-xl tracking-tight">Sealify</span>
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <div class="pt-20 pb-12 min-h-[calc(100vh-152px)]">
        <?php echo e($slot); ?>

    </div>

    <?php echo $__env->make('partials.footer', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <?php echo $__env->yieldPushContent('scripts'); ?>
</body>
</html>
<?php /**PATH C:\Users\THE~SEAL CW LTD\dyad-apps\sealify\resources\views/components/guest-layout.blade.php ENDPATH**/ ?>