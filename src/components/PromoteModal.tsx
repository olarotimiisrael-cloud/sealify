import React, { useState } from 'react';
import { X, Zap, ShieldCheck, Check, Sparkles, TrendingUp, Flame } from 'lucide-react';
import { toast } from 'sonner';

interface PromoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle: string;
}

interface Plan {
  id: string;
  name: string;
  badge: string;
  price: string;
  period: string;
  viewsBoost: string;
  features: string[];
  color: string;
  icon: React.FC<{ className?: string }>;
}

const PLANS: Plan[] = [
  {
    id: 'top_ad',
    name: 'Top Ad Highlight',
    badge: 'POPULAR',
    price: '$9.99',
    period: '3 days',
    viewsBoost: '5x More Views',
    features: ['Highlighted in search results', 'Yellow background badge', 'Priority buyer inbox placement'],
    color: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
    icon: Flame,
  },
  {
    id: 'featured',
    name: 'Featured Category Banner',
    badge: 'MAX IMPACT',
    price: '$19.99',
    period: '7 days',
    viewsBoost: '10x More Views',
    features: ['Top of category gallery', 'Featured badge banner', 'Social share boost', 'Dedicated customer support'],
    color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
    icon: Sparkles,
  },
  {
    id: 'urgent',
    name: 'Urgent Seller Tag',
    badge: 'QUICK SALE',
    price: '$4.99',
    period: '5 days',
    viewsBoost: '3x More Views',
    features: ['Red URGENT badge on card', 'Fast buyer notification blast'],
    color: 'border-rose-500/50 bg-rose-500/10 text-rose-300',
    icon: TrendingUp,
  },
];

export const PromoteModal: React.FC<PromoteModalProps> = ({ isOpen, onClose, listingTitle }) => {
  const [selectedPlanId, setSelectedPlanId] = useState('top_ad');

  if (!isOpen) return null;

  const handleApplyPromotion = () => {
    const plan = PLANS.find((p) => p.id === selectedPlanId);
    toast.success(`🎉 ${plan?.name} activated for "${listingTitle}"!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white">Promote Your Classified Ad</h2>
            <p className="text-xs text-slate-400">
              Increase buyer inquiries for: <strong className="text-slate-200">{listingTitle}</strong>
            </p>
          </div>

          {/* Package Selection Options */}
          <div className="space-y-3">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlanId === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isSelected
                      ? `${plan.color} ring-2 ring-emerald-500 shadow-xl`
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{plan.name}</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700">
                          {plan.badge}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-400 font-semibold">{plan.viewsBoost}</p>
                      <ul className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-right shrink-0 self-end sm:self-center">
                    <p className="text-xl font-black text-white">{plan.price}</p>
                    <p className="text-[10px] text-slate-400">{plan.period}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleApplyPromotion}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Activate Promotion Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoteModal;