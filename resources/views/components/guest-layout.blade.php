{{-- Guest layout for auth pages --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Sealify' }} — Sealify Nigeria</title>
    <meta name="theme-color" content="#10b981">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    <style>
        body { background-color: #f8fafc; color: #0f172a; }
    </style>
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
<body class="dark:bg-slate-900 dark:text-slate-100">
    <nav class="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div class="relative">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
            <div class="max-w-7xl mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                <a href="{{ route('home') }}" class="flex items-center gap-2">
                    @include('partials.sealify-logo', ['size' => 'lg', 'class' => 'mr-1'])
                </a>
                </div>
            </div>
        </div>
    </nav>

    <div class="pt-20 pb-12 min-h-[calc(100vh-152px)]">
        {{ $slot }}
    </div>

    @include('partials.footer')

    @stack('scripts')
</body>
</html>
