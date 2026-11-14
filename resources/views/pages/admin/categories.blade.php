@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">Manage Categories</h1>
            <p class="text-slate-600">Create, edit, and organize marketplace categories.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">? Back to Dashboard</a>
    </div>

    <!-- Add Category Form -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Add New Category</h3>
        <form method="POST" action="{{ route('admin.categories.store') }}" class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            @csrf
            <div class="col-span-4 sm:col-span-2">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Category Name</label>
                <input name="name" type="text" required placeholder="e.g. Electronics"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div class="sm:col-span-1">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Slug</label>
                <input name="slug" type="text" required placeholder="e.g. electronics"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <div class="sm:col-span-1">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Icon</label>
                <input name="icon" type="text" placeholder="e.g. ??"
                       class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            </div>
            <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                Add Category
            </button>
        </form>
    </div>

    <!-- Categories List -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table class="w-full text-left">
            <thead>
                <tr class="border-b border-slate-100">
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Icon</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Name</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Slug</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Color</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-900 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($categories as $category)
                    <?php $icon = $category->icon ?? '???'; ?>
                    <?php $colorClass = $category->is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'; ?>
                    <?php $statusText = $category->is_active ? 'Active' : 'Inactive'; ?>
                    <tr class="group hover:bg-slate-50">
                        <td class="px-6 py-4 text-center">
                            <span class="text-2xl">{{ $icon }}</span>
                        </td>
                        <td class="px-6 py-4 font-medium text-slate-900">{{ $category->name }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ $category->slug }}</td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-{{ $category->color ?? 'emerald' }}-100 text-{{ $category->color ?? 'emerald' }}-600">
                                {{ $category->color ?? 'emerald' }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold {{ $colorClass }}">
                                {{ $statusText }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <form method="POST" action="{{ route('admin.categories.update', $category) }}" class="inline">
                                    @csrf @method('PUT')
                                    <input name="name" value="{{ $category->name }}" hidden>
                                    <input name="slug" value="{{ $category->slug }}" hidden>
                                    <input name="icon" value="{{ $category->icon }}" hidden>
                                    <input name="color" value="{{ $category->color }}" hidden>
                                    <input name="sort_order" value="{{ $category->sort_order }}" hidden>
                                    <input name="is_active" value="{{ $category->is_active ? '1' : '0' }}" hidden>
                                    <button type="submit" class="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Edit">
                                        ??
                                    </button>
                                </form>
                                <form method="POST" action="{{ route('admin.categories.destroy', $category) }}" onsubmit="return confirm('Delete this category?')" class="inline">
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
                        <td colspan="6" class="px-6 py-12 text-center text-slate-500">No categories found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection

