import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { Category } from '../types/sealify';
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
  Zap
} from 'lucide-react';

interface CategoryItem {
  label: Category | 'All';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  count: number;
}

const CATEGORIES: CategoryItem[] = [
  { label: 'All', name: 'All', icon: Layers, color: 'text-emerald-400 bg-emerald-500/10', count: 0 },
  { label: 'Vehicles', name: 'Vehicles', icon: Car, color: 'text-blue-400 bg-blue-500/10', count: 120 },
  { label: 'Electronics', name: 'Electronics', icon: Smartphone, color: 'text-purple-400 bg-purple-500/10', count: 340 },
  { label: 'Real Estate', name: 'Real Estate', icon: Home, color: 'text-teal-400 bg-teal-500/10', count: 85 },
  { label: 'Fashion', name: 'Fashion', icon: Shirt, color: 'text-pink-400 bg-pink-500/10', count: 210 },
  { label: 'Home & Furniture', name: 'Home & Furniture', icon: Armchair, color: 'text-amber-400 bg-amber-500/10', count: 95 },
  { label: 'Services', name: 'Services', icon: Wrench, color: 'text-cyan-400 bg-cyan-500/10', count: 140 },
  { label: 'Jobs', name: 'Jobs', icon: Briefcase, color: 'text-indigo-500 bg-indigo-500/10', count: 60 },
  { label: 'Beauty & Health', name: 'Beauty & Health', icon: Sparkles, color: 'text-rose-400 bg-rose-500/10', count: 110 },
  { label: 'Utility & Energy', name: 'Utility & Energy', icon: Zap, color: 'text-yellow-400 bg-yellow-500/10', count: 15 },
];

export const CategoryBar: React.FC = () => {
  const { activeCategory, setActiveCategory } = useSealify();

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-3 px-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Browse Categories</h2>
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

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.label;
          const IconComponent = cat.icon;
          return (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(isSelected ? 'All' : cat.label)}
              className={`flex flex-col items-center p-3.5 rounded-2xl border transition-all duration-200 group text-center cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105'
                  : 'bg-slate-900/90 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800/80'
              }`}
            >
              <div className={`p-1 rounded-lg ${isSelected ? 'bg-slate-950/20' : cat.color}`}>
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold line-clamp-1">{cat.name}</span>
              <span className={`text-[10px] mt-1 font-semibold ${isSelected ? 'text-slate-950' : 'text-slate-400'}`}>
                {cat.count}+ ads
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;