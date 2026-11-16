@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Promotion Payments</h1>
            <p class="text-slate-600">Review uploaded receipts and approve ad promotions. {{ $pendingCount }} pending.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    @if (session('status'))
        <div class="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ session('status') }}</div>
    @endif

    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <form method="GET" class="flex flex-col sm:flex-row gap-4 items-end">
            <div class="min-w-[180px]">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Status</label>
                <select name="status" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <option value="">All Statuses</option>
                    <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                    <option value="approved" {{ request('status') == 'approved' ? 'selected' : '' }}>Approved</option>
                    <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Rejected</option>
                </select>
            </div>
            <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl">Filter</button>
        </form>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-4 py-4 font-bold text-slate-900 text-sm">Ad / Reference</th>
                    <th class="px-4 py-4 font-bold text-slate-900 text-sm">User</th>
                    <th class="px-4 py-4 font-bold text-slate-900 text-sm">Paid</th>
                    <th class="px-4 py-4 font-bold text-slate-900 text-sm">Receipt</th>
                    <th class="px-4 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-4 py-4 font-bold text-slate-900 text-sm text-right">Action</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($receipts as $r)
                    <tr class="hover:bg-slate-50 align-top">
                        <td class="px-4 py-4 text-sm">
                            <p class="font-medium text-slate-900">{{ $r->listing->title ?? ('Ad #'.$r->listing_id) }}</p>
                            <p class="font-mono text-xs text-slate-500">{{ $r->transaction->reference ?? 'N/A' }}</p>
                            <p class="text-xs text-slate-500">{{ $r->transaction->metadata['weeks'] ?? 1 }} week(s) requested</p>
                        </td>
                        <td class="px-4 py-4 text-sm">
                            <p class="text-slate-900">{{ $r->user->name ?? 'Unknown' }}</p>
                            <p class="text-xs text-slate-500">{{ $r->user->email ?? '' }}</p>
                        </td>
                        <td class="px-4 py-4 text-sm">
                            <p class="text-emerald-600 font-bold">₦{{ number_format($r->amount_paid, 2) }}</p>
                            <p class="text-xs text-slate-500">{{ ucwords(str_replace('_', ' ', $r->payment_method ?? '')) }}</p>
                            <p class="text-xs text-slate-500">{{ $r->payer_name }}</p>
                            <p class="text-xs text-slate-500">{{ $r->paid_at?->format('M j, Y') }}</p>
                        </td>
                        <td class="px-4 py-4 text-sm">
                            <a href="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($r->receipt_path) }}" target="_blank"
                               class="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100">
                                View Receipt
                            </a>
                        </td>
                        <td class="px-4 py-4 text-sm">
                            <span class="inline-flex px-2 py-1 rounded text-xs font-bold
                                {{ $r->status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ($r->status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700') }}">
                                {{ ucfirst($r->status) }}
                            </span>
                            @if ($r->reviewer)
                                <p class="text-xs text-slate-400 mt-1">by {{ $r->reviewer->name }}</p>
                            @endif
                        </td>
                        <td class="px-4 py-4 text-sm text-right">
                            @if ($r->status === 'pending')
                                <form method="POST" action="{{ route('admin.payments.receipts.approve', $r) }}" class="inline-flex flex-wrap items-center gap-2 justify-end">
                                    @csrf
                                    <select name="weeks" class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm">
                                        @for ($w = 1; $w <= 12; $w++)
                                            <option value="{{ $w }}" {{ ($r->transaction->metadata['weeks'] ?? 1) == $w ? 'selected' : '' }}>{{ $w }} week{{ $w > 1 ? 's' : '' }}</option>
                                        @endfor
                                    </select>
                                    <input type="text" name="review_notes" placeholder="Note (optional)" class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm">
                                    <button type="submit" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-medium text-sm">Approve</button>
                                </form>
                                <form method="POST" action="{{ route('admin.payments.receipts.reject', $r) }}" class="inline-flex items-center gap-2 justify-end mt-2">
                                    @csrf
                                    <input type="text" name="rejection_reason" required placeholder="Rejection reason" class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm">
                                    <button type="submit" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-medium text-sm">Reject</button>
                                </form>
                            @else
                                <span class="text-xs text-slate-500">{{ $r->review_notes }}</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center text-slate-500">No payment receipts found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        <div class="px-4 py-3">{{ $receipts->links() }}</div>
    </div>
</div>
@endsection
