import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { Category } from '../types/sealify';
import { 
  Car, 
  Smartphone, 
  Home, 
  Shirt, 
  Wrench, 
  Armchair, 
  Briefcase, 
  Sparkles,
  Zap,
  LayoutGrid 
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Car,
  Smartphone,
  Home,
  Shirt,
  Wrench,
  Armchair,
  Briefcase,
  Sparkles,
  Zap,
};

export const CategoryGrid: React.FC = () => {
  const { activeCategory, setActiveCategory, categories, listings, t } = useSealify();

  return (
    <section className="py-1">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base sm:text-xl font-black text-white tracking-tight">{t('browse_categories')}</h2>
          <p className="text-[11px] text-slate-400">Discover verified items & local services in Ogbomoso</p>
        </div>
        {activeCategory !== 'All' && (
          <button
            onClick={() => setActiveCategory('All')}
            className="text-[11px] font-bold text-emerald-400 hover:underline bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
          >
            {t('reset_filter')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 sm:gap-3">
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.iconName] || LayoutGrid;
          const isSelected = activeCategory === cat.name;
          const matchingCount = listings.filter((l) => l.category === cat.name).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(isSelected ? 'All' : (cat.name as Category))}
              className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 group text-center cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-black'
                  : 'bg-slate-900/90 text-slate-200 border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/80'
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 shadow-md shrink-0 ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : `${cat.color} text-white`
                }`}
              >
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold line-clamp-1 leading-snug w-full truncate">
                {cat.name}
              </span>
              <span className={`text-[9px] sm:text-[10px] mt-0.5 font-semibold ${isSelected ? 'text-slate-950' : 'text-slate-400'}`}>
                {matchingCount > 0 ? `${matchingCount}` : '0'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;