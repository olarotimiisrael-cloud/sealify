<?php $__env->startSection('adminContent'); ?>
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">SEO, Ads & Analytics</h1>
            <p class="text-slate-600">Configure search engine optimization, Google AdSense, and analytics tracking.</p>
        </div>
        <a href="<?php echo e(route('admin.dashboard')); ?>" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <form method="POST" action="<?php echo e(route('admin.seo.update')); ?>" class="space-y-8">
            <?php echo csrf_field(); ?>

            <!-- SEO Settings -->
            <div>
                <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Search Engine Optimization (SEO)
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Meta Title</label>
                        <input name="meta_title" type="text" value="<?php echo e(old('meta_title', $settings->meta_title)); ?>"
                               placeholder="e.g. Sealify - Nigeria's Trusted Marketplace"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <p class="text-xs text-slate-500 mt-1">Browser tab title</p>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Meta Description</label>
                        <textarea name="meta_description" rows="3"
                                  placeholder="e.g. Buy and sell locally in Ogbomosoland with verified sellers"
                                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"><?php echo e(old('meta_description', $settings->meta_description)); ?></textarea>
                        <p class="text-xs text-slate-500 mt-1">Search result description</p>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Meta Keywords</label>
                        <input name="meta_keywords" type="text" value="<?php echo e(old('meta_keywords', $settings->meta_keywords)); ?>"
                               placeholder="e.g. marketplace, buy sell, ogbomoso, nigeria"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <p class="text-xs text-slate-500 mt-1">Comma-separated keywords</p>
                    </div>
                </div>
            </div>

            <!-- Analytics Settings -->
            <div>
                <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    Analytics & Tracking
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Google Analytics ID</label>
                        <input name="google_analytics_id" type="text" value="<?php echo e(old('google_analytics_id', $settings->google_analytics_id)); ?>"
                               placeholder="e.g. G-XXXXXXXXXX"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <p class="text-xs text-slate-500 mt-1">GA4 measurement ID</p>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Google Tag Manager ID</label>
                        <input name="google_tag_manager_id" type="text" value="<?php echo e(old('google_tag_manager_id', $settings->google_tag_manager_id)); ?>"
                               placeholder="e.g. GTM-XXXXXXX"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <p class="text-xs text-slate-500 mt-1">GTM container ID</p>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Facebook Pixel ID</label>
                        <input name="facebook_pixel_id" type="text" value="<?php echo e(old('facebook_pixel_id', $settings->facebook_pixel_id)); ?>"
                               placeholder="e.g. 1234567890"
                               class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <p class="text-xs text-slate-500 mt-1">Facebook Pixel ID</p>
                    </div>
                </div>
            </div>

            <!-- AdSense Settings -->
            <div>
                <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Google AdSense
                </h3>
                <div class="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <div class="flex items-center gap-3 mb-4">
                        <input type="checkbox" name="adsense_enabled" id="adsense_enabled" 
                               <?php echo e(old('adsense_enabled', $settings->adsense_enabled) ? 'checked' : ''); ?>

                               class="rounded text-emerald-600 focus:ring-emerald-500">
                        <label for="adsense_enabled" class="font-bold text-slate-900">Enable Google AdSense</label>
                    </div>
                    <p class="text-sm text-slate-600 mb-6">Paste your Google AdSense credentials below. Ads will be displayed in non-intrusive positions to maintain good user experience.</p>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">AdSense Client ID</label>
                            <input name="adsense_client_id" type="text" value="<?php echo e(old('adsense_client_id', $settings->adsense_client_id)); ?>"
                                   placeholder="e.g. ca-pub-1234567890"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                            <p class="text-xs text-slate-500 mt-1">Your AdSense publisher ID</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Auto Ads</label>
                            <input type="checkbox" name="adsense_auto_ads" id="adsense_auto_ads"
                                   <?php echo e(old('adsense_auto_ads', $settings->adsense_auto_ads) ? 'checked' : ''); ?>

                                   class="rounded text-emerald-600 focus:ring-emerald-500">
                            <label for="adsense_auto_ads" class="ml-2 text-sm text-slate-700">Let Google place ads automatically</label>
                            <p class="text-xs text-slate-500 mt-1">Recommended for beginners</p>
                        </div>
                    </div>

                    <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Manual Ad Placement</h4>
                    <p class="text-sm text-slate-600 mb-4">Choose where ads appear. We recommend minimal placements to avoid annoying users.</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex items-center gap-3">
                            <input type="checkbox" name="adsense_placement_home_top" id="home_top"
                                   <?php echo e(old('adsense_placement_home_top', $settings->adsense_placement_home_top ?? true) ? 'checked' : ''); ?>

                                   class="rounded text-emerald-600 focus:ring-emerald-500">
                            <label for="home_top" class="font-medium text-slate-900">Home Page - Top</label>
                            <p class="text-xs text-slate-500 mt-1">Small banner below header</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="checkbox" name="adsense_placement_home_bottom" id="home_bottom"
                                   <?php echo e(old('adsense_placement_home_bottom', $settings->adsense_placement_home_bottom ?? false) ? 'checked' : ''); ?>

                                   class="rounded text-emerald-600 focus:ring-emerald-500">
                            <label for="home_bottom" class="font-medium text-slate-900">Home Page - Bottom</label>
                            <p class="text-xs text-slate-500 mt-1">Above footer</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="checkbox" name="adsense_placement_listing_top" id="listing_top"
                                   <?php echo e(old('adsense_placement_listing_top', $settings->adsense_placement_listing_top ?? false) ? 'checked' : ''); ?>

                                   class="rounded text-emerald-600 focus:ring-emerald-500">
                            <label for="listing_top" class="font-medium text-slate-900">Listings - Top</label>
                            <p class="text-xs text-slate-500 mt-1">Above listings grid</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="checkbox" name="adsense_placement_listing_bottom" id="listing_bottom"
                                   <?php echo e(old('adsense_placement_listing_bottom', $settings->adsense_placement_listing_bottom ?? false) ? 'checked' : ''); ?>

                                   class="rounded text-emerald-600 focus:ring-emerald-500">
                            <label for="listing_bottom" class="font-medium text-slate-900">Listings - Bottom</label>
                            <p class="text-xs text-slate-500 mt-1">Below listings</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="checkbox" name="adsense_placement_detail_top" id="detail_top"
                                   <?php echo e(old('adsense_placement_detail_top', $settings->adsense_placement_detail_top ?? true) ? 'checked' : ''); ?>

                                   class="rounded text-emerald-600 focus:ring-emerald-500">
                            <label for="detail_top" class="font-medium text-slate-900">Listing Detail - Top</label>
                            <p class="text-xs text-slate-500 mt-1">Below listing title</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="checkbox" name="adsense_placement_detail_bottom" id="detail_bottom"
                                   <?php echo e(old('adsense_placement_detail_bottom', $settings->adsense_placement_detail_bottom ?? false) ? 'checked' : ''); ?>

                                   class="rounded text-emerald-600 focus:ring-emerald-500">
                            <label for="detail_bottom" class="font-medium text-slate-900">Listing Detail - Bottom</label>
                            <p class="text-xs text-slate-500 mt-1">Below description</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Home Slot ID</label>
                            <input name="adsense_slot_home" type="text" value="<?php echo e(old('adsense_slot_home', $settings->adsense_slot_home)); ?>"
                                   placeholder="e.g. 1234567890"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Listing Slot ID</label>
                            <input name="adsense_slot_listing" type="text" value="<?php echo e(old('adsense_slot_listing', $settings->adsense_slot_listing)); ?>"
                                   placeholder="e.g. 1234567890"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Detail Slot ID</label>
                            <input name="adsense_slot_detail" type="text" value="<?php echo e(old('adsense_slot_detail', $settings->adsense_slot_detail)); ?>"
                                   placeholder="e.g. 1234567890"
                                   class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                    </div>
                </div>
            </div>

            <div class="pt-6 border-t border-slate-100">
                <button type="submit"
                        class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                    Save Settings
                </button>
            </div>
        </form>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.admin', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\THE~SEAL CW LTD\dyad-apps\sealify\resources\views/pages/admin/seo.blade.php ENDPATH**/ ?>