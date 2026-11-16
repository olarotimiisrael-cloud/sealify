@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-5 lg:space-y-6">

    <!-- LOCATION CHIP -->
    <div class="mt-2 flex items-center justify-center gap-2">
        <button class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
            <span>Ogbomosoland</span>
            <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
    </div>

    <!-- SEARCH BAR (prominent, centered) -->
    <div class="flex justify-center">
    <form method="GET" action="{{ route('listings.index') }}" class="relative w-full max-w-lg lg:max-w-xl">
        <div class="flex items-center gap-2 px-3 py-2 rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <svg class="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input name="q" value="{{ request('q') }}" placeholder="What are you looking for? (e.g. iPhone, Toyota, Ankara)"
                   class="flex-1 rounded-xl border-0 bg-transparent py-2 text-sm outline-none placeholder-slate-400">
            <button type="submit" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 text-sm active:scale-95">
                Search
            </button>
        </div>
    </form>
    </div>

    <!-- QUICK ACTION -->
    <div class="flex justify-center">
        <a href="{{ route('listings.create') }}"
           class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-300 hover:shadow-emerald-400 hover:bg-emerald-600 transition-all active:scale-95">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Post Ad
        </a>
    </div>

    <!-- MARKETPLACE FEEDS (compact grid) -->
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-black text-slate-900 tracking-tight">Marketplace Feeds</h2>
            <a href="{{ route('listings.index') }}" class="text-xs text-emerald-600 font-bold uppercase tracking-widest">View all →</a>
        </div>

        @if ($listings->isEmpty())
            <div class="text-center py-10">
                <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 text-2xl">📢</div>
                <p class="text-xs text-slate-600">No listings yet. Be the first to post an ad.</p>
                <a href="{{ route('listings.create') }}" class="mt-3 inline-block bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-md shadow-emerald-200 hover:bg-emerald-600">
                    Post Your First Ad →
                </a>
            </div>
        @else
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                @foreach ($listings as $listing)
                    @php
                        $placeholderMap = [
                            'iPhone' => 'https://images.unsplash.com/photo-1575745234279-3a74b6e0e514?w=400&q=80',
                            'Toyota' => 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80',
                            'MacBook' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
                            'Dining' => 'https://images.unsplash.com/photo-1533770270245-0e4cbf2565d3?w=400&q=80',
                            'Ankara' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
                            'Samsung' => 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80',
                            'Bajaj' => 'https://images.unsplash.com/photo-1558981806-ec537fa0bca3?w=400&q=80',
                            'LG' => 'https://images.unsplash.com/photo-1601813177118-5de6f5222e1b?w=400&q=80',
                        ];
                        $imageUrl = $listing->images->first()?->url ?? ($placeholderMap[$listing->title] ?? 'https://images.unsplash.com/photo-1560472355-6374e3fd260d?w=400&q=80');
                    @endphp
                    <a href="{{ route('listings.show', $listing) }}" class="block group">
                        <div class="aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group-hover:border-emerald-200 transition-all">
                            <img src="{{ $imageUrl }}" alt=""
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            <span class="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                {{ $listing->condition ?? 'New' }}
                            </span>
                        </div>
                        <h3 class="font-bold text-slate-900 text-sm mt-2 group-hover:text-emerald-600 transition-colors mb-1 line-clamp-1">{{ $listing->title }}</h3>
                        <div class="flex items-center gap-1 text-emerald-600 font-black text-sm mb-1">₦{{ number_format($listing->price, 0) }}</div>
                        <p class="text-[10px] text-slate-500 line-clamp-1">{{ $listing->location ?? '' }}</p>
                    </a>
                @endforeach
            </div>
        @endif
    </div>
</div>
@endsection
