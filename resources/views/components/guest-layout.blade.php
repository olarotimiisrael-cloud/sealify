{{-- Guest layout for auth pages --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Sealify' }} — Sealify Nigeria</title>
    <meta name="theme-color" content="#10b981">
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
        .dark .border-slate-200 { border-color: #334155 !important; }
        .dark .border-slate-300 { border-color: #475569 !important; }
        .dark .border-gray-200 { border-color: #334155 !important; }
        .dark .text-white { color: #f8fafc !important; }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 dark:text-slate-100">
    <nav class="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div class="relative">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
            <div class="max-w-7xl mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                    <a href="{{ route('home') }}" class="flex items-center gap-2">
                        @include('partials.sealify-logo', ['size' => 'lg', 'class' => 'mr-1'])
                    </a>

                    <div class="flex items-center gap-2">
                        <!-- Notification Bell -->
                        <a href="{{ route('login') }}" class="relative p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors rounded-xl group" title="Notifications (Login required)">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        </a>

                        <!-- Saved Searches -->
                        <a href="{{ route('saved-searches.index') }}" class="p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl" title="Saved Searches">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </a>

                        <!-- Theme Switch -->
                        <button type="button" onclick="toggleTheme()" class="p-2 text-slate-800 hover:text-emerald-600 hover:bg-emerald-50 transition-colors rounded-xl" id="theme-toggle" title="Toggle Theme">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <div class="relative pt-20 pb-12 min-h-[calc(100vh-152px)] flex items-center justify-center px-4 overflow-hidden">
        {{-- Decorative gradient blobs --}}
        <div class="pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-40 dark:opacity-10"></div>
        <div class="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-teal-200 rounded-full blur-3xl opacity-40 dark:opacity-10"></div>
        <div class="pointer-events-none absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-30 dark:opacity-10"></div>

        <div class="relative w-full">
            {{ $slot }}
        </div>
    </div>

    @include('partials.footer')

    @include('partials.feedback-button')

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
