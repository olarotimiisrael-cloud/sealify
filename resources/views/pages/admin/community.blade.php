@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Community News Board</h1>
            <p class="text-slate-600">Create and manage community news posts visible to all users.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <!-- Add Community Post -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Add New Community Post</h3>
        <form method="POST" action="{{ route('admin.community.store') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Title</label>
                <input name="title" type="text" required placeholder="e.g. Community Safety Meeting"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Content</label>
                <textarea name="content" rows="4" required placeholder="Share community news, events, or announcements..."
                          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"></textarea>
            </div>
            <div class="flex items-center gap-3">
                <input name="is_published" type="checkbox" checked class="rounded text-emerald-600 focus:ring-emerald-500">
                <label class="text-sm text-slate-600">Published</label>
            </div>
            <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Create Post
            </button>
        </form>
    </div>

    <!-- Community Posts List -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Title</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Author</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($posts as $post)
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4 font-medium text-slate-900">{{ $post->title }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ optional($post->author)->name ?? 'Unknown' }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                                {{ $post->is_published ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500' }}">
                                {{ $post->is_published ? 'Published' : 'Draft' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <form method="POST" action="{{ route('admin.community.destroy', $post) }}" onsubmit="return confirm('Delete this community post?')" class="inline">
                                @csrf @method('DELETE')
                                <button class="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors" title="Delete">
                                    🗑️
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="px-6 py-12 text-center text-slate-500">No community posts found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        {{ $posts->links() }}
    </div>
</div>
@endsection
