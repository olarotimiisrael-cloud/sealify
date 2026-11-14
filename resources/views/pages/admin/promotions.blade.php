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
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($promotions as $promotion)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-900">#{{ $promotion->id }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ $promotion->listing->title ?? 'N/A' }}</td>
                        <td class="px-6 py-4 text-sm text-slate-900">{{ $promotion->listing->user->name ?? 'Unknown' }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $promotion->status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500' }}">
                                {{ ucfirst($promotion->status ?? 'active') }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <form method="POST" action="{{ route('admin.promotions.destroy', $promotion) }}" onsubmit="return confirm('Delete this promotion?')" class="inline">
                                @csrf @method('DELETE')
                                <button class="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete">
                                    ???
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-slate-500">No promotions found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $promotions->links() }}
    </div>
</div>
@endsection

