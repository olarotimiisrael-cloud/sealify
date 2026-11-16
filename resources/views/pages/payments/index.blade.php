@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div class="mb-6">
            <h1 class="text-2xl font-black text-slate-900">Payments</h1>
            <p class="text-slate-600">Pay for ad promotions and upload your receipt for admin approval.</p>
        </div>

        @if (session('status'))
            <div class="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {{ session('status') }}
            </div>
        @endif
        @if (session('error'))
            <div class="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {{ session('error') }}
            </div>
        @endif

        @php
            $manual = config('promotions.manual');
            $price = (float) config('promotions.price', 500);
        @endphp

        {{-- Payment instructions --}}
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
            <h2 class="text-lg font-bold text-slate-900 mb-3">How to pay for ad promotion</h2>
            <p class="text-sm text-slate-600 mb-4">Transfer to the account below, then upload your receipt. An admin verifies and activates your promotion automatically.</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p class="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Bank</p>
                    <p class="font-medium text-slate-900">{{ $manual['bank_name'] }}</p>
                </div>
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p class="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Account Number</p>
                    <p class="font-medium text-slate-900">{{ $manual['account_number'] }}</p>
                </div>
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p class="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Account Name</p>
                    <p class="font-medium text-slate-900">{{ $manual['account_name'] }}</p>
                </div>
            </div>
            <p class="text-xs text-slate-500 mt-3">Price per week: <strong>₦{{ number_format($price, 0) }}</strong>. After payment, upload the receipt against the payment reference below.</p>
        </div>

        {{-- Pending promotion payments with upload forms --}}
        @php
            $pending = $transactions->getCollection()->filter(fn ($t) => $t->purpose === 'promotion_boost' && $t->status === 'pending');
        @endphp

        @if ($pending->count())
            <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
                <h2 class="text-lg font-bold text-slate-900 mb-4">Pending promotion payments</h2>
                <div class="space-y-4">
                    @foreach ($pending as $tx)
                        <div class="border border-slate-100 rounded-xl p-4">
                            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div>
                                    <p class="font-bold text-slate-900">{{ $tx->metadata['listing_title'] ?? ('Ad #'.($tx->metadata['listing_id'] ?? '')) }}</p>
                                    <p class="text-xs text-slate-500">Reference: <span class="font-mono font-bold">{{ $tx->reference }}</span></p>
                                </div>
                                <div class="text-right">
                                    <p class="text-emerald-600 font-bold">₦{{ number_format($tx->amount, 0) }}</p>
                                    <p class="text-xs text-slate-500">{{ $tx->metadata['weeks'] ?? 1 }} week(s)</p>
                                </div>
                            </div>

                            <form method="POST" action="{{ route('payments.receipts.upload') }}" enctype="multipart/form-data" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                @csrf
                                <input type="hidden" name="transaction_reference" value="{{ $tx->reference }}">

                                <div>
                                    <label class="block text-xs font-bold text-slate-600 mb-1">Amount Paid (₦)</label>
                                    <input type="number" step="0.01" name="amount_paid" required value="{{ $tx->amount }}"
                                           class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-600 mb-1">Payment Method</label>
                                    <select name="payment_method" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                                        @foreach ($manual['methods'] as $method)
                                            <option value="{{ $method }}">{{ ucwords(str_replace('_', ' ', $method)) }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-600 mb-1">Payer Name</label>
                                    <input type="text" name="payer_name" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" placeholder="Name on transfer">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-600 mb-1">Payer Account / Phone</label>
                                    <input type="text" name="payer_account" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" placeholder="Account or phone used">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-600 mb-1">Date Paid</label>
                                    <input type="date" name="paid_at" value="{{ now()->format('Y-m-d') }}" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-600 mb-1">Receipt (JPG/PNG/PDF)</label>
                                    <input type="file" name="receipt" required accept="image/*,.pdf" class="w-full text-sm">
                                </div>
                                <div class="sm:col-span-2">
                                    <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg transition-colors">
                                        Upload Receipt for Review
                                    </button>
                                </div>
                            </form>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        {{-- Receipts submitted --}}
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">My receipts</h2>
            @if ($receipts->isEmpty())
                <p class="text-sm text-slate-500 py-6 text-center">No receipts uploaded yet.</p>
            @else
                <div class="space-y-2">
                    @foreach ($receipts as $r)
                        <div class="flex items-center justify-between border border-slate-100 rounded-lg p-3 text-sm">
                            <div>
                                <p class="font-medium text-slate-900">{{ $r->listing->title ?? ('Ad #'.$r->listing_id) }}</p>
                                <p class="text-xs text-slate-500">₦{{ number_format($r->amount_paid, 0) }} · {{ ucwords(str_replace('_', ' ', $r->payment_method ?? 'transfer')) }} · {{ $r->created_at?->format('M j, Y') }}</p>
                            </div>
                            <span class="px-2 py-1 rounded text-xs font-bold
                                {{ $r->status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ($r->status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700') }}">
                                {{ ucfirst($r->status) }}
                            </span>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>

        {{-- Transaction history --}}
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">Transaction history</h2>
            @if ($transactions->isEmpty())
                <p class="text-sm text-slate-500 py-6 text-center">No transactions yet.</p>
            @else
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead>
                            <tr class="border-b border-slate-100 text-slate-500">
                                <th class="py-2 pr-4">Reference</th>
                                <th class="py-2 pr-4">Purpose</th>
                                <th class="py-2 pr-4">Amount</th>
                                <th class="py-2 pr-4">Status</th>
                                <th class="py-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($transactions as $tx)
                                <tr class="border-b border-slate-50">
                                    <td class="py-2 pr-4 font-mono text-xs">{{ $tx->reference }}</td>
                                    <td class="py-2 pr-4">{{ ucwords(str_replace('_', ' ', $tx->purpose)) }}</td>
                                    <td class="py-2 pr-4 text-emerald-600 font-bold">₦{{ number_format($tx->amount, 0) }}</td>
                                    <td class="py-2 pr-4">
                                        <span class="px-2 py-0.5 rounded text-xs font-bold
                                            {{ $tx->status === 'success' ? 'bg-emerald-100 text-emerald-700' : ($tx->status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700') }}">
                                            {{ ucfirst($tx->status) }}
                                        </span>
                                    </td>
                                    <td class="py-2 text-slate-500">{{ $tx->created_at?->format('M j, Y') }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="mt-4">{{ $transactions->links() }}</div>
            @endif
        </div>
    </div>
@endsection
