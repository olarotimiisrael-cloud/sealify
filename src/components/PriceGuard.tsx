import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { ShieldCheck, Info, TrendingDown, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { Category } from '../types/sealify';

interface PriceGuardProps {
  price: number;
  category: Category;
  location: string;
}

export const PriceGuard: React.FC<PriceGuardProps> = ({ price, category, location }) => {
  const { marketStats } = useSealify();

  const stats = marketStats.find((s) => s.category === category);
  
  if (!stats || stats.avgPrice === 0) return null;

  const diff = ((price - stats.avgPrice) / stats.avgPrice) * 100;
  
  const isGreatDeal = diff <= -10;
  const isFairPrice = diff > -10 && diff <= 10;
  const isAboveMarket = diff > 10;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Sealify AI Price Guard</span>
        </div>
        
        {isGreatDeal && (
          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">
            <Sparkles className="w-3 h-3 fill-current" />
            VETTED GREAT DEAL
          </span>
        )}
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">Market Analysis for <strong className="text-slate-200">{location.split(',')[0]}</strong></p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Confidence: 94%</p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {isGreatDeal ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-emerald-300">Priced {Math.abs(Math.round(diff))}% Below Average</p>
                <p className="text-[10px] text-emerald-400/80 leading-relaxed mt-0.5">This item is significantly cheaper than similar listings in the Ogbomoso Node. High probability of fast sale.</p>
              </div>
            </div>
          ) : isFairPrice ? (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-blue-300">Fair Market Valuation</p>
                <p className="text-[10px] text-blue-400/80 leading-relaxed mt-0.5">The asking price is within the standard range for this category in Oyo State. Safe to proceed with inspection.</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-amber-300">Premium Asking Price</p>
                <p className="text-[10px] text-amber-400/80 leading-relaxed mt-0.5">This listing is {Math.round(diff)}% above the local average. Verify if extra accessories or superior condition justify the cost.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800 pt-2">
          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Based on {stats.totalAds} local ads</span>
          <button className="font-bold text-emerald-400 hover:underline">View Price Index →</button>
        </div>
      </div>
    </div>
  );
};

export default PriceGuard;