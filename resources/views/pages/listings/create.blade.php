@extends('layouts.app')

@section('content')
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <x-form-card title="Post a New Ad" subtitle="Share your item with verified buyers in Ogbomosoland and Oyo State.">
            <div class="flex items-center justify-between mb-6">
                <a href="{{ route('listings.index') }}" class="text-sm text-emerald-600 font-bold hover:underline">
                    ← Back to listings
                </a>
            </div>

            @if (session('status'))
                <div class="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm">
                    {{ session('status') }}
                </div>
            @endif

            @if ($errors->any())
                <div class="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
                    <ul class="list-disc list-inside space-y-1">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <form method="POST" action="{{ route('listings.store') }}" enctype="multipart/form-data" class="space-y-6">
                @csrf

                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div>
                        <p class="text-sm font-bold text-amber-800 mb-1">No AI-generated images allowed</p>
                        <p class="text-sm text-amber-700">Do not use AI-generated content to represent the item you are listing. Upload only real photos and a short video of the actual item to avoid misleading or deceiving buyers.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-slate-700">Title</label>
                        <input id="title" name="title" type="text" required
                               value="{{ old('title') }}"
                               class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                    <div>
                        <label for="price" class="block text-sm font-medium text-slate-700">Price (₦)</label>
                        <input id="price" name="price" type="number" step="0.01" required min="0"
                               value="{{ old('price') }}"
                               class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    </div>
                </div>

                <div>
                    <label for="category_id" class="block text-sm font-medium text-slate-700">Category</label>
                    <select id="category_id" name="category_id" required
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <option value="">Select a category</option>
                        @foreach ($categories as $category)
                            <option value="{{ $category->id }}" {{ old('category_id') == $category->id ? 'selected' : '' }}>{{ $category->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div>
                    <label for="condition" class="block text-sm font-medium text-slate-700">Condition</label>
                    <select id="condition" name="condition" required
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                        <option value="new" {{ old('condition') == 'new' ? 'selected' : '' }}>New</option>
                        <option value="like_new" {{ old('condition') == 'like_new' ? 'selected' : '' }}>Like New</option>
                        <option value="good" {{ old('condition') == 'good' ? 'selected' : '' }}>Good</option>
                        <option value="fair" {{ old('condition') == 'fair' ? 'selected' : '' }}>Fair</option>
                        <option value="poor" {{ old('condition') == 'poor' ? 'selected' : '' }}>Poor</option>
                        <option value="needs_repair" {{ old('condition') == 'needs_repair' ? 'selected' : '' }}>Needs Repair</option>
                    </select>
                </div>

                <div>
                    <label for="condition_note" class="block text-sm font-medium text-slate-700">Condition details <span class="font-normal text-slate-400">(optional)</span></label>
                    <input id="condition_note" name="condition_note" type="text" maxlength="100"
                           value="{{ old('condition_note') }}"
                           placeholder="e.g. Small scratch on the back, battery lasts 4 hours"
                           class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                    <p class="text-xs text-slate-400 mt-1">Describe the exact condition buyers should know about this item.</p>
                </div>

                <div>
                    <label for="location" class="block text-sm font-medium text-slate-700">Location</label>
                    <input id="location" name="location" type="text" required placeholder="e.g. Sabo Market, Ogbomoso"
                           value="{{ old('location') }}"
                           class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium text-slate-700">Description</label>
                    <textarea id="description" name="description" rows="5" required
                              class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">{{ old('description') }}</textarea>
                </div>

                <div>
                    <label for="images" class="block text-sm font-medium text-slate-700">Listing Images</label>
                    <input id="images" name="images[]" type="file" accept="image/*" multiple
                           class="mt-1 block w-full text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                    <p class="text-xs text-slate-400 mt-1">Upload up to 10 images (JPEG, PNG, GIF, WebP). Max 2MB each.</p>
                </div>

                <div>
                    <label for="video" class="block text-sm font-medium text-slate-700">Short Item Video <span class="font-normal text-slate-400">(optional)</span></label>
                    <input id="video" name="video" type="file" accept="video/*"
                           class="mt-1 block w-full text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                    <p class="text-xs text-slate-400 mt-1">Upload 1 short video of the actual item (MP4, MOV). Max 50MB.</p>
                </div>

                <button type="submit"
                        class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                    Publish Ad
                </button>
            </form>
        </x-form-card>
    </div>
@endsection
