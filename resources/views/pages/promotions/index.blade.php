@extends('layouts.app')

@section('content')
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Promotions</h2>
            <p class="text-slate-600 mb-6">Boost your listings with paid promotion.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <h4 class="font-bold text-slate-900 mb-2">1 Month</h4>
                    <p class="text-lg font-bold text-emerald-600 mb-4">â‚¦15,000</p>
                    <p class="text-xs text-slate-600 mb-4">Featured placement</p>
                    <button class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-sm">Promote</button>
                </div>
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <h4 class="font-bold text-slate-900 mb-2">3 Months</h4>
                    <p class="text-lg font-bold text-emerald-600 mb-4">â‚¦39,000</p>
                    <p class="text-xs text-slate-600 mb-4">Featured placement</p>
                    <button class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-lg text-sm">Promote</button>
                </div>
            </div>
        </div>
    </div>
@endsection
