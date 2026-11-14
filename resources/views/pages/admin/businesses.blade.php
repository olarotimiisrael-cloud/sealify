@extends('layouts.admin')

@section('content')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Business Profiles</h1>
            <p class="text-slate-600">Manage and verify business sellers on Sealify.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <form method="GET" class="flex flex-col sm:flex-row gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Search</label>
                <input name="q" value="{{ request('q') }}" placeholder="Search business name, email…"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div class="min-w-[180px]">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Verification</label>
                <select name="verified" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    <option value="">All</option>
                    <option value="1" {{ request('verified') == '1' ? 'selected' : '' }}>Verified</option>
                    <option value="0" {{ request('verified') == '0' ? 'selected' : '' }}>Unverified</option>
                </select>
            </div>
            <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Filter
            </button>
        </form>
    </div>

    <!-- Business Table -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Business</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Owner</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Category</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Location</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Verified</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Listings</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($businesses as $business)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                    {{ strtoupper(substr($business->name ?? 'U', 0, 1)) }}
                                </div>
                                <div>
                                    <p class="font-medium text-slate-900">{{ $business->business_name ?? 'Unnamed Business' }}</p>
                                    <p class="text-xs text-slate-500">{{ $business->email }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-900">{{ $business->name }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ $business->business_category ?? 'Not set' }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ $business->business_address ?? 'Not set' }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $business->is_verified_seller ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600' }}">
                                {{ $business->is_verified_seller ? '✓ Verified' : '⚠ Unverified' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ $business->listings->count() }}</td>
                        <td class="px-6 py-4 text-right">
                            <a href="{{ route('admin.businesses.show', $business) }}" class="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="View Details">
                                👁️
                            </a>
                            @if ($business->is_verified_seller)
                                <form method="POST" action="{{ route('admin.businesses.unverify', $business) }}" class="inline">
                                    @csrf
                                    <button class="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="Unverify Business">
                                        ↩️
                                    </button>
                                </form>
                            @else
                                <form method="POST" action="{{ route('admin.businesses.verify', $business) }}" class="inline">
                                    @csrf
                                    <button class="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Verify Business">
                                        ✓
                                    </button>
                                </form>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="px-6 py-12 text-center text-slate-500">No business profiles found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $businesses->links() }}
    </div>
</div>
@endsection
