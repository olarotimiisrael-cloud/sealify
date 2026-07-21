import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Navigation, Clock, Share2, Check, ExternalLink, Building2, Coffee, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface SafeMeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  onSelectSpot?: (spotName: string, spotAddress: string) => void;
}

interface MeetupSpot {
  id: string;
  name: string;
  category: 'Police Safe Zone' | 'Public Library' | 'Shopping Mall' | 'Café';
  address: string;
  distance: string;
  hours: string;
  cctvVerified: boolean;
  icon: React.FC<{ className?: string }>;
  badgeColor: string;
}

const SAFE_SPOTS: MeetupSpot[] = [
  {
    id: 'spot_1',
    name: 'NYPD 78th Precinct Safe Exchange Zone',
    category: 'Police Safe Zone',
    address: '65 6th Ave, Brooklyn, NY 11217',
    distance: '0.6 miles away',
    hours: 'Open 24/7 (24hr Police Surveillance)',
    cctvVerified: true,
    icon: Shield,
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    id: 'spot_2',
    name: 'Brooklyn Public Library - Central Branch Lobby',
    category: 'Public Library',
    address: '10 Grand Army Plaza, Brooklyn, NY 11238',
    distance: '1.1 miles away',
    hours: 'Mon-Sat 9:00 AM - 8:00 PM',
    cctvVerified: true,
    icon: Building2,
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  },
  {
    id: 'spot_3',
    name: 'City Point Brooklyn Mall Center Atrium',
    category: 'Shopping Mall',
    address: '445 Albee Square W, Brooklyn, NY 11201',
    distance: '1.4 miles away',
    hours: 'Daily 10:00 AM - 10:00 PM',
    cctvVerified: true,
    icon: Building2,
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  {
    id: 'spot_4',
    name: 'Starbucks Reserve Center (Busy Public Café)',
    category: 'Café',
    address: '61 9th Ave, New York, NY 10011',
    distance: '2.3 miles away',
    hours: 'Daily 7:00 AM - 9:00 PM',
    cctvVerified: true,
    icon: Coffee,
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
];

export const SafeMeetupModal: React.FC<SafeMeetupModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  onSelectSpot,
}) => {
  const [selectedSpotId, setSelectedSpotId] = useState<string>(SAFE_SPOTS[0].id);
  const [shared, setShared] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSpot = SAFE_SPOTS.find((s) => s.id === selectedSpotId) || SAFE_SPOTS[0];

  const handleShareLocation = () => {
    if (onSelectSpot) {
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-white">Verified Safe Meetup Spots</h2>
            <p className="text-xs text-slate-400">
              Choose a well-lit, CCTV-monitored public location to meet in person
            </p>
          </div>

          {/* List of Safe Exchange Locations */}
          <div className="space-y-3">
            {SAFE_SPOTS.map((spot) => {
              const Icon = spot.icon;
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
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${spot.badgeColor}`}>
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
            })}
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
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
    </div>
  );
};

export default SafeMeetupModal;