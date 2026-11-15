

<?php $__env->startSection('content'); ?>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-10">
            <h2 class="text-3xl font-bold text-slate-900 mb-6">Contact Us</h2>
            <p class="text-slate-600 mb-6">Have a question? Reach our support team.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-4">
                    <p class="text-sm font-medium text-slate-900">Email</p>
                    <p class="text-slate-600">support@sealify.ng</p>
                    <p class="text-sm font-medium text-slate-900">Phone</p>
                    <p class="text-slate-600">+234 813 120 8468</p>
                    <p class="text-sm font-medium text-slate-900">Office</p>
                    <p class="text-slate-600">Ogbomosoland, Oyo State, Nigeria</p>
                </div>
                <div>
                    <form class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700">Name</label>
                            <input type="text" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700">Message</label>
                            <textarea rows="4" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
                        </div>
                        <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-lg transition-colors w-full">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\THE~SEAL CW LTD\dyad-apps\sealify\resources\views/pages/contact.blade.php ENDPATH**/ ?>