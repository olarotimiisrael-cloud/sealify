import React, { useState } from 'react';
import { Listing } from '../types/sealify';
import { MapPin, Navigation, ShieldCheck, Eye, ExternalLink, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MapViewProps {
  listings: Listing[];
}

export const MapView: React.FC<MapViewProps> = ({ listings }) => {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(listings[0] || null);
  const [radiusKm, setRadiusKm] = useState<number>(15);

  const pinPositions = [
    { top: '35%', left: '28%', distance: '1.2 km' },
    { top: '48%', left: '62%', distance: '2.1 km' },
    { top: '22%', left: '75%', distance: '3.5 km' },
    { top: '65%', left: '42%', distance: '5.8 km' },
    { top: '55%', left: '80%', distance: '6.9 km' },
    { top: '30%', left: '48%', distance: '8.2 km' },
    { top: '78%', left: '25%', distance: '11.5 km' },
  ];

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 pointer-events-auto shadow-lg">
          <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white">Ogbomoso, Nigeria Area</span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-semibold">
            {listings.length} local pins
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1 rounded-2xl flex items-center gap-1 pointer-events-auto shadow-lg">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {[5, 10, 15, 25, 50].map((r) => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                radiusKm === r
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 bg-[#0b1320] overflow-hidden select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25"></div>

        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 100 Q 300 200 600 150 T 1200 400" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="6 6" />
          <path d="M 200 0 Q 400 300 800 600" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <path d="M 0 450 Q 500 350 1000 500" fill="none" stroke="#64748b" strokeWidth="4" />
          <circle cx="50%" cy="50%" r="220" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        </svg>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 animate-ping absolute"></div>
          <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-10"></div>
        </div>

        {listings.map((item, idx) => {
          const pos = pinPositions[idx % pinPositions.length];
          const isSelected = selectedListing?.id === item.id;

          return (
            <div
              key={item.id}
              style={{ top: pos.top, left: pos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <button
                onClick={() => setSelectedListing(item)}
                className={`group flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-black shadow-xl transition-all transform hover:scale-110 active:scale-95 border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-white ring-4 ring-emerald-500/30 scale-110 z-30'
                    : 'bg-slate-900/90 text-white border-slate-700 hover:border-emerald-400'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                <span>{formatNGN(item.price)}</span>
              </button>
            </div>
          );
        })}

        {selectedListing && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex gap-3">
              <img
                src={selectedListing.images[0]}
                alt={selectedListing.title}
                className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">
                    {selectedListing.category}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {selectedListing.viewsCount}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-white truncate">{selectedListing.title}</h4>
                <p className="text-base font-black text-emerald-400">{formatNGN(selectedListing.price)}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {selectedListing.location}
                  </span>
                  {selectedListing.sellerVerified && (
                    <span className="flex items-center gap-0.5 text-emerald-400 font-semibold shrink-0">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
              <Link
                to={`/listing/${selectedListing.id}`}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs text-center flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                <span>View Full Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;