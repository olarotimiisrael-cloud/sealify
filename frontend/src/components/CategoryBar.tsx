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

type CategoryConfig = {
  id: string;
  name: Category;
  iconName: string;
  color: string;
  count?: number;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
  Building,
};

export const CategoryBar: React.FC = () => {
  const { activeCategory, setActiveCategory, categories, t } = useSealify();
  const [isHostelFinderOpen, setIsHostelFinderOpen] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-slate-200 py-3 px-4 overflow-x-auto no-scrollbar font-sans shadow-sm">
        <div className="flex items-center gap-2 max-w-7xl mx-auto">
          <button
            onClick={() => setActiveCategory('All')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
              activeCategory === 'All'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 ring-1 ring-emerald-600/20'
                : 'bg-white text-[#0f172a] hover:text-emerald-600 border border-slate-200 hover:border-emerald-600/50'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="font-black">{t('all_categories')}</span>
          </button>

          <button
            onClick={() => setIsHostelFinderOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-100 hover:bg-teal-200 text-teal-700 border border-teal-200 shrink-0 transition-colors shadow-sm hover:shadow-teal-200/50"
          >
            <Building className="w-3.5 h-3.5" />
            <span>LAUTECH Hostel Finder</span>
          </button>

          {categories.map((cat: CategoryConfig) => {
            const isSelected = activeCategory === cat.name;
            const IconComponent = iconMap[cat.iconName] || LayoutGrid;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isSelected ? 'All' : cat.name)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 ring-1 ring-emerald-600/20'
                    : 'bg-white text-[#0f172a] hover:text-emerald-600 hover:border-emerald-600/50 border border-slate-200 hover:bg-slate-50 drop-shadow-sm shadow-sm'
                }`}
              >
                <div className={`p-1 rounded-lg shadow-sm ${
                  isSelected ? 'bg-white/20 border border-white/30' : `${cat.color} border border-${cat.color}/30`
                }`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <span className={`whitespace-nowrap font-black text-[#0f172a] drop-shadow-sm`}>{cat.name}</span>
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

