@extends('layouts.app')

@section('content')
<div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div class="p-6">
            <div class="flex items-center gap-2 mb-8">
                <img src="{{ asset('logo.png') }}" alt="Sealify" class="h-7 w-auto">
                <span class="font-black text-lg tracking-tight"><span class="text-[#1e3a5f]">Seal</span><span class="text-amber-500">ify</span></span>
            </div>
            <p class="text-xs text-slate-500 uppercase tracking-widest mb-6 font-bold">Admin Panel</p>

            <nav class="space-y-1">
                <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 011 1M7 20h4v-4H7z"></path></svg>
                    Dashboard
                </a>
                <a href="{{ route('admin.users') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Users
                </a>
                <a href="{{ route('admin.listings') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    Listings
                </a>
                <a href="{{ route('admin.categories') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    Categories
                </a>
                <a href="{{ route('admin.verifications') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    KYC Verifications
                </a>
                <a href="{{ route('admin.disputes') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Disputes
                </a>
                <a href="{{ route('admin.reports') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    Reports
                </a>
                <a href="{{ route('admin.neighborhood-hubs') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Neighborhood Hubs
                </a>
                <a href="{{ route('admin.payments.receipts') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path></svg>
                    Promotion Payments
                </a>
                <a href="{{ route('admin.transactions') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Transactions
                </a>
                <a href="{{ route('admin.system-config') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-1.063-2.573c.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37M9 10a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zM5 21c1.952 0 3.6-1.307 4.274-2.956.768-1.934 2.243-3.57 4.461-4.675a48 48 0 00-2.678-.127M15 11c-1.333 0-2.667.334-4 .998-.047.023-.092.049-.141.07-.676.28-1.293.79-1.809 1.414-.78.937-1.106 2.035-1.106 3.118v.986c0 .357.123.68.309.905q.027.04.056.081.286.388.62.719c.441.437 1.046.692 1.702.692h.002c.672 0 1.29-.272 1.733-.709q.156-.146.29-.33c.184-.225.296-.544.296-.94v-.985c0-.611-.212-1.152-.526-1.569a8 8 0 00-1.568-1.273c-.441-.437-1.046-.691-1.702-.692h-.002c-.671 0-1.289.269-1.701.706q-.152.144-.277.324c-.192.24-.306.565-.306.919v.984c0 1.079.326 2.181.875 3.042.782 1.239 1.658 1.997 2.597 2.145.433.068.852.106 1.253.106h.002c.414 0 .82-.038 1.224-.109a48 48 0 00-1.646-.26c-.265-.066-.517-.147-.77-.247m-4.934 5.033c.64.213 1.328.325 2.052.325a48 48 0 003.882-.325M13 21c-1.11 0-2.08-.402-2.599-1M9 21c.51.098 1.018.165 1.541.165a48 48 0 003.918-.325m-4.934-5.033c-.64-.213-1.328-.325-2.052-.325a48 48 0 00-3.882.325z"></path></svg>
                    System Config
                </a>
                <a href="{{ route('admin.seo') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    SEO &amp; Ads
                </a>
                <a href="{{ route('admin.announcements') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.418-9.418a4 4 0 10-5.656 5.656m7.071-2.828 2.829 2.829a1 1 0 010 1.414l-4.243 4.243a1 1 0 01-1.414 0l-2.828-2.829a1 1 0 00-1.414 0l-2.829 2.829a1 1 0 01-1.414 0l-4.243-4.243a1 1 0 010-1.414l2.828-2.829a1 1 0 011.414 0l4.243 4.243a1 1 0 011.414 0l2.829-2.829a1 1 0 011.414 0z"></path></svg>
                    Announcements
                </a>
                <a href="{{ route('admin.badge-applications') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Badge Applications
                </a>
                <a href="{{ route('admin.email.broadcaster') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V3M3 7l9 1m-9 1l9-1M3 13l9 1m-9 1l9-1M3 13v10a4 4 0 004 4h10a4 4 0 004-4V13"></path></svg>
                    Email Broadcaster
                </a>
                <a href="{{ route('admin.sms-otp') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 011 1.453l-.986 2.89a2 2 0 011.143 1.491l1.549.773c.256.128.509.193.771.193h1.71c.756 0 .999-.256.999-.53V9a2 2 0 012-2h.002h5a2 2 0 012 2v5.093c0 .35.339.581.688.53h1.71c.262 0 .515-.065.771-.193l1.549-.773a2 2 0 011.143-1.491l-.986-2.89a1 1 0 011-1.453H19a2 2 0 012-2h6a2 2 0 012 2v3a2 2 0 01-2 2h-5.897l-.986 2.89a2 2 0 01-1.143 1.491l-1.549.773c-.256.128-.509.193-.771.193h-1.71c-.262 0-.515.065-.771.193l-1.549.773a2 2 0 01-1.143-1.491l-.986-2.89a1 1 0 011-1.453h2.285l.986-2.89a1 1 0 011-1.453h1.71c.262 0 .515-.065.771-.193l1.549-.773a2 2 0 011.143-1.491l-.986-2.89a1 1 0 011-1.453H19a2 2 0 012-2v-1a2 2 0 002-2h-6a2 2 0 00-2 2h-5.897l-.986 2.89a2 2 0 00-1.143 1.491l-1.549.773c-.256.128-.509.193-.771.193h-1.71c-.262 0-.515.065-.771.193l-1.549.773a2 2 0 01-1.143-1.491l-.986-2.89a1 1 0 011-1.453h2.285l.986-2.89a1 1 0 011-1.453H3z"></path></svg>
                    SMS OTP
                </a>
            </nav>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-6 lg:p-10">
        @yield('adminContent')
    </main>
</div>
@endsection
