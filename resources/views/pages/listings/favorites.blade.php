@extends('layouts.app')

@section('content')
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {{-- Header --}}
        <div class="relative overflow-hidden rounded-3xl mb-8 p-8 sm:p-10 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 shadow-xl shadow-rose-200">
            <div class="absolute inset-0 opacity-20 pointer-events-none">
                <svg class="absolute -right-6 -top-6 w-40 h-40 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                <svg class="absolute right-24 bottom-0 w-24 h-24 text-white/70" viewBox="0 0 24 24" fill="currentColor"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </div>
            <div class="relative flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </div>
                <div>
                    <h1 class="text-2xl sm:text-3xl font-black text-white">Your Loved Listings</h1>
                    <p class="text-white/90 text-sm mt-1">Everything you hearted from the marketplace — saved for later review and purchase.</p>
                </div>
            </div>
        </div>

        @if ($listings->isEmpty())
            <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-12 text-center">
                <div class="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-5">
                    <svg class="w-9 h-9 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-1">No favorites yet</h3>
                <p class="text-slate-500 mb-6 max-w-sm mx-auto">Tap the heart on any listing in the marketplace feed to save it here.</p>
                <a href="{{ route('listings.index') }}" class="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-emerald-200">Browse Marketplace</a>
            </div>
        @else
            <div class="flex items-center justify-between mb-4">
                <p class="text-sm text-slate-600"><strong class="text-slate-900">{{ $listings->total() }}</strong> saved {{ \Illuminate\Support\Str::plural('listing', $listings->total()) }}</p>
                <a href="{{ route('listings.index') }}" class="text-sm text-emerald-600 font-bold hover:underline">Find more →</a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach ($listings as $listing)
                    <div class="relative group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                        <a href="{{ route('listings.show', $listing) }}" class="block">
                            <div class="aspect-video bg-slate-100 overflow-hidden relative">
                                <img src="{{ optional($listing->images)->first()?->url ?? asset('logo.png') }}" alt="{{ $listing->title }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                                @if ($listing->condition)
                                    <span class="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow">{{ $listing->condition }}</span>
                                @endif
                            </div>
                        </a>

                        {{-- Unfavorite (filled heart) --}}
                        <form method="POST" action="{{ route('listings.favorite', $listing) }}" class="absolute top-3 right-3 z-10">
                            @csrf
                            <button type="submit" class="fav-btn is-fav" title="Remove from favorites" aria-label="Remove from favorites" aria-pressed="true">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                            </button>
                        </form>

                        <div class="p-4">
                            <a href="{{ route('listings.show', $listing) }}" class="block">
                                <h3 class="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{{ $listing->title }}</h3>
                                <div class="flex items-center gap-1 text-emerald-600 font-black mt-1">₦{{ number_format($listing->price, 0) }}</div>
                                @if ($listing->location)
                                    <p class="text-xs text-slate-500 mt-1 line-clamp-1">{{ $listing->location }}</p>
                                @endif
                            </a>
                            <div class="mt-3 flex items-center gap-2">
                                <a href="{{ route('listings.show', $listing) }}" class="flex-1 text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-lg transition-colors">View &amp; Buy</a>
                                <a href="{{ route('messages.index') }}" class="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-lg transition-colors">Message Seller</a>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
            <div class="mt-8">{{ $listings->links() }}</div>
        @endif
    </div>

    @push('styles')
    <style>
        .fav-btn{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:9999px;background:rgba(255,255,255,.92);backdrop-filter:blur(6px);color:#f43f5e;box-shadow:0 2px 10px rgba(0,0,0,.15);transition:transform .18s ease;}
        .fav-btn:hover{transform:scale(1.12);}
        .fav-btn:active{transform:scale(.9);}
        .fav-btn.is-fav svg{fill:#f43f5e;}
        .fav-btn.is-fav svg path{animation:favpop .4s ease;}
        @keyframes favpop{0%{transform:scale(1)}40%{transform:scale(1.4)}70%{transform:scale(.9)}100%{transform:scale(1)}}
        .dark .fav-btn{background:rgba(15,23,42,.85);}
    </style>
    @endpush
@endsection
