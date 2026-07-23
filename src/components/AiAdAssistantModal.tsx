import React, { useState } from 'react';
import { X, Sparkles, Wand2, Check } from 'lucide-react';
import { Category, Condition } from '../types/sealify';
import { toast } from 'sonner';

interface AiAdAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: Category;
  condition: Condition;
  price: string;
  location: string;
  onApplyDescription: (generatedText: string) => void;
}

export const AiAdAssistantModal: React.FC<AiAdAssistantModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
  condition,
  price,
  location,
  onApplyDescription,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<'detailed' | 'punchy' | 'commercial'>('detailed');

  if (!isOpen) return null;

  const formattedPrice = price ? `₦${Number(price).toLocaleString()}` : 'Negotiable Price';
  const itemTitle = title.trim() || 'This Item';
  const itemLoc = location.trim() || 'Ogbomoso, Oyo State';

  const templates = {
    detailed: `✨ ${itemTitle.toUpperCase()} — EXCELLENT DEAL ✨

📌 Product Details:
• Category: ${category}
• Condition: ${condition}
• Asking Price: ${formattedPrice}
• Location: ${itemLoc}

🔍 Description & Highlights:
This ${itemTitle} is in ${condition.toLowerCase()} working condition, carefully tested and ready for immediate pickup or dispatch delivery. 100% authentic and well-maintained. Perfect for anyone looking for quality in ${itemLoc}.

🛡️ Safety & Inspection:
• Physical inspection highly recommended at verified Safe Meetup Spots.
• Test thoroughly before making any payment.
• Direct phone call or instant live chat available for serious buyers.`,

    punchy: `🚀 QUICK SALE: ${itemTitle} (${formattedPrice})

Condition: ${condition}
Location: ${itemLoc}

Clean, fully functional, and ready to go! No hidden faults. Very good value for money compared to market average. Serious buyers only.

📍 Meetup in public safe zone or doorstep dispatch rider available. Message now to seal the deal!`,

    commercial: `🏪 SEALIFY VERIFIED MERCHANT LISTING
Product Name: ${itemTitle}
Condition: ${condition}
Price: ${formattedPrice}
Location / Store: ${itemLoc}

Description:
Professional grade ${category.toLowerCase()} listing offered with full seller verification. Guaranteed working condition. Comes with all primary accessories. We pride ourselves on transparent trading in ${itemLoc}.

📞 Contact seller today for fast response and safe meetup arrangement!`,
  };

  const handleApply = () => {
    onApplyDescription(templates[selectedStyle]);
    toast.success('AI description applied to your ad form!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
            <Wand2 className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white">AI Ad Content Generator</h2>
          <p className="text-xs text-slate-400">
            Generate professional, buyer-trusted description copy based on your ad details
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedStyle('detailed')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedStyle === 'detailed'
                ? 'border-purple-500 bg-purple-500/10 text-purple-300 font-bold ring-2 ring-purple-500/30'
                : 'border-slate-800 bg-slate-950 text-slate-400'
            }`}
          >
            <p className="text-xs font-bold text-white">Detailed</p>
            <p className="text-[9px] text-slate-400">Full Specs</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStyle('punchy')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedStyle === 'punchy'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold ring-2 ring-emerald-500/30'
                : 'border-slate-800 bg-slate-950 text-slate-400'
            }`}
          >
            <p className="text-xs font-bold text-white">Quick</p>
            <p className="text-[9px] text-slate-400">Fast Sale</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStyle('commercial')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedStyle === 'commercial'
                ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold ring-2 ring-amber-500/30'
                : 'border-slate-800 bg-slate-950 text-slate-400'
            }`}
          >
            <p className="text-xs font-bold text-white">Store</p>
            <p className="text-[9px] text-slate-400">Professional</p>
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Generated Text Preview</span>
          </label>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-sans text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto shadow-inner">
            {templates[selectedStyle]}
          </div>
        </div>

        <button
          onClick={handleApply}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Apply to Ad Description</span>
        </button>
      </div>
    </div>
  );
};

export default AiAdAssistantModal;