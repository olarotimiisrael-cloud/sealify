@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">KYC Verifications</h1>
            <p class="text-slate-600">Review and approve/reject seller identity verifications. Assign badges on approval.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <form method="GET" class="flex flex-col sm:flex-row gap-4 items-end">
            <div class="min-w-[180px]">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Status</label>
                <select name="status" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    <option value="">All Statuses</option>
                    <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending Review</option>
                    <option value="verified" {{ request('status') == 'verified' ? 'selected' : '' }}>Verified</option>
                    <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Rejected</option>
                    <option value="failed" {{ request('status') == 'failed' ? 'selected' : '' }}>Failed</option>
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
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Document</th>
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
                        <td class="px-6 py-4 text-sm text-slate-600">{{ $verification->typeLabel() }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold {{ $verification->statusColorClass() }}">
                                {{ $verification->statusLabel() }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center">
                            @if ($verification->hasDocument())
                                <a href="{{ route('admin.kyc.document', $verification) }}"
                                   target="_blank"
                                   class="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                                   title="View {{ $verification->typeLabel() }} document">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    View
                                </a>
                            @else
                                <span class="text-xs text-slate-400">No document</span>
                            @endif
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                @if ($verification->status === 'pending')
                                    <form method="POST" action="{{ route('admin.kyc.approve', $verification) }}" class="inline-block w-full sm:w-auto">
                                        @csrf
                                        <input type="hidden" name="status" value="verified">
                                        <select name="badge" class="w-full sm:w-auto inline-block mr-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                                            <option value="">Badge (optional)</option>
                                            @foreach ($badges as $key => $label)
                                                <option value="{{ $key }}">{{ $label }}</option>
                                            @endforeach
                                        </select>
                                        <input type="text" name="review_notes" placeholder="Admin note (optional)" class="w-full sm:w-auto inline-block mr-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                                        <button type="submit"
                                                class="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-medium text-sm transition-colors">
                                            Approve
                                        </button>
                                    </form>

                                    <form method="POST" action="{{ route('admin.kyc.reject', $verification) }}" class="inline-block w-full sm:w-auto mt-2 sm:mt-0">
                                        @csrf
                                        <input type="hidden" name="status" value="rejected">
                                        <input type="text" name="rejection_reason" required placeholder="Rejection reason" class="w-full sm:w-auto inline-block mr-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                                        <button type="submit"
                                                class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-medium text-sm transition-colors">
                                            Reject
                                        </button>
                                    </form>
                                @else
                                    <span class="text-xs text-slate-500">{{ $verification->statusLabel() }}</span>
                                    @if ($verification->badge_awarded)
                                        <span class="ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-{{ $verification->badge_awarded == 'business' ? 'emerald' : ($verification->badge_awarded == 'vendor' ? 'amber' : ($verification->badge_awarded == 'sealify_official' ? 'indigo' : ($verification->badge_awarded == 'sealify_staff' ? 'rose' : 'purple')) ) }}-100 text-{{ $verification->badge_awarded == 'business' ? 'emerald' : ($verification->badge_awarded == 'vendor' ? 'amber' : ($verification->badge_awarded == 'sealify_official' ? 'indigo' : ($verification->badge_awarded == 'sealify_staff' ? 'rose' : 'purple')) ) }}-700">
                                            Badge: {{ ucfirst($verification->badge_awarded) }}
                                        </span>
                                    @endif
                                    @if ($verification->reviewed_by)
                                        <span class="ml-2 text-xs text-slate-400">Reviewed by: {{ $verification->reviewer?->name ?? 'Admin' }}</span>
                                    @endif
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center text-slate-500">No KYC verifications found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $verifications->links() }}
    </div>
</div>
@endsection