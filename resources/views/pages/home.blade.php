@extends('layouts.app')

@section('content')
@php
    $favoriteIds = auth()->check() ? auth()->user()->favoriteListings()->pluck('listings.id')->all() : [];
@endphp
<div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 space-y-6">

    <!-- NEIGHBORHOOD HUBS (location chips) -->
    <div class="bg-white shadow-sm rounded-2xl border border-emerald-100 p-5 mb-6">
        <h3 class="text-lg font-black text-slate-900 tracking-tight mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
            Neighborhood Hubs
        </h3>
        <p class="text-slate-600 text-sm mb-3">Filter by campus zones in Ogbomosoland</p>
        <div class="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
            @foreach ($neighborhoodHubs as $chip)
                <?php $isActive = request('location') === ($chip['query'] ?? null); ?>
                <a href="{{ route('listings.index', array_merge(request()->only(['q', 'category']), ($chip['query'] ?? null) ? ['location' => $chip['query']] : [])) }}"
                   class="inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-all
                          {{ $isActive ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300' }}">
                    <span class="w-2.5 h-2.5 rounded-full {{ $isActive ? 'bg-white' : 'bg-emerald-100' }} flex items-center justify-center text-[9px] font-bold">
                        {{ strtoupper(substr($chip['label'], 0, 1)) }}
                    </span>
                    <span>{{ $chip['label'] }}</span>
                </a>
            @endforeach
        </div>
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

    <!-- SPECIAL PROMOTIONS CAROUSEL -->
    @if ($promotedListings && $promotedListings->isNotEmpty())
    <div class="mb-6">
        <h2 class="text-lg font-black text-slate-900 tracking-tight mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Special Promotions
        </h2>
        <div class="promotion-carousel relative overflow-hidden rounded-3xl bg-white border border-emerald-100 shadow-2xl shadow-emerald-100/50 p-3 md:p-4 mb-3">
            <div class="promotion-track flex transition-transform duration-500 ease-in-out" id="promotionTrack">
                @foreach ($promotedListings as $promoListing)
                @php
                    $imageUrl = $promoListing->images->first()?->url ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
                    $promoDays = $promoListing->activePromotion?->ends_at?->diffForHumans() ?? '';
                @endphp
                <div class="promotion-slide shrink-0 w-full flex flex-col items-center justify-center p-4 md:p-6 cursor-pointer hover:scale-105 transition-transform duration-300 group/card" onclick="location.href='{{ route('listings.show', $promoListing) }}'">
                        <div class="w-full rounded-2xl overflow-hidden relative bg-white border border-emerald-100 shadow-xl group-hover:shadow-emerald-200/60 transition-shadow">
                            <span class="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Featured</span>
                            @include('partials.watermark-image', [
                                'src' => $imageUrl,
                                'alt' => $promoListing->title,
                                'class' => 'w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300',
                                'download' => false,
                            ])
                            <div class="absolute top-12 right-3 z-20" onclick="event.stopPropagation()">
                            @include('partials.favorite-button', ['listing' => $promoListing, 'isFav' => in_array($promoListing->id, $favoriteIds, true), 'formClass' => 'static'])
                        </div>
                        <div class="p-3 md:p-4 flex-1">
                            <h3 class="font-bold text-slate-900 text-base mb-1 line-clamp-1">{{ $promoListing->title }}</h3>
                            <div class="text-emerald-600 font-black text-lg mb-2">₦{{ number_format($promoListing->price, 0) }}</div>
                            <p class="text-xs text-slate-500 mt-1 line-clamp-1">{{ $promoListing->location }}</p>
                            @if ($promoListing->activePromotion)
                            <span class="inline-block text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                                Promoted {{ $promoDays }}
                            </span>
                            @endif
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </div>
    <script>
        // Auto-slide promotion carousel every 5 seconds
        const track = document.getElementById('promotionTrack');
        if (track) {
            const slides = track.querySelectorAll('.promotion-slide');
            const totalSlides = slides.length;
            if (totalSlides > 1) {
                let currentIndex = 0;
                let isPaused = false;

                function getSlideWidth() {
                    return slides[0].offsetWidth;
                }

                function goToSlide(index) {
                    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
                    const translateX = -currentIndex * getSlideWidth();
                    track.style.transform = `translateX(${translateX}px)`;
                }

                const intervalId = setInterval(() => {
                    if (isPaused) return;
                    currentIndex = (currentIndex + 1) % totalSlides;
                    goToSlide(currentIndex);
                }, 5000);

                // Pause on hover
                track.parentElement?.addEventListener('mouseenter', () => { isPaused = true; });
                track.parentElement?.addEventListener('mouseleave', () => { isPaused = false; });

                // Recompute on resize
                window.addEventListener('resize', () => goToSlide(currentIndex));

                goToSlide(0);
            }
        }
    </script>
    @endif

    <!-- MARKETPLACE FEEDS (grid only, map removed) -->
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-black text-slate-900 tracking-tight">Marketplace Feeds</h2>
            <div class="flex items-center gap-2">
                <button type="button" onclick="toggleLayout('grid')" id="gridBtn" class="p-2 rounded-lg bg-emerald-100 text-emerald-600 transition-colors" title="Grid View">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                </button>
                <button type="button" onclick="toggleLayout('list')" id="listBtn" class="p-2 rounded-lg bg-slate-100 text-slate-500 transition-colors" title="List View">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                </button>
                <a href="{{ route('listings.index') }}" class="text-xs text-emerald-600 font-bold uppercase tracking-widest">View all →</a>
            </div>
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
            @php $favoriteIds = auth()->check() ? auth()->user()->favoriteListings()->pluck('listings.id')->all() : []; @endphp
            <div id="listingsContainer" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 transition-all duration-300">
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
                        $imageUrl = $listing->images->first()?->url ?? ($placeholderMap[$listing->title] ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80');
                        $isFav = in_array($listing->id, $favoriteIds, true);
                    @endphp
                    <div class="relative group">
                        <a href="{{ route('listings.show', $listing) }}" class="block">
                            <div class="aspect-video relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group-hover:border-emerald-200 transition-all">
                                @include('partials.watermark-image', [
                                    'src' => $imageUrl,
                                    'alt' => $listing->title,
                                    'class' => 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
                                    'download' => false,
                                ])
                                <span class="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-20">
                                    {{ $listing->condition_label ?? 'New' }}
                                </span>
                            </div>
                        </a>
                        @include('partials.favorite-button', ['listing' => $listing, 'isFav' => $isFav, 'formClass' => 'absolute top-2 right-2 z-10'])
                        <a href="{{ route('listings.show', $listing) }}" class="block">
                            <h3 class="font-bold text-slate-900 text-sm mt-2 group-hover:text-emerald-600 transition-colors mb-1 line-clamp-1">{{ $listing->title }}</h3>
                            <div class="flex items-center gap-1 text-emerald-600 font-black text-sm mb-1">₦{{ number_format($listing->price, 0) }}</div>
                            <p class="text-[10px] text-slate-500 line-clamp-1">{{ $listing->location ?? '' }}</p>
                        </a>
                    </div>
                @endforeach
            </div>
        @endif

        @push('styles')
        <style>
            .fav-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:rgba(255,255,255,.9);backdrop-filter:blur(6px);color:#475569;box-shadow:0 2px 10px rgba(0,0,0,.15);transition:transform .18s ease,color .18s ease,background .18s ease;}
            .fav-btn:hover{transform:scale(1.12);color:#f43f5e;background:#fff;}
            .fav-btn:active{transform:scale(.9);}
            .fav-btn.is-fav{color:#f43f5e;background:#fff;}
            .fav-btn.is-fav svg{fill:#f43f5e;}
            .fav-btn.is-fav svg path{animation:favpop .4s ease;}
            @keyframes favpop{0%{transform:scale(1)}40%{transform:scale(1.4)}70%{transform:scale(.9)}100%{transform:scale(1)}}
            .dark .fav-btn{background:rgba(15,23,42,.8);color:#e2e8f0;}
            /* List view layout */
            #listingsContainer.list-view {
                grid-template-columns: 1fr !important;
            }
            #listingsContainer.list-view > div {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 1rem;
            }
            #listingsContainer.list-view > div > a:first-child {
                flex-shrink: 0;
                width: 120px;
            }
            #listingsContainer.list-view > div > a:first-child .aspect-video {
                aspect-ratio: 1 / 1;
            }
            #listingsContainer.list-view > div .fav-btn {
                position: static !important;
            }
        </style>
        @endpush
        @push('scripts')
        <script>
            function toggleLayout(mode) {
                const container = document.getElementById('listingsContainer');
                const gridBtn = document.getElementById('gridBtn');
                const listBtn = document.getElementById('listBtn');
                if (mode === 'list') {
                    container.classList.add('list-view');
                    gridBtn.classList.remove('bg-emerald-100', 'text-emerald-600');
                    gridBtn.classList.add('bg-slate-100', 'text-slate-500');
                    listBtn.classList.remove('bg-slate-100', 'text-slate-500');
                    listBtn.classList.add('bg-emerald-100', 'text-emerald-600');
                } else {
                    container.classList.remove('list-view');
                    listBtn.classList.remove('bg-emerald-100', 'text-emerald-600');
                    listBtn.classList.add('bg-slate-100', 'text-slate-500');
                    gridBtn.classList.remove('bg-slate-100', 'text-slate-500');
                    gridBtn.classList.add('bg-emerald-100', 'text-emerald-600');
                }
                localStorage.setItem('sealify-layout', mode);
            }
            // Restore saved layout
            const savedLayout = localStorage.getItem('sealify-layout');
            if (savedLayout === 'list') toggleLayout('list');
        </script>
        @endpush
    </div>
</div>
@endsection
