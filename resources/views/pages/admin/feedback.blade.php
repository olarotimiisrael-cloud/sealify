@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">User Feedback</h1>
            <p class="text-slate-600">Review and manage feedback submitted by users.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        @if ($feedbacks->isEmpty())
            <p class="text-slate-500 text-center py-12">No feedback submitted yet.</p>
        @else
            <div class="space-y-4">
                @foreach ($feedbacks as $feedback)
                    <div class="p-4 rounded-xl border border-slate-100 bg-slate-50 {{ $feedback->status === 'resolved' ? 'opacity-60' : '' }}">
                        <div class="flex items-start justify-between mb-2">
                            <div class="flex items-center gap-3">
                                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold
                                    {{ $feedback->type === 'bug' ? 'bg-rose-100 text-rose-600' : ($feedback->type === 'suggestion' ? 'bg-blue-100 text-blue-600' : ($feedback->type === 'complaint' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600')) }}">
                                    {{ ucfirst($feedback->type) }}
                                </span>
                                <span class="text-xs text-slate-500">{{ $feedback->created_at->diffForHumans() }}</span>
                                @if ($feedback->status === 'resolved')
                                    <span class="text-xs font-bold text-emerald-600">✓ Resolved</span>
                                @endif
                            </div>
                            @if ($feedback->status !== 'resolved')
                                <form method="POST" action="{{ route('admin.feedback.resolve', $feedback) }}" class="inline">
                                    @csrf
                                    <button type="submit" class="text-xs text-emerald-600 font-bold hover:underline">Mark Resolved</button>
                                </form>
                            @endif
                        </div>
                        <p class="text-sm text-slate-700 mb-2">{{ $feedback->message }}</p>
                        <div class="flex items-center gap-4 text-xs text-slate-400">
                            <span>{{ $feedback->user->name ?? $feedback->name ?? 'Guest' }}</span>
                            @if ($feedback->email)
                                <span>{{ $feedback->email }}</span>
                            @endif
                            @if ($feedback->page_url)
                                <a href="{{ $feedback->page_url }}" class="text-emerald-600 hover:underline truncate max-w-xs">{{ $feedback->page_url }}</a>
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>
            <div class="mt-4">{{ $feedbacks->links() }}</div>
        @endif
    </div>
</div>
@endsection