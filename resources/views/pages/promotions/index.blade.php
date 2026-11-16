@extends('layouts.app')

@section('content')
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Boost Your Listings</h2>

            {{-- Referral Status --}}
            <div class="mb-6 bg-slate-50 rounded-xl p-6">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h4 class="font-bold text-slate-900">Referral Promotion Credits</h4>
                        <p class="text-sm text-slate-500">10 referrals = 1 week free promotion</p>
                    </div>
                    <div class="text-right">
                        <p class="text-3xl font-black text-emerald-600">{{ $user->referralCount() }}</p>
                        <p class="text-xs text-slate-500">successful referrals</p>
                    </div>
                </div>
                <div class="mt-4 flex flex-col sm:flex-row gap-2">
                    <div class="flex-1 bg-emerald-100 rounded-xl p-3">
                        <p class="text-xs text-emerald-600 font-bold">{{ $user->availablePromotionCredits() }} weeks available</p>
                        <p class="text-slate-600 text-sm">from {{ $user->totalReferralCredits() }} earned</p>
                    </div>
                    <div class="flex-1 bg-amber-100 rounded-xl p-3">
                        <p class="text-xs text-amber-600 font-bold">{{ $user->totalReferralCredits() }} total earned</p>
                        <p class="text-slate-600 text-sm">referrals ÷ 10</p>
                    </div>
                </div>
            </div>

            {{-- Eligibility --}}
            @if ($user->canClaimFreePromotion())
                <div class="mb-4 p-4 rounded-xl border border-emerald-400 bg-emerald-50 text-emerald-600 font-medium">
                    You have enough credits for a 1-week free promotion!
                </div>
            @elseif ($user->canClaimDoubleFreePromotion())
                <div class="mb-4 p-4 rounded-xl border border-emerald-400 bg-emerald-50 text-emerald-600 font-medium">
                    You have enough credits for a 2-week free promotion!
                </div>
            @elseif ($user->availablePromotionCredits() > 0)
                <div class="mb-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-400 font-medium">
                    You have {{ $user->availablePromotionCredits() }} week(s) of free promotion credits available.
                </div>
            @endif

            {{-- Your Ads --}}
            @if ($listings->isEmpty())
                <div class="mt-8 text-center py-16">
                    <p class="text-slate-500">You haven't posted any ads yet.</p>
                    <a href="{{ route('listings.create') }}" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors inline-block mt-4">Post Your First Ad</a>
                </div>
            @else
                <div class="mt-6 space-y-3">
                    @foreach ($listings as $listing)
                        <div class="border border-slate-100 rounded-xl p-4 group">
                            <div class="flex items-center justify-between mb-2">
                                <a href="{{ route('listings.show', $listing) }}" class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                                    {{ $listing->title }}
                                </a>
                                <span class="text-xs text-slate-500">
                                    ₦{{ number_format($listing->price, 0) }}
                                </span>
                            </div>
                            <p class="text-xs text-slate-500 mb-2">{{ $listing->description ?? 'No description' }}</p>

                            {{-- Promotion eligibility for this listing --}}
                            <form method="POST" action="{{ route('listings.promote', $listing) }}" class="mt-3">
                                @csrf

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                    {{-- 1-week option --}}
                                    @if ($user->canClaimFreePromotion())
                                        <div class="border rounded border-emerald-400 p-2">
                                            <input type="radio" name="weeks" value="1" required
                                                   class="w-4 h-4 rounded-emerald-500 cursor-pointer">
                                            <span class="ml-2 text-sm text-emerald-600">1 week (10 credits)</span>
                                        </div>
                                    @else
                                        <div class="border rounded p-2 text-slate-300 cursor-not-allowed">
                                            <input type="radio" name="weeks" value="1" disabled class="w-4 h-4">
                                            <span class="ml-2 text-sm text-slate-400">Not enough credits</span>
                                        </div>
                                    @endif

                                    {{-- 2-week option --}}
                                    @if ($user->canClaimDoubleFreePromotion())
                                        <div class="border rounded border-emerald-400 p-2">
                                            <input type="radio" name="weeks" value="2" required
                                                   class="w-4 h-4 rounded-emerald-500 cursor-pointer">
                                            <span class="ml-2 text-sm text-emerald-600">2 weeks (20 credits)</span>
                                        </div>
                                    @else
                                        <div class="border rounded p-2 text-slate-300 cursor-not-allowed">
                                            <input type="radio" name="weeks" value="2" disabled class="w-4 h-4">
                                            <span class="ml-2 text-sm text-slate-400">Not enough credits</span>
                                        </div>
                                    @endif
                                </div>

                                <button type="submit"
                                        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                                    Promote Ad (Free)
                                </button>
                            </form>
                        </div>
                    @endforeach
                </div>
                <div class="mt-6">{{ $listings->links() }}</div>
            @endif
        </div>
    </div>
@endsection