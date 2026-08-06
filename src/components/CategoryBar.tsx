import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import { Category } from '../types/sealify';
import HostelFinderModal from './HostelFinderModal';
import { 
  Layers, 
  Car, 
  Smartphone, 
  Home, 
  Shirt, 
  Armchair, 
  Wrench, 
  Briefcase, 
  Sparkles,
  Zap,
  LayoutGrid,
  Building
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Layers,
  Car,
  Smartphone,
  Home,
  Shirt,
  Armchair,
  Wrench,
  Briefcase,
  Sparkles,
  Zap,
};

export const CategoryBar: React.FC = () => {
  const { activeCategory, setActiveCategory, categories, t } = useSealify();
  const [isHostelFinderOpen, setIsHostelFinderOpen] = useState(false);

  return (
    <>
      <div className="bg-slate-900 border-b border-slate-800 py-3 px-4 overflow-x-auto no-scrollbar font-sans">
        <div className="flex items-center gap-2 max-w-7xl mx-auto">
          <button
            onClick={() => setActiveCategory('All')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
              activeCategory === 'All'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t('all_categories')}</span>
          </button>

          <button
            onClick={() => setIsHostelFinderOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0 transition-colors"
          >
            <Building className="w-3.5 h-3.5" />
            <span>LAUTECH Hostel Finder</span>
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat.name;
            const IconComponent = iconMap[cat.iconName] || LayoutGrid;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isSelected ? 'All' : cat.name)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                }`}
              >
                <div className={`p-1 rounded-lg ${isSelected ? 'bg-slate-950/20' : `${cat.color} text-white`}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <HostelFinderModal
        isOpen={isHostelFinderOpen}
        onClose={() => setIsHostelFinderOpen(false)}
      />
    </>
  );
};

export default CategoryBar;