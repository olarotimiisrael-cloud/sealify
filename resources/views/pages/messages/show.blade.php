@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
            <h2 class="text-xl font-bold text-slate-900 mb-2">Conversation</h2>
            <p class="text-sm text-slate-600">{{ $conversation->listingTitle ?? 'Marketplace ad' }}</p>
        </div>

        <div class="flex flex-col lg:flex-row gap-6">
            <div class="flex-1 min-w-0">
                <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-[600px]">
                    <div class="border-b border-slate-100 p-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                {{ strtoupper(substr($conversation->other_user['name'] ?? 'U', 0, 1)) }}
                            </div>
                            <div>
                                <p class="text-sm font-medium text-slate-900">{{ $conversation->other_user['name'] ?? 'User' }}</p>
                                <p class="text-xs text-slate-500">{{ $conversation->listingTitle ?? 'Listing conversation' }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        @if ($conversation->messages->isEmpty())
                            <div class="text-center pt-20">
                                <p class="text-slate-500">No messages yet. Start the conversation!</p>
                            </div>
                        @else
                            @foreach ($conversation->messages as $message)
                                <div class="flex {{ $message->sender_id == auth()->id() ? 'justify-end' : 'justify-start' }}">
                                    <div class="max-w-[80%] {{ $message->sender_id == auth()->id() ? 'bg-emerald-500 text-slate-950' : 'bg-white text-slate-900 border border-slate-200' }} rounded-2xl p-3
                                        {{ $message->sender_id == auth()->id() ? 'rounded-tr-none' : 'rounded-tl-none' }} shadow-sm">
                                        <p class="text-sm">{{ $message->content }}</p>
                                        <p class="text-[10px] {{ $message->sender_id == auth()->id() ? 'text-slate-700' : 'text-slate-400' }} mt-1 text-right">
                                            {{ \Carbon\Carbon::parse($message->created_at)->format('g:i a') }}
                                        </p>
                                    </div>
                                </div>
                            @endforeach
                        @endif
                    </div>
                    <div class="border-t border-slate-100 p-3">
                        <form method="POST" action="{{ route('messages.store', $conversation) }}" class="flex gap-3">
                            @csrf
                            <input name="content" type="text" placeholder="Type a messageâ€¦"
                                   class="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                            <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors">
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
