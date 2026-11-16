@extends('layouts.app')

@section('content')
<?php
    $iconMap = [
        'smartphone' => '📱', 'car' => '🚗', 'home' => '🏠', 'shirt' => '👕',
        'sofa' => '🛋️', 'wrench' => '🔧', 'briefcase' => '💼', 'laptop' => '💻',
        'baby' => '👶', 'paw' => '🐾', 'leaf' => '🌿', 'factory' => '🏭',
    ];
?>

<div class="max-w-md mx-auto px-3 sm:px-4 space-y-6">

    <div class="text-center">
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">All Categories</h1>
        <p class="text-slate-600 text-sm mt-1">Find what you're looking for in Ogbomosoland and Oyo State.</p>
    </div>

    <div class="space-y-3">
        @foreach ($categories as $parent)
            @php
                $pIcon = $iconMap[$parent->icon] ?? '🏷️';
                $color = $parent->color ?? 'emerald';
            @endphp
            <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div class="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
                    <div class="w-9 h-9 rounded-xl bg-{{ $color }}-50 flex items-center justify-center border border-{{ $color }}-100 text-xl">{{ $pIcon }}</div>
                    <h2 class="text-base font-black text-slate-900 flex-1">{{ $parent->name }}</h2>
                    <span class="text-xs text-{{ $color }}-600 font-bold">{{ $parent->listings_count ?? 0 }} items</span>
                </div>
                @if ($parent->children->count())
                    <div class="divide-y divide-slate-50 px-4 pb-3">
                        @foreach ($parent->children as $child)
                            @php $cIcon = $iconMap[$child->icon] ?? '🏷️'; @endphp
                            <a href="{{ route('categories.show', $child->slug) }}"
                               class="flex items-center gap-3 px-4 py-2.5 text-slate-700 font-medium text-sm hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 border-l-2 border-transparent hover:border-emerald-50 transition-all rounded-r-xl group">
                                <span class="text-lg group-hover:text-emerald-500 transition-colors">{{ $cIcon }}</span>
                                <span class="flex-1">{{ $child->name }}</span>
                                <span class="text-xs text-slate-400 font-medium">{{ $child->listings_count ?? 0 }} items</span>
                                <svg class="w-3 h-3 text-slate-400 shrink-0 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>
                        @endforeach
                    </div>
                @else
                    <a href="{{ route('categories.show', $parent->slug) }}"
                       class="flex items-center gap-3 px-4 py-3 text-slate-700 font-medium text-sm hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                        <span class="text-lg group-hover:text-emerald-500 transition-colors">{{ $pIcon }}</span>
                        <span class="flex-1">Browse {{ $parent->name }}</span>
                        <span class="text-xs text-slate-400 font-medium">{{ $parent->listings_count ?? 0 }} items</span>
                    </a>
                @endif
            </div>
        @endforeach
    </div>

    @if ($categories->where('listings_count', '>', 0)->isEmpty())
        <div class="text-center py-10">
            <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 text-2xl">🏷️</div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">No categories yet.</h3>
            <p class="text-slate-600 text-sm mb-6">Be the first to <a href="{{ route('listings.create') }}" class="text-emerald-600 font-black hover:underline">post an ad</a>.</p>
        </div>
    @endif

</div>
@endsection
