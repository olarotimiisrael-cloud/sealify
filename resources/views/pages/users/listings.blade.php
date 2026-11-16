@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Listings by {{ $user->name ?? 'User' }}</h2>
            @if ($listings->isEmpty())
                <div class="text-center py-16">
                    <p class="text-slate-500">No listings.</p>
                </div>
            @else
                @php $favoriteIds = auth()->check() ? auth()->user()->favoriteListings()->pluck('listings.id')->all() : []; @endphp
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    @foreach ($listings as $listing)
                        @php $isFav = in_array($listing->id, $favoriteIds, true); @endphp
                        <div class="relative group border border-slate-100 rounded-xl p-3 hover:border-emerald-200 transition-colors">
                            <a href="{{ route('listings.show', $listing) }}" class="block">
                                <div class="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden mb-2">
                                    @include('partials.watermark-image', [
                                        'src' => optional($listing->images)->first() ?? asset('logo.png'),
                                        'alt' => $listing->title,
                                        'class' => 'w-full h-full object-cover',
                                    ])
                                </div>
                                <h4 class="font-bold text-sm text-slate-900 group-hover:text-emerald-600">{{ $listing->title }}</h4>
                                <span class="text-xs text-emerald-600 font-bold">₦{{ number_format($listing->price, 0) }}</span>
                            </a>
                            @include('partials.favorite-button', ['listing' => $listing, 'isFav' => $isFav])
                        </div>
                    @endforeach
                </div>
                {{ $listings->links() }}
            @endif
        </div>
    </div>
@endsection
