import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { Category } from '../types/sealify';
import { 
  Car, 
  Home, 
  Smartphone, 
  Shirt, 
  Armchair, 
  Wrench, 
  Briefcase, 
  Sparkles,
  Layers,
  Zap
} from 'lucide-react';

interface CategoryItem {
  label: Category | 'All';
  icon: React.FC<{ className?: string }>;
  color: string;
}

const categories: CategoryItem[] = [
  { label: 'All', icon: Layers, color: 'text-emerald-400 bg-emerald-500/10' },
  { label: 'Vehicles', icon: Car, color: 'text-blue-400 bg-blue-500/10' },
  { label: 'Electronics', icon: Smartphone, color: 'text-purple-400 bg-purple-500/10' },
  { label: 'Real Estate', icon: Home, color: 'text-teal-400 bg-teal-500/10' },
  { label: 'Fashion', icon: Shirt, color: 'text-pink-400 bg-pink-500/10' },
  { label: 'Home & Furniture', icon: Armchair, color: 'text-amber-400 bg-amber-500/10' },
  { label: 'Services', icon: Wrench, color: 'text-cyan-400 bg-cyan-500/10' },
  { label: 'Jobs', icon: Briefcase, color: 'text-indigo-400 bg-indigo-500/10' },
  { label: 'Beauty & Health', icon: Sparkles, color: 'text-rose-400 bg-rose-500/10' },
  { label: 'Utility & Energy', icon: Zap, color: 'text-yellow-400 bg-yellow-500/10' },
];

const CategoryBar: React.FC = () => {
  const { activeCategory, setActiveCategory } = useSealify();

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-slate-950/20' : cat.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;