@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8 mb-6">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">My Ads</h2>
            <p class="text-sm text-slate-600 mb-4">Promote your ads with paid boosts or free referral-based promotions.</p>

            {{-- Referral credit info bar --}}
            <div class="mb-4 p-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-50">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-emerald-100 flex items-center justify-center">
                        <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 9.351 9.246 9.161 8.234 7.621C7.21 6.1 6 4.522 6 2.866c0-1.691 1.35-3.076 3.02-3.254C9.531 0 10.903 0 12.124 0c1.219 0 2.589.024 3.83.714 1.794.841 2.949 2.382 3.032 4.005C18.002 5.409 19.598 6.94 20 8.67c0 1.658-1.293 3.04-2.859 3.498-1.13.33-2.298.39-3.508.39-1.208 0-2.4-.25-3.518-.748-1.017-.44-2.01-.99-2.84-1.654C9.999 6.058 11.002 7.304 11.5 8.504c.391.904.585 1.849.585 2.868 0 1.02-.15 1.998-.455 2.948C10.887 12.454 10.567 13.52 10.223 14.5c-.343.98-.514 1.98-.514 3.003v1.5c0 1.297.113 2.547.33 3.76.319 1.808 1.074 3.524 2.126 4.803a12 12 0 001.317 1.481c.672.591 1.439 1.08 2.273 1.446a22.6 22.6 0 002.588.373c1.269 0 2.535-.127 3.79-.364a22 22 0 002.177-.885c.91-.487 1.74-1.076 2.473-1.766a22.7 22.7 0 002.245-2.044c.567-.835.877-1.787.877-2.828v-1.5c0-1.022-.153-2.003-.44-2.947a12 12 0 00-1.316-1.486c-.672-.591-1.439-1.08-2.273-1.445a22.4 22.4 0 00-2.588-.374c-1.269 0-2.535.126-3.79.365a22 22 0 00-2.177.886c-.91.487-1.74 1.075-2.473 1.765a22.8 22.8 0 00-2.245 2.044c-.567.836-.877 1.788-.877 2.829v1.5c0 1.022.153 2.003.44 2.947a12 12 0 001.316 1.487c.672.591 1.439 1.08 2.273 1.446a22.6 22.6 0 002.588.374c1.269 0 2.535-.127 3.79-.364a22 22 0 002.177-.885c.91-.487 1.74-1.076 2.473-1.766a22.7 22.7 0 002.245-2.044c.567-.835.877-1.787.877-2.828v-1.5c0-1.021-.153-2.002-.44-2.946a12 12 0 00-1.316-1.485c-.672-.591-1.439-1.08-2.273-1.445a22.4 22.4 0 00-2.588-.373c-1.269 0-2.535.126-3.79.363a22 22 0 00-2.177.886c-.91.487-1.74 1.075-2.473 1.765a22.8 22.8 0 00-2.245 2.044c-.567.836-.877 1.786-.877 2.828v1.5c0 1.023.153 2.004.44 2.947a12 12 0 001.316 1.486c.672.591 1.439 1.08 2.273 1.446a22.6 22.6 0 002.588.374c1.269 0 2.535-.127 3.79-.364a22 22 0 002.177-.884c.91-.487 1.74-1.076 2.473-1.766a22.7 22.7 0 002.245-2.043c.567-.835.877-1.787.877-2.828v-1.5c0-1.021-.153-2.002-.44-2.946a12 12 0 00-1.316-1.486"></path></svg>
                    </div>
                    <div>
                        <p class="font-medium text-slate-900">{{ $user->referralCount() }} referrals</p>
                        <p class="text-xs text-slate-500">Successful referrals</p>
                        @if ($user->canClaimFreePromotion())
                            <p class="text-emerald-600 font-bold">🎉 1-week free promotion available!</p>
                        @elseif ($user->canClaimDoubleFreePromotion())
                            <p class="text-emerald-600 font-bold">🎉 2-week free promotion available!</p>
                        @elseif ($user->availablePromotionCredits() > 0)
                            <p class="text-emerald-400 text-sm">{{ $user->availablePromotionCredits() }} week(s) referral credit(s) available</p>
                        @endif
                    </div>
                </div>
            </div>

            @if ($listings->isEmpty())
                <div class="text-center py-16">
                    <p class="text-slate-500">You haven't posted any ads yet.</p>
                    <a href="{{ route('listings.create') }}" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors inline-block mt-4">Post Your First Ad</a>
                </div>
            @else
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    @foreach ($listings as $listing)
                        <div class="block group border border-slate-100 rounded-xl p-3 hover:border-emerald-200 transition-colors">
                            <a href="{{ route('listings.show', $listing) }}" class="block">
                                <div class="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden mb-2">
                                    <img src="{{ optional($listing->images)->first() ?? asset('logo.png') }}" class="w-full h-full object-cover">
                                </div>
                                <h4 class="font-bold text-sm text-slate-900 group-hover:text-emerald-600">{{ $listing->title }}</h4>
                                <span class="text-xs text-emerald-600 font-bold">₦{{ number_format($listing->price, 0) }}</span>
                            </a>
                        </div>

                        {{-- Promotion form for each listing --}}
                        <form method="POST" action="{{ route('listings.promote', $listing) }}" class="mt-2">
                            @csrf

                            {{-- Select promotion duration --}}
                            <div class="grid grid-cols-2 gap-2 mb-2">
                                {{-- 1-week option --}}
                                @if ($user->canClaimFreePromotion())
                                    <label class="border rounded border-emerald-400 p-1 cursor-pointer select-none">
                                        <input type="radio" name="weeks" value="1" required
                                               class="w-3 h-3 rounded-emerald-500 cursor-pointer">
                                        1 week free
                                    </label>
                                @else
                                    <label class="border rounded p-1 text-slate-300 cursor-not-allowed select-none">
                                        <input type="radio" name="weeks" value="1" disabled class="w-3 h-3">
                                        1 week
                                    </label>
                                @endif

                                {{-- 2-week option --}}
                                @if ($user->canClaimDoubleFreePromotion())
                                    <label class="border rounded border-emerald-400 p-1 cursor-pointer select-none">
                                        <input type="radio" name="weeks" value="2" required
                                               class="w-3 h-3 rounded-emerald-500 cursor-pointer">
                                        2 weeks free
                                    </label>
                                @else
                                    <label class="border rounded p-2 text-slate-300 cursor-not-allowed select-none">
                                        <input type="radio" name="weeks" value="2" disabled class="w-3 h-3">
                                        2 weeks
                                    </label>
                                @endif
                            </div>

                            <button type="submit"
                                    class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-1 rounded-sm transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                                Promote Ad
                            </button>
                        </form>
                    @endforeach
                </div>
                <div class="mt-6">{{ $listings->links() }}</div>
            @endif
        </div>
    </div>
@endsection