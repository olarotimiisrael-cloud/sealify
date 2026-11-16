@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8 mb-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900 mb-1">{{ $user->name ?? 'User Profile' }}</h2>
                    @if ($user->hasBadge())
                        <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-{{ $user->badgeColor() }}-100 text-{{ $user->badgeColor() }}-700">
                            {{ $user->badgeLabel() }}
                        </span>
                    @endif
                    <p class="text-sm text-slate-600">@{{ $user->username ?? $user->email }}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="text-2xl font-bold text-slate-900">{{ $user->listings->count() }}</div>
                    <div class="text-xs text-slate-500">Listings</div>
                </div>
                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="text-2xl font-bold text-slate-900">{{ $referralStatus['count'] ?? 0 }}</div>
                    <div class="text-xs text-slate-500">Successful Referrals</div>
                </div>
                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="text-2xl font-bold text-slate-900">{{ round($referralStatus['progress'] ?? 0) }}%</div>
                    <div class="text-xs text-slate-500">Toward 2-Week Free Promotion</div>
                </div>
            </div>

            @if (!empty($referralStatus['count']))
                <div class="mt-6 p-4 rounded-xl border border-emerald-100 bg-emerald-50 text-sm text-emerald-700">
                    <p class="font-bold mb-2">Referral Promotion Status</p>
                    <p class="mb-1">{{ $referralStatus['count'] }} successful referrals of {{ config('promotions.referral.double_free_promotion_referrals', 20) }} needed for 2-week free promotion.</p>
                    @if ($referralStatus['can_claim_1_week'])
                        <p class="text-emerald-600 font-bold">🎉 1-week free promotion ready to claim!</p>
                    @elseif ($referralStatus['can_claim_2_weeks'])
                        <p class="text-emerald-600 font-bold">🎉 2-week free promotion ready to claim!</p>
                    @else
                        <p class="text-emerald-600">Next milestone: {{ $referralStatus['next_milestone'] }} referrals.</p>
                    @endif
                </div>
            @endif
        </div>

        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Listings by {{ $user->name ?? 'this user' }}</h3>
            @if ($listings->isEmpty())
                <p class="text-slate-500 text-center py-8">No listings.</p>
            @else
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    @foreach ($listings as $listing)
                        <a href="{{ route('listings.show', $listing) }}" class="block group border border-slate-100 rounded-xl p-3 hover:border-emerald-200 transition-colors">
                            <div class="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden mb-2">
                                <img src="{{ optional($listing->images)->first() ?? asset('logo.png') }}" class="w-full h-full object-cover">
                            </div>
                            <h4 class="font-bold text-sm text-slate-900 group-hover:text-emerald-600">{{ $listing->title }}</h4>
                            <span class="text-xs text-emerald-600 font-bold">₦{{ number_format($listing->price, 0) }}</span>
                        </a>
                    @endforeach
                </div>
                {{ $listings->links() }}
            @endif
        </div>
    </div>
@endsection