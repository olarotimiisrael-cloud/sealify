import React, { useState, useRef, useEffect } from 'react';
import { useSealify } from '../context/SealifyContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Download, Smartphone, Share2, Sparkles, Image, Link, QrCode } from 'lucide-react';

interface AdCardGeneratorProps {
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
    status?: string;
  };
  onClose?: () => void;
}

export const AdCardGenerator: React.FC<AdCardGeneratorProps> = ({ adId, adData, onClose }) => {
  const { user, isSyncing } = useSealify();
  const [selectedAssetType, setSelectedAssetType] = useState<'whatsapp_status' | 'instagram_post' | 'facebook_ad' | 'email_banner'>('whatsapp_status');
  const [generatedCard, setGeneratedCard] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [background, setBackground] = useState<string>('#0ea5e9');
  const [overlayTitle, setOverlayTitle] = useState('');
  const [overlayDescription, setOverlayDescription] = useState('');
  const [overlayPrice, setOverlayPrice] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [generatedAssetUrl, setGeneratedAssetUrl] = useState<string | null>(null);

  // Default templates based on asset type
  const templates = {
    whatsapp_status: {
      width: 1080, height: 1920, bgColor: '#0ea5e9', title: 'Just Listed!', description: 'Check out this amazing deal',
    },
    instagram_post: {
      width: 1080, height: 1080, bgColor: '#6366f1', title: 'For Sale', description: 'Quality guaranteed',
    },
    facebook_ad: {
      width: 1920, height: 1080, bgColor: '#14b8a6', title: 'Special Offer', description: 'Limited time only',
    },
    email_banner: {
      width: 800, height: 450, bgColor: '#8b5cf6', title: 'Featured Product', description: 'Shop now',
    },
  };

  useEffect(() => {
    if (adData) {
      const t = templates[selectedAssetType];
      setOverlayTitle(adData.title || '');
      setOverlayPrice(`₦${adData.price.toLocaleString('en-NG')}`);
      setOverlayDescription(adData.description?.substring(0, 80) || '');
      setSelectedImage(adData.images?.[0] || '');
      setBackground(t.bgColor);
    }
  }, [adData, selectedAssetType]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCardPreview = async () => {
    try {
      const canvas = document.createElement('canvas');
      const t = templates[selectedAssetType];
      canvas.width = t.width;
      canvas.height = t.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      // Background
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, t.width, t.height);

      // Gradient overlay for depth
      const gradient = ctx.createLinearGradient(0, 0, 0, t.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, t.width, t.height);

      // Image handling
      if (selectedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedImage;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        // Center crop logic
        const aspect = img.width / img.height;
        const cropW = t.width * 0.75;
        const cropH = cropW / aspect;
        const x = (t.width - cropW) / 2;
        const y = (t.height - cropH) / 2 - (t.height * 0.05);
        ctx.drawImage(img, (img.width - cropW) / 2, (img.height - cropH) / 2, cropW, cropH, x, y, cropW, cropH);
      }

      // Sealify branding strip
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(0, 0, t.width, 60, [0, 0, 20, 20]);
      ctx.fill();

      ctx.fillStyle = background;
      ctx.font = 'bold 24px Arial';
      ctx.fillText('SEALIFY NIGERIA', 30, 38);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px Arial';
      ctx.fillText('Verified Marketplace for Nigeria', 30, 62);

      // Price badge
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.roundRect(30, t.height - 140, 160, 70, [12, 12, 12, 12]);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(overlayPrice || '₦0', 45, t.height - 95);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${36}px Arial`;
      const titleY = t.height * 0.28;
      ctx.textAlign = 'center';
      ctx.fillText(overlayTitle, t.width / 2, titleY);

      // Description
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '20px Arial';
      const descLines = wrapText(ctx, overlayDescription, t.width - 60, 24);
      const descStartY = t.height * 0.38;
      descLines.forEach((line, i) => {
        ctx.fillText(line, t.width / 2, descStartY + i * 28);
      });

      // Seller info
      if (adData?.sellerName) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`By ${adData.sellerName}`, 30, t.height - 45);

        if (adData.sellerAvatar) {
          const sellerImg = new Image();
          sellerImg.crossOrigin = 'anonymous';
          sellerImg.src = adData.sellerAvatar;
          ctx.drawImage(sellerImg, 30, t.height - 75, 40, 40);
        }
      }

      // WhatsApp badge (for whatsapp status)
      if (selectedAssetType === 'whatsapp_status') {
        ctx.fillStyle = '#25D366';
        ctx.beginPath();
        ctx.roundRect(t.width - 100, t.height - 100, 80, 40, [20, 20, 20, 20]);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Share', t.width - 60, t.height - 75);
        ctx.font = 'bold 14px Arial';
        ctx.fillText('WhatsApp', t.width - 60, t.height - 52);
      }

      // Sealify footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.textAlign = 'center';
      ctx.font = '12px Arial';
      ctx.fillText('sealify.ng', t.width / 2, t.height - 15);

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Generate card preview error:', error);
      toast.error('Failed to generate card preview');
      return null;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const previewUrl = await generateCardPreview();
      if (!previewUrl) return;
      setGeneratedCard(previewUrl);
      setGeneratedAssetUrl(previewUrl);

      // Save to Supabase
      if (adId && user) {
        const { data: session } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (accessToken) {
          const { data, error } = await fetch('/api/ad-cards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              adId,
              assetType: selectedAssetType,
              aspectRatio: templates[selectedAssetType].aspectRatio,
              width: templates[selectedAssetType].width,
              height: templates[selectedAssetType].height,
              background: background,
            }),
          }).then(res => res.json());

          if (error || !data) {
            console.error('Failed to save ad card:', error);
          }
        }
      }

      toast.success('Ad card generated successfully!');
    } catch (error) {
      console.error('Generate card error:', error);
      toast.error('Failed to generate ad card');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedCard) {
      await handleGenerate();
    }
    if (generatedCard) {
      try {
        const response = await fetch(generatedCard);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const t = templates[selectedAssetType];
        a.download = `sealify_ad_${selectedAssetType}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Download started!');
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download ad card');
      }
    }
  };

  const handleShareToWhatsApp = async () => {
    if (!generatedCard) {
      await handleGenerate();
    }
    if (generatedCard) {
      try {
        const response = await fetch(generatedCard);
        const blob = await response.blob();
        const file = new File([blob], 'sealify_ad.png', { type: 'image/png' });

        if ('share' in navigator && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Check out this deal on Sealify!',
            text: overlayTitle,
          });
          toast.success('Shared to WhatsApp!');
        } else {
          // Fallback: copy image to clipboard
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast.success('Copied to clipboard - paste in WhatsApp!');
        }
      } catch (error) {
        console.error('Share error:', error);
        toast.error('Failed to share');
      }
    }
  };

  // Text wrapping helper
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Ad Card Generator</h2>
            <p className="text-sm text-slate-400">Create optimized social media cards for your listings</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
              ✕
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Controls */}
            <div className="space-y-6">
              {/* Asset Type Selection */}
              <div>
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 block">Select Format</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'whatsapp_status', icon: Smartphone, label: 'WhatsApp Status', ratio: '9:16' },
                    { id: 'instagram_post', icon: Camera, label: 'Instagram Post', ratio: '1:1' },
                    { id: 'facebook_ad', icon: Share2, label: 'Facebook Ad', ratio: '16:9' },
                    { id: 'email_banner', icon: Sparkles, label: 'Email Banner', ratio: '16:9' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedAssetType(type.id as any)}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        selectedAssetType === type.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <type.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <div className="text-white font-bold text-sm">{type.label}</div>
                      <div className="text-slate-400 text-xs text-center">{type.ratio}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 block">Background Color</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Sky Blue', value: '#0ea5e9' },
                    { name: 'Indigo', value: '#6366f1' },
                    { name: 'Teal', value: '#14b8a6' },
                    { name: 'Purple', value: '#8b5cf6' },
                    { name: 'Emerald', value: '#10b981' },
                    { name: 'Rose', value: '#f43f5e' },
                  ].map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setBackground(color.value)}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${
                        background === color.value ? 'border-white scale-110' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 block">Product Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                  >
                    <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div className="text-slate-300 font-medium text-sm">Upload Product Photo</div>
                    <div className="text-slate-500 text-xs">JPG, PNG, WebP</div>
                  </label>
                </div>
              </div>

              {/* Overlay Text */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">Title Overlay</label>
                <input
                  type="text"
                  value={overlayTitle}
                  onChange={(e) => setOverlayTitle(e.target.value)}
                  placeholder="e.g. Just Dropped!"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">Description Overlay</label>
                <textarea
                  value={overlayDescription}
                  onChange={(e) => setOverlayDescription(e.target.value)}
                  placeholder="e.g. Quality guaranteed. Call now."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block">Price Overlay</label>
                <input
                  type="text"
                  value={overlayPrice}
                  onChange={(e) => setOverlayPrice(e.target.value)}
                  placeholder="₦50,000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Right: Preview */}
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 block">Live Preview</label>
              <div className="flex-1 bg-slate-950 rounded-2xl border-2 border-slate-800 flex items-center justify-center p-4 min-h-[500px]">
                {generatedCard ? (
                  <img src={generatedCard} alt="Card preview" className="max-w-full max-h-full rounded-lg shadow-2xl" />
                ) : (
                  <div className="text-center text-slate-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-3" />
                    <p>Configure settings and click generate</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-6 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Ad Card
              </span>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download
          </button>

          <button
            onClick={handleShareToWhatsApp}
            className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black py-4 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Smartphone className="w-5 h-5" />
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
