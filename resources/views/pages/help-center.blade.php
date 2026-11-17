@extends('layouts.app')

@section('content')
@php
    $guides = [
        [
            'icon' => '🛒', 'color' => 'emerald',
            'title' => 'Buying Guide',
            'desc' => 'Everything you need to buy safely on Sealify.',
            'steps' => [
                'Search for the item using the search bar or browse categories.',
                'Open the listing and review photos, price, and seller info.',
                'Tap the message/chat icon to contact the seller.',
                'Agree on price and a public Safe Spot to meet.',
                'Inspect the item, then pay the seller.',
            ],
        ],
        [
            'icon' => '🏷️', 'color' => 'teal',
            'title' => 'Selling Guide',
            'desc' => 'Post, promote, and close deals faster.',
            'steps' => [
                'Tap Sell (+) and fill in title, category, price, and description.',
                'Upload clear photos and set your location.',
                'Publish your ad — it goes live instantly.',
                'Respond quickly to buyer messages.',
                'Meet at a Safe Spot, hand over the item, and get paid.',
            ],
        ],
        [
            'icon' => '🪪', 'color' => 'amber',
            'title' => 'Verification (KYC)',
            'desc' => 'Build trust with a verified badge.',
            'steps' => [
                'Go to Verify ID from your profile.',
                'Enter your personal and address details.',
                'Upload a government ID and a clear selfie.',
                'Submit for review (usually 24–48 hours).',
                'Once approved, apply for a Verified Seller badge.',
            ],
        ],
        [
            'icon' => '💳', 'color' => 'blue',
            'title' => 'Payments & Wallet',
            'desc' => 'Secure checkout and refunds.',
            'steps' => [
                'Pay via card or bank transfer (Paystack).',
                'Or upload a payment receipt for manual confirmation.',
                'Wallet balance can be used for promotions.',
                'Request refunds via a Trade Dispute within 7 days.',
                'Track all activity in the Payments page.',
            ],
        ],
        [
            'icon' => '📣', 'color' => 'purple',
            'title' => 'Promoting Ads',
            'desc' => 'Get more views and sell faster.',
            'steps' => [
                'Open your ad and tap Promote.',
                'Choose a promotion package.',
                'Pay securely to activate the promotion.',
                'Your ad is highlighted in Special Promotions.',
                'Track performance in the Promotions page.',
            ],
        ],
        [
            'icon' => '🛡️', 'color' => 'rose',
            'title' => 'Staying Safe',
            'desc' => 'Avoid scams and trade confidently.',
            'steps' => [
                'Meet in public Safe Spots (police stations, malls).',
                'Inspect items before paying.',
                'Never send advance payments to strangers.',
                'Report suspicious users or listings.',
                'Trust verified sellers with the green badge.',
            ],
        ],
    ];
@endphp

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-2">
    <!-- Header -->
    <div class="relative">
        <div class="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 blur-xl opacity-20"></div>
        <div class="relative bg-white/95 backdrop-blur-xl rounded-[2rem] border border-white/70 shadow-xl shadow-emerald-500/15 p-6 sm:p-8 text-center">
            <div class="h-1 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto mb-4"></div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sealify Help Center</h1>
            <p class="text-slate-500 text-sm mt-2">Step-by-step guides for buying, selling, payments, and safety.</p>
            <a href="{{ route('faq') }}" class="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-200 active:scale-95">
                Browse all FAQs →
            </a>
        </div>
    </div>

    <!-- Guides grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @foreach ($guides as $guide)
            <div class="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:border-emerald-200 transition-all">
                <div class="w-12 h-12 rounded-xl bg-{{ $guide['color'] }}-100 text-{{ $guide['color'] }}-600 flex items-center justify-center text-2xl mb-4">{{ $guide['icon'] }}</div>
                <h3 class="text-lg font-black text-slate-900 mb-1">{{ $guide['title'] }}</h3>
                <p class="text-xs text-slate-500 mb-4">{{ $guide['desc'] }}</p>
                <ol class="space-y-2">
                    @foreach ($guide['steps'] as $step)
                        <li class="flex items-start gap-2 text-xs text-slate-600">
                            <span class="shrink-0 w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] font-bold mt-0.5">✓</span>
                            <span>{{ $step }}</span>
                        </li>
                    @endforeach
                </ol>
            </div>
        @endforeach
    </div>

    <!-- Quick links -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 class="text-lg font-black text-slate-900 mb-4">Quick Links</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <a href="{{ route('listings.create') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                <span class="text-2xl">📝</span><span class="text-xs font-bold text-slate-700">Post an Ad</span>
            </a>
            <a href="{{ route('kyc.index') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors">
                <span class="text-2xl">🪪</span><span class="text-xs font-bold text-slate-700">Verify ID</span>
            </a>
            <a href="{{ route('payments.index') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
                <span class="text-2xl">💳</span><span class="text-xs font-bold text-slate-700">Payments</span>
            </a>
            <a href="{{ route('promotions.index') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors">
                <span class="text-2xl">📣</span><span class="text-xs font-bold text-slate-700">Promotions</span>
            </a>
            <a href="{{ route('dispute') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors">
                <span class="text-2xl">⚖️</span><span class="text-xs font-bold text-slate-700">File Dispute</span>
            </a>
            <a href="{{ route('safety') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-teal-50 border border-teal-100 hover:bg-teal-100 transition-colors">
                <span class="text-2xl">🛡️</span><span class="text-xs font-bold text-slate-700">Safety Center</span>
            </a>
            <a href="{{ route('contact') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                <span class="text-2xl">📧</span><span class="text-xs font-bold text-slate-700">Contact Us</span>
            </a>
            <a href="{{ route('how-it-works') }}" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                <span class="text-2xl">❓</span><span class="text-xs font-bold text-slate-700">How It Works</span>
            </a>
        </div>
    </div>

    <!-- Still need help -->
    <div class="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 sm:p-8 text-white text-center shadow-lg shadow-emerald-200">
        <h2 class="text-xl font-black mb-2">Still need help?</h2>
        <p class="text-emerald-50 text-sm mb-4">Our support team is ready to assist you.</p>
        <div class="flex flex-wrap justify-center gap-3">
            <a href="{{ route('contact') }}" class="px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition-colors active:scale-95">Contact Support</a>
            <a href="{{ route('faq') }}" class="px-5 py-2.5 rounded-xl bg-white/20 border border-white/40 text-white font-bold text-sm hover:bg-white/30 transition-colors active:scale-95">Read FAQs</a>
        </div>
    </div>
</div>
@endsection