@extends('layouts.admin')

@section('content')
<div class="space-y-8">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-black text-slate-900 mb-2">System Configuration</h1>
            <p class="text-slate-600">Configure marketplace settings and site preferences.</p>
        </div>
        <a href="{{ route('admin.dashboard') }}" class="text-sm text-emerald-600 font-bold hover:underline">← Back to Dashboard</a>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <form method="POST" action="{{ route('admin.system-config.update') }}" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            @csrf
            @foreach ($settings as $key => $value)
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{{ ucwords(str_replace('_', ' ', $key)) }}</label>
                    <input name="{{ $key }}" type="text" value="{{ old($key, $value) }}"
                           class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                </div>
            @endforeach
            <div class="col-span-2">
                <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300">
                    Save Configuration
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
