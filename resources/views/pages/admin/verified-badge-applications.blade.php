@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Verified Badge Applications</h1>
            <p class="text-slate-600">Review and approve user applications for the verified seller badge.</p>
        </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">User</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Business</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">KYC Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Listings</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($users as $user)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
                                    {{ strtoupper(substr($user->name ?? 'U', 0, 1)) }}
                                </div>
                                <div>
                                    <p class="font-medium text-slate-900 line-clamp-1">{{ $user->name }}</p>
                                    <p class="text-xs text-slate-500">{{ $user->email }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            @if($user->business_name)
                                <p class="font-medium text-slate-900">{{ $user->business_name }}</p>
                                <p class="text-xs text-slate-500">{{ $user->business_category }}</p>
                            @else
                                <span class="text-slate-400 text-sm">No business profile</span>
                            @endif
                        </td>
                        <td class="px-6 py-4">
                            @if($user->isKycVerified())
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-600">
                                    ✓ Verified
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-600">
                                    Pending
                                </span>
                            @endif
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-900">
                            {{ $user->listings->count() }}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <form method="POST" action="{{ route('admin.badge.approve', $user) }}" class="inline">
                                    @csrf
                                    <button type="submit" class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-colors" onclick="return confirm('Approve verified badge for {{ $user->name }}?')">
                                        Approve
                                    </button>
                                </form>
                                <form method="POST" action="{{ route('admin.badge.reject', $user) }}" class="inline">
                                    @csrf
                                    <button type="submit" class="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-colors" onclick="return confirm('Reject badge application for {{ $user->name }}?')">
                                        Reject
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-slate-500">No pending badge applications.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $users->links() }}
    </div>
</div>
@endsection