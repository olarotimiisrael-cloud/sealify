@extends('layouts.admin')

@section('content')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Transactions</h1>
            <p class="text-slate-600">View all marketplace transactions.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Transaction #</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">User</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Amount</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Type</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Date</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($transactions as $tx)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-900">#{{ $tx->id }}</td>
                        <td class="px-6 py-4 text-sm text-slate-900">{{ $tx->user->name ?? 'Unknown' }}</td>
                        <td class="px-6 py-4 text-sm text-emerald-600 font-bold">₦{{ number_format($tx->amount ?? 0, 2) }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ ucfirst($tx->type ?? 'payment') }}</td>
                        <td class="px-6 py-4 text-sm text-slate-500">{{ $tx->created_at ?? 'N/A' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-slate-500">No transactions found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $transactions->links() }}
    </div>
</div>
@endsection
