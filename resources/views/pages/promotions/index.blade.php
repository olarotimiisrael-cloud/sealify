@extends('layouts.app')

@section('content')
    @php $weekPrice = (float) config('promotions.price', 500); @endphp
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Boost Your Listings</h2>

            @if (session('error'))
                <div class="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ session('error') }}</div>
            @endif

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
                        <p class="text-xs text-amber-600 font-bold">₦{{ number_format($weekPrice, 0) }} / week</p>
                        <p class="text-slate-600 text-sm">paid promotion price</p>
                    </div>
                </div>
            </div>

            {{-- Your Ads --}}
            @if ($listings->isEmpty())
                <div class="mt-8 text-center py-16">
                    <p class="text-slate-500">You haven't posted any ads yet.</p>
                    <a href="{{ route('listings.create') }}" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors inline-block mt-4">Post Your First Ad</a>
                </div>
            @else
                <div class="mt-6 space-y-3">
                    @foreach ($listings as $listing)
                        @php $already = \App\Models\Promotion::active()->where('listing_id', $listing->id)->exists(); @endphp
                        <div class="border border-slate-100 rounded-xl p-4">
                            <div class="flex items-center justify-between mb-2">
                                <a href="{{ route('listings.show', $listing) }}" class="font-medium text-slate-900 hover:text-emerald-600 transition-colors">
                                    {{ $listing->title }}
                                </a>
                                <span class="text-xs text-slate-500">₦{{ number_format($listing->price, 0) }}</span>
                            </div>

                            @if ($already)
                                <p class="text-xs font-bold text-emerald-600">🚀 This ad is already promoted.</p>
                            @else
                                <form method="POST" action="{{ route('listings.promote', $listing) }}" class="mt-3 space-y-2">
                                    @csrf

                                    {{-- Referral (free) option --}}
                                    @if ($user->availablePromotionCredits() > 0)
                                        <label class="flex items-start gap-2 border border-emerald-300 rounded-lg p-2 cursor-pointer">
                                            <input type="radio" name="payment_choice" value="referral" class="mt-1" required>
                                            <span class="text-sm">
                                                <span class="font-bold text-emerald-600">Use referral credits (free)</span><br>
                                                <span class="text-slate-500">You have {{ $user->availablePromotionCredits() }} week(s) of credits.</span>
                                            </span>
                                        </label>
                                    @endif

                                    {{-- Paid option --}}
                                    <label class="block border border-slate-200 rounded-lg p-2">
                                        <div class="flex items-center gap-2">
                                            <input type="radio" name="payment_choice" value="paid" class="mt-1" required>
                                            <span class="text-sm font-bold text-slate-900">Pay to promote (bank transfer + receipt)</span>
                                        </div>
                                        <div class="mt-2 ml-6 flex items-center gap-2">
                                            <label class="text-xs text-slate-500">Weeks</label>
                                            <select name="weeks" class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm">
                                                @for ($w = 1; $w <= 12; $w++)
                                                    <option value="{{ $w }}">{{ $w }} week{{ $w > 1 ? 's' : '' }} — ₦{{ number_format($weekPrice * $w, 0) }}</option>
                                                @endfor
                                            </select>
                                        </div>
                                    </label>

                                    <button type="submit"
                                            class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                                        Promote Ad
                                    </button>
                                </form>
                            @endif
                        </div>
                    @endforeach
                </div>
            @endif

            <div class="mt-6">
                <a href="{{ route('payments.index') }}" class="text-sm text-emerald-600 font-bold hover:underline">Go to Payments →</a>
            </div>
        </div>
    </div>
@endsection
