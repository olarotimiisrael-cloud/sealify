

<?php $__env->startSection('content'); ?>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-slate-900">Post a New Ad</h2>
                <a href="<?php echo e(route('listings.index')); ?>" class="text-sm text-emerald-600 font-bold hover:underline">Back to listings</a>
            </div>

            <?php if(session('status')): ?>
                <div class="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">
                    <?php echo e(session('status')); ?>

                </div>
            <?php endif; ?>

            <?php if($errors->any()): ?>
                <div class="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
                    <ul class="list-disc list-inside space-y-1">
                        <?php $__currentLoopData = $errors->all(); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <li><?php echo e($error); ?></li>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </ul>
                </div>
            <?php endif; ?>

            <form method="POST" action="<?php echo e(route('listings.store')); ?>" enctype="multipart/form-data" class="space-y-6">
                <?php echo csrf_field(); ?>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-slate-700">Title</label>
                        <input id="title" name="title" type="text" required
                               value="<?php echo e(old('title')); ?>"
                               class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label for="price" class="block text-sm font-medium text-slate-700">Price (₦)</label>
                        <input id="price" name="price" type="number" step="0.01" required min="0"
                               value="<?php echo e(old('price')); ?>"
                               class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                </div>

                <div>
                    <label for="category_id" class="block text-sm font-medium text-slate-700">Category</label>
                    <select id="category_id" name="category_id" required
                            class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <option value="">Select a category</option>
                        <?php $__currentLoopData = $categories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $category): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                            <option value="<?php echo e($category->id); ?>" <?php echo e(old('category_id') == $category->id ? 'selected' : ''); ?>><?php echo e($category->name); ?></option>
                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                    </select>
                </div>

                <div>
                    <label for="condition" class="block text-sm font-medium text-slate-700">Condition</label>
                    <select id="condition" name="condition" required
                            class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <option value="new" <?php echo e(old('condition') == 'new' ? 'selected' : ''); ?>>New</option>
                        <option value="like_new" <?php echo e(old('condition') == 'like_new' ? 'selected' : ''); ?>>Like New</option>
                        <option value="good" <?php echo e(old('condition') == 'good' ? 'selected' : ''); ?>>Good</option>
                        <option value="fair" <?php echo e(old('condition') == 'fair' ? 'selected' : ''); ?>>Fair</option>
                        <option value="poor" <?php echo e(old('condition') == 'poor' ? 'selected' : ''); ?>>Poor</option>
                    </select>
                </div>

                <div>
                    <label for="location" class="block text-sm font-medium text-slate-700">Location</label>
                    <input id="location" name="location" type="text" required placeholder="e.g. Sabo Market, Ogbomoso"
                           value="<?php echo e(old('location')); ?>"
                           class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium text-slate-700">Description</label>
                    <textarea id="description" name="description" rows="5" required
                              class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"><?php echo e(old('description')); ?></textarea>
                </div>

                <div>
                    <label for="images" class="block text-sm font-medium text-slate-700">Listing Images</label>
                    <input id="images" name="images[]" type="file" accept="image/*" multiple
                           class="mt-1 block w-full text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                    <p class="text-xs text-slate-400 mt-1">Upload up to 10 images (JPEG, PNG, GIF, WebP). Max 2MB each.</p>
                </div>

                <button type="submit"
                        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-colors">
                    Publish Ad
                </button>
            </form>
        </div>
    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\THE~SEAL CW LTD\dyad-apps\sealify\resources\views/pages/listings/create.blade.php ENDPATH**/ ?>