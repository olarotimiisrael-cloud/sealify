@extends('layouts.app')

@section('content')
<?php
    $iconMap = [
        'smartphone' => '📱', 'car' => '🚗', 'home' => '🏠', 'shirt' => '👕',
        'sofa' => '🛋️', 'wrench' => '🔧', 'briefcase' => '💼', 'laptop' => '💻',
        'baby' => '👶', 'paw' => '🐾', 'leaf' => '🌿', 'factory' => '🏭',
    ];
    $icon = $iconMap[$category->icon] ?? '🏷️';
    $color = $category->color ?? 'emerald';
    
    $placeholderMap = [
        'iPhone' => 'https://images.unsplash.com/photo-1575745234279-3a74b6e0e514?w=800&q=80',
        'Toyota' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
        'MacBook' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
        'Dining' => 'https://images.unsplash.com/photo-1533770270245-0e4cbf2565d3?w=800&q=80',
        'Ankara' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
        'Samsung' => 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
        'Bajaj' => 'https://images.unsplash.com/photo-1558981806-ec537fa0bca3?w=800&q=80',
        'LG' => 'https://images.unsplash.com/photo-1601813177118-5de6f5222e1b?w=800&q=80',
    ];
?>
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow-sm rounded-2xl border border-{{ $color }}-100 p-8 mb-6">
        <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-2xl bg-{{ $color }}-100 flex items-center justify-center text-2xl border border-{{ $color }}-200">
                {{ $icon }}
            </div>
            <div>
                <h1 class="text-3xl font-black text-slate-900 mb-1">{{ $category->name }}</h1>
                <p class="text-slate-600 text-sm">Browse {{ $category->name }} listings in Ogbomosoland and Oyo State.</p>
            </div>
        </div>
    </div>

    @if ($listings->isEmpty())
        <div class="text-center py-16">
            <div class="w-20 h-20 rounded-full bg-{{ $color }}-100 flex items-center justify-center mx-auto mb-4 text-4xl">{{ $icon }}</div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">No {{ $category->name }} listings yet.</h3>
            <p class="text-slate-600 mb-6">Be the first to <a href="{{ route('listings.create') }}" class="text-{{ $color }}-600 font-black hover:underline">post an ad</a>.</p>
        </div>
    @else
        @php $favoriteIds = auth()->check() ? auth()->user()->favoriteListings()->pluck('listings.id')->all() : []; @endphp
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @foreach ($listings as $listing)
                @php
                    $listingImageUrl = $listing->images->first()?->url ?? ($placeholderMap[$listing->title] ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80');
                    $isFav = in_array($listing->id, $favoriteIds, true);
                @endphp
                <div class="relative group">
                    <a href="{{ route('listings.show', $listing) }}" class="block">
                        <div class="aspect-video bg-gradient-to-br from-{{ $color }}-50 to-slate-50 rounded-2xl overflow-hidden mb-3 border border-{{ $color }}-100 group-hover:border-{{ $color }}-300 transition-colors relative">
                            <img src="{{ $listingImageUrl }}" alt="{{ $listing->title }}"
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            <span class="absolute top-3 left-3 bg-{{ $color }}-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                                {{ $listing->condition ?? 'New' }}
                            </span>
                        </div>
                    </a>
                    @include('partials.favorite-button', ['listing' => $listing, 'isFav' => $isFav])
                    <a href="{{ route('listings.show', $listing) }}" class="block">
                        <h3 class="font-bold text-slate-900 text-sm group-hover:text-{{ $color }}-600 transition-colors mb-1">{{ $listing->title }}</h3>
                        <div class="flex items-center gap-2 text-sm text-{{ $color }}-600 font-black">
                            ₦{{ number_format($listing->price, 0) }}
                        </div>
                        <p class="text-xs text-slate-500 line-clamp-2 mt-1">{{ $listing->location ?? '' }}</p>
                    </a>
                </div>
            @endforeach
        </div>
        <div class="mt-6 flex justify-center">
            {{ $listings->links() }}
        </div>
    @endif
</div>
@endsection
