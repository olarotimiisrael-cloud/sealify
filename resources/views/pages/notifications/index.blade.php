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

                            @if($notification->data && !empty($notification->data['favorited_by']))
                                <div class="mt-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                    <p class="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">Favorited by</p>
                                    <div class="space-y-1 text-sm">
                                        <p class="font-bold text-slate-900">{{ $notification->data['favorited_by']['name'] ?? 'User' }}</p>
                                        @if(!empty($notification->data['favorited_by']['phone']))
                                            <p class="text-slate-600">Phone: {{ $notification->data['favorited_by']['phone'] }}</p>
                                        @endif
                                        @if(!empty($notification->data['favorited_by']['email']))
                                            <p class="text-slate-600">Email: {{ $notification->data['favorited_by']['email'] }}</p>
                                        @endif
                                        @if(!empty($notification->data['favorited_by']['username']))
                                            <p class="text-slate-600">Username: {{ $notification->data['favorited_by']['username'] }}</p>
                                        @endif
                                    </div>
                                    @if(!empty($notification->data['listing_url']))
                                        <div class="mt-3 flex gap-2">
                                            <a href="{{ $notification->data['listing_url'] }}"
                                               class="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors">
                                                View Ad
                                            </a>
                                            <a href="{{ $notification->data['favorited_by']['profile_url'] ?? '#' }}"
                                               class="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                                                View Profile
                                            </a>
                                        </div>
                                    @endif
                                </div>
                            @endif
                        </li>
                    @endforeach
                </ul>
                {{ $notifications->links() }}
            @endif
        </div>
    </div>
@endsection
