@props([
    'src' => null,
    'alt' => 'Listing image',
    'class' => '',
    'width' => null,
    'height' => null,
    'download' => true,
])

<?php
$style = '';
if ($width)  $style .= "width:{$width}px;";
if ($height) $style .= "height:{$height}px;";
?>

<div class="relative inline-block overflow-hidden rounded-2xl shadow-sm border border-slate-200 {{ $class }}"
     {{ $style ? 'style="'.$style.'"': '' }}>
    <img src="{{ $src }}"
         alt="{{ $alt }}"
         class="block w-full h-full object-cover"
         {{ $width ? "width=\"{$width}\"" : '' }}
         {{ $height ? "height=\"{$height}\"" : '' }}
         loading="lazy"
         decoding="async">

    {{-- Always-visible Sealify watermark — captured by screenshots and screen-shares --}}
    <div class="absolute bottom-3 right-3 z-20 pointer-events-none">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/20 shadow-xl text-white">
            <div class="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-black text-white shadow-lg border border-white/30">
                S
            </div>
            <span class="text-[10px] font-black text-white tracking-widest uppercase shadow-lg leading-none">
                SEALIFY
            </span>
        </div>
    </div>

    {{-- Download with canvas-burned Sealify watermark --}}
    @if ($download)
        <button type="button"
                class="absolute bottom-3 left-3 z-20 p-1.5 bg-slate-900/80 backdrop-blur-md hover:bg-slate-900 text-white rounded-lg transition-colors"
                onclick="sealifyDownloadImage(this, '{{ addslashes($src) }}', '{{ addslashes($alt) }}')"
                aria-label="Download image with Sealify watermark"
                title="Download image — Sealify watermark included">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
        </button>
    @if ($download)
</div>

@push('scripts')
<script>
function sealifyDownloadImage(btn, src, alt) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const scale = Math.max(1, 1200 / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw source image
        ctx.drawImage(img, 0, 0, w, h);

        // Bottom-right watermark band
        const bandH = Math.round(h * 0.13);
        const bandY = h - bandH;
        const grad = ctx.createLinearGradient(0, bandY, 0, h);
        grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, bandY, w, bandH);

        // Sealify logo mark (circle with S)
        const logoR = Math.round(Math.min(w, h) * 0.055);
        const logoX = Math.round(w * 0.05);
        const logoY = bandY + bandH / 2;
        ctx.beginPath();
        ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${logoR * 0.9}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', logoX, logoY);

        // Sealify name
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(w * 0.04)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'start';
        ctx.textBaseline = 'middle';
        ctx.fillText('SEALIFY', logoX + logoR * 1.5, logoY);

        // Diagonal repeating watermark across whole image
        ctx.save();
        ctx.translate(w * 0.2, h * 0.45);
        ctx.rotate(-22);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.font = `bold ${Math.round(w * 0.10)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = -3; i <= 3; i++) {
            ctx.fillText('SEALIFY', i * w * 0.5, 0);
        }
        ctx.restore();

        const link = document.createElement('a');
        link.download = 'sealify-' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    img.onerror = function () {
        window.location.href = src;
    };
}
</script>
@endpush
