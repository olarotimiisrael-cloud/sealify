@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-10">
            <h2 class="text-3xl font-bold text-slate-900 mb-6">Help &amp; FAQ</h2>
            <div class="space-y-4">
                <div class="border border-slate-200 rounded-xl overflow-hidden">
                    <button class="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-50 hover:bg-emerald-50 transition-colors" data-collapse-toggle="faq-1">
                        <span class="font-medium text-slate-900">How do I post an ad?</span>
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div id="faq-1" class="hidden px-4 pb-4">
                        <p class="text-slate-600 text-sm">Go to "Post an Ad", fill in the details, add photos, and publish. Your ad goes live after review.</p>
                    </div>
                </div>
                <div class="border border-slate-200 rounded-xl overflow-hidden">
                    <button class="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-50 hover:bg-emerald-50 transition-colors" data-collapse-toggle="faq-2">
                        <span class="font-medium text-slate-900">Is it safe to meet sellers?</span>
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div id="faq-2" class="hidden px-4 pb-4">
                        <p class="text-slate-600 text-sm">Yes. Use our verified Safe Spots (police stations, malls) and never send money before inspecting the item.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
