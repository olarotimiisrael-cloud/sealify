@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- HERO SECTION -->
    <div class="mb-8">
        <div class="flex flex-col sm:flex-row gap-4 items-center md:items-start">
            <div class="flex-1">
                <h1 class="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome to Sealify</h1>
                <p class="text-slate-600 text-sm">Buy & sell verified items & local services in Ogbomosoland</p>
            </div>
            <div class="w-full md:w-auto">
                <form method="GET" action="{{ route('listings.index') }}" class="w-full">
                    <div class="flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-200 bg-slate-50">
                        <svg class="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input name="q" value="{{ request('q') }}" placeholder="Search for products, services, or keywords…"
                               class="flex-1 rounded-xl border-0 bg-transparent py-2 text-sm outline-none placeholder-slate-400">
                        <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm">
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- MARKET PULSE / COMMUNITY / IMPRESSIONS / VOLUME STATS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white shadow-sm rounded-2xl border border-emerald-100 p-6 flex flex-col items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">Market Pulse</h3>
            <p class="text-3xl font-black text-emerald-600">Live</p>
            <p class="text-xs text-slate-500">Active Node Trading</p>
        </div>
        <div class="bg-white shadow-sm rounded-2xl border border-emerald-100 p-6 flex flex-col items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13 19l0-1M14 19l0-1M19 19l0-1"/></svg>
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">Community</h3>
            <p class="text-3xl font-black text-emerald-600">0</p>
            <p class="text-xs text-slate-500">Registered Members</p>
        </div>
        <div class="bg-white shadow-sm rounded-2xl border border-emerald-100 p-6 flex flex-col items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">Impressions</h3>
            <p class="text-3xl font-black text-emerald-600">0.0k</p>
            <p class="text-xs text-slate-500">Cumulative Ad Views</p>
        </div>
        <div class="bg-white shadow-sm rounded-2xl border border-emerald-100 p-6 flex flex-col items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 9h.01m-6.993 9h.01m6.993 9h.01M3 9V5a2 2 0 012-2h.32m-1.68-5.a2 2 0 012 1.23v.95m-.42 1.272a6 6 0 01-.84 1.255l-3.35 2.07a6 6 0 01-1.015.559l-.082.035l-.053-.079a6 6 0 01-1.13-.093l-3.35-2.07a6 6 0 01-.841-.559l-.082-.035a6 6 0 01-.053.079l-3.35 2.07M8.35 5.25a2.5 2.5 0 100 5h.01m0-5H.01c-.621 0-1.127.48-1.23.998m14.482 5.389a2.5 2.5 0 100 5h.01m0-5h-.01c.621 0 1.127-.48 1.23-.998m-6.787-5.389a2.5 2.5 0 100 5h.01m0 5H.01c-.621 0-1.127.48-1.23.998"/></svg>
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">Volume</h3>
            <p class="text-3xl font-black text-emerald-600">0</p>
            <p class="text-xs text-slate-500">Verified Classifieds</p>
        </div>
    </div>

    <!-- BROWSE CATEGORIES -->
    <div class="mb-8">
        <h2 class="text-2xl font-black text-slate-900 tracking-tight mb-6">Browse Categories</h2>
        <p class="text-slate-600 mb-8">Discover verified items & local services in Ogbomosoland</p>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            @foreach ($topCategories as $category)
                @php
                    $color = $category->color ?? 'emerald';
                    $iconMap = [
                        'smartphone' => '📱', 'car' => '🚗', 'home' => '🏠', 'shirt' => '👕',
                        'sofa' => '🛋️', 'wrench' => '🔧', 'briefcase' => '💼', 'laptop' => '💻',
                        'baby' => '👶', 'paw' => '🐾', 'leaf' => '🌿', 'factory' => '🏭',
                    ];
                    $icon = $iconMap[$category->icon] ?? '🏷️';
                @endphp
                <a href="{{ route('categories.show', $category->slug) }}"
                   class="flex flex-col items-center gap-2 p-3 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all text-xs font-medium">
                    <div class="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-lg border border-emerald-200">{{ $icon }}</div>
                    <span class="font-medium leading-tight">{{ $category->name }}</span>
                    <span class="text-emerald-400 text-xs mt-1">{{ $category->listings_count ?? 0 }}</span>
                </a>
            @endforeach
        </div>
    </div>

    <!-- NEIGHBORHOOD HUBS -->
    <div class="bg-white shadow-sm rounded-2xl border border-emerald-100 p-6 mb-10">
        <h3 class="text-xl font-black text-slate-900 tracking-tight mb-4">Neighborhood Hubs</h3>
        <p class="text-slate-600 text-sm mb-6">Filter by campus zones in Ogbomosoland</p>

        <div class="flex flex-wrap gap-2">
            @foreach ($neighborhoodHubs as $hub)
                <a href="{{ $hub['query'] ? route('listings.index', ['location' => $hub['query']]) : route('home') }}"
                   class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-900 transition-all">
                    <span class="w-3 h-3 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold">{{ strtoupper(substr($hub['label'], 0, 1)) }}</span>
                    <span class="text-emerald-700">{{ $hub['label'] }}</span>
                </a>
            @endforeach
            <a href="{{ route('home') }}"
               class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-900 text-sm font-medium border border-emerald-300 hover:bg-emerald-50 hover:text-emerald-950 transition-all">
                <span>All Ogbomoso</span>
            </a>
        </div>
    </div>

    <!-- MARKETPLACE FEED -->
    <div class="mb-10">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-black text-slate-900 tracking-tight">Marketplace Feed</h2>
                <p class="text-slate-600">{{ $listings->total() }} ads</p>
            </div>
            <div class="flex items-center gap-2 text-sm text-emerald-600">
                <button class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-3 py-1 rounded-full transition-all border border-emerald-200 hover:border-emerald-300">
                    Grid
                </button>
                <button class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-3 py-1 rounded-full transition-all border border-emerald-200 hover:border-emerald-300">
                    Map
                </button>
            </div>
        </div>

        @if ($listings->isEmpty())
            <div class="text-center py-16">
                <div class="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 text-4xl">📢</div>
                <h3 class="text-xl font-bold text-slate-900 mb-2">No ads found matching your criteria</h3>
                <p class="text-slate-600 mb-6 max-w-sm mx-auto">Try clearing your search keyword, category, or location filters to view all listings.</p>
                <a href="{{ route('listings.create') }}" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 text-sm">
                    Post Your First Ad →
                </a>
                <button class="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium px-6 py-3 rounded-xl mt-4 transition-all border border-emerald-200">
                    Reset All Filters
                </button>
            </div>
        @else
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach ($listings as $listing)
                    @php
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
                        $imageUrl = $listing->images->first()?->url ?? ($placeholderMap[$listing->title] ?? 'https://images.unsplash.com/photo-1560472355-6374e3fd260d?w=800&q=80');
                    @endphp
                    <a href="{{ route('listings.show', $listing) }}" class="block group">
                        <div class="aspect-[4/3] bg-gradient-to-br from-emerald-50 to-slate-50 rounded-2xl overflow-hidden mb-3 border border-emerald-100 group-hover:border-emerald-300 transition-colors relative">
                            <img src="{{ $imageUrl }}" alt="" title=""
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            <span class="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                                {{ $listing->condition ?? 'New' }}
                            </span>
                        </div>
                        <div class="px-1">
                            <h3 class="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors mb-1 line-clamp-1">{{ $listing->title }}</h3>
                            <div class="flex items-center gap-1.5 text-sm text-emerald-600 font-black mb-1">
                                ₦{{ number_format($listing->price, 0) }}
                            </div>
                            <p class="text-xs text-slate-500 line-clamp-1">{{ $listing->location ?? '' }}</p>
                        </div>
                    </a>
                @endforeach
            </div>
            <div class="mt-6 flex justify-center">
                <div class="flex gap-1">
                    {{ $listings->links() }}
                </div>
            </div>
        @endif
    </div>
</div>
@endsection
