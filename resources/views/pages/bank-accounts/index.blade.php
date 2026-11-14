@extends('layouts.app')

@section('content')
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Bank Accounts</h2>
            <p class="text-slate-600 mb-6">Manage your bank account details for withdrawals.</p>
            <div class="text-center py-8">
                <p class="text-slate-500">No bank accounts added yet.</p>
                <button class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors inline-block mt-4">Add Bank Account</button>
            </div>
        </div>
    </div>
@endsection
