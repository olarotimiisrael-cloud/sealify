@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8 mb-6">
<div class="flex items-center justify-between mb-6">
                <div>
                    <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold mb-3">
                        {{ strtoupper(substr($user->name ?? 'U', 0, 1)) }}
                    </div>
                    <h2 class="text-2xl font-bold text-slate-900">{{ $user->name ?? 'Profile' }}</h2>
                    <p class="text-sm text-slate-600">{{ $user->username ?? $user->email }}</p>
                </div>
                <a href="{{ route('reports.user', $user) }}" class="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Report User">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172l3.536 3.536m-3.536 5.656l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="text-2xl font-bold text-slate-900">{{ $user->listings->count() }}</div>
                    <div class="text-xs text-slate-500">Listings</div>
                </div>
                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="text-2xl font-bold text-slate-900">{{ $user->favoriteListings->count() }}</div>
                    <div class="text-xs text-slate-500">Favorites</div>
                </div>
            </div>

            @if ($user->phone)
                <div class="flex items-center gap-3 mt-6 text-sm text-slate-600">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 011 1.453l-.986 2.89a2 2 0 011.143 1.491l1.549.773c.256.128.509.193.771.193h1.71c.756 0 .999-.256.999-.53V9a2 2 0 012-2h.002h5a2 2 0 012 2v5.093c0 .35.339.581.688.53h1.71c.262 0 .515-.065.771-.193l1.549-.773a2 2 0 011.143-1.491l-.986-2.89a1 1 0 01-1-1.453H17a2 2 0 012 2v1a2 2 0 01-2 2h-5l-.986 2.89a2 2 0 01-1.143 1.491l-1.549.773c-.256.128-.509.193-.771.193h-1.71c-.262 0-.515.065-.771.193l-1.549.773a2 2 0 01-1.143-1.491l-.986-2.89a1 1 0 01-1-1.453h2.285l.986-2.89a1 1 0 011-1.453h1.71c.262 0 .515-.065.771-.193l1.549-.773a2 2 0 011.143-1.491l-.986-2.89a1 1 0 011-1.453H19a2 2 0 012-2v-1a2 2 0 002-2h-6a2 2 0 00-2 2h-5.897l-.986 2.89a2 2 0 00-1.143 1.491l-1.549.773c-.256.128-.509.193-.771.193h-1.71c-.262 0-.515.065-.771.193l-1.549.773a2 2 0 00-1.143-1.491l-.986-2.89a1 1 0 00-1-1.453h2.285l.986-2.89a1 1 0 001-1.453H3z"></path></svg>
                    {{ $user->phone }}
                </div>
            @endif
            @if ($user->location)
                <div class="flex items-center gap-3 mt-2 text-sm text-slate-600">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {{ $user->location }}
                </div>
            @endif
        </div>

        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6">
            <h3 class="text-xl font-bold text-slate-900 mb-4">My Listings</h3>
            @if ($user->listings->isEmpty())
                <p class="text-slate-500 text-center py-8">No listings yet.</p>
            @else
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    @foreach ($user->listings as $listing)
                        <a href="{{ route('listings.show', $listing) }}" class="block group">
                            <div class="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden mb-2 border border-slate-100">
                                <img src="{{ optional($listing->images)->first() ?? asset('logo.png') }}" class="w-full h-full object-cover">
                            </div>
                            <div class="flex justify-between items-start">
                                <h4 class="font-bold text-sm text-slate-900 group-hover:text-emerald-600">{{ $listing->title }}</h4>
                                <span class="text-xs text-emerald-600 font-bold">â‚¦{{ number_format($listing->price, 0) }}</span>
                            </div>
                        </a>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
@endsection
