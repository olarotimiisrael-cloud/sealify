@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Promotions</h1>
            <p class="text-slate-600">Manage listing promotions and featured ads.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">? Back to Dashboard</a>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Promotion #</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Listing</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">User</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Type</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($promotions as $promotion)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-900">#{{ $promotion->id }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">
                            <a href="{{ route('listings.show', $promotion->listing) }}" class="hover:text-emerald-600">
                                {{ $promotion->listing->title ?? 'N/A' }}
                            </a>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-900">{{ $promotion->listing->user->name ?? 'Unknown' }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $promotion->kind === 'referral' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600' }}">
                                {{ ucfirst($promotion->kind ?? 'paid') }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $promotion->status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500' }}">
                                {{ ucfirst($promotion->status ?? 'active') }}
                            </span>
                            @if ($promotion->ends_at)
                                <div class="text-[10px] text-slate-400 mt-1">Ends: {{ $promotion->ends_at->format('M d, Y') }}</div>
                            @endif
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button type="button"
                                        class="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                                        title="Copy promotion link"
                                        onclick="navigator.clipboard.writeText('{{ route('listings.show', $promotion->listing) }}'); alert('Promotion link copied!');">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                </button>
                                <form method="POST" action="{{ route('admin.promotions.email', $promotion) }}" class="inline">
                                    @csrf
                                    <button type="submit" class="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Email all users about this promotion">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </button>
                                </form>
                                @if ($promotion->status === 'active')
                                    <form method="POST" action="{{ route('admin.promotions.stop', $promotion) }}" onsubmit="return confirm('Stop this promotion?')" class="inline">
                                        @csrf
                                        <button type="submit" class="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="Stop promotion">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </button>
                                    </form>
                                @endif
                                <form method="POST" action="{{ route('admin.promotions.destroy', $promotion) }}" onsubmit="return confirm('Delete this promotion?')" class="inline">
                                    @csrf @method('DELETE')
                                    <button class="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center text-slate-500">No promotions found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $promotions->links() }}
    </div>
</div>
@endsection