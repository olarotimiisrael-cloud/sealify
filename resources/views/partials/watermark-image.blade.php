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
         crossOrigin="anonymous"
         {{ $width ? "width=\"{$width}\"" : '' }}
         {{ $height ? "height=\"{$height}\"" : '' }}
         loading="lazy"
         decoding="async">

    {{-- Transparent Sealify watermark using original logo (always visible, captured by screenshots) --}}
    <div class="absolute bottom-3 left-3 z-20 pointer-events-none">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/50 backdrop-blur-sm border border-white/30 shadow-xl text-white">
            <img src="{{ $logoUrl }}"
                 alt="Sealify"
                 class="w-5 h-5 object-contain"
                 onerror="this.style.display='none'">
            <span class="text-[10px] font-black text-white tracking-widest uppercase shadow-lg leading-none opacity-95">
                SEALIFY
            </span>
        </div>
    </div>

    {{-- Prominent download button — burns Sealify watermark into saved image --}}
    @if ($download)
        <button type="button"
                class="absolute inset-x-0 bottom-0 z-30 w-full bg-gradient-to-t from-black/80 via-transparent to-transparent px-4 pb-6 pt-2 backdrop-blur-md"
                onclick="sealifyDownloadImage('{{ addslashes($src) }}', '{{ addslashes($alt) }}')"
                aria-label="Download image with Sealify watermark"
                title="Download image — Sealify watermark included">
            <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span class="text-xs font-bold text-white tracking-widest uppercase shadow-lg">
                    Download with Sealify Watermark
                </span>
            </div>
        </button>
    @endif
</div>

@push('scripts')
<script>
function sealifyDownloadImage(src, alt) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const scale = Math.max(1, 1600 / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw source image
        ctx.drawImage(img, 0, 0, w, h);

        // Transparent bottom-right watermark band
        const bandH = Math.round(h * 0.14);
        const bandY = h - bandH;
        const grad = ctx.createLinearGradient(0, bandY, 0, h);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, bandY, w, bandH);

        // Sealify logo mark (circle)
        const logoR = Math.round(Math.min(w, h) * 0.055);
        const logoX = Math.round(w * 0.05);
        const logoY = bandY + bandH / 2;
        ctx.beginPath();
        ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fill();

        // Load and draw actual Sealify logo
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = '{{ addslashes(asset('logo.png')) }}';
        logoImg.onload = function () {
            const logoW = logoR * 1.7;
            const logoH = logoR * 1.7;
            ctx.drawImage(logoImg, logoX - logoW / 2, logoY - logoH / 2, logoW, logoH);

            // Sealify name next to logo
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(w * 0.04)}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = 'start';
            ctx.textBaseline = 'middle';
            ctx.fillText('SEALIFY', logoX + logoR * 1.4, logoY);

            // Diagonal repeating watermark across whole image
            ctx.save();
            ctx.translate(w * 0.2, h * 0.4);
            ctx.rotate(-22);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.font = `bold ${Math.round(w * 0.11)}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let i = -3; i <= 3; i++) {
                ctx.fillText('SEALIFY', i * w * 0.5, 0);
            }
            ctx.restore();

            // Trigger download
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
            ctx.font = `bold ${Math.round(w * 0.04)}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = 'start';
            ctx.textBaseline = 'middle';
            ctx.fillText('SEALIFY', logoX + logoR * 1.4, logoY);

            const link = document.createElement('a');
            link.download = 'sealify-' + Date.now() + '.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    };
    img.onerror = function () {
        // Canvas failed (CORS), fall back to direct download
        const link = document.createElement('a');
        link.download = 'sealify-' + Date.now() + '.jpg';
        link.href = src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}
</script>
@endpush
