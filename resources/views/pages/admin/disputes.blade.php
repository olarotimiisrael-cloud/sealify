@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Trade Disputes</h1>
            <p class="text-slate-600">Review and resolve buyer-seller disputes.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">? Back to Dashboard</a>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Dispute #</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Listing</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Filed By</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($disputes as $dispute)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-900">#{{ $dispute->id }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ $dispute->listing->title ?? 'N/A' }}</td>
                        <td class="px-6 py-4 text-sm text-slate-900">{{ $dispute->user->name ?? 'Unknown' }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $dispute->status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600' }}">
                                {{ ucfirst($dispute->status ?? 'open') }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            @if ($dispute->status === 'open')
                                <form method="POST" action="{{ route('admin.disputes.resolve', $dispute) }}" class="inline">
                                    @csrf
                                    <input name="status" value="resolved" hidden>
                                    <button type="submit" class="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-medium text-sm transition-colors">
                                        Resolve
                                    </button>
                                </form>
                                <form method="POST" action="{{ route('admin.disputes.resolve', $dispute) }}" class="inline">
                                    @csrf
                                    <input name="status" value="rejected" hidden>
                                    <button type="submit" class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-medium text-sm transition-colors">
                                        Reject
                                    </button>
                                </form>
                                <form method="POST" action="{{ route('admin.disputes.resolve', $dispute) }}" class="inline">
                                    @csrf
                                    <input name="status" value="escalated" hidden>
                                    <button type="submit" class="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg font-medium text-sm transition-colors">
                                        Escalate
                                    </button>
                                </form>
                            @else
                                <span class="text-xs text-slate-500">{{ ucfirst($dispute->status) }}</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-slate-500">No disputes found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $disputes->links() }}
    </div>
</div>
@endsection

