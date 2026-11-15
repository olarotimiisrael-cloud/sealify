{{-- Guest layout for auth pages --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Sealify' }} — Sealify Nigeria</title>
    <meta name="theme-color" content="#10b981">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { @apply bg-slate-50 text-slate-900 font-sans antialiased; }
    </style>
    @stack('styles')
</head>
<body>
    <nav class="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div class="relative">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
            <div class="max-w-7xl mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                    <a href="{{ route('home') }}" class="flex items-center gap-2">
                        <img src="{{ asset('logo.png') }}" alt="Sealify" class="h-8 w-auto">
                        <span class="text-emerald-600 font-black text-xl tracking-tight">Sealify</span>
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
