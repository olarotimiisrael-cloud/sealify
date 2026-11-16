@props(['class' => '', 'size' => 'lg'])

{--
  Sealify brand wordmark: "Seal" in deep navy, "ify" in gold/amber.
  size: sm (text-base), md (text-lg), lg (text-xl), xl (text-2xl)
--}
@php
    $sizeMap = [
        'sm' => 'text-base',
        'md' => 'text-lg',
        'lg' => 'text-xl',
        'xl' => 'text-2xl',
    ];
    $textSize = $sizeMap[$size] ?? 'text-xl';
@endphp

<div class="sealify-logo inline-flex items-center gap-0 {{ $class }}">
    <span class="{{ $textSize }} font-black tracking-tight text-[#0f172a] sealify-seal">Seal</span>
    <span class="{{ $textSize }} font-black tracking-tight text-[#f59e0b] drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] sealify-ify">ify</span>
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
    .sealify-logo .sealify-seal {
        animation: sealifyFadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    .sealify-logo .sealify-ify {
        animation: sealifyFadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both,
                   sealifyGlow 2s ease-in-out 0.8s infinite;
    }
</style>