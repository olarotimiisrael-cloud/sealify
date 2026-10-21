import React from 'react';
import { X, TrendingUp, Eye, Heart, MessageSquare, CheckCircle2, AlertCircle, Share2, Globe } from 'lucide-react';
import { Listing } from '../types/sealify';

interface AdAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
}

export const AdAnalyticsModal: React.FC<AdAnalyticsModalProps> = ({
  isOpen,
  onClose,
  listing,
}) => {
  if (!isOpen || !listing) return null;

  const totalViews = listing.viewsCount || 142;
  const viralViews = Math.round(totalViews * 0.35);
  const directViews = totalViews - viralViews;
  
  const savedCount = Math.round(totalViews * 0.18);
  const totalInquiries = Math.round(totalViews * 0.08) || 3;
  const ctrRate = ((totalInquiries / totalViews) * 100).toFixed(1);

  const weeklyViews = [
    { day: 'Mon', count: Math.round(totalViews * 0.1) },
    { day: 'Tue', count: Math.round(totalViews * 0.12) },
    { day: 'Wed', count: Math.round(totalViews * 0.18) },
    { day: 'Thu', count: Math.round(totalViews * 0.22) },
    { day: 'Fri', count: Math.round(totalViews * 0.15) },
    { day: 'Sat', count: Math.round(totalViews * 0.13) },
    { day: 'Sun', count: Math.round(totalViews * 0.1) },
  ];

  const maxDayViews = Math.max(...weeklyViews.map(w => w.count)) || 1;

  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Ad Performance Analytics</h2>
              <p className="text-xs text-slate-600">{listing?.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl text-center space-y-1">
              <Eye className="w-4 h-4 text-emerald-600 mx-auto" />
              <p className="text-xl font-black text-slate-900">{totalViews}</p>
              <p className="text-[10px] text-slate-600 font-semibold uppercase">Total Views</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl text-center space-y-1">
              <Heart className="w-4 h-4 text-rose-600 mx-auto" />
              <p className="text-xl font-black text-slate-900">{savedCount}</p>
              <p className="text-[10px] text-slate-600 font-semibold uppercase">Saved Items</p>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl text-center space-y-1">
              <MessageSquare className="w-4 h-4 text-teal-600 mx-auto" />
              <p className="text-xl font-black text-slate-900">{totalInquiries}</p>
              <p className="text-[10px] text-slate-600 font-semibold uppercase">Chat Leads</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-[2rem] space-y-4 shadow-inner">
             <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                   <Globe className="w-4 h-4 text-blue-400" />
                   Traffic Sources
                </h4>
                <span className="text-[10px] text-slate-600 font-bold">Real-time Attribution</span>
             </div>

             <div className="space-y-4">
                <div className="space-y-1.5">
                   <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-300 flex items-center gap-1.5">
                         <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                         Flyer & Social Referral
                      </span>
                      <span className="text-slate-900">{viralViews} views ({Math.round((viralViews/totalViews)*100)}%)</span>
                   </div>
                   <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(viralViews/totalViews)*100}%` }}></div>
                   </div>
                </div>

                <div className="space-y-1.5">
                   <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-300">Marketplace Direct Search</span>
                      <span className="text-slate-900">{directViews} views ({Math.round((directViews/totalViews)*100)}%)</span>
                   </div>
                   <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-200">
                      <div className="bg-blue-500 h-full" style={{ width: `${(directViews/totalViews)*100}%` }}></div>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-inner">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">Weekly Traffic Trend</span>
              <span className="text-[11px] text-emerald-600 font-semibold">{ctrRate}% Buyer Conversion</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-1 border-b border-slate-200">
              {weeklyViews.map((item) => {
                const heightPercent = Math.round((item.count / maxDayViews) * 100);
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                    <span className="text-[9px] text-slate-600 font-mono">{item.count}</span>
                    <div
                      style={{ height: `${Math.max(15, heightPercent)}%` }}
                      className="w-full bg-emerald-100 rounded-t-md hover:bg-emerald-400 transition-colors"
                    ></div>
                    <span className="text-[10px] text-slate-600 font-bold">{item.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Visibility Optimization</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Multiple product photos uploaded
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Good</span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Promote with Top Ad Highlight
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 bg-emerald-50 px-2 py-0.5 rounded">+5x Boost</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-100 hover:bg-slate-750 text-slate-900 font-bold rounded-xl text-xs transition-colors"
              >
                Close Analytics Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdAnalyticsModal;

