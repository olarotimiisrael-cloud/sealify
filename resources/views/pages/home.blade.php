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

    <!-- QUICK ACTION CHIPS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 max-w-lg lg:max-w-2xl mx-auto">
        <button type="button" onclick="openAllCategoriesModal()"
           class="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-white text-slate-700 text-sm font-medium shadow-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 114 0v11a2 2 0 11-4 0V6zm16 13a2 2 0 10-4 0v-4a2 2 0 114 0v4zm-6-5a2 2 0 10-4 0v3a2 2 0 004 0v-3zm0 0l4 4m0 0l-4-4m4 4V9h4v12"/></svg>
            All Categories
        </button>
        <a href="{{ route('listings.create') }}"
           class="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-300 hover:shadow-emerald-400 transition-all active:scale-95">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Post Ad
        </a>
    </div>

        <!-- RECOMMENDED (horizontal scroll mobile, grid tablet+) -->
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <h2 class="text-lg font-black text-slate-900 tracking-tight">Recommended for you</h2>
                <a href="{{ route('listings.index') }}" class="text-xs text-emerald-600 font-bold uppercase tracking-widest">View all →</a>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                @foreach ($topCategories->take(8) as $category)
                    @php
                        $iconMap = [
                            'smartphone' => '📱', 'car' => '🚗', 'home' => '🏠', 'shirt' => '👕',
                            'sofa' => '🛋️', 'wrench' => '🔧', 'briefcase' => '💼', 'laptop' => '💻',
                            'baby' => '👶', 'paw' => '🐾', 'leaf' => '🌿', 'factory' => '🏭',
                        ];
                        $icon = $iconMap[$category->icon] ?? '🏷️';
                    @endphp
                    <a href="{{ route('categories.show', $category->slug) }}"
                       class="flex-shrink-0 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col items-center gap-2 text-center">
                        <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-xl">{{ $icon }}</div>
                        <span class="text-xs font-bold text-slate-900 leading-tight line-clamp-2">{{ $category->name }}</span>
                        <span class="text-[10px] text-emerald-500 font-medium">{{ $category->listings_count ?? 0 }} items</span>
                    </a>
                @endforeach
            </div>
        </div>

    <!-- CATEGORY TILES (compact grid) -->
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-black text-slate-900 tracking-tight">All Categories</h2>
            <button type="button" onclick="openAllCategoriesModal()" class="text-xs text-emerald-600 font-bold uppercase tracking-widest">See All →</button>
        </div>
        <div class="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            @foreach ($topCategories->take(12) as $category)
                @php
                    $iconMap = [
                        'smartphone' => '📱', 'car' => '🚗', 'home' => '🏠', 'shirt' => '👕',
                        'sofa' => '🛋️', 'wrench' => '🔧', 'briefcase' => '💼', 'laptop' => '💻',
                        'baby' => '👶', 'paw' => '🐾', 'leaf' => '🌿', 'factory' => '🏭',
                    ];
                    $icon = $iconMap[$category->icon] ?? '🏷️';
                @endphp
                <a href="{{ route('categories.show', $category->slug) }}"
                   class="rounded-2xl border border-emerald-100 bg-white p-2.5 shadow-sm flex flex-col items-center gap-1 text-center transition-all hover:border-emerald-300 hover:shadow-md hover:scale-[1.02]">
                    <div class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-lg">{{ $icon }}</div>
                    <span class="text-[10px] font-bold text-slate-800 leading-tight line-clamp-2">{{ $category->name }}</span>
                </a>
            @endforeach
        </div>
    </div>

    <!-- FEATURED LISTINGS (compact grid) -->
    <div class="space-y-3">
        <div class="flex items-center justify-between">
            <h2 class="text-lg font-black text-slate-900 tracking-tight">Featured Listings</h2>
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

    <!-- ALL CATEGORIES MODAL SHEET -->
    <div id="allCategoriesModal" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onclick="closeAllCategoriesModal()"></div>
        <div class="fixed inset-0 flex items-end justify-center p-2 sm:p-0">
            <div class="relative w-full max-w-md max-h-[85vh] bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                <div class="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 id="modal-title" class="text-lg font-black text-slate-900">All Categories</h2>
                    <button onclick="closeAllCategoriesModal()" class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors" aria-label="Close">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-4">
                    @php
                        $parentCategories = $categories->where('parent_id', null)->sortBy('sort_order');
                        $childCategories = $categories->where('parent_id', '!=', null)->groupBy('parent_id');
                        $iconMap = [
                            'smartphone' => '📱', 'car' => '🚗', 'home' => '🏠', 'shirt' => '👕',
                            'sofa' => '🛋️', 'wrench' => '🔧', 'briefcase' => '💼', 'laptop' => '💻',
                            'baby' => '👶', 'paw' => '🐾', 'leaf' => '🌿', 'factory' => '🏭',
                        ];
                    @endphp
                    @foreach ($parentCategories as $parent)
                        <div class="mb-6">
                            <h3 class="text-sm font-black text-slate-900 mb-3 flex items-center gap-2 pb-1 border-b border-slate-100">
                                @php $pIcon = $iconMap[$parent->icon] ?? '🏷️'; @endphp
                                <span class="text-xl">{{ $pIcon }}</span>
                                {{ $parent->name }}
                                <span class="text-xs font-normal text-slate-400 ml-auto">{{ ($parent->listings_count ?? 0) }} listings</span>
                            </h3>
                            @if ($childCategories->has($parent->id))
                                <div class="grid grid-cols-3 gap-1">
                                    @foreach ($childCategories[$parent->id] as $child)
                                        <a href="{{ route('categories.show', $child->slug) }}"
                                           class="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-white text-slate-700 text-sm font-medium shadow-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                                           onclick="closeAllCategoriesModal()">
                                            {{ $child->name }}
                                        </a>
                                    @endforeach
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

</div>
@push('styles')
<style>
    @keyframes slide-up {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .animate-slide-up { animation: slide-up 0.3s ease-out; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
</style>
@endpush
@push('scripts')
<script>
    function openAllCategoriesModal() {
        const modal = document.getElementById('allCategoriesModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    function closeAllCategoriesModal() {
        const modal = document.getElementById('allCategoriesModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
    document.getElementById('allCategoriesModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeAllCategoriesModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeAllCategoriesModal();
    });
</script>
@endpush
@endsection
