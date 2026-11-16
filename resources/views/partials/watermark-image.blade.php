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
$logoUrl = asset('logo.png');
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

    {{-- Transparent Sealify watermark using original logo --}}
    <div class="absolute bottom-3 right-3 z-20 pointer-events-none">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/45 backdrop-blur-sm border border-white/20 shadow-xl text-white">
            <img src="{{ $logoUrl }}"
                 alt="Sealify"
                 class="w-5 h-5 object-contain"
                 onerror="this.style.display='none'">
            <span class="text-[10px] font-black text-white tracking-widest uppercase shadow-lg leading-none opacity-95">
                SEALIFY
            </span>
        </div>
    </div>

    {{-- Download with canvas-burned Sealify watermark --}}
    @if ($download)
        <button type="button"
                class="absolute bottom-3 left-3 z-20 p-1.5 bg-black/45 backdrop-blur-sm hover:bg-black/60 text-white rounded-lg transition-colors"
                onclick="sealifyDownloadImage(this, '{{ addslashes($src) }}', '{{ addslashes($alt) }}')"
                aria-label="Download image with Sealify watermark"
                title="Download image — Sealify watermark included">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
        </button>
    @endif
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

        // Transparent bottom-right watermark band
        const bandH = Math.round(h * 0.13);
        const bandY = h - bandH;
        const grad = ctx.createLinearGradient(0, bandY, 0, h);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.45)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, bandY, w, bandH);

        // Sealify logo mark (circle)
        const logoR = Math.round(Math.min(w, h) * 0.05);
        const logoX = Math.round(w * 0.045);
        const logoY = bandY + bandH / 2;
        ctx.beginPath();
        ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();

        // Load and draw actual Sealify logo
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = '{{ addslashes(asset('logo.png')) }}';
        logoImg.onload = function () {
            const logoW = logoR * 1.8;
            const logoH = logoR * 1.8;
            ctx.drawImage(logoImg, logoX - logoW / 2, logoY - logoH / 2, logoW, logoH);

            // Sealify name next to logo
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(w * 0.036)}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = 'start';
            ctx.textBaseline = 'middle';
            ctx.fillText('SEALIFY', logoX + logoR * 1.3, logoY);

            // Subtle diagonal repeating watermark across whole image
            ctx.save();
            ctx.translate(w * 0.18, h * 0.45);
            ctx.rotate(-20);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
            ctx.font = `bold ${Math.round(w * 0.09)}px system-ui, -apple-system, sans-serif`;
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
        logoImg.onerror = function () {
            // Fallback: draw text S if logo fails
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${logoR * 0.9}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('S', logoX, logoY);
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(w * 0.036)}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = 'start';
            ctx.textBaseline = 'middle';
            ctx.fillText('SEALIFY', logoX + logoR * 1.3, logoY);

            const link = document.createElement('a');
            link.download = 'sealify-' + Date.now() + '.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    };
    img.onerror = function () {
        window.location.href = src;
    };
}
</script>
@endpush
