<?php if (isset($component)) { $__componentOriginalcb8170ac00b272413fe5b25f86fc5e3a = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalcb8170ac00b272413fe5b25f86fc5e3a = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.guest-layout','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('guest-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
    <?php if (isset($component)) { $__componentOriginal8e3939701bc9c667d1f9e91d04821cb7 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8e3939701bc9c667d1f9e91d04821cb7 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.form-card','data' => ['title' => 'Create an account','subtitle' => 'Join Nigeria\'s trusted local marketplace.']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('form-card'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Create an account','subtitle' => 'Join Nigeria\'s trusted local marketplace.']); ?>
        <div class="flex items-center justify-center mb-6">
            <img src="<?php echo e(asset('logo.png')); ?>" alt="Sealify" class="h-8 w-auto">
            <span class="text-emerald-600 font-black text-xl tracking-tight">Sealify</span>
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

        <form method="POST" action="<?php echo e(route('register.submit')); ?>" class="space-y-4">
            <?php echo csrf_field(); ?>

            <div>
                <label for="name" class="block text-sm font-medium text-slate-700">Full Name</label>
                <input id="name" name="name" type="text" required
                       value="<?php echo e(old('name')); ?>"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
                <input id="email" name="email" type="email" required
                       value="<?php echo e(old('email')); ?>"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>

            <div>
                <label for="phone" class="block text-sm font-medium text-slate-700">Phone Number</label>
                <input id="phone" name="phone" type="tel" required placeholder="+234 812 345 6789"
                       value="<?php echo e(old('phone')); ?>"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
                <input id="password" name="password" type="password" required minlength="6"
                       class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>

            <button type="submit"
                    class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Create Account
            </button>
        </form>

        <div class="mt-8 text-center">
            <p class="text-xs text-slate-500">Already have an account?</p>
            <a href="<?php echo e(route('login')); ?>" class="text-emerald-600 font-bold text-xs hover:underline">Sign In</a>
        </div>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8e3939701bc9c667d1f9e91d04821cb7)): ?>
<?php $attributes = $__attributesOriginal8e3939701bc9c667d1f9e91d04821cb7; ?>
<?php unset($__attributesOriginal8e3939701bc9c667d1f9e91d04821cb7); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8e3939701bc9c667d1f9e91d04821cb7)): ?>
<?php $component = $__componentOriginal8e3939701bc9c667d1f9e91d04821cb7; ?>
<?php unset($__componentOriginal8e3939701bc9c667d1f9e91d04821cb7); ?>
<?php endif; ?>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalcb8170ac00b272413fe5b25f86fc5e3a)): ?>
<?php $attributes = $__attributesOriginalcb8170ac00b272413fe5b25f86fc5e3a; ?>
<?php unset($__attributesOriginalcb8170ac00b272413fe5b25f86fc5e3a); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalcb8170ac00b272413fe5b25f86fc5e3a)): ?>
<?php $component = $__componentOriginalcb8170ac00b272413fe5b25f86fc5e3a; ?>
<?php unset($__componentOriginalcb8170ac00b272413fe5b25f86fc5e3a); ?>
<?php endif; ?>
<?php /**PATH C:\Users\THE~SEAL CW LTD\dyad-apps\sealify\resources\views/auth/register.blade.php ENDPATH**/ ?>