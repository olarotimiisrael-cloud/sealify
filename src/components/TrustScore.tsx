import React from 'react';
import { ShieldCheck, Zap, Clock, ThumbsUp, Star, Award } from 'lucide-react';

interface TrustScoreProps {
  score: number; // 0 to 100
  responseTime: string;
  verified: boolean;
  salesCount: number;
}

export const TrustScore: React.FC<TrustScoreProps> = ({ score, responseTime, verified, salesCount }) => {
  const getScoreColor = () => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getLabel = () => {
    if (score >= 90) return 'Exceptional';
    if (score >= 75) return 'Reliable';
    return 'Warning';
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seller Reputation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${score >= 90 ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'}`}>
            {getLabel()}
          </span>
          <div className={`text-xl font-black ${getScoreColor()}`}>{score}%</div>
        </div>
      </div>

      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)] ${score >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase leading-none">Response</p>
            <p className="text-[11px] text-slate-200 font-black truncate">{responseTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase leading-none">Deals Done</p>
            <p className="text-[11px] text-slate-200 font-black truncate">{salesCount}+ Items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase leading-none">Feedback</p>
            <p className="text-[11px] text-slate-200 font-black truncate">100% Pos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-purple-400" />
          <div className="min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase leading-none">Level</p>
            <p className="text-[11px] text-slate-200 font-black truncate">Verified Elite</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScore;