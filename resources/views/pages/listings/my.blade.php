@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8 mb-6">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">My Ads</h2>
            @if ($listings->isEmpty())
                <div class="text-center py-16">
                    <p class="text-slate-500">You haven't posted any ads yet.</p>
                    <a href="{{ route('listings.create') }}" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors inline-block mt-4">Post Your First Ad</a>
                </div>
            @else
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    @foreach ($listings as $listing)
                        <a href="{{ route('listings.show', $listing) }}" class="block group border border-slate-100 rounded-xl p-3 hover:border-emerald-200 transition-colors">
                            <div class="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden mb-2">
                                <img src="{{ optional($listing->images)->first() ?? asset('logo.png') }}" class="w-full h-full object-cover">
                            </div>
                            <h4 class="font-bold text-sm text-slate-900 group-hover:text-emerald-600">{{ $listing->title }}</h4>
                            <span class="text-xs text-emerald-600 font-bold">â‚¦{{ number_format($listing->price, 0) }}</span>
                        </a>
                    @endforeach
                </div>
                {{ $listings->links() }}
            @endif
        </div>
    </div>
@endsection
