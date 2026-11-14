@extends('layouts.app')

@section('content')
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Notifications</h2>
            @if ($notifications->isEmpty())
                <div class="text-center py-16">
                    <p class="text-slate-500">No notifications yet.</p>
                </div>
            @else
                <ul class="divide-y divide-slate-100">
                    @foreach ($notifications as $notification)
                        <li class="px-6 py-4 border-b border-slate-50 last:border-0">
                            <p class="text-sm font-medium text-slate-900">{{ $notification->title ?? 'Notification' }}</p>
                            <p class="text-xs text-slate-500">{{ $notification->description ?? '' }}</p>
                            <p class="text-[10px] text-slate-400 mt-1">{{ $notification->created_at ?? '' }}</p>
                        </li>
                    @endforeach
                </ul>
                {{ $notifications->links() }}
            @endif
        </div>
    </div>
@endsection
