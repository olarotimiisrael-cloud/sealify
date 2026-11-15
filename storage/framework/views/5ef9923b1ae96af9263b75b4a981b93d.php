

<?php $__env->startSection('content'); ?>
<?php
    $iconMap = [
        'smartphone' => '📱', 'car' => '🚗', 'home' => '🏠', 'shirt' => '👕',
        'sofa' => '🛋️', 'wrench' => '🔧', 'briefcase' => '💼', 'laptop' => '💻',
        'baby' => '👶', 'paw' => '🐾', 'leaf' => '🌿', 'factory' => '🏭',
    ];
    $color = $category = $listing->category;
    $catColor = $color ? ($color->color ?? 'emerald') : 'emerald';
    $catIcon = $color ? ($iconMap[$color->icon] ?? '🏷️') : '🏷️';
    
    $placeholderMap = [
        'iPhone' => 'https://images.unsplash.com/photo-1575745234279-3a74b6e0e514?w=800&q=80',
        'Toyota' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
        'MacBook' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
        'Dining' => 'https://images.unsplash.com/photo-1533770270245-0e4cbf2565d3?w=800&q=80',
        'Ankara' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
        'Samsung' => 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
        'Bajaj' => 'https://images.unsplash.com/photo-1558981806-ec537fa0bca3?w=800&q=80',
        'LG' => 'https://images.unsplash.com/photo-1601813177118-5de6f5222e1b?w=800&q=80',
    ];
    $mainImage = $listing->images->first()?->url ?? ($placeholderMap[$listing->title] ?? 'https://images.unsplash.com/photo-1560472355-6374e3fd260d?w=800&q=80');
?>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-8">
                <div class="aspect-video bg-gradient-to-br from-<?php echo e($catColor); ?>-50 to-slate-50 rounded-2xl overflow-hidden mb-6 border border-<?php echo e($catColor); ?>-100 relative">
                    <img src="<?php echo e($mainImage); ?>" alt="<?php echo e($listing->title); ?>"
                         class="w-full h-full object-cover">
                    <span class="absolute top-3 left-3 bg-white text-<?php echo e($catColor); ?>-600 text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                        <?php echo e(ucfirst($listing->condition ?? 'New')); ?>

                    </span>
                    <?php if($listing->user->is_verified_seller): ?>
                        <span class="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                            Verified
                        </span>
                    <?php endif; ?>
                </div>
                <?php if($listing->images->count() > 1): ?>
                    <div class="flex gap-2 overflow-x-auto pb-4">
                        <?php $__currentLoopData = $listing->images; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $img): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <img src="<?php echo e($img->url); ?>" class="w-16 h-16 rounded-lg object-cover border border-slate-200 hover:border-<?php echo e($catColor); ?>-500 cursor-pointer flex-shrink-0 transition-colors">
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </div>
                <?php endif; ?>
            </div>

            <div class="lg:col-span-4 space-y-6">
                <div class="flex items-center gap-3">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-<?php echo e($catColor); ?>-600 bg-<?php echo e($catColor); ?>-50">
                        <?php echo e($catIcon); ?> <?php echo e(ucfirst($listing->condition ?? 'New')); ?>

                    </span>
                    <?php if($listing->user->is_verified_seller): ?>
                        <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold text-green-600 bg-green-50">
                            ✓ Verified Seller
                        </span>
                    <?php endif; ?>
                </div>

                <h1 class="text-3xl font-black text-slate-900 tracking-tight"><?php echo e($listing->title); ?></h1>
                
                <!-- Non-aggressive AdSense Ad - Listing Detail Top -->
                <?php if($settings && $settings->adsense_enabled && $settings->adsense_placement_detail_top && $settings->adsense_client_id): ?>
                    <div class="mb-4 flex justify-center">
                        <ins class="adsbygoogle" style="display:block" data-ad-client="<?php echo e($settings->adsense_client_id); ?>" data-ad-slot="<?php echo e($settings->adsense_slot_detail); ?>" data-ad-format="auto" data-full-width-responsive="true"></ins>
                        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                    </div>
                <?php endif; ?>
                
                <div class="text-2xl font-bold text-<?php echo e($catColor); ?>-600">₦<?php echo e(number_format($listing->price, 0)); ?></div>
                <p class="text-slate-600 mb-6 leading-relaxed"><?php echo e($listing->description); ?></p>

                <div class="space-y-3 text-sm text-slate-600">
                    <div class="flex justify-between items-center bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500">Location</span>
                        <span class="font-bold text-slate-900"><?php echo e($listing->location); ?></span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500">Condition</span>
                        <span class="font-bold text-slate-900 capitalize"><?php echo e($listing->condition ?? 'N/A'); ?></span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500">Category</span>
                        <span class="font-bold text-slate-900"><?php echo e($listing->category->name ?? 'N/A'); ?></span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500">Seller</span>
                        <span class="font-bold text-slate-900"><?php echo e($listing->user->name ?? 'Sealify User'); ?></span>
                    </div>
                    <div class="flex justify-between items-center bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <span class="font-medium text-slate-500">Views</span>
                        <span class="font-bold text-slate-900"><?php echo e($listing->views_count); ?></span>
                    </div>
                </div>

                <div class="space-y-3">
                    <a href="<?php echo e(route('messages.index')); ?>" class="w-full bg-<?php echo e($catColor); ?>-500 hover:bg-<?php echo e($catColor); ?>-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-<?php echo e($catColor); ?>-200 hover:shadow-<?php echo e($catColor); ?>-300 text-center text-sm font-black">
                        Message Seller
                    </a>
                    <a href="<?php echo e(route('listings.favorite', $listing)); ?>" class="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3.5 rounded-xl transition-colors text-center">
                        Save to Favorites
                    </a>
                    <a href="<?php echo e(route('reports.listing', $listing)); ?>" class="w-full border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold py-3.5 rounded-xl transition-colors text-center text-sm">
                        ⚠ Report Listing
                    </a>
                </div>
            </div>
        </div>

        <div class="mt-12">
            <h3 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zm-7 0a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                About the Seller
            </h3>
            <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                        <?php echo e(strtoupper(substr($listing->user->name ?? 'U', 0, 1))); ?>

                    </div>
                    <div>
                        <p class="font-bold text-slate-900"><?php echo e($listing->user->name ?? 'Sealify User'); ?></p>
                        <?php if($listing->user->is_verified_seller): ?>
                            <span class="text-xs text-green-600 font-bold flex items-center gap-1">✓ Verified</span>
                        <?php endif; ?>
                    </div>
                </div>
                <p class="text-slate-600 text-sm"><?php echo e($listing->user->location ?? 'Ogbomosoland, Oyo State'); ?></p>
            </div>
        </div>
    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\THE~SEAL CW LTD\dyad-apps\sealify\resources\views/pages/listings/show.blade.php ENDPATH**/ ?>