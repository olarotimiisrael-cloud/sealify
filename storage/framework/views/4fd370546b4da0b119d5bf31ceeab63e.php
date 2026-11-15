<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames((['title' => null, 'subtitle' => null]));

foreach ($attributes->all() as $__key => $__value) {
    if (in_array($__key, $__propNames)) {
        $$__key = $$__key ?? $__value;
    } else {
        $__newAttributes[$__key] = $__value;
    }
}

$attributes = new \Illuminate\View\ComponentAttributeBag($__newAttributes);

unset($__propNames);
unset($__newAttributes);

foreach (array_filter((['title' => null, 'subtitle' => null]), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars, $__key, $__value); ?>

<div class="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-emerald-50/40 p-8 sm:p-10 mb-10">
    <?php if($title || $subtitle): ?>
        <div class="text-center mb-8">
            <?php if($title): ?>
                <h2 class="text-2xl font-black text-slate-900 mb-2"><?php echo e($title); ?></h2>
            <?php endif; ?>
            <?php if($subtitle): ?>
                <p class="text-slate-600 text-sm"><?php echo e($subtitle); ?></p>
            <?php endif; ?>
        </div>
    <?php endif; ?>
    <?php echo e($slot); ?>

</div>
<?php /**PATH C:\Users\THE~SEAL CW LTD\dyad-apps\sealify\resources\views/components/form-card.blade.php ENDPATH**/ ?>