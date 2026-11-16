@extends('layouts.app')

@section('content')
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8 mb-6">
            <h2 class="text-3xl font-bold text-slate-900 mb-2">Verified Merchants</h2>
            <p class="text-slate-600 mb-6">Trusted businesses with KYC-verified owners in Ogbomosoland and beyond.</p>

            @if ($verifiedMerchants->isEmpty())
                <div class="text-center py-16">
                    <div class="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 text-3xl">🏪</div>
                    <p class="text-slate-500">No verified merchants yet.</p>
                </div>
            @else
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach ($verifiedMerchants as $merchant)
                        <div class="group relative bg-white rounded-2xl border border-slate-100 p-6 hover:border-emerald-200 hover:shadow-lg transition-all">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                    {{ strtoupper(substr($merchant->name ?? 'M', 0, 1)) }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-bold text-slate-900 text-lg truncate">{{ $merchant->business_name ?? $merchant->name }}</h4>
                                    <p class="text-sm text-slate-500 truncate">{{ $merchant->business_category ?? 'General' }}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-2 mb-3">
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                    Verified
                                </span>
                                @if ($merchant->averageRating() > 0)
                                    <span class="inline-flex items-center gap-1 text-xs text-amber-600 font-bold">
                                        ★ {{ number_format($merchant->averageRating(), 1) }}
                                        <span class="text-slate-400">({{ $merchant->reviewCount() }})</span>
                                    </span>
                                @endif
                            </div>

                            <div class="text-sm text-slate-600 space-y-1">
                                @if ($merchant->location)
                                    <p class="flex items-center gap-2">
                                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                        {{ $merchant->location }}
                                    </p>
                                @endif
                                @if ($merchant->business_hours)
                                    <p class="flex items-center gap-2">
                                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        {{ $merchant->business_hours }}
                                    </p>
                                @endif
                            </div>

                            <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span class="text-xs text-slate-500">{{ $merchant->listings->count() }} listing{{ $merchant->listings->count() === 1 ? '' : 's' }}</span>
                                <a href="{{ route('users.show', $merchant) }}" class="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                    View Profile →
                                </a>
                            </div>

                            @auth
                                @if (auth()->user()->isAdmin())
                                    <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <form method="POST" action="{{ route('admin.businesses.unverify', $merchant) }}" onsubmit="return confirm('Unverify this merchant?')" class="inline">
                                            @csrf
                                            <button type="submit" class="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" title="Unverify">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </form>
                                    </div>
                                @endif
                            @endauth
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
@endsection