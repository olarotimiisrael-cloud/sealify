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
  const { activeCategory, setActiveCategory, categories, listings } = useSealify();

  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Browse Categories</h2>
          <p className="text-xs text-slate-400">Discover verified items and local services in Ogbomoso & across Nigeria</p>
        </div>
        {activeCategory !== 'All' && (
          <button
            onClick={() => setActiveCategory('All')}
            className="text-xs font-bold text-emerald-400 hover:underline bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20"
          >
            Show All Items
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        {categories.map((cat) => {
          const IconComponent = iconMap[cat.iconName] || LayoutGrid;
          const isSelected = activeCategory === cat.name;
          const matchingCount = listings.filter((l) => l.category === cat.name).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(isSelected ? 'All' : (cat.name as Category))}
              className={`flex flex-col items-center p-3.5 rounded-2xl border transition-all duration-200 group text-center cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105 font-black'
                  : 'bg-slate-900/90 text-slate-200 border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/80'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 shadow-md ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : `${cat.color} text-white`
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold line-clamp-1 leading-snug">{cat.name}</span>
              <span className={`text-[10px] mt-0.5 font-semibold ${isSelected ? 'text-slate-950' : 'text-slate-400'}`}>
                {matchingCount > 0 ? `${matchingCount}+ ads` : 'Explore'}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;