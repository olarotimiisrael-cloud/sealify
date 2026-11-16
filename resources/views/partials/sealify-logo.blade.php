@php
    $size = $size ?? 'lg';
    $class = $class ?? '';
    $sizeMap = [
        'sm' => 'text-base',
        'md' => 'text-lg',
        'lg' => 'text-xl',
        'xl' => 'text-2xl',
    ];
    $iconMap = [
        'sm' => 'h-6 w-auto',
        'md' => 'h-7 w-auto',
        'lg' => 'h-8 w-auto',
        'xl' => 'h-10 w-auto',
    ];
    $textSize = $sizeMap[$size] ?? 'text-xl';
    $iconSize = $iconMap[$size] ?? 'h-8 w-auto';
@endphp

<div class="sealify-logo inline-flex items-center gap-1 {{ $class }}">
    <img src="{{ asset('logo-small.png') }}" alt="Sealify" class="{{ $iconSize }} shrink-0 drop-shadow-sm">
    <span class="sealify-wordmark inline-flex items-center gap-0">
        <span class="{{ $textSize }} font-black tracking-tight sealify-seal">Seal</span>
        <span class="{{ $textSize }} font-black tracking-tight sealify-ify">ify</span>
    </span>
</div>

<style>
    @keyframes sealifyFadeIn {
        0% { opacity: 0; transform: translateY(-8px) scale(0.9); }
        50% { opacity: 0.5; transform: translateY(2px) scale(1.02); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes sealifyGlow {
        0%, 100% { filter: drop-shadow(0 0 4px rgba(245,158,11,0.4)); }
        50% { filter: drop-shadow(0 0 12px rgba(245,158,11,0.8)); }
    }
    .sealify-logo .sealify-seal { color: #0f172a; animation: sealifyFadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    .sealify-logo .sealify-ify { color: #f59e0b; animation: sealifyFadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both, sealifyGlow 2s ease-in-out 0.8s infinite; }
    .dark .sealify-logo .sealify-seal { color: #ffffff; }
    .dark .sealify-logo .sealify-ify { color: #fbbf24; }
</style>