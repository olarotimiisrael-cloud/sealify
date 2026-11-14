@extends('layouts.app')

@section('content')
    <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow-sm rounded-2xl border border-slate-100 p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Payments</h2>
            <p class="text-slate-600 mb-6">View your payment history and transactions.</p>
            <div class="text-center py-16">
                <p class="text-slate-500">No payments yet.</p>
            </div>
        </div>
    </div>
@endsection
