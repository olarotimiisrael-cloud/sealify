@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-10">
            <h2 class="text-3xl font-bold text-slate-900 mb-6">Market Insights</h2>
            <p class="text-slate-600 mb-6">Price trends and demand across categories in Ogbomosoland and Oyo State.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <h4 class="font-bold text-slate-900 mb-2">Electronics</h4>
                    <p class="text-sm text-emerald-600 font-bold">â†‘ 12% demand</p>
                    <p class="text-xs text-slate-500">Avg price: â‚¦180,000</p>
                </div>
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <h4 class="font-bold text-slate-900 mb-2">Vehicles</h4>
                    <p class="text-sm text-emerald-600 font-bold">â†’ Stable</p>
                    <p class="text-xs text-slate-500">Avg price: â‚¦2,500,000</p>
                </div>
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <h4 class="font-bold text-slate-900 mb-2">Real Estate</h4>
                    <p class="text-sm text-rose-600 font-bold">â†“ 8% demand</p>
                    <p class="text-xs text-slate-500">Avg price: â‚¦4,500,000</p>
                </div>
            </div>
        </div>
    </div>
@endsection
