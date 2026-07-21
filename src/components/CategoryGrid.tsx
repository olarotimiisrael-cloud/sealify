import React from 'react';
import { CATEGORIES } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { Car, Smartphone, Home, Shirt, Wrench, Armchair, Briefcase, Dumbbell, LayoutGrid } from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Car,
  Smartphone,
  Home,
  Shirt,
  Wrench,
  Armchair,
  Briefcase,
  Dumbbell,
};

export const CategoryGrid: React.FC = () => {
  const { searchFilter, setSearchFilter } = useApp();

  const handleCategorySelect = (catId: string) => {
    setSearchFilter((prev) => ({
      ...prev,
      category: prev.category === catId ? 'all' : catId,
    }));
  };

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Explore Categories</h2>
          <p className="text-xs text-slate-500">Find exactly what you are looking for</p>
        </div>
        {searchFilter.category !== 'all' && (
          <button
            onClick={() => setSearchFilter((p) => ({ ...p, category: 'all' }))}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const IconComponent = iconMap[cat.iconName] || LayoutGrid;
          const isSelected = searchFilter.category === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 group text-center ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 scale-105'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:shadow-sm'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${
                  isSelected ? 'bg-white/20 text-white' : `${cat.color} text-white shadow-sm`
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium line-clamp-1 leading-tight">{cat.name}</span>
              <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                {cat.count}+ ads
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};