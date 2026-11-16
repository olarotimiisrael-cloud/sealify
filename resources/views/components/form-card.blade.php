@props(['title' => null, 'subtitle' => null])

<div class="relative w-full max-w-md mx-auto">
    {{-- Gradient glow behind the card --}}
    <div class="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 blur-xl opacity-30"></div>

    <div class="relative bg-white/95 backdrop-blur-xl rounded-[2rem] border border-white/70 shadow-2xl shadow-emerald-500/25 p-8 sm:p-10">
        {{-- Top accent bar --}}
        <div class="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-b-full"></div>

        @if($title || $subtitle)
            <div class="text-center mb-8">
                @if($title)
                    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">{{ $title }}</h2>
                @endif
                @if($subtitle)
                    <p class="text-slate-500 text-sm">{{ $subtitle }}</p>
                @endif
            </div>
        @endif

        {{ $slot }}
    </div>
</div>