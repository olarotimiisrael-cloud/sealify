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
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    @stack('styles')
    <style>
        .dark .text-slate-900 { color: #e2e8f0 !important; }
        .dark .text-slate-800 { color: #cbd5e1 !important; }
        .dark .text-slate-700 { color: #94a3b8 !important; }
        .dark .text-slate-600 { color: #64748b !important; }
        .dark .text-slate-500 { color: #94a3b8 !important; }
        .dark .text-slate-400 { color: #64748b !important; }
        .dark .text-slate-300 { color: #94a3b8 !important; }
        .dark .bg-white { background-color: #0f172a !important; }
        .dark .bg-gray-50 { background-color: #0f172a !important; }
        .dark .bg-gray-100 { background-color: #1e293b !important; }
        .dark .border-slate-200 { border-color: #334155 !important; }
        .dark .border-slate-300 { border-color: #475569 !important; }
        .dark .border-gray-200 { border-color: #334155 !important; }
        .dark .text-white { color: #f8fafc !important; }
    </style>
</head>
<body class="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-sans antialiased">

    <nav class="bg-white border-b border-emerald-50 sticky top-0 z-50 shadow-sm">
        <div class="relative">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
            <div class="max-w-7xl mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                <a href="{{ route('home') }}" class="flex items-center gap-2 group">
                    @include('partials.sealify-logo', ['size' => 'lg', 'class' => 'mr-1'])
                </a>

                    <div class="hidden md:flex items-center gap-4">
                        <a href="{{ route('home') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Home</a>
                        <a href="{{ route('listings.index') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Listings</a>
                        <a href="{{ route('services') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Services</a>
                        <a href="{{ route('how-it-works') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">How It Works</a>
                        <a href="{{ route('contact') }}" class="text-slate-800 hover:text-emerald-600 transition-colors font-bold">Contact</a>
                    </div>

                    <div class="flex items-center gap-3">
                        <a href="{{ route('messages.index') }}" class="relative p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl group">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-4-4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm8 0c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z"/></svg>
                            @php
                                $unreadMessages = App\Models\Message::where('receiver_id', auth()->id())->where('is_read', false)->count();
                            @endphp
                            @if ($unreadMessages > 0)
                                <span class="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{{ $unreadMessages }}</span>
                            @endif
                        </a>
                        <a href="{{ route('notifications.index') }}" class="relative p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl group">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13 19l0-1M14 19l0-1M19 19l0-1"></path></svg>
                            @php
                                $unreadNotifications = App\Models\Notification::where('user_id', auth()->id())->where('read_at', null)->count();
                            @endphp
                            @if ($unreadNotifications > 0)
                                <span class="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{{ $unreadNotifications }}</span>
                            @endif
                        </a>
                        <a href="{{ route('profile.show') }}" class="p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </a>

                        <!-- Saved Searches -->
                        <a href="{{ route('saved-searches.index') }}" class="p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl" title="Saved Searches">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </a>

                        <!-- Theme Switch -->
                        <button type="button" onclick="toggleTheme()" class="p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl" id="theme-toggle" title="Toggle Theme">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                        </button>

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
                        @include('partials.sealify-logo', ['size' => 'md', 'class' => 'mr-1'])
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

    <script>
        function toggleTheme() {
            const html = document.documentElement;
            const isDark = html.classList.contains('dark');
            html.classList.toggle('dark');
            localStorage.setItem('sealify-theme', isDark ? 'light' : 'dark');
        }

        // Restore saved theme on load
        (function () {
            const saved = localStorage.getItem('sealify-theme');
            if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            }
        })();
    </script>
</body>
</html>
