import React, { useState, useRef } from 'react';
import { X, QrCode, Download, Share2, Copy, Check, Sparkles, MapPin, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import VerifiedBadge from './VerifiedBadge';
import Logo from './Logo';
import { VerificationBadgeType } from '../types/sealify';

interface StorefrontFlycardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price?: number;
  location?: string;
  image?: string;
  sellerName?: string;
  sellerPhone?: string;
  verificationType?: VerificationBadgeType;
  businessName?: string;
  itemUrl?: string;
}

export const StorefrontFlycardModal: React.FC<StorefrontFlycardModalProps> = ({
  isOpen,
  onClose,
  title,
  price,
  location = 'Ogbomoso, Oyo State',
  image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
  sellerName = 'Verified Merchant',
  sellerPhone = '+234 813 120 8468',
  verificationType = 'individual',
  businessName,
  itemUrl = window.location.href,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formattedPrice = price ? formatNGN(price) : 'Contact for Price';

  // Ensure absolute URL back to this item with social card attribution
  const baseUrl = itemUrl.startsWith('http') 
    ? itemUrl 
    : `${window.location.origin}${itemUrl}`;
  
  // Adding Viral Attribution Tag
  const targetItemUrl = baseUrl.includes('?') 
    ? `${baseUrl}&ref=social_card` 
    : `${baseUrl}?ref=social_card`;

  const promoCaption = `🔥 AVAILABLE ON SEALIFY NIGERIA 🔥\n\n📦 Item: ${title}\n💰 Price: ${formattedPrice}\n📍 Location: ${location}\n👤 Seller: ${businessName || sellerName}\n📞 Phone: ${sellerPhone}\n\n👉 View details & inspect ad here:\n${targetItemUrl}`;

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    targetItemUrl
  )}&color=059669&bgcolor=020617`;

  // Helper to load image securely for Canvas
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  // Generate High-Res 1080x1080 Canvas Image File
  const generateCanvasCard = async (): Promise<{ blob: Blob; file: File; dataUrl: string } | null> => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 1. Dark Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.5, '#0b1329');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Accent subtle glow circle
      const glowGrad = ctx.createRadialGradient(900, 100, 10, 900, 100, 400);
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
      glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(900, 100, 400, 0, Math.PI * 2);
      ctx.fill();

      // Outer Border
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 12;
      ctx.strokeRect(20, 20, 1040, 1040);

      // 2. Header Bar - Brand Logo Text
      ctx.fillStyle = '#10b981';
      ctx.font = '900 42px sans-serif';
      ctx.fillText('SEALIFY', 60, 90);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px sans-serif';
      ctx.fillText('NIGERIA MARKETPLACE', 240, 90);

      // Verified Badge Pill
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.beginPath();
      ctx.roundRect(760, 50, 260, 52, 26);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('✓ VERIFIED AD', 800, 84);

      // 3. Product Main Image Container (Rounded Card)
      const imgX = 60;
      const imgY = 130;
      const imgW = 960;
      const imgH = 540;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 32);
      ctx.clip();

      try {
        const mainImg = await loadImage(image);
        // Draw image cover mode
        const imgRatio = mainImg.width / mainImg.height;
        const targetRatio = imgW / imgH;
        let renderW = imgW;
        let renderH = imgH;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > targetRatio) {
          renderW = imgH * imgRatio;
          offsetX = (imgW - renderW) / 2;
        } else {
          renderH = imgW / imgRatio;
          offsetY = (imgH - renderH) / 2;
        }

        ctx.drawImage(mainImg, imgX + offsetX, imgY + offsetY, renderW, renderH);
      } catch {
        // Fallback placeholder if image load fails
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(imgX, imgY, imgW, imgH);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, imgX + imgW / 2, imgY + imgH / 2);
        ctx.textAlign = 'left';
      }
      ctx.restore();

      // Product Image Border
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, 32);
      ctx.stroke();

      // Price Tag Overlay on Image
      const priceText = formattedPrice;
      ctx.font = '900 48px sans-serif';
      const priceWidth = ctx.measureText(priceText).width;
      
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(imgX + 30, imgY + imgH - 100, priceWidth + 60, 70, 20);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.fillText(priceText, imgX + 60, imgY + imgH - 50);

      // 4. Title & Details Section
      const detailsY = 710;
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 44px sans-serif';

      // Truncate title if needed
      let displayTitle = title;
      if (ctx.measureText(displayTitle).width > 960) {
        displayTitle = title.substring(0, 38) + '...';
      }
      ctx.fillText(displayTitle, 60, detailsY + 30);

      // Location
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 28px sans-serif';
      ctx.fillText(`📍 ${location}`, 60, detailsY + 80);

      // 5. Merchant & QR Footer Card
      const footerY = 830;
      ctx.fillStyle = '#0b1329';
      ctx.beginPath();
      ctx.roundRect(60, footerY, 960, 180, 28);
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Merchant Info
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('CONTACT MERCHANT ON SEALIFY', 90, footerY + 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px sans-serif';
      ctx.fillText(businessName || sellerName, 90, footerY + 95);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 30px monospace';
      ctx.fillText(`📞 ${sellerPhone}`, 90, footerY + 140);

      // QR Code on right side
      try {
        const qrImg = await loadImage(qrDataUrl);
        ctx.drawImage(qrImg, 840, footerY + 20, 140, 140);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(840, footerY + 20, 140, 140);
      } catch {
        // Skip QR if network fails
      }

      // Convert Canvas to Blob and File
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const fileName = `Sealify_Promo_${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
          const file = new File([blob], fileName, { type: 'image/png' });
          const dataUrl = canvas.toDataURL('image/png');
          resolve({ blob, file, dataUrl });
        }, 'image/png');
      });
    } catch (err) {
      console.error('Canvas generation error:', err);
      return null;
    }
  };

  const handleDownloadCard = async () => {
    setIsGenerating(true);
    toast.info('Generating high-res Social Promo Card...');
    const result = await generateCanvasCard();
    setIsGenerating(false);

    if (result) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(result.blob);
      a.download = result.file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Social Promo Card flyer downloaded successfully!');
    } else {
      toast.error('Failed to generate image download. Please try again.');
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(promoCaption);
    setCopiedText(true);
    toast.success('Promo caption copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyDirectLink = () => {
    navigator.clipboard.writeText(targetItemUrl);
    setCopiedLink(true);
    toast.success('Viral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Automatically share Flyer Image + Link together
  const handleAutoShareCard = async () => {
    setIsGenerating(true);
    toast.info('Preparing Social Promo Card & Link for sharing...');
    const result = await generateCanvasCard();
    setIsGenerating(false);

    if (result) {
      // Try Web Share API with File attachment (supported on mobile iOS/Android & macOS Safari/Chrome)
      if (navigator.share) {
        try {
          if (navigator.canShare && navigator.canShare({ files: [result.file] })) {
            await navigator.share({
              title: `${title} — ${formattedPrice} on Sealify`,
              text: promoCaption,
              url: targetItemUrl,
              files: [result.file],
            });
            toast.success('Social Promo Card shared!');
            return;
          }
        } catch (shareErr) {
          // User canceled or share failed, fallback gracefully
          console.warn('File share canceled or unavailable:', shareErr);
        }
      }

      // Fallback if file sharing isn't supported on current browser:
      // Download the flyer card image AND copy link to clipboard / open share
      const a = document.createElement('a');
      a.href = URL.createObjectURL(result.blob);
      a.download = result.file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      navigator.clipboard.writeText(promoCaption);
      toast.success('Promo card image saved to downloads & caption copied to clipboard! Paste directly into WhatsApp/Socials.');

      // Open WhatsApp or generic web share
      const waUrl = `https://wa.me/?text=${encodeURIComponent(promoCaption)}`;
      window.open(waUrl, '_blank');
    } else {
      // Basic link share fallback
      if (navigator.share) {
        navigator.share({
          title: `${title} — ${formattedPrice} on Sealify`,
          text: promoCaption,
          url: targetItemUrl,
        }).catch(() => {});
      } else {
        handleCopyCaption();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">Social Promo Card</h2>
          <p className="text-xs text-slate-400">
            Generate, download & automatically share a high-res flyer card with ad link
          </p>
        </div>

        {/* Live Visual Card Preview */}
        <div id="social-promo-card-preview" className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <Logo size="sm" />
            <VerifiedBadge type={verificationType} showText />
          </div>

          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-emerald-400 font-black text-lg shadow-lg">
              {formattedPrice}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-base font-black text-white line-clamp-2 leading-tight">{title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{location}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-extrabold uppercase text-slate-500">Contact Merchant</p>
                <p className="font-extrabold text-xs text-white truncate">{businessName || sellerName}</p>
                <p className="text-[11px] font-mono text-emerald-400 font-bold">{sellerPhone}</p>
              </div>

              <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0 text-center">
                <img src={qrDataUrl} alt="Scan QR" className="w-12 h-12 rounded" />
                <span className="text-[8px] font-bold text-slate-500 uppercase block mt-0.5">Scan Link</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attributed Share Link */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 text-xs">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Target Ad Link</p>
            <p className="text-emerald-400 font-mono text-[11px] truncate">{targetItemUrl}</p>
          </div>
          <button
            onClick={handleCopyDirectLink}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold shrink-0 transition-colors border border-slate-800"
          >
            {copiedLink ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleDownloadCard}
            disabled={isGenerating}
            className="py-3 bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Download className="w-4 h-4 text-emerald-400" />}
            <span>Download Card</span>
          </button>

          <button
            onClick={handleCopyCaption}
            className="py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Copy Caption</span>
          </button>

          <button
            onClick={handleAutoShareCard}
            disabled={isGenerating}
            className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            <span>Share Card & Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorefrontFlycardModal;