@extends('layouts.app')

@section('content')
@php
    $sections = [
        ['h' => '1. Acceptance of Terms', 'p' => [
            'By accessing or using Sealify ("the Platform", "we", "us"), you agree to be bound by these Terms & Conditions. If you do not agree, do not use the Platform.',
            'You must be at least 18 years old to create an account or transact on Sealify.',
        ]],
        ['h' => '2. Your Account', 'p' => [
            'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.',
            'Provide accurate, current, and complete information when registering and keep it updated. Impersonation or fake identities are prohibited.',
            'We may suspend or terminate accounts that violate these terms or engage in fraudulent activity.',
        ]],
        ['h' => '3. Listings & Marketplace Rules', 'p' => [
            'Sellers must provide accurate descriptions and genuine photos of items. Prohibited items include illegal goods, weapons, drugs, counterfeit products, and stolen property.',
            'You may not post misleading, duplicate, or spam listings. We reserve the right to remove any listing that violates our policies.',
            'Buyers and sellers are responsible for inspecting items and agreeing on terms before completing a transaction.',
        ]],
        ['h' => '4. Payments & Fees', 'p' => [
            'Payments are processed securely via third-party providers (e.g. Paystack). Sealify does not store card details.',
            'Optional services such as promoted listings, featured placement, and verified badges may require payment. Applicable fees are shown before purchase.',
            'Wallet balances and credits are non-transferable and have no cash value outside the Platform.',
        ]],
        ['h' => '5. Prohibited Conduct', 'p' => [
            'You agree not to: harass or abuse other users; post fraudulent or illegal content; attempt to hack or disrupt the Platform; scrape data; or use the Platform for any unlawful purpose.',
            'Scamming, fraud, and misrepresentation will result in immediate account suspension and may be reported to law enforcement.',
        ]],
        ['h' => '6. Disputes & Liability', 'p' => [
            'Sealify is a marketplace connecting buyers and sellers. We are not a party to transactions and are not liable for the quality, safety, or legality of items.',
            'Disputes should first be resolved between buyer and seller. If unresolved, file a Trade Dispute through the Platform for mediation.',
            'To the maximum extent permitted by law, Sealify is not liable for indirect, incidental, or consequential damages arising from use of the Platform.',
        ]],
        ['h' => '7. Intellectual Property', 'p' => [
            'The Sealify name, logo, and Platform content are owned by Sealify and protected by law. You may not use them without permission.',
            'User-generated content remains yours, but you grant Sealify a license to display it in connection with the Platform.',
        ]],
        ['h' => '8. Termination', 'p' => [
            'We may suspend or terminate your access at any time for violations of these terms, with or without notice.',
            'Provisions that by their nature should survive termination (e.g. liability limits) will remain in effect.',
        ]],
        ['h' => '9. Changes to Terms', 'p' => [
            'We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the updated Terms.',
        ]],
        ['h' => '10. Contact', 'p' => [
            'Questions about these Terms? Contact us at support@sealify.com.ng.',
        ]],
    ];
@endphp

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-6">
    <div class="text-center">
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Terms &amp; Conditions</h1>
        <p class="text-slate-500 text-sm mt-1">Last updated: {{ now()->format('F Y') }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        @foreach ($sections as $section)
            <section>
                <h2 class="text-lg font-black text-slate-900 mb-2">{{ $section['h'] }}</h2>
                <div class="space-y-2">
                    @foreach ($section['p'] as $para)
                        <p class="text-sm text-slate-600 leading-relaxed">{{ $para }}</p>
                    @endforeach
                </div>
            </section>
        @endforeach

        <div class="pt-6 border-t border-slate-100">
            <p class="text-xs text-slate-500">Related: <a href="{{ route('privacy') }}" class="text-emerald-600 font-bold hover:underline">Privacy Policy</a> · <a href="{{ route('refund-policy') }}" class="text-emerald-600 font-bold hover:underline">Refund Policy</a> · <a href="{{ route('contact') }}" class="text-emerald-600 font-bold hover:underline">Contact Us</a></p>
        </div>
    </div>
</div>
@endsection