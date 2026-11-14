@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">Messages</h2>
            <p class="text-sm text-slate-600">Your conversations with buyers and sellers.</p>
        </div>

        @if ($conversations->isEmpty())
            <div class="text-center py-16">
                <p class="text-slate-500">No conversations yet. Start by messaging a seller from a listing.</p>
            </div>
        @else
            <div class="bg-white shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
                <ul class="divide-y divide-slate-100">
                    @foreach ($conversations as $conv)
                        <a href="{{ route('messages.show', $conv) }}" class="block px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                    {{ strtoupper(substr($conv->other_user['name'] ?? 'U', 0, 1)) }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-slate-900 truncate">{{ $conv->other_user['name'] ?? 'User' }}</p>
                                    <p class="text-xs text-slate-500 truncate">{{ $conv->listingTitle ?? 'Marketplace ad' }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xs font-medium text-slate-900">{{ \Carbon\Carbon::parse($conv->lastMessageTime ?? $conv->created_at)->diffForHumans() }}</p>
                                    @if (($conv->unreadCount ?? 0) > 0)
                                        <span class="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold text-white bg-emerald-600">{{ $conv->unreadCount }}</span>
                                    @endif
                                </div>
                            </div>
                        </a>
                    @endforeach
                </ul>
            </div>
        @endif
    </div>
@endsection
