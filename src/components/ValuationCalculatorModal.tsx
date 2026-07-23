import React, { useState } from 'react';
import { X, Calculator, Sparkles, TrendingUp, Clock, Check, ArrowRight } from 'lucide-react';
import { Category, Condition } from '../types/sealify';

interface ValuationCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrice?: (suggestedPrice: number) => void;
}

export const ValuationCalculatorModal: React.FC<ValuationCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyPrice,
}) => {
  const [category, setCategory] = useState<Category>('Electronics');
  const [condition, setCondition] = useState<Condition>('Like New');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [ageMonths, setAgeMonths] = useState<number>(6);
  const [result, setResult] = useState<{ suggestedPrice: number; minPrice: number; maxPrice: number; daysToSell: number } | null>(null);

  if (!isOpen) return null;

  const calculateValuation = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = Number(originalPrice);
    if (!orig || orig <= 0) return;

    // Depreciation rules based on condition & age
    let conditionFactor = 0.85; // Default for Brand New
    if (condition === 'Like New') conditionFactor = 0.75;
    if (condition === 'Used - Good') conditionFactor = 0.60;
    if (condition === 'Used - Fair') conditionFactor = 0.45;

    // Category factor
    let categoryFactor = 1.0;
    if (category === 'Electronics') categoryFactor = 0.85; // Tech depreciates faster
    if (category === 'Vehicles') categoryFactor = 0.90;
    if (category === 'Real Estate') categoryFactor = 1.20; // Appreciates

    // Age factor (compounding depreciation)
    const ageFactor = Math.max(0.4, Math.pow(0.96, ageMonths / 4));

    const estimated = Math.round(orig * conditionFactor * categoryFactor * ageFactor);
    const minPrice = Math.round(estimated * 0.9);
    const maxPrice = Math.round(estimated * 1.1);

    // Days to sell estimation
    const daysToSell = condition === 'Brand New' || condition === 'Like New' ? 3 : 8;

    setResult({
      suggestedPrice: estimated,
      minPrice,
      maxPrice,
      daysToSell,
    });
  };

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Smart Price Estimator</h3>
              <p className="text-xs text-slate-400">Calculate fair market valuation for Ogbomoso Hub</p>
            </div>
          </div>

          <form onSubmit={calculateValuation} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Original Retail Price (₦ NGN)</label>
              <input
                type="number"
                required
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="How much was it bought for?"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Furniture">Home & Furniture</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Condition)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Like New">Like New</option>
                  <option value="Used - Good">Used - Good</option>
                  <option value="Used - Fair">Used - Fair</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Age of Item</label>
              <select
                value={ageMonths}
                onChange={(e) => setAgeMonths(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value={1}>Under 3 Months</option>
                <option value={6}>3 to 6 Months</option>
                <option value={12}>1 Year</option>
                <option value={24}>2 Years</option>
                <option value={48}>Over 3 Years</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Calculate Resale Estimate</span>
            </button>
          </form>

          {result && (
            <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Recommended Price</span>
                <span className="text-xl font-black text-emerald-400">{formatNGN(result.suggestedPrice)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Fast Sale Min</span>
                  <span className="font-bold text-white">{formatNGN(result.minPrice)}</span>
                </div>

                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Est. Time to Sell</span>
                    <span className="font-bold text-white">~{result.daysToSell} Days</span>
                  </div>
                </div>
              </div>

              {onApplyPrice && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyPrice(result.suggestedPrice);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply ₦{result.suggestedPrice.toLocaleString()} to Ad</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValuationCalculatorModal;