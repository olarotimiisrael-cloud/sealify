@extends('layouts.app')

@section('content')
@php
    $faqGroups = [
        'Getting Started' => [
            ['q' => 'How do I create an account?', 'a' => 'Click Sign Up, provide your name, email, phone, and a password. Verify your email via the link sent to your inbox, then complete your profile.'],
            ['q' => 'How do I post my first ad?', 'a' => 'Tap the Sell (+ ) button or go to Post an Ad. Add a title, category, price, description, photos, and location, then publish. Your ad goes live immediately.'],
            ['q' => 'Is Sealify free to use?', 'a' => 'Browsing and posting standard ads is free. Optional paid features include promoted listings, verified seller badges, and featured placement.'],
        ],
        'Buying & Selling' => [
            ['q' => 'How do I buy an item?', 'a' => 'Open the listing, contact the seller via the Messages icon, agree on price and a Safe Spot, inspect the item, then pay.'],
            ['q' => 'How do I negotiate price?', 'a' => 'Message the seller directly. Many sellers mark prices as negotiable. Agree on the final price in chat before meeting.'],
            ['q' => 'How do I edit or delete my ad?', 'a' => 'Go to My Ads, open the ad, and choose Edit or Delete. Changes go live immediately.'],
            ['q' => 'Can I promote my ad?', 'a' => 'Yes. Open your ad and tap Promote to feature it, or buy a promotion from the Promotions page. Promoted ads get more visibility.'],
        ],
        'Payments & Wallet' => [
            ['q' => 'What payment methods are supported?', 'a' => 'We support card payments and bank transfers via Paystack. You can also upload a payment receipt for manual verification.'],
            ['q' => 'How does the wallet work?', 'a' => 'Your wallet holds balance from refunds or credits. You can use it to pay for promotions and featured listings.'],
            ['q' => 'How do I request a refund?', 'a' => 'If an item was not received or not as described, file a Trade Dispute from the Dispute page within 7 days. See our Refund Policy for details.'],
            ['q' => 'Is my payment information secure?', 'a' => 'Yes. Payments are processed by Paystack (PCI-DSS compliant). Sealify never stores your card details.'],
        ],
        'Trust & Safety' => [
            ['q' => 'How do I verify my identity (KYC)?', 'a' => 'Go to Verify ID, upload a government-issued ID and a selfie. Our team reviews and approves verification, usually within 24-48 hours.'],
            ['q' => 'What is a Verified Seller badge?', 'a' => 'A green checkmark shown next to sellers who completed KYC and business verification. It signals a trusted seller. Apply after completing KYC and your business profile.'],
            ['q' => 'How do I stay safe when meeting?', 'a' => 'Meet in public Safe Spots (police stations, malls), inspect items before paying, never send advance payments to strangers, and report suspicious users.'],
            ['q' => 'How do I report a scam or bad user?', 'a' => 'Open the listing or user profile and tap Report. Our moderation team reviews all reports and takes action.'],
        ],
        'Account & Notifications' => [
            ['q' => 'How do I change my password?', 'a' => 'Go to Settings, enter your current password and a new one, then save. You can also use Forgot Password on the login page.'],
            ['q' => 'How do I enable dark mode?', 'a' => 'Tap the moon/sun icon in the header to toggle between light and dark mode. Your preference is saved on your device.'],
            ['q' => 'How do biometric / Face ID locks work?', 'a' => 'In Settings, enable Biometric or Face ID lock and register your device. You will be prompted to authenticate when reopening the app.'],
            ['q' => 'How do I delete my account?', 'a' => 'Contact support to request account deletion. Active disputes or pending transactions must be resolved first.'],
        ],
    ];
@endphp

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-2">
    <!-- Header -->
    <div class="text-center">
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Help &amp; FAQ</h1>
        <p class="text-slate-500 text-sm mt-1">Answers to the most common questions about buying, selling, and staying safe on Sealify.</p>
    </div>

    <!-- Search -->
    <div class="relative max-w-xl mx-auto">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-20"></div>
        <div class="relative flex items-center gap-2 pl-4 pr-2 py-2 rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input id="faq-search" type="text" placeholder="Search questions… (e.g. refund, promote, KYC)"
                   class="flex-1 border-0 bg-transparent py-1.5 text-sm outline-none placeholder-slate-400">
        </div>
    </div>

    <!-- Quick links -->
    <div class="flex flex-wrap justify-center gap-2">
        <a href="{{ route('help-center') }}" class="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">Help Center</a>
        <a href="{{ route('safety') }}" class="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors">Safety Center</a>
        <a href="{{ route('contact') }}" class="px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors">Contact Us</a>
        <a href="{{ route('dispute') }}" class="px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors">File a Dispute</a>
    </div>

    <!-- FAQ groups -->
    <div class="space-y-5" id="faq-groups">
        @foreach ($faqGroups as $groupName => $questions)
            <div class="faq-group" data-group="{{ $groupName }}">
                <h2 class="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
                    <span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        {{ strtoupper(substr($groupName, 0, 1)) }}
                    </span>
                    {{ $groupName }}
                </h2>
                <div class="space-y-2.5">
                    @foreach ($questions as $i => $faq)
                        <div class="faq-item bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <button class="faq-toggle w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-emerald-50/50 transition-colors" data-search="{{ strtolower($faq['q'].' '.$faq['a']) }}">
                                <span class="font-bold text-slate-900 text-sm">{{ $faq['q'] }}</span>
                                <svg class="faq-chevron w-5 h-5 text-slate-400 shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </button>
                            <div class="faq-answer hidden px-5 pb-4">
                                <p class="text-sm text-slate-600 leading-relaxed">{{ $faq['a'] }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endforeach
    </div>

    <p id="faq-no-results" class="hidden text-center py-10 text-slate-500 text-sm">No questions match your search. Try different keywords or <a href="{{ route('contact') }}" class="text-emerald-600 font-bold hover:underline">contact us</a>.</p>

    <!-- Policies -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 class="text-lg font-black text-slate-900 mb-3">Policies &amp; Legal</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a href="{{ route('terms') }}" class="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                <span class="text-xl">📜</span>
                <span class="text-sm font-bold text-slate-900">Terms &amp; Conditions</span>
            </a>
            <a href="{{ route('privacy') }}" class="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                <span class="text-xl">🔒</span>
                <span class="text-sm font-bold text-slate-900">Privacy Policy</span>
            </a>
            <a href="{{ route('refund-policy') }}" class="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                <span class="text-xl">💸</span>
                <span class="text-sm font-bold text-slate-900">Refund Policy</span>
            </a>
        </div>
    </div>
</div>

@push('scripts')
<script>
    // Accordion toggle
    document.querySelectorAll('.faq-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const answer = btn.nextElementSibling;
            const chevron = btn.querySelector('.faq-chevron');
            answer.classList.toggle('hidden');
            chevron.classList.toggle('rotate-180');
        });
    });

    // Live search
    const searchInput = document.getElementById('faq-search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const q = this.value.trim().toLowerCase();
            let visibleCount = 0;
            document.querySelectorAll('.faq-item').forEach(function (item) {
                const toggle = item.querySelector('.faq-toggle');
                const matches = !q || toggle.dataset.search.includes(q);
                item.classList.toggle('hidden', !matches);
                if (matches) visibleCount++;
            });
            // Hide empty groups
            document.querySelectorAll('.faq-group').forEach(function (group) {
                const anyVisible = group.querySelectorAll('.faq-item:not(.hidden)').length > 0;
                group.classList.toggle('hidden', !anyVisible);
            });
            document.getElementById('faq-no-results').classList.toggle('hidden', visibleCount > 0);
        });
    }
</script>
@endpush
@endsection