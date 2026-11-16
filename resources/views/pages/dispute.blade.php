@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div class="text-center">
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">File a Trade Dispute</h1>
            <p class="text-slate-500 text-sm mt-1">Have an issue with a trade? Submit a dispute and our team will review it.</p>
        </div>

        @if (session('status'))
            <div class="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">{{ session('status') }}</div>
        @endif

        @if ($errors->any())
            <div class="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
                <ul class="list-disc list-inside space-y-1">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        {{-- Filing form --}}
        <div class="relative">
            <div class="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 blur-xl opacity-20"></div>
            <div class="relative bg-white/95 backdrop-blur-xl rounded-[2rem] border border-white/70 shadow-xl shadow-emerald-500/15 p-6 sm:p-8">
                <div class="h-1 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-5"></div>
                <form method="POST" action="{{ route('dispute.store') }}" class="space-y-4">
                    @csrf

                    @if ($transactions->isNotEmpty())
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Related transaction <span class="font-normal text-slate-400">(optional)</span></label>
                            <select name="transaction_id" class="w-full rounded-xl px-4 py-3">
                                <option value="">— Select a transaction (optional) —</option>
                                @foreach ($transactions as $tx)
                                    <option value="{{ $tx->id }}" {{ old('transaction_id') == $tx->id ? 'selected' : '' }}>
                                        {{ $tx->reference }} — {{ $tx->purpose ?? 'Payment' }} — ₦{{ number_format((float) $tx->amount, 0) }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    @endif

                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Item / Trade title <span class="text-rose-500">*</span></label>
                        <input type="text" name="item_title" required value="{{ old('item_title') }}" placeholder="e.g. iPhone 13 Pro — not delivered"
                               class="w-full rounded-xl px-4 py-3">
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Category <span class="font-normal text-slate-400">(optional)</span></label>
                            <select name="category" class="w-full rounded-xl px-4 py-3">
                                <option value="">— Select category —</option>
                                @foreach ($categories as $cat)
                                    <option value="{{ $cat->name }}" {{ old('category') == $cat->name ? 'selected' : '' }}>{{ $cat->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Reason <span class="text-rose-500">*</span></label>
                            <select name="reason" required class="w-full rounded-xl px-4 py-3">
                                @foreach ([
                                    'item_not_received' => 'Item not received',
                                    'not_as_described' => 'Not as described',
                                    'damaged_or_defective' => 'Damaged / defective',
                                    'refund_not_received' => 'Refund not received',
                                    'other' => 'Other',
                                ] as $val => $label)
                                    <option value="{{ $val }}" {{ old('reason') == $val ? 'selected' : '' }}>{{ $label }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Details <span class="text-rose-500">*</span></label>
                        <textarea name="details" rows="4" required minlength="10" placeholder="Describe what happened and what resolution you're seeking…"
                                  class="w-full rounded-xl px-4 py-3">{{ old('details') }}</textarea>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Receipt reference <span class="font-normal text-slate-400">(optional)</span></label>
                            <input type="text" name="receipt_reference" value="{{ old('receipt_reference') }}" placeholder="e.g. TXN-12345"
                                   class="w-full rounded-xl px-4 py-3">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Evidence URL <span class="font-normal text-slate-400">(optional)</span></label>
                            <input type="url" name="evidence_url" value="{{ old('evidence_url') }}" placeholder="https://…"
                                   class="w-full rounded-xl px-4 py-3">
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200/60 hover:shadow-emerald-300/70 active:scale-95">
                        Submit Dispute
                    </button>
                </form>
            </div>
        </div>

        {{-- My disputes --}}
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100">
                <h2 class="text-lg font-bold text-slate-900">My Disputes</h2>
            </div>
            @if ($disputes->isEmpty())
                <div class="p-8 text-center text-slate-500 text-sm">You haven't filed any disputes yet.</div>
            @else
                <ul class="divide-y divide-slate-100">
                    @foreach ($disputes as $dispute)
                        <li class="p-5 flex items-start justify-between gap-4">
                            <div class="min-w-0">
                                <p class="font-bold text-slate-900 truncate">#{{ $dispute->id }} — {{ $dispute->item_title }}</p>
                                <p class="text-xs text-slate-500 mt-0.5">
                                    {{ ucfirst(str_replace('_', ' ', $dispute->reason)) }}
                                    @if($dispute->category) · {{ $dispute->category }} @endif
                                    · {{ $dispute->created_at->diffForHumans() }}
                                </p>
                                <p class="text-xs text-slate-600 mt-1 line-clamp-2">{{ $dispute->details }}</p>
                            </div>
                            <span class="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                                {{ $dispute->status === 'resolved' ? 'bg-emerald-100 text-emerald-700'
                                   : ($dispute->status === 'rejected' ? 'bg-rose-100 text-rose-700'
                                   : ($dispute->status === 'escalated' ? 'bg-purple-100 text-purple-700'
                                   : 'bg-amber-100 text-amber-700')) }}">
                                {{ ucfirst($dispute->status) }}
                            </span>
                        </li>
                    @endforeach
                </ul>
            @endif
        </div>
    </div>
@endsection