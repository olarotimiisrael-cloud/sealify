import React from 'react';
import { ShieldCheck, Zap, Clock, ThumbsUp, Star } from 'lucide-react';

interface TrustScoreProps {
  score: number; // 0 to 100
  responseTime: string;
  verified: boolean;
  salesCount: number;
}

export const TrustScore: React.FC<TrustScoreProps> = ({ score, responseTime, verified, salesCount }) => {
  const getScoreColor = () => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="bg-white/50 border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Seller Trust Score</span>
        </div>
        <div className={`text-lg font-black ${getScoreColor()}`}>{score}%</div>
      </div>

      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${score >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-600" />
          <span className="text-[10px] text-slate-300 font-bold">{responseTime} response</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-600" />
          <span className="text-[10px] text-slate-300 font-bold">{salesCount}+ successful deals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ThumbsUp className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] text-slate-300 font-bold">Recommended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 text-purple-600 fill-purple-400/20" />
          <span className="text-[10px] text-slate-300 font-bold">Top Rated</span>
        </div>
      </div>
    </div>
  );
};

export default TrustScore;

