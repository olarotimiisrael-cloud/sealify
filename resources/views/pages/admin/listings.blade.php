@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Manage Listings</h1>
            <p class="text-slate-600">Approve, reject, suspend, or feature listings.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">? Back to Dashboard</a>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <form method="GET" class="flex flex-col sm:flex-row gap-4 items-end">
            <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Search</label>
                <input name="q" value="{{ request('q') }}" placeholder="Search listings by title"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div class="min-w-[180px]">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Status</label>
                <select name="status" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    <option value="">All Statuses</option>
                    <option value="active" {{ request('status') == 'active' ? 'selected' : '' }}>Active</option>
                    <option value="suspended" {{ request('status') == 'suspended' ? 'selected' : '' }}>Suspended</option>
                    <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Rejected</option>
                    <option value="sold" {{ request('status') == 'sold' ? 'selected' : '' }}>Sold</option>
                </select>
            </div>
            <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Filter
            </button>
        </form>
    </div>

    <!-- Listings Table -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Listing</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Seller</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Price</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Category</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($listings as $listing)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <img src="{{ $listing->images->first()?->url ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' }}"
                                     class="w-10 h-10 rounded-lg object-cover">
                                <div>
                                    <p class="font-medium text-slate-900 line-clamp-1">{{ $listing->title }}</p>
                                    <p class="text-xs text-slate-500">#{{ $listing->id }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-900">{{ $listing->user->name ?? 'Unknown' }}</td>
                        <td class="px-6 py-4 text-sm text-emerald-600 font-bold">?{{ number_format($listing->price, 0) }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ $listing->category->name ?? 'N/A' }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $listing->status === 'active' ? 'bg-emerald-100 text-emerald-600' : ($listing->status === 'suspended' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600') }}">
                                {{ ucfirst($listing->status ?? 'active') }}
                            </span>
                            @if ($listing->featured)
                                <span class="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-600">? Featured</span>
                            @endif
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button onclick="toggleListingStatus({{ $listing->id }}, '{{ $listing->status === 'active' ? 'suspended' : 'active' }}')"
                                        class="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600">
                                    {{ $listing->status === 'active' ? '??' : '??' }}
                                </button>
                                <button onclick="toggleFeatured({{ $listing->id }})"
                                        class="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors">
                                    {{ $listing->featured ? '?' : '?' }}
                                </button>
                                <form method="POST" action="{{ route('admin.listings.destroy', $listing) }}" onsubmit="return confirm('Delete this listing?')" class="inline">
                                    @csrf @method('DELETE')
                                    <button class="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete">
                                        ???
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center text-slate-500">No listings found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $listings->links() }}
    </div>
</div>

<script>
    function toggleListingStatus(listingId, status) {
        if (!confirm('Change listing status to ' + status + '?')) return;
        fetch('{{ route('admin.listings.status', 0) }}'.replace('0', listingId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ status: status })
        }).then(() => location.reload());
    }
    function toggleFeatured(listingId) {
        fetch('{{ route('admin.listings.featured', 0) }}'.replace('0', listingId), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({})
        }).then(() => location.reload());
    }
</script>
@endsection

