@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-10">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h2 class="text-3xl font-black text-slate-900 mb-2">Community News Board</h2>
                    <p class="text-slate-600">Local announcements and events in Ogbomosoland and Oyo State.</p>
                </div>
                @auth
                    <a href="{{ route('community') }}" class="text-sm text-emerald-600 font-bold hover:underline">
                        ← Back to Community
                    </a>
                @endauth
            </div>

            <div class="space-y-4">
                @forelse ($posts as $post)
                    <div class="p-6 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors group">
                        <div class="flex items-start gap-3 mb-2">
                            <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold shrink-0">
                                {{ strtoupper(substr(optional($post->author)->name ?? 'U', 0, 1)) }}
                            </div>
                            <div>
                                <p class="font-bold text-slate-900 text-sm leading-tight">{{ $post->title }}</p>
                                <p class="text-xs text-slate-500 mt-0.5">
                                    By {{ optional($post->author)->name ?? 'Community' }} • {{ $post->created_at->format('M j, Y') }}
                                </p>
                            </div>
                        </div>
                        <p class="text-slate-700 text-sm leading-relaxed mb-2">{{ $post->content }}</p>
                    </div>
                @empty
                    <div class="p-6 rounded-xl border border-slate-100 bg-slate-50 text-center">
                        <p class="text-slate-500 text-sm">No community posts yet. Check back soon.</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>
@endsection
