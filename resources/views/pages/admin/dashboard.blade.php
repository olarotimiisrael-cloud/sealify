@extends('layouts.admin')

@section('adminContent')
<div class="space-y-8">
    <div>
        <h1 class="text-3xl font-black text-slate-900 mb-2">Admin Dashboard</h1>
        <p class="text-slate-600">Manage your marketplace from one place.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                    <p class="text-3xl font-bold text-slate-900 mt-1">{{ $stats['users'] ?? 0 }}</p>
                </div>
                <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">??</div>
            </div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Listings</p>
                    <p class="text-3xl font-bold text-slate-900 mt-1">{{ $stats['active_listings'] ?? 0 }}</p>
                </div>
                <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">??</div>
            </div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending KYC</p>
                    <p class="text-3xl font-bold text-slate-900 mt-1">{{ $stats['pending_kyc'] ?? 0 }}</p>
                </div>
                <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl">??</div>
            </div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Disputes</p>
                    <p class="text-3xl font-bold text-slate-900 mt-1">{{ $stats['open_disputes'] ?? 0 }}</p>
                </div>
                <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl">??</div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="{{ route('admin.users') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                <span class="text-xl">??</span>
                <span class="font-medium text-slate-900">Manage Users</span>
            </a>
            <a href="{{ route('admin.listings') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                <span class="text-xl">??</span>
                <span class="font-medium text-slate-900">Manage Listings</span>
            </a>
            <a href="{{ route('admin.verifications') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                <span class="text-xl">??</span>
                <span class="font-medium text-slate-900">Review KYC</span>
            </a>
            <a href="{{ route('admin.disputes') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                <span class="text-xl">??</span>
                <span class="font-medium text-slate-900">Resolve Disputes</span>
            </a>
        </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
        <div class="space-y-4">
            <div class="flex items-center gap-4 text-sm">
                <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">??</div>
                <div class="flex-1">
                    <p class="font-medium text-slate-900">New user registered</p>
                    <p class="text-xs text-slate-500">Just now</p>
                </div>
            </div>
            <div class="flex items-center gap-4 text-sm">
                <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">??</div>
                <div class="flex-1">
                    <p class="font-medium text-slate-900">New listing posted</p>
                    <p class="text-xs text-slate-500">2 minutes ago</p>
                </div>
            </div>
            <div class="flex items-center gap-4 text-sm">
                <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">??</div>
                <div class="flex-1">
                    <p class="font-medium text-slate-900">KYC submitted for review</p>
                    <p class="text-xs text-slate-500">5 minutes ago</p>
                </div>
            </div>
        </div>
    </div>
<!-- Payment Accounts -->
    <div class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Payment Accounts (Cashout)</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Flutterwave</p>
                <a href="https://flutterwave.com/pay/8eqijxd7cmv1" target="_blank" class="text-sm text-emerald-600 font-bold hover:underline">flutterwave.com/pay/8eqijxd7cmv1</a>
            </div>
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Opay</p>
                <p class="text-sm text-slate-900 font-medium">6117594285</p>
            </div>
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">USDC (Polygon/Ethereum)</p>
                <p class="text-xs text-slate-400 font-mono break-all">0xa82B567566714030363fFf131AC1855CC35A3C07</p>
            </div>
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">USDC (Solana)</p>
                <p class="text-xs text-slate-400 font-mono break-all">313PDEUQoCeLg75C2SfukfZTuMQhfoYm3sAJALL6pVpW</p>
            </div>
        </div>
    </div>
</div>
@endsection

