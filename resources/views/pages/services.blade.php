@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-10 text-center">
            <h2 class="text-3xl font-bold text-slate-900 mb-4">Services</h2>
            <p class="text-slate-600 mb-8">Professional services from verified providers across Ogbomosoland and Oyo State.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="w-12 h-12 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-xl">ðŸ”§</div>
                    <h4 class="font-bold text-slate-900 mb-2">Home Services</h4>
                    <p class="text-xs text-slate-600">Plumbing, electrical, cleaning, repairs.</p>
                </div>
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="w-12 h-12 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-xl">ðŸ’‡</div>
                    <h4 class="font-bold text-slate-900 mb-2">Beauty &amp; Wellness</h4>
                    <p class="text-xs text-slate-600">Salons, spas, fitness, barbers.</p>
                </div>
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="w-12 h-12 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-xl">ðŸ“š</div>
                    <h4 class="font-bold text-slate-900 mb-2">Tutorials &amp; Training</h4>
                    <p class="text-xs text-slate-600">Lessons, coaching, skill acquisition.</p>
                </div>
            </div>
        </div>
    </div>
@endsection
