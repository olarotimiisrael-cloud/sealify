@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">KYC Verifications</h1>
            <p class="text-slate-600">Review and approve/reject seller identity verifications.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">? Back to Dashboard</a>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <form method="GET" class="flex flex-col sm:flex-row gap-4 items-end">
            <div class="min-w-[180px]">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Status</label>
                <select name="status" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    <option value="">All Statuses</option>
                    <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                    <option value="approved" {{ request('status') == 'approved' ? 'selected' : '' }}>Approved</option>
                    <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Rejected</option>
                </select>
            </div>
            <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Filter
            </button>
        </form>
    </div>

    <!-- KYC Table -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">User</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Email</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">ID Type</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($verifications as $verification)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                    {{ strtoupper(substr($verification->user->name ?? 'U', 0, 1)) }}
                                </div>
                                <div>
                                    <p class="font-medium text-slate-900">{{ $verification->user->name ?? 'Unknown' }}</p>
                                    <p class="text-xs text-slate-500">{{ $verification->user->phone }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-900">{{ $verification->user->email }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ ucfirst($verification->id_type ?? 'N/A') }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $verification->status === 'pending' ? 'bg-amber-100 text-amber-600' : ($verification->status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600') }}">
                                {{ ucfirst($verification->status ?? 'pending') }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                @if ($verification->status === 'pending')
                                    <form method="POST" action="{{ route('admin.kyc.approve', $verification) }}" class="inline">
                                        @csrf
                                        <button class="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-medium text-sm transition-colors">
                                            Approve
                                        </button>
                                    </form>
                                    <form method="POST" action="{{ route('admin.kyc.reject', $verification) }}" class="inline">
                                        @csrf
                                        <button class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-medium text-sm transition-colors">
                                            Reject
                                        </button>
                                    </form>
                                @else
                                    <span class="text-xs text-slate-500">{{ ucfirst($verification->status) }}</span>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-slate-500">No KYC verifications found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $verifications->links() }}
    </div>
</div>
@endsection

