@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <!-- HERO SECTION -->
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 p-8 mb-10 shadow-2xl shadow-emerald-200/50">
        <div class="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 rounded-3xl blur opacity-20"></div>
        <div class="relative z-10 max-w-4xl mx-auto text-center">
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold tracking-wider uppercase border border-white/30 mb-4">
                🏪 Verified Marketplace
            </span>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
                Buy &amp; Sell Anything<br>in Ogbomosoland
            </h1>
            <p class="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                Nigeria's most trusted local marketplace. Find cars, electronics, real estate, fashion, and more — with verified sellers and safe meetup zones.
            </p>

            <!-- SEARCH BAR -->
            <form method="GET" action="{{ route('listings.index') }}" class="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <div class="relative flex-1">
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input name="q" type="text" placeholder="Search for anything… (e.g. iPhone, car, laptop)"
                           value="{{ request('q') }}"
                           class="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-white/60 focus:bg-white/20 focus:ring-2 focus:ring-white transition-all backdrop-blur-sm text-sm">
                </div>
                <button type="submit"
                        class="bg-white text-emerald-600 font-black px-8 py-4 rounded-2xl text-base hover:bg-emerald-50 transition-all shadow-lg shadow-white/20">
                    Search
                </button>
            </form>

            <!-- QUICK CATEGORY CHIPS -->
            <div class="flex flex-wrap justify-center gap-2 mt-8">
                @php
                    $topCategories = $categories->take(8);
                    $iconMap = [
                        'leaf' => '🌿', 'baby' => '👶', 'factory' => '🏭', 'laptop' => '💻',
                        'shirt' => '👕', 'sofa' => '🛋️', 'briefcase' => '💼', 'paw' => '🐾',
                        'smartphone' => '📱', 'home' => '🏠', 'wrench' => '🔧', 'car' => '🚗',
                    ];
                @endphp
                @foreach ($topCategories as $category)
                    <?php $icon = $iconMap[$category->icon] ?? '🏷️'; ?>
                    <a href="{{ route('categories.show', $category->slug) }}"
                       class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm group">
                        <span class="text-sm group-hover:scale-110 transition-transform">{{ $icon }}</span>
                        {{ \Illuminate\Support\Str::limit($category->name, 12) }}
                    </a>
                @endforeach
                <button onclick="document.getElementById('all-categories').classList.toggle('hidden')"
                        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/20 transition-all backdrop-blur-sm">
                    <span>All Categories</span>
                    <svg class="w-4 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
            </div>
        </div>

        <!-- HIDDEN ALL CATEGORIES PANEL -->
        <div id="all-categories" class="hidden mt-8 pt-8 border-t border-white/20 relative z-10">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-white">All Categories</h3>
                <button onclick="document.getElementById('all-categories').classList.add('hidden')"
                        class="text-white/70 hover:text-white text-sm font-medium">
                    Close ×
                </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                @foreach ($categories as $category)
                    <?php $icon = $iconMap[$category->icon] ?? '🏷️'; ?>
                    <a href="{{ route('categories.show', $category->slug) }}"
                       class="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/30 transition-all text-sm group">
                        <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform border border-white/10">
                            {{ $icon }}
                        </div>
                        <span class="font-medium leading-tight group-hover:text-white">{{ \Illuminate\Support\Str::limit($category->name, 14) }}</span>
                    </a>
                @endforeach
            </div>
        </div>
    </section>

    <!-- TRUST BADGES -->
    <div class="flex flex-wrap justify-center gap-8 mb-10 opacity-90">
        <div class="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50/50 px-6 py-3 rounded-xl border border-slate-100">
            <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
            Verified Sellers
        </div>
        <div class="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50/50 px-6 py-3 rounded-xl border border-slate-100">
            <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">📍</span>
            Safe Meetup Zones
        </div>
        <div class="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50/50 px-6 py-3 rounded-xl border border-slate-100">
            <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">🔒</span>
            Secure Chat
        </div>
        <div class="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50/50 px-6 py-3 rounded-xl border border-slate-100">
            <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">⚡</span>
            Fast Posting
        </div>
    </div>

    <!-- Non-aggressive AdSense Ad - Home Page Top -->
    @if($settings && $settings->adsense_enabled && $settings->adsense_placement_home_top && $settings->adsense_client_id)
        <div class="mb-8 flex justify-center">
            <ins class="adsbygoogle" style="display:block" data-ad-client="{{ $settings->adsense_client_id }}" data-ad-slot="{{ $settings->adsense_slot_home }}" data-ad-format="auto" data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>
    @endif

    <!-- FEATURED LISTINGS -->
    <div class="mb-10">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-2xl font-black text-slate-900 tracking-tight">Featured Listings</h2>
                <p class="text-slate-600">Latest ads from verified sellers</p>
            </div>
            <a href="{{ route('listings.index') }}" class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 text-sm">
                Browse All →
            </a>
        </div>

        @if ($listings->isEmpty())
            <div class="text-center py-20">
                <div class="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 text-4xl">📢</div>
                <h3 class="text-xl font-bold text-slate-900 mb-2">No listings yet.</h3>
                <p class="text-slate-600 mb-6 max-w-sm mx-auto">Be the first to share what you're selling.</p>
                <a href="{{ route('listings.create') }}" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                    Post Your First Ad →
                </a>
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
                            <img src="{{ $imageUrl }}" alt="{{ $listing->title }}"
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            <span class="absolute top-3 left-3 bg-white text-emerald-600 text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                                {{ $listing->condition ?? 'New' }}
                            </span>
                            @if ($listing->user->is_verified_seller)
                                <span class="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                    Verified
                                </span>
                            @endif
                        </div>
                        <div class="px-1">
                            <h3 class="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors mb-1 line-clamp-1">{{ $listing->title }}</h3>
                            <div class="flex items-center gap-1.5 text-sm text-emerald-600 font-black mb-1">
                                ₦{{ number_format($listing->price, 0) }}
                            </div>
                            <p class="text-xs text-slate-500 line-clamp-1">{{ $listing->location ?? $listing->category->name ?? '' }}</p>
                        </div>
                    </a>
                @endforeach
            </div>
            <div class="mt-8 flex justify-center">
                {{ $listings->links() }}
            </div>
        @endif
    </div>
</div>
@endsection
