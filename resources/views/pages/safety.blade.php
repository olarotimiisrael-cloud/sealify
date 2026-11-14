@extends('layouts.app')

@section('content')
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-10 text-center">
            <h2 class="text-3xl font-bold text-slate-900 mb-6">Safety Center</h2>
            <p class="text-slate-600 mb-8">Trade safely with verified Safe Spots across Ogbomosoland.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="w-10 h-10 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 text-xl">ðŸš”</div>
                    <h4 class="font-bold text-slate-900 mb-2">Police Safe Zones</h4>
                    <p class="text-xs text-slate-600">Ogbomoso Divisional Police HQ â€” 24/7, CCTV verified.</p>
                </div>
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="w-10 h-10 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 text-xl">ðŸ¥</div>
                    <h4 class="font-bold text-slate-900 mb-2">Hospital Security Posts</h4>
                    <p class="text-xs text-slate-600">LAUTECH Teaching Hospital â€” safe, well-lit meeting area.</p>
                </div>
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50">
                    <div class="w-10 h-10 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 text-xl">ðŸª</div>
                    <h4 class="font-bold text-slate-900 mb-2">Shopping Malls</h4>
                    <p class="text-xs text-slate-600">Takie Square Mall â€” public, CCTV monitored.</p>
                </div>
            </div>
        </div>
    </div>
@endsection
