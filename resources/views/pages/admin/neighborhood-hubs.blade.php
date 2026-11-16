@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Neighborhood Hubs</h1>
            <p class="text-slate-600">Manage location filters shown on the homepage and listings page.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <!-- Add New Hub -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Add New Location</h3>
        <form method="POST" action="{{ route('admin.neighborhood-hubs.store') }}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            @csrf
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Key (unique)</label>
                <input name="key" required placeholder="e.g. bodija" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Label</label>
                <input name="label" required placeholder="e.g. Bodija Area" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Icon</label>
                <input name="icon" placeholder="e.g. building" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Query (location match)</label>
                <input name="query" placeholder="e.g. Bodija" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Sort Order</label>
                <input name="sort_order" type="number" value="0" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div class="sm:col-span-2 lg:col-span-5">
                <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                    Add Location
                </button>
            </div>
        </form>
    </div>

    <!-- Existing Hubs -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Existing Locations</h3>
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="border-b border-slate-100">
                        <th class="px-4 py-3 font-bold text-slate-900 text-sm">Label</th>
                        <th class="px-4 py-3 font-bold text-slate-900 text-sm">Key</th>
                        <th class="px-4 py-3 font-bold text-slate-900 text-sm">Query</th>
                        <th class="px-4 py-3 font-bold text-slate-900 text-sm">Order</th>
                        <th class="px-4 py-3 font-bold text-slate-900 text-sm">Active</th>
                        <th class="px-4 py-3 font-bold text-slate-900 text-sm text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse ($hubs as $hub)
                        <tr class="hover:bg-slate-50">
                            <td class="px-4 py-3 font-medium text-slate-900">{{ $hub->label }}</td>
                            <td class="px-4 py-3 text-sm text-slate-500">{{ $hub->key }}</td>
                            <td class="px-4 py-3 text-sm text-slate-500">{{ $hub->query ?? '—' }}</td>
                            <td class="px-4 py-3 text-sm text-slate-500">{{ $hub->sort_order }}</td>
                            <td class="px-4 py-3">
                                <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                    {{ $hub->is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500' }}">
                                    {{ $hub->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <form method="POST" action="{{ route('admin.neighborhood-hubs.destroy', $hub) }}" onsubmit="return confirm('Delete this location?')" class="inline">
                                    @csrf @method('DELETE')
                                    <button class="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-4 py-12 text-center text-slate-500">No neighborhood hubs found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection