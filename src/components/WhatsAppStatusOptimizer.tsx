import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { toast } from 'sonner';
import { Smartphone, Download, Share2, Image, QrCode, ArrowRight, Link } from 'lucide-react';

interface WhatsAppStatusProps {
  adId?: string;
  adData?: {
    title: string;
    price: number;
    description?: string;
    sellerName?: string;
    sellerAvatar?: string;
    images?: string[];
    category?: string;
    location?: string;
  };
  onGenerate?: (url: string) => void;
}

export const WhatsAppStatusOptimizer: React.FC<WhatsAppStatusProps> = ({
  adId,
  adData,
  onGenerate,
}) => {
  const { user } = useSealify();
  const [statusImage, setStatusImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [templateSelected, setTemplateSelected] = useState<string>('professional');
  const [colorScheme, setColorScheme] = useState<'trust' | 'urgent' | 'promo' | 'premium'>('trust');

  // WhatsApp Status optimized dimensions: 9:16 aspect ratio
  const statusDimensions = { width: 1080, height: 1920 };

  // Pre-designed templates for different ad categories
  const templates = {
    professional: {
      name: 'Professional Clean',
      bgColor: '#1f2937',
      titleColor: '#ffffff',
      accentColor: '#60a5fa',
      description: 'Clean, professional look for services and high-value items',
    },
    trust: {
      name: 'Trust Builder',
      bgColor: '#064e3b',
      titleColor: '#dcfce7',
      accentColor: '#10b981',
      description: 'Green-based scheme that builds trust and credibility',
    },
    urgent: {
      name: 'Urgency Driver',
      bgColor: '#7f1d1d',
      titleColor: '#fecaca',
      accentColor: '#f87171',
      description: 'Red-based scheme that creates FOMO and urgency',
    },
    premium: {
      name: 'Premium Luxury',
      bgColor: '#111827',
      titleColor: '#f3f4f6',
      accentColor: '#fbbf24',
      description: 'Dark scheme with gold accents for luxury items',
    },
  };

  // Generate WhatsApp Status optimized card
  const generateStatusCard = async () => {
    if (!adData || !adData.title) {
      toast.error('Ad data required to generate status card');
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = statusDimensions.width;
      canvas.height = statusDimensions.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      const t = templates[colorScheme];

      // Background
      ctx.fillStyle = t.bgColor;
      ctx.fillRect(0, 0, statusDimensions.width, statusDimensions.height);

      // Gradient overlay for depth
      const gradient = ctx.createLinearGradient(0, 0, 0, statusDimensions.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, statusDimensions.width, statusDimensions.height);

      // Main image (if available)
      if (adData?.images?.[0]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = adData.images[0];
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        // Center crop image to fit 70% height
        const imgAspect = img.width / img.height;
        const targetHeight = statusDimensions.height * 0.6;
        const targetWidth = targetHeight * imgAspect;
        const x = (statusDimensions.width - targetWidth) / 2;
        const y = statusDimensions.height * 0.05;

        // Clip to circle for portrait mode or rectangle for landscape
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, targetWidth, targetHeight, [16, 16, 16, 16]);
        ctx.clip();
        ctx.drawImage(img, x, y, targetWidth, targetHeight);
        ctx.restore();
      }

      // Title Section
      const titleY = adData?.images?.[0] ? statusDimensions.height * 0.72 : statusDimensions.height * 0.4;
      ctx.fillStyle = t.titleColor;
      ctx.font = 'bold 36px Inter';
      ctx.textAlign = 'center';
      const maxTitleWidth = statusDimensions.width - 80;
      const words = adData.title.split(' ');
      let line = '';
      const lines: string[] = [];

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const width = ctx.measureText(testLine).width;
        if (width < maxTitleWidth) {
          line = testLine;
        } else {
          lines.push(line);
          line = word;
        }
      }
      lines.push(line);

      const lineHeight = 44;
      const totalHeight = lines.length * lineHeight;
      const startY = titleY - (totalHeight / 2);

      lines.forEach((line, i) => {
        ctx.fillText(line, statusDimensions.width / 2, startY + i * lineHeight);
      });

      // Price Badge
      if (adData.price > 0) {
        const priceText = `₦${adData.price.toLocaleString('en-NG')}`;
        ctx.fillStyle = t.accentColor;
        ctx.beginPath();
        ctx.roundRect(40, statusDimensions.height - 180, 200, 90, [12, 12, 12, 12]);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(priceText, 140, statusDimensions.height - 105);
        ctx.fillStyle = t.titleColor;
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('PRICE', 140, statusDimensions.height - 85);
      }

      // Seller Info
      if (adData.sellerName) {
        ctx.fillStyle = t.titleColor;
        ctx.font = '20px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`By ${adData.sellerName}`, 40, statusDimensions.height - 120);
        if (adData.sellerAvatar) {
          const sellerImg = new Image();
          sellerImg.crossOrigin = 'anonymous';
          sellerImg.src = adData.sellerAvatar;
          ctx.drawImage(sellerImg, 40, statusDimensions.height - 150, 60, 60);
        }
      }

      // Call-to-Action Buttons
      ctx.fillStyle = '#ffffff20';
      ctx.beginPath();
      ctx.roundRect(40, statusDimensions.height - 80, statusDimensions.width - 80, 60, [30, 30, 30, 30]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '22px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Tap to View Details', statusDimensions.width / 2, statusDimensions.height - 40);

      // Sealify Branding
      ctx.fillStyle = '#ffffff30';
      ctx.font = '16px Inter';
      ctx.textAlign = 'right';
      ctx.fillText('SEALIFY NIGERIA', statusDimensions.width - 40, statusDimensions.height - 20);

      // QR Code placeholder (in practice, would generate real QR)
      ctx.fillStyle = '#ffffff20';
      ctx.beginPath();
      ctx.roundRect(statusDimensions.width - 120, statusDimensions.height - 200, 80, 80, [16, 16, 16, 16]);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN', statusDimensions.width - 80, statusDimensions.height - 165);
      ctx.fillText('FOR MORE', statusDimensions.width - 80, statusDimensions.height - 150);

      const dataUrl = canvas.toDataURL('image/png');
      setStatusImage(dataUrl);

      // Auto-save to Supabase if adId provided
      if (adId && user) {
        const { data: session } = await supabase.auth.getSession();
        if (session?.access_token) {
          const response = await fetch('/api/ad-cards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              adId,
              assetType: 'whatsapp_status',
              aspectRatio: '9:16',
              width: statusDimensions.width,
              height: statusDimensions.height,
              colorScheme,
              template: templateSelected,
              fileUrl: dataUrl,
            }),
          });

          const result = await response.json();
          if (result.error) {
            console.warn('Failed to save status card to DB:', result.error);
          } else {
            console.log('Status card saved successfully');
          }
        }
      }

      toast.success('WhatsApp Status card generated!');
      if (onGenerate) onGenerate(dataUrl);
    } catch (error: any) {
      console.error('Generate status card error:', error);
      toast.error('Failed to generate status card');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!statusImage) {
      await generateStatusCard();
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(statusImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sealify_whatsapp_status_${adData?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('WhatsApp Status downloaded!');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download status card');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!statusImage) {
      await generateStatusCard();
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(statusImage);
      const blob = await response.blob();
      const file = new File([blob], 'sealify_status.png', { type: 'image/png' });

      if ('share' in navigator && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Check out this deal on Sealify!`,
          text: `${adData?.title} - ${adData?.price ? `₦${adData.price.toLocaleString('en-NG')}` : 'Price on request'}`,
        });
        toast.success('Shared via WhatsApp!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        toast.success('Copied to clipboard - paste directly into WhatsApp Status!');
      }
    } catch (error: any) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-96 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-white tracking-wider">
              WhatsApp Status Optimizer
            </h3>
            <p className="text-sm text-slate-400">
              9:16 optimized for instant sharing to WhatsApp Status
            </p>
          </div>
          <Smartphone className="w-5 h-5 text-emerald-400" />
        </div>

        {/* Preview */}
        <div className="relative h-64 w-full rounded-2xl bg-slate-800 overflow-hidden">
          {statusImage ? (
            <img
              src={statusImage}
              alt="WhatsApp Status preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-900">
              <div className="space-y-4 text-center">
                <Smartphone className="w-12 h-12 text-emerald-400 mb-2" />
                <p className="text-slate-400">Create your WhatsApp Status</p>
                <p className="text-xs text-slate-500">
                  Optimized 9:16 aspect ratio for perfect fit
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Template Selection */}
        <div>
          <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Design Template
          </label>
          <div className="space-y-2">
            {Object.entries(templates).map(([key, template]) => (
              <div
                key={key}
                onClick={() => setTemplateSelected(key)}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  templateSelected === key
                    ? `border-${colorScheme === 'trust' ? 'emerald' : colorScheme === 'urgent' ? 'rose' : colorScheme === 'premium' ? 'yellow' : 'blue'}-500 bg-${colorScheme === 'trust' ? 'emerald' : colorScheme === 'urgent' ? 'rose' : colorScheme === 'premium' ? 'yellow' : 'blue'}-50`
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-white">{template.name}</p>
                    <p className="text-xs text-slate-400">{template.description}</p>
                  </div>
                  <div className="text-xs text-slate-400">{key}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color Scheme Selection */}
        <div>
          <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Color Psychology
          </label>
          <div className="flex gap-2">
            {[
              { value: 'trust', label: 'Trust', desc: 'Green = Safety, Growth', color: '#059669' },
              { value: 'urgent', label: 'Urgency', desc: 'Red = Action, Attention', color: '#dc2626' },
              { value: 'promo', label: 'Promo', desc: 'Yellow = Energy, Optimism', color: '#eab308' },
              { value: 'premium', label: 'Premium', desc: 'Purple = Luxury, Quality', color: '#7c3aed' },
            ].map((scheme) => (
              <div
                key={scheme.value}
                onClick={() => setColorScheme(scheme.value as any)}
                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 cursor-pointer ${
                  colorScheme === scheme.value
                    ? `border-${scheme.value === 'trust' ? 'emerald' : scheme.value === 'urgent' ? 'rose' : scheme.value === 'premium' ? 'purple' : 'gray'}-600 bg-${scheme.value === 'trust' ? 'emerald' : scheme.value === 'urgent' ? 'rose' : scheme.value === 'premium' ? 'purple' : 'gray'}-50`
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scheme.color }} />
                <div>
                  <p className="font-medium text-white">{scheme.label}</p>
                  <p className="text-xs text-slate-400">{scheme.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={generateStatusCard}
            disabled={isGenerating}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Status
              </span>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Preparing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </span>
            )}
          </button>

          <button
            onClick={handleShare}
            disabled={isProcessing}
            className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <Smartphone className="w-4 h-4" />
                Sharing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Smartphone className="w-4 h-4" />
                Share to WhatsApp
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};