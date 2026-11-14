@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8 mb-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900">Business Profile</h2>
                    <p class="text-slate-600">Manage your business identity on Sealify.</p>
                </div>
                <a href="{{ route('profile.show') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Profile</a>
            </div>

            @if (session('status'))
                <div class="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">
                    {{ session('status') }}
                </div>
            @endif

            @if ($errors->any())
                <div class="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
                    <ul class="list-disc list-inside space-y-1">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- Business Status Badge -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full
                        {{ $user->is_verified_seller ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700' }}
                        text-xs font-bold">
                        {{ $user->is_verified_seller ? '✓ Verified Business' : '⚠ Unverified Business' }}
                    </span>
                </div>
            </div>

            <form method="POST" action="{{ route('business.profile.update') }}" class="space-y-6">
                @csrf

                <div>
                    <label for="business_name" class="block text-sm font-medium text-slate-700">Business Name</label>
                    <input id="business_name" name="business_name" type="text" required
                           value="{{ old('business_name', $user->business_name) }}"
                           class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label for="business_category" class="block text-sm font-medium text-slate-700">Business Category</label>
                        <input id="business_category" name="business_category" type="text"
                               value="{{ old('business_category', $user->business_category) }}"
                               class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label for="cac_number" class="block text-sm font-medium text-slate-700">CAC Registration Number</label>
                        <input id="cac_number" name="cac_number" type="text"
                               value="{{ old('cac_number', $user->cac_number) }}"
                               class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <p class="text-xs text-slate-400 mt-1">Corporate Affairs Commission registration number (optional)</p>
                    </div>
                </div>

                <div>
                    <label for="business_address" class="block text-sm font-medium text-slate-700">Business Address</label>
                    <input id="business_address" name="business_address" type="text" required
                           value="{{ old('business_address', $user->business_address) }}"
                           class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div>
                    <label for="business_hours" class="block text-sm font-medium text-slate-700">Business Hours</label>
                    <input id="business_hours" name="business_hours" type="text"
                           value="{{ old('business_hours', $user->business_hours) }}"
                           class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                           placeholder="e.g. Mon–Fri 9AM–6PM">
                    <p class="text-xs text-slate-400 mt-1">Your operating hours (optional)</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label for="website_url" class="block text-sm font-medium text-slate-700">Website URL</label>
                        <input id="website_url" name="website_url" type="url"
                               value="{{ old('website_url', $user->website_url) }}"
                               class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label for="whatsapp_number" class="block text-sm font-medium text-slate-700">WhatsApp Number</label>
                        <input id="whatsapp_number" name="whatsapp_number" type="tel"
                               value="{{ old('whatsapp_number', $user->whatsapp_number) }}"
                               class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label for="instagram_handle" class="block text-sm font-medium text-slate-700">Instagram Handle</label>
                        <input id="instagram_handle" name="instagram_handle" type="text"
                               value="{{ old('instagram_handle', $user->instagram_handle) }}"
                               class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                               placeholder="@username">
                    </div>
                    <div>
                        <label for="twitter_handle" class="block text-sm font-medium text-slate-700">Twitter Handle</label>
                        <input id="twitter_handle" name="twitter_handle" type="text"
                               value="{{ old('twitter_handle', $user->twitter_handle) }}"
                               class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                               placeholder="@username">
                    </div>
                </div>

                <button type="submit"
                        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-colors">
                    Save Business Profile
                </button>
            </form>

            <!-- Your Listings -->
            @if ($user->listings->count() > 0)
                <div class="mt-12">
                    <h3 class="text-xl font-bold text-slate-900 mb-4">Your Listings ({{ $user->listings->count() }})</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        @foreach ($user->listings->take(6) as $listing)
                            <a href="{{ route('listings.show', $listing) }}" class="block group border border-slate-100 rounded-xl p-3 hover:border-emerald-200 transition-colors">
                                <div class="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden mb-2">
                                    <img src="{{ $listing->images->first()?->url ?? asset('logo.png') }}" class="w-full h-full object-cover">
                                </div>
                                <h4 class="font-bold text-sm text-slate-900 group-hover:text-emerald-600">{{ $listing->title }}</h4>
                                <span class="text-xs text-emerald-600 font-bold">₦{{ number_format($listing->price, 0) }}</span>
                            </a>
                        @endforeach
                    </div>
                    @if ($user->listings->count() > 6)
                        <div class="mt-4 text-center">
                            <a href="{{ route('listings.my') }}" class="text-sm text-emerald-600 font-bold hover:underline">View all {{ $user->listings->count() }} listings →</a>
                        </div>
                    @endif
                </div>
            @endif
        </div>
    </div>
@endsection
