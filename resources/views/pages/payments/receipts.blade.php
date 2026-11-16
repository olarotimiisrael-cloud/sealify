@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-black text-slate-900">My Payment Receipts</h1>
                <p class="text-slate-600">Track the receipts you uploaded for ad promotions.</p>
            </div>
            <a href="{{ route('payments.index') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Payments</a>
        </div>

        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6">
            @if ($receipts->isEmpty())
                <p class="text-sm text-slate-500 py-10 text-center">No receipts uploaded yet.</p>
            @else
                <div class="space-y-3">
                    @foreach ($receipts as $r)
                        <div class="border border-slate-100 rounded-xl p-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p class="font-medium text-slate-900">{{ $r->listing->title ?? ('Ad #'.$r->listing_id) }}</p>
                                <p class="text-xs text-slate-500">
                                    ₦{{ number_format($r->amount_paid, 0) }} ·
                                    {{ ucwords(str_replace('_', ' ', $r->payment_method ?? 'transfer')) }} ·
                                    {{ $r->created_at?->format('M j, Y g:i A') }}
                                </p>
                                @if ($r->review_notes)
                                    <p class="text-xs text-slate-500 mt-1"><strong>Note:</strong> {{ $r->review_notes }}</p>
                                @endif
                            </div>
                            <span class="px-2 py-1 rounded text-xs font-bold
                                {{ $r->status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ($r->status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700') }}">
                                {{ ucfirst($r->status) }}
                            </span>
                        </div>
                    @endforeach
                </div>
                <div class="mt-4">{{ $receipts->links() }}</div>
            @endif
        </div>
    </div>
@endsection
