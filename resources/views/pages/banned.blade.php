@extends('layouts.app')

@section('content')
<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white rounded-2xl border border-rose-100 shadow-sm p-8 md:p-12 text-center">
        <div class="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6 text-4xl">🚫</div>

        <h1 class="text-3xl font-black text-slate-900 mb-2">Account Banned</h1>
        <p class="text-lg text-slate-600 mb-6">
            @if ($user && $user->banned_until === null)
                Your account has been <strong class="text-rose-600">permanently banned</strong> from Sealify.
            @elseif ($user && $user->banned_until)
                Your account has been <strong class="text-rose-600">temporarily banned</strong> until <strong>{{ $user->banned_until->format('F j, Y, g:i A') }}</strong>.
            @else
                Your account has been <strong class="text-rose-600">banned</strong> from Sealify.
            @endif
        </p>

        @if ($user && $user->ban_reason)
            <div class="bg-rose-50 border border-rose-200 rounded-xl p-6 mb-8">
                <h3 class="text-lg font-bold text-slate-900 mb-2">Reason:</h3>
                <p class="text-slate-700 italic">{{ $user->ban_reason }}</p>
            </div>
        @endif

        <div class="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
            <h3 class="text-lg font-bold text-slate-900 mb-3">What to do next:</h3>
            <ul class="text-slate-600 space-y-3 text-left max-w-md mx-auto">
                <li class="flex items-start gap-3">
                    <span class="text-rose-600 mt-0.5">⚠️</span>
                    <p class="text-sm">Your account is currently restricted from buying, selling, and messaging on Sealify.</p>
                </li>
                <li class="flex items-start gap-3">
                    <span class="text-emerald-600 mt-0.5">✉️</span>
                    <p class="text-sm">If you believe this ban was made in error, or if you would like to discuss this decision, please contact our support team.</p>
                </li>
                <li class="flex items-start gap-3">
                    <span class="text-emerald-600 mt-0.5">📧</span>
                    <p class="text-sm">Email: <strong class="text-slate-900">support@sealify.com.ng</strong></p>
                </li>
                <li class="flex items-start gap-3">
                    <span class="text-emerald-600 mt-0.5">📍</span>
                    <p class="text-sm">Office: Ogbomosoland, Oyo State, Nigeria</p>
                </li>
            </ul>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="{{ route('logout') }}" class="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-rose-200 hover:shadow-rose-300">
                Sign Out
            </a>
            <a href="mailto:support@sealify.com.ng" class="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 font-bold py-3 px-6 rounded-xl transition-colors border border-slate-200 shadow-sm">
                Contact Support
            </a>
        </div>
    </div>
</div>
@endsection
