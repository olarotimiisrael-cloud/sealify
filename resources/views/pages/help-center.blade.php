@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-10">
            <h2 class="text-3xl font-bold text-slate-900 mb-6">Help Center</h2>
            <p class="text-slate-600 mb-6">Guides for buying, selling, payments, and KYC on Sealify.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <h4 class="font-bold text-slate-900 mb-2">Buying Guide</h4>
                    <p class="text-xs text-slate-600">Search, message the seller, and meet at a Safe Spot.</p>
                </div>
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <h4 class="font-bold text-slate-900 mb-2">Selling Guide</h4>
                    <p class="text-xs text-slate-600">Post an ad, chat with buyers, and close the deal.</p>
                </div>
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <h4 class="font-bold text-slate-900 mb-2">KYC Verification</h4>
                    <p class="text-xs text-slate-600">Verify your identity to build trust as a seller.</p>
                </div>
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <h4 class="font-bold text-slate-900 mb-2">Payments</h4>
                    <p class="text-xs text-slate-600">Secure checkout via Paystack with buyer protection.</p>
                </div>
            </div>
        </div>
    </div>
@endsection
