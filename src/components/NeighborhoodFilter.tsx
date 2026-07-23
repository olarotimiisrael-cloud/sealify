import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { MapPin, GraduationCap, Building2, Store, Home, Compass } from 'lucide-react';

interface NeighborhoodZone {
  id: string;
  name: string;
  query: string;
  icon: React.FC<{ className?: string }>;
  tag: 'Campus' | 'Commercial' | 'Market' | 'Residential';
}

const ZONES: NeighborhoodZone[] = [
  { id: 'all', name: 'All Ogbomoso', query: '', icon: Compass, tag: 'Residential' },
  { id: 'under_g', name: 'Under G', query: 'Under G', icon: GraduationCap, tag: 'Campus' },
  { id: 'lautech_gate', name: 'LAUTECH Gate', query: 'LAUTECH', icon: GraduationCap, tag: 'Campus' },
  { id: 'takie', name: 'Takie Square', query: 'Takie', icon: Building2, tag: 'Commercial' },
  { id: 'sabo', name: 'Sabo Market', query: 'Sabo', icon: Store, tag: 'Market' },
  { id: 'adenike', name: 'Adenike Area', query: 'Adenike', icon: Home, tag: 'Campus' },
  { id: 'aroje', name: 'Aroje & Akala Way', query: 'Aroje', icon: Home, tag: 'Residential' },
];

export const NeighborhoodFilter: React.FC = () => {
  const { filters, setFilters, listings } = useSealify();

  const handleSelectZone = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      location: prev.location === query ? '' : query,
    }));
  };

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Hyper-Local Neighborhood Filter
            </h3>
            <p className="text-[10px] text-slate-400">Filter deals by campus zones & neighborhood hubs in Ogbomoso</p>
          </div>
        </div>

        {filters.location && (
          <button
            onClick={() => setFilters((prev) => ({ ...prev, location: '' }))}
            className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl hover:bg-rose-500/20 transition-colors"
          >
            Clear Zone
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {ZONES.map((zone) => {
          const Icon = zone.icon;
          const isSelected = zone.query === '' ? !filters.location : filters.location.toLowerCase().includes(zone.query.toLowerCase());
          
          const matchingCount = zone.query === ''
            ? listings.length
            : listings.filter((l) => l.location.toLowerCase().includes(zone.query.toLowerCase())).length;

          return (
            <button
              key={zone.id}
              onClick={() => handleSelectZone(zone.query)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20 scale-105 font-black'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-teal-500/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-teal-400'}`} />
              <span className="whitespace-nowrap">{zone.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
              }`}>
                {matchingCount}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default NeighborhoodFilter;