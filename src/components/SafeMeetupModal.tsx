import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Navigation, Clock, Share2, Check, ExternalLink, Building2, Coffee, Shield, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useSealify } from '../context/SealifyContext';

interface SafeMeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  onSelectSpot?: (spotName: string, spotAddress: string) => void;
}

type ZoneFilter = 'All' | 'LAUTECH Area' | 'Takie / Center' | 'Sabo Market Zone' | 'Police HQ';

export const SafeMeetupModal: React.FC<SafeMeetupModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  onSelectSpot,
}) => {
  const { safeSpots } = useSealify();
  const [selectedSpotId, setSelectedSpotId] = useState<string>(safeSpots[0]?.id || '');
  const [selectedZone, setSelectedZone] = useState<ZoneFilter>('All');
  const [shared, setShared] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredSpots = safeSpots.filter(s => selectedZone === 'All' || s.zone === selectedZone);
  const currentSpot = safeSpots.find((s) => s.id === selectedSpotId) || filteredSpots[0] || safeSpots[0];

  const getIcon = (category: string) => {
    if (category === 'Police Safe Zone') return Shield;
    if (category === 'Public Library') return Building2;
    if (category === 'Shopping Mall') return Building2;
    return Coffee;
  };

  const getBadgeColor = (category: string) => {
    if (category === 'Police Safe Zone') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (category === 'Public Library') return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    if (category === 'Shopping Mall') return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  const handleShareLocation = () => {
    if (onSelectSpot && currentSpot) {
      onSelectSpot(currentSpot.name, currentSpot.address);
    }
    setShared(true);
    toast.success(`Proposed meetup location "${currentSpot.name}" shared to chat!`);
    setTimeout(() => {
      setShared(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Verified Safe Meetup Spots</h2>
          <p className="text-xs text-slate-400">
            Choose a well-lit, CCTV-monitored public location to meet in person in Ogbomosoland
          </p>
        </div>

        {/* Zone Selector Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filter by Neighborhood Area</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {(['All', 'LAUTECH Area', 'Takie / Center', 'Sabo Market Zone', 'Police HQ'] as ZoneFilter[]).map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedZone === zone
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        {/* Spots List */}
        <div className="space-y-3">
          {filteredSpots.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No safe spots in this area.</div>
          ) : (
            filteredSpots.map((spot) => {
              const Icon = getIcon(spot.category);
              const isSelected = selectedSpotId === spot.id;

              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setSelectedSpotId(spot.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-white ring-2 ring-emerald-500/30 shadow-lg'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{spot.name}</span>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getBadgeColor(spot.category)}`}>
                          {spot.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {spot.address}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-400" /> {spot.hours}
                        </span>
                        {spot.cctvVerified && (
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> CCTV Protected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-black text-emerald-400 shrink-0 self-end sm:self-center bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    {spot.distance}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
          {currentSpot && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${currentSpot.name} ${currentSpot.address}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Get GPS Directions</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          )}

          <button
            onClick={handleShareLocation}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{shared ? 'Location Sent!' : 'Propose Meetup Location'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafeMeetupModal;