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
        <div class="bg-white shadow-sm rounded-2xl border border-emerald-100 p-8 mb-8">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-3xl font-black text-slate-900 tracking-tight">All Listings</h2>
                    <p class="text-slate-600">{{ $listings->total() }} items found</p>
                </div>
                <a href="{{ route('listings.create') }}" class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                    + Post an Ad →
                </a>
            </div>

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
                <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 text-sm">
                    Filter
                </button>
            </form>

    @if ($listings->isEmpty())
        <div class="text-center py-16">
            <div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-4xl">📢</div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">No listings match your filters.</h3>
            <p class="text-slate-600 mb-6">Try adjusting your search or <a href="{{ route('listings.create') }}" class="text-emerald-600 font-black hover:underline">post an ad</a>.</p>
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
                                <img src="{{ $listing->images->first()?->url ?? ($placeholderMap[$listing->title] ?? 'https://images.unsplash.com/photo-1560472355-6374e3fd260d?w=800&q=80') }}" alt="{{ $listing->title }}"
                                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
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
