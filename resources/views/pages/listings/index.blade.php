@extends('layouts.app')

@section('content')
<?php
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
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- NEIGHBORHOOD HUBS -->
    <div class="bg-white shadow-sm rounded-2xl border border-emerald-100 p-6 mb-8">
        <h3 class="text-xl font-black text-slate-900 tracking-tight mb-4">Neighborhood Hubs</h3>
        <p class="text-slate-600 text-sm mb-6">Filter by campus zones in Ogbomosoland</p>

        <div class="flex flex-wrap gap-2">
            @foreach ($neighborhoodHubs as $hub)
                <a href="{{ $hub['query'] ? route('listings.index', ['location' => $hub['query'], 'q' => request('q'), 'category' => request('category')]) : route('listings.index', ['q' => request('q'), 'category' => request('category')]) }}"
                   class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-900 transition-all">
                    <span class="w-3 h-3 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold">{{ strtoupper(substr($hub['label'], 0, 1)) }}</span>
                    <span class="text-emerald-700">{{ $hub['label'] }}</span>
                </a>
            @endforeach
        </div>
    </div>

    <!-- MARKETPLACE FEED -->
    <div class="mb-10">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
                <h2 class="text-2xl font-black text-slate-900 tracking-tight">Marketplace Feed</h2>
                <p class="text-slate-600 text-sm mt-1">{{ $listings->total() }} {{ Str::plural('ad', $listings->total()) }} available</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button type="button" class="inline-flex items-center gap-1.5 whitespace-nowrap bg-white hover:bg-emerald-50 text-emerald-700 font-semibold px-3 py-2 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-all text-xs">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                    <span>Search Alerts</span>
                </button>
                <button type="button" class="inline-flex items-center gap-1.5 whitespace-nowrap bg-white hover:bg-emerald-50 text-emerald-700 font-semibold px-3 py-2 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-all text-xs">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    <span>Compare (0)</span>
                </button>
                <button type="button" class="inline-flex items-center gap-1.5 whitespace-nowrap bg-white hover:bg-emerald-50 text-emerald-700 font-semibold px-3 py-2 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-all text-xs">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                    <span>Filters</span>
                </button>
                <div class="inline-flex items-center rounded-lg border border-emerald-200 overflow-hidden bg-white">
                    <button type="button" class="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-emerald-500 text-white">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                        <span>Grid</span>
                    </button>
                    <button type="button" class="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                        <span>Map</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- SEARCH FILTERS BAR -->
        <form method="GET" action="{{ route('listings.index') }}" class="flex flex-col sm:flex-row gap-4 mb-8 items-end">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Search</label>
                <input name="q" value="{{ request('q') }}" placeholder="Search listings…"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>
            <div class="min-w-[200px]">
                <label class="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Category</label>
                <select name="category" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
                    <option value="">All Categories</option>
                    @foreach ($categories as $category)
                        <option value="{{ $category->id }}" {{ request('category') == $category->id ? 'selected' : '' }}>{{ $category->name }}</option>
                    @endforeach
                </select>
            </div>
            <div class="min-w-[200px]">
                <label class="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Location</label>
                <input name="location" value="{{ request('location') }}" placeholder="Location…"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            </div>
            <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 text-sm">
                Filter
            </button>
        </form>

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
        <!-- Non-aggressive AdSense Ad - Listings Page Top -->
        @if($settings && $settings->adsense_enabled && $settings->adsense_placement_listing_top && $settings->adsense_client_id)
            <div class="mb-6 flex justify-center">
                <ins class="adsbygoogle" style="display:block" data-ad-client="{{ $settings->adsense_client_id }}" data-ad-slot="{{ $settings->adsense_slot_listing }}" data-ad-format="auto" data-full-width-responsive="true"></ins>
                <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            </div>
        @endif
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach ($listings as $listing)
                        <a href="{{ route('listings.show', $listing) }}" class="block group">
                            <div class="aspect-video bg-gradient-to-br from-emerald-50 to-slate-50 rounded-2xl overflow-hidden mb-3 border border-emerald-100 group-hover:border-emerald-300 transition-colors relative">
                                <img src="{{ $listing->images->first()?->url ?? ($placeholderMap[$listing->title] ?? 'https://images.unsplash.com/photo-1560472355-6374e3fd260d?w=800&q=80') }}" alt="" title="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                                <span class="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                                    {{ $listing->condition ?? 'New' }}
                                </span>
                            </div>
                            <h3 class="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors mb-1">{{ $listing->title }}</h3>
                            <div class="flex items-center gap-2 text-sm text-emerald-600 font-black">
                                ₦{{ number_format($listing->price, 0) }}
                            </div>
                            <p class="text-xs text-slate-500 line-clamp-2 mt-1">{{ $listing->location ?? '' }}</p>
                            <span class="text-xs text-slate-400">{{ $listing->user->name ?? 'Seller' }}</span>
                        </a>
                    @endforeach
                </div>
                <div class="mt-8 flex justify-center">
                    <div class="flex gap-1">
                        {{ $listings->links() }}
                    </div>
                </div>
        @endif
    </div>
</div>
@endsection
