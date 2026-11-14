@extends('layouts.admin')

@section('content')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Reports</h1>
            <p class="text-slate-600">Review and resolve user-submitted reports.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Report #</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Reported By</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Reason</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($reports as $report)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-900">#{{ $report->id }}</td>
                        <td class="px-6 py-4 text-sm text-slate-900">{{ $report->reporter->name ?? 'Unknown' }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ $report->reason ?? 'N/A' }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $report->status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600' }}">
                                {{ ucfirst($report->status ?? 'open') }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            @if ($report->status === 'open')
                                <form method="POST" action="{{ route('admin.reports.resolve', $report) }}" class="inline">
                                    @csrf
                                    <input name="status" value="resolved" hidden>
                                    <button type="submit" class="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg font-medium text-sm transition-colors">
                                        Resolve
                                    </button>
                                </form>
                                <form method="POST" action="{{ route('admin.reports.resolve', $report) }}" class="inline">
                                    @csrf
                                    <input name="status" value="dismissed" hidden>
                                    <button type="submit" class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-medium text-sm transition-colors">
                                        Dismiss
                                    </button>
                                </form>
                            @else
                                <span class="text-xs text-slate-500">{{ ucfirst($report->status) }}</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-slate-500">No reports found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $reports->links() }}
    </div>
</div>
@endsection
