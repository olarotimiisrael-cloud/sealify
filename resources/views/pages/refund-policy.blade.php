@extends('layouts.app')

@section('content')
@php
    $sections = [
        ['h' => '1. Overview', 'p' => [
            'Sealify connects buyers and sellers. Most transactions are completed in person after inspection. However, we want you to shop with confidence, so this policy explains when refunds are available.',
            'Because goods are exchanged directly between users, buyers are encouraged to inspect items before paying.',
        ]],
        ['h' => '2. Eligible for Refund', 'p' => [
            'Item not received after payment was made and confirmed.',
            'Item received is materially different from its description (not as described).',
            'Item arrived damaged or defective and the issue was not disclosed in the listing.',
            'Duplicate or unauthorized payment was made in error.',
        ]],
        ['h' => '3. Not Eligible for Refund', 'p' => [
            'Change of mind after a successful inspection and purchase.',
            'Minor cosmetic wear that was reasonably expected for a used item.',
            'Buyer’s remorse or inability to collect the item after agreeing to buy.',
            'Items purchased and collected in person without prior inspection.',
        ]],
        ['h' => '4. How to Request a Refund', 'p' => [
            'File a Trade Dispute from the Dispute page within 7 days of the transaction, providing details and evidence (photos, chat logs, receipt reference).',
            'Our team reviews the dispute and contacts both parties. We aim to respond within 3–5 business days.',
            'If the dispute is resolved in your favor, approved refunds are returned via the original payment method or Sealify wallet.',
        ]],
        ['h' => '5. Digital & Promotional Purchases', 'p' => [
            'Payments for promoted listings, featured placement, and verification are generally non-refundable once the service has been rendered.',
            'If a paid promotion fails to activate due to a technical error on our side, you may request a refund or a re-run of the promotion.',
        ]],
        ['h' => '6. Processing Time', 'p' => [
            'Approved refunds are typically processed within 5–10 business days, depending on your payment provider.',
        ]],
        ['h' => '7. Contact', 'p' => [
            'Questions about refunds? Contact support@sealify.com.ng or file a dispute through the Platform.',
        ]],
    ];
@endphp

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-6">
    <div class="text-center">
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Refund Policy</h1>
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

        <div class="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
            <p class="text-sm text-emerald-700">Need to request a refund? <a href="{{ route('dispute') }}" class="font-bold underline">File a Trade Dispute →</a></p>
        </div>

        <div class="pt-6 border-t border-slate-100">
            <p class="text-xs text-slate-500">Related: <a href="{{ route('terms') }}" class="text-emerald-600 font-bold hover:underline">Terms &amp; Conditions</a> · <a href="{{ route('privacy') }}" class="text-emerald-600 font-bold hover:underline">Privacy Policy</a> · <a href="{{ route('contact') }}" class="text-emerald-600 font-bold hover:underline">Contact Us</a></p>
        </div>
    </div>
</div>
@endsection