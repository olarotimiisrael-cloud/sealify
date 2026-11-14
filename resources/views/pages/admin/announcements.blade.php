@extends('layouts.admin')

@section('content')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Announcements</h1>
            <p class="text-slate-600">Create platform-wide announcements for users.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <!-- Add Announcement -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Add New Announcement</h3>
        <form method="POST" action="{{ route('admin.announcements.store') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Title</label>
                <input name="title" type="text" required placeholder="e.g. New Safety Policy"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Content</label>
                <textarea name="content" rows="3" required placeholder="Announcement details..."
                          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
            </div>
            <div class="flex items-center gap-3">
                <input name="is_active" type="checkbox" checked class="rounded text-emerald-600 focus:ring-emerald-500">
                <label class="text-sm text-slate-600">Active</label>
            </div>
            <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Create Announcement
            </button>
        </form>
    </div>

    <!-- Announcements List -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Title</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($announcements as $announcement)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-900">{{ $announcement->title }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $announcement->is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500' }}">
                                {{ $announcement->is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <form method="POST" action="{{ route('admin.announcements.destroy', $announcement) }}" onsubmit="return confirm('Delete this announcement?')" class="inline">
                                @csrf @method('DELETE')
                                <button class="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete">
                                    🗑️
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="3" class="px-6 py-12 text-center text-slate-500">No announcements found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $announcements->links() }}
    </div>
</div>
@endsection
