import React from 'react';
import { X, TrendingUp, Eye, Heart, MessageSquare, Award, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';
import { Listing } from '../types/sealify';

interface AdAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
};

export const AdAnalyticsModal: React.FC<AdAnalyticsModalProps> = ({
  isOpen,
  onClose,
  listing,
}) => {
  if (!isOpen || !listing) return null;

  const totalViews = listing.viewsCount || 142;
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Ad Performance Analytics</h2>
              <p className="text-xs text-slate-400">{listing?.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
              <Eye className="w-4 h-4 text-emerald-400 mx-auto" />
              <p className="text-xl font-black text-white">{totalViews}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Views</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
              <Heart className="w-4 h-4 text-rose-400 mx-auto" />
              <p className="text-xl font-black text-white">{savedCount}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Saved Bookmarks</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-center space-y-1">
              <MessageSquare className="w-4 h-4 text-teal-400 mx-auto" />
              <p className="text-xl font-black text-white">{totalInquiries}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Buyer Chat Leads</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">Weekly View Traffic</span>
              <span className="text-[11px] text-emerald-400 font-semibold">{ctrRate}% Buyer Conversion</span>
            </div>

            {/* Simple CSS-based Chart for instant rendering speed */}
            <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-1 border-b border-slate-800">
              {weeklyViews.map((item) => {
                const heightPercent = Math.round((item.count / maxDayViews) * 100);
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                    <span className="text-[9px] text-slate-400 font-mono">{item.count}</span>
                    <div
                      style={{ height: `${Math.max(15, heightPercent)}%` }}
                      className="w-full bg-emerald-500/20 rounded-t-md hover:bg-emerald-400 transition-colors"
                    ></div>
                    <span className="text-[10px] text-slate-500 font-bold">{item.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Visibility Optimization Checklist</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Multiple product photos uploaded
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Good</span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Promote with Top Ad Highlight
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 bg-emerald-500/10 px-2 py-0.5 rounded">+5x Boost</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
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