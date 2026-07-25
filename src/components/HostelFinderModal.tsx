import React, { useState } from 'react';
import { X, Home, MapPin, Sparkles, Filter, CheckCircle2, ArrowRight, ShieldCheck, Zap, DollarSign, Building } from 'lucide-react';
import { useSealify } from '../context/SealifyContext';
import { Link, useNavigate } from 'react-router-dom';

interface HostelFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCOMMODATION_TYPES = [
  'Self-Contain (Tiled)',
  'Single Room',
  '2-Bedroom Flat',
  '3-Bedroom Flat',
  'Commercial Shop',
  'Land Plot',
];

const CAMPUS_ZONES = [
  { name: 'Under G', dist: '3-5 mins to LAUTECH Gate', popularity: 'Very High' },
  { name: 'Adenike Area', dist: '5-8 mins to LAUTECH Gate', popularity: 'High' },
  { name: 'LAUTECH Main Gate', dist: '1 min walk', popularity: 'Extreme' },
  { name: 'Aroje / Akala Way', dist: '10 mins drive', popularity: 'Moderate' },
  { name: 'Takie / Center', dist: '12 mins drive', popularity: 'Commercial' },
];

export const HostelFinderModal: React.FC<HostelFinderModalProps> = ({ isOpen, onClose }) => {
  const { setFilters } = useSealify();
  const navigate = useNavigate();

  const [selectedZone, setSelectedZone] = useState('Under G');
  const [selectedType, setSelectedType] = useState('Self-Contain (Tiled)');
  const [maxRent, setMaxRent] = useState<string>('300000');

  if (!isOpen) return null;

  const handleApplyFinder = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      category: 'Real Estate',
      location: selectedZone,
      maxPrice: maxRent ? Number(maxRent) : null,
    }));
    onClose();
    navigate(`/?category=Real Estate&location=${encodeURIComponent(selectedZone)}`);
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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center mx-auto border border-teal-500/30">
            <Home className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">LAUTECH Hostel & Property Finder</h2>
          <p className="text-xs text-slate-400">
            Find verified student hostels, flats, and land listings across Ogbomoso neighborhoods
          </p>
        </div>

        <form onSubmit={handleApplyFinder} className="space-y-5 text-xs">
          {/* Zone Selector */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>1. Select Campus Neighborhood Zone</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAMPUS_ZONES.map((zone) => {
                const isSelected = selectedZone === zone.name;
                return (
                  <button
                    key={zone.name}
                    type="button"
                    onClick={() => setSelectedZone(zone.name)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-white ring-2 ring-emerald-500/30 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="font-bold text-xs text-white truncate">{zone.name}</p>
                    <p className="text-[9px] text-slate-400 truncate mt-0.5">{zone.dist}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apartment Type */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-teal-400" />
              <span>2. Accommodation Category</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ACCOMMODATION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedType === type
                      ? 'bg-teal-500 text-slate-950 font-black shadow'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Maximum Rent Budget */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>3. Maximum Yearly Rent Budget (₦ NGN)</span>
            </label>
            <input
              type="number"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              placeholder="e.g. 250000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3 text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              All hostel listings on Sealify are physically inspected for running water, security gates, and prepaid meter availability.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>Search Hostels in {selectedZone} ({maxRent ? formatNGN(Number(maxRent)) : 'Any Rent'})</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default HostelFinderModal;