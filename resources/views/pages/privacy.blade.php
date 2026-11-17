@extends('layouts.app')

@section('content')
@php
    $sections = [
        ['h' => '1. Information We Collect', 'p' => [
            'Account details: name, email, phone number, username, and profile photo.',
            'Verification data: government ID and selfie for KYC (stored securely, used only for verification).',
            'Transaction data: payment references, amounts, and wallet activity. Card details are handled by our payment provider and never stored by us.',
            'Usage data: device info, IP address, and interactions to improve the Platform.',
        ]],
        ['h' => '2. How We Use Your Information', 'p' => [
            'To create and manage your account and listings.',
            'To process payments, promotions, and verification.',
            'To send notifications (email, in-app, WhatsApp) about your account and activity.',
            'To detect fraud, enforce our Terms, and improve our services.',
            'We do not sell your personal data to third parties.',
        ]],
        ['h' => '3. Sharing of Information', 'p' => [
            'We share data only with service providers who help us operate (e.g. payment processors, SMS/email delivery) under strict confidentiality.',
            'When required by law, regulation, or valid legal process, we may disclose your information.',
            'Your public profile (name, location, ratings, verified status) is visible to other users to facilitate trade. Your phone number is hidden unless you choose otherwise in Settings.',
        ]],
        ['h' => '4. Data Security', 'p' => [
            'We use encryption and secure infrastructure to protect your data. Payment data is processed by PCI-DSS compliant providers.',
            'No system is 100% secure, but we take reasonable measures to safeguard your information.',
        ]],
        ['h' => '5. Your Rights & Choices', 'p' => [
            'You can access and update your profile information in Settings at any time.',
            'You may control notification preferences (email, WhatsApp) in Settings.',
            'You can request deletion of your account and associated data by contacting support.',
        ]],
        ['h' => '6. Cookies', 'p' => [
            'We use cookies and local storage to keep you logged in, remember preferences (theme), and analyze usage. You can clear these via your browser settings.',
        ]],
        ['h' => '7. Data Retention', 'p' => [
            'We retain your data for as long as your account is active or as needed to provide services, comply with legal obligations, and resolve disputes.',
        ]],
        ['h' => '8. Children’s Privacy', 'p' => [
            'Sealify is not intended for users under 18. We do not knowingly collect data from children.',
        ]],
        ['h' => '9. Changes to this Policy', 'p' => [
            'We may update this Privacy Policy periodically. Material changes will be communicated via the Platform or email.',
        ]],
        ['h' => '10. Contact', 'p' => [
            'For privacy questions or data requests, email support@sealify.com.ng.',
        ]],
    ];
@endphp

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-6">
    <div class="text-center">
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
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
            <p class="text-xs text-slate-500">Related: <a href="{{ route('terms') }}" class="text-emerald-600 font-bold hover:underline">Terms &amp; Conditions</a> · <a href="{{ route('refund-policy') }}" class="text-emerald-600 font-bold hover:underline">Refund Policy</a> · <a href="{{ route('contact') }}" class="text-emerald-600 font-bold hover:underline">Contact Us</a></p>
        </div>
    </div>
</div>
@endsection