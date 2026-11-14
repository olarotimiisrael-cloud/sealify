@props(['title' => null, 'subtitle' => null])

<div class="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-emerald-50/40 p-8 sm:p-10 mb-10">
    @if($title || $subtitle)
        <div class="text-center mb-8">
            @if($title)
                <h2 class="text-2xl font-black text-slate-900 mb-2">{{ $title }}</h2>
            @endif
            @if($subtitle)
                <p class="text-slate-600 text-sm">{{ $subtitle }}</p>
            @endif
        </div>
    @endif
    {{ $slot }}
</div>
