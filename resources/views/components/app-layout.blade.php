{{-- App layout for authenticated pages --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Sealify' }} — Sealify Nigeria</title>
    <meta name="description" content="Buy, sell, and connect locally in Ogbomosoland, Oyo State, and across Nigeria.">
    <meta name="theme-color" content="#10b981">
    <link rel="icon" type="image/png" href="{{ asset('logo.png') }}">
    <script src="https://cdn.tailwindcss.com"></script>
    @stack('styles')
</head>
<body class="bg-white text-slate-900 font-sans antialiased">

    <nav class="bg-white border-b border-emerald-50 sticky top-0 z-50 shadow-sm">
        <div class="relative">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
            <div class="max-w-7xl mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                    <a href="{{ route('home') }}" class="flex items-center gap-2 group">
                        <img src="{{ asset('logo.png') }}" alt="Sealify" class="h-8 w-auto">
                        <span class="text-emerald-600 font-black text-xl tracking-tight">Sealify</span>
                    </a>

                    <div class="hidden md:flex items-center gap-4">
                        <a href="{{ route('home') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Home</a>
                        <a href="{{ route('listings.index') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Listings</a>
                        <a href="{{ route('services') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Services</a>
                        <a href="{{ route('how-it-works') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">How It Works</a>
                        <a href="{{ route('contact') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Contact</a>
                    </div>

                    <div class="flex items-center gap-3">
                        <a href="{{ route('messages.index') }}" class="relative p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </a>
                        <a href="{{ route('notifications.index') }}" class="relative p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v-.347C7.67 6.165 9 8.51 9 11a1.5 1.5 0 003 0m-1 15l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        </a>
                        <a href="{{ route('profile.show') }}" class="p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </a>

                        @if (auth()->user()->isAdmin())
                            <a href="{{ route('admin.dashboard') }}" class="p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </a>
                        @endif

                        <form method="POST" action="{{ route('logout') }}" class="inline">
                            @csrf
                            <button type="submit" class="p-2 text-slate-800 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-xl">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="py-8">
        {{ $slot }}
    </div>

    <footer class="bg-white border-t border-slate-200 pt-12 pb-24 mt-12 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 space-y-10">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <div class="flex items-center gap-2 mb-3">
                        <img src="{{ asset('logo.png') }}" alt="Sealify" class="h-6 w-auto">
                        <span class="text-emerald-600 font-black text-lg tracking-tight">Sealify</span>
                    </div>
                    <p class="text-xs text-slate-800 leading-relaxed">
                        Nigeria's most trusted local marketplace. Connecting verified buyers and sellers in Ogbomosoland, Oyo State, and across Nigeria.
                    </p>
                </div>
                <div class="space-y-2">
                    <p class="text-xs font-bold text-slate-700 uppercase tracking-wider">Marketplace</p>
                    <ul class="space-y-1 text-xs text-slate-800">
                        <li><a href="{{ route('listings.index') }}" class="hover:text-emerald-600">Browse All Ads</a></li>
                        <li><a href="{{ route('listings.create') }}" class="hover:text-emerald-600">Post an Ad</a></li>
                        <li><a href="{{ route('safety') }}" class="hover:text-emerald-600">Safety Center</a></li>
                    </ul>
                </div>
                <div class="space-y-2">
                    <p class="text-xs font-bold text-slate-700 uppercase tracking-wider">Support</p>
                    <ul class="space-y-1 text-xs text-slate-800">
                        <li><a href="{{ route('faq') }}" class="hover:text-emerald-600">Help &amp; FAQ</a></li>
                        <li><a href="{{ route('contact') }}" class="hover:text-emerald-600">Contact</a></li>
                        <li><a href="{{ route('dispute') }}" class="text-rose-600 hover:text-rose-300">File Trade Dispute</a></li>
                    </ul>
                </div>
            </div>
            <div class="pt-8 border-t border-slate-200 text-[10px] text-slate-800 uppercase font-black tracking-widest">
                © 2027 SEALIFY NIGERIA. ALL RIGHTS RESERVED.
            </div>
        </div>
    </footer>

    @stack('scripts')
</body>
</html>
