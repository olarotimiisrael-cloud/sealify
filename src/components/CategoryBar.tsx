import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { Category, CategoryItem } from '../types/sealify';
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
  LayoutGrid
} from 'lucide-react';

const CATEGORIES: CategoryItem[] = [
  { label: 'All', icon: Layers, color: 'text-emerald-400 bg-emerald-500/10' },
  { label: 'Vehicles', icon: Car, color: 'text-blue-400 bg-blue-500/10' },
  { label: 'Electronics', icon: Smartphone, color: 'text-purple-400 bg-purple-500/10' },
  { label: 'Real Estate', icon: Home, color: 'text-teal-400 bg-teal-500/10' },
  { label: 'Fashion', icon: Shirt, color: 'text-pink-400 bg-pink-500/10' },
  { label: 'Home & Furniture', icon: Armchair, color: 'text-amber-400 bg-amber-500/10' },
  { label: 'Services', icon: Wrench, color: 'text-cyan-400 bg-cyan-500/10' },
  { label: 'Jobs', icon: Briefcase, color: 'text-indigo-500 bg-indigo-500/10' },
  { label: 'Beauty & Health', icon: Sparkles, color: 'text-rose-400 bg-rose-500/10' },
  { label: 'Utility & Energy', icon: Zap, color: 'text-yellow-400 bg-yellow-500/10' },
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
            onClick={() => set<dyad-problem-report summary="60 problems">
<problem file="src/components/CategoryBar.tsx" line="41" column="6" code="17008">JSX element 'div' has no corresponding closing tag.</problem>
<problem file="src/components/CategoryBar.tsx" line="57" column="8" code="17008">JSX element 'div' has no corresponding closing tag.</problem>
<problem file="src/components/CategoryBar.tsx" line="62" column="14" code="17008">JSX element 'button' has no corresponding closing tag.</problem>
<problem file="src/components/CategoryBar.tsx" line="85" column="28" code="1002">Unterminated string literal.</problem>
<problem file="src/components/CategoryBar.tsx" line="85" column="28" code="1005">'</' expected.</problem>
<problem file="src/components/CompareModal.tsx" line="119" column="11" code="1005">')' expected.</problem>
<problem file="src/components/CompareModal.tsx" line="122" column="5" code="1005">')' expected.</problem>
<problem file="src/components/CompareModal.tsx" line="123" column="3" code="1109">Expression expected.</problem>
<problem file="src/components/CompareModal.tsx" line="124" column="1" code="1128">Declaration or statement expected.</problem>
<problem file="src/pages/SellerProfile.tsx" line="123" column="18" code="17008">JSX element 'button' has no corresponding closing tag.</problem>
<problem file="src/pages/SellerProfile.tsx" line="133" column="14" code="17008">JSX element 'p' has no corresponding closing tag.</problem>
<problem file="src/pages/SellerProfile.tsx" line="139" column="7" code="1005">')' expected.</problem>
<problem file="src/pages/SellerProfile.tsx" line="140" column="5" code="1109">Expression expected.</problem>
<problem file="src/pages/SellerProfile.tsx" line="141" column="3" code="1109">Expression expected.</problem>
<problem file="src/pages/SellerProfile.tsx" line="142" column="1" code="1128">Declaration or statement expected.</problem>
<problem file="src/components/CategoryBar.tsx" line="3" column="20" code="2724">'"../types/sealify"' has no exported member named 'CategoryItem'. Did you mean 'Category'?</problem>
<problem file="src/components/CategoryBar.tsx" line="64" column="74" code="2339">Property 'name' does not exist on type 'CategoryItem'.</problem>
<problem file="src/components/CategoryBar.tsx" line="74" column="69" code="2339">Property 'name' does not exist on type 'CategoryItem'.</problem>
<problem file="src/components/MagicSearch.tsx" line="26" column="28" code="2304">Cannot find name 'Shirt'.</problem>
<problem file="src/components/MagicSearch.tsx" line="27" column="37" code="2304">Cannot find name 'Armchair'.</problem>
<problem file="src/components/MagicSearch.tsx" line="28" column="29" code="2304">Cannot find name 'Wrench'.</problem>
<problem file="src/components/MagicSearch.tsx" line="29" column="25" code="2304">Cannot find name 'Briefcase'.</problem>
<problem file="src/components/MagicSearch.tsx" line="96" column="16" code="2304">Cannot find name 'recentlyViewed'.</problem>
<problem file="src/components/MagicSearch.tsx" line="99" column="22" code="2304">Cannot find name 'Clock'.</problem>
<problem file="src/components/MagicSearch.tsx" line="103" column="22" code="2304">Cannot find name 'recentlyViewed'.</problem>
<problem file="src/components/MagicSearch.tsx" line="132" column="29" code="2304">Cannot find name 'Shirt'.</problem>
<problem file="src/components/MagicSearch.tsx" line="133" column="29" code="2304">Cannot find name 'Armchair'.</problem>
<problem file="src/components/MagicSearch.tsx" line="134" column="29" code="2304">Cannot find name 'Wrench'.</problem>
<problem file="src/components/MagicSearch.tsx" line="135" column="29" code="2304">Cannot find name 'Briefcase'.</problem>
<problem file="src/components/MagicSearch.tsx" line="144" column="63" code="2339">Property 'color' does not exist on type '{ icon: any; label: string; }'.</problem>
<problem file="src/components/Navbar.tsx" line="102" column="20" code="2552">Cannot find name 'languages'. Did you mean 'language'?</problem>
<problem file="src/components/CompareModal.tsx" line="122" column="7" code="2304">Cannot find name 'div'.</problem>
<problem file="src/pages/Index.tsx" line="4" column="8" code="2613">Module '"C:/Users/THE~SEAL CW LTD/dyad-apps/sealify/src/components/CategoryBar"' has no default export. Did you mean to use 'import { CategoryBar } from "C:/Users/THE~SEAL CW LTD/dyad-apps/sealify/src/components/CategoryBar"' instead?</problem>
<problem file="src/components/EditListingModal.tsx" line="8" column="12" code="2304">Cannot find name 'Listing'.</problem>
<problem file="src/components/EditListingModal.tsx" line="9" column="41" code="2304">Cannot find name 'Listing'.</problem>
<problem file="src/components/EditListingModal.tsx" line="12" column="19" code="2304">Cannot find name 'Condition'.</problem>
<problem file="src/components/EditListingModal.tsx" line="28" column="46" code="2304">Cannot find name 'Condition'.</problem>
<problem file="src/components/EditListingModal.tsx" line="107" column="65" code="2304">Cannot find name 'Condition'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="12" column="3" code="2300">Duplicate identifier 'Calendar'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="27" column="3" code="2300">Duplicate identifier 'Calendar'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="25" column="3" code="2300">Duplicate identifier 'ExternalLink'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="30" column="3" code="2300">Duplicate identifier 'ExternalLink'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="26" column="3" code="2300">Duplicate identifier 'Share2'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="31" column="3" code="2300">Duplicate identifier 'Share2'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="65" column="22" code="2451">Cannot redeclare block-scoped variable 'setIsAuthOpen'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="73" column="27" code="2451">Cannot redeclare block-scoped variable 'setIsAuthOpen'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="71" column="48" code="2304">Cannot find name 'Listing'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="80" column="9" code="2304">Cannot find name 'setIsMagicSearchOpen'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="83" column="40" code="2769">No overload matches this call.
  Overload 1 of 2, '(type: "keydown", listener: (this: Window, ev: KeyboardEvent) => any, options?: boolean | AddEventListenerOptions): void', gave the following error.
    Argument of type '(e: React.KeyboardEvent) => void' is not assignable to parameter of type '(this: Window, ev: KeyboardEvent) => any'.
      Types of parameters 'e' and 'ev' are incompatible.
        Type 'KeyboardEvent' is missing the following properties from type 'KeyboardEvent<Element>': locale, nativeEvent, isDefaultPrevented, isPropagationStopped, persist
  Overload 2 of 2, '(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void', gave the following error.
    Argument of type '(e: React.KeyboardEvent) => void' is not assignable to parameter of type 'EventListenerOrEventListenerObject'.
      Type '(e: React.KeyboardEvent) => void' is not assignable to type 'EventListener'.
        Types of parameters 'e' and 'evt' are incompatible.
          Type 'Event' is missing the following properties from type 'KeyboardEvent<Element>': altKey, charCode, ctrlKey, code, and 15 more.</problem>
<problem file="src/pages/SellerProfile.tsx" line="84" column="56" code="2769">No overload matches this call.
  Overload 1 of 2, '(type: "keydown", listener: (this: Window, ev: KeyboardEvent) => any, options?: boolean | EventListenerOptions): void', gave the following error.
    Argument of type '(e: React.KeyboardEvent) => void' is not assignable to parameter of type '(this: Window, ev: KeyboardEvent) => any'.
      Types of parameters 'e' and 'ev' are incompatible.
        Type 'KeyboardEvent' is missing the following properties from type 'KeyboardEvent<Element>': locale, nativeEvent, isDefaultPrevented, isPropagationStopped, persist
  Overload 2 of 2, '(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void', gave the following error.
    Argument of type '(e: React.KeyboardEvent) => void' is not assignable to parameter of type 'EventListenerOrEventListenerObject'.
      Type '(e: React.KeyboardEvent) => void' is not assignable to type 'EventListener'.
        Types of parameters 'e' and 'evt' are incompatible.
          Type 'Event' is missing the following properties from type 'KeyboardEvent<Element>': altKey, charCode, ctrlKey, code, and 15 more.</problem>
<problem file="src/pages/SellerProfile.tsx" line="90" column="5" code="2552">Cannot find name 'sendMessage'. Did you mean 'onmessage'?</problem>
<problem file="src/pages/SellerProfile.tsx" line="96" column="5" code="2552">Cannot find name 'sendMessage'. Did you mean 'onmessage'?</problem>
<problem file="src/pages/SellerProfile.tsx" line="99" column="8" code="2552">Cannot find name 'isOpen'. Did you mean 'open'?</problem>
<problem file="src/pages/SellerProfile.tsx" line="103" column="112" code="2552">Cannot find name 'onClose'. Did you mean 'onclose'?</problem>
<problem file="src/pages/SellerProfile.tsx" line="108" column="18" code="2304">Cannot find name 'Sparkles'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="120" column="20" code="2304">Cannot find name 'Command'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="124" column="34" code="2304">Cannot find name 'setIsAuthModalOpen'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="127" column="20" code="2304">Cannot find name 'X'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="139" column="9" code="2304">Cannot find name 'div'.</problem>
<problem file="src/pages/SellerProfile.tsx" line="140" column="7" code="2304">Cannot find name 'div'.</problem>
</dyad-problem-report><think>The user has provided 60 TypeScript compile-time errors across multiple files. I need to fix them all. Let me analyze the errors and provide fixes.

Key issues:
1. CategoryBar.tsx - JSX structure issues, missing CategoryItem type, property name issues
2. CompareModal.tsx - JSX structure issues
3. SellerProfile.tsx - Multiple issues: duplicate imports, missing variables, JSX structure, event handler types
4. MagicSearch.tsx - Missing imports (Shirt, Armchair, Wrench, Briefcase, Clock, recentlyViewed), property color issue
4. Navbar.tsx - missing languages variable
5. EditListingModal.tsx - missing Listing and Condition types
6. Index.tsx - import issue with CategoryBar

Let me fix these files one by one. I'll start with the most critical ones.</think><dyad-write path="src/components/CategoryBar.tsx">
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
  Zap,
  LayoutGrid
} from 'lucide-react';

interface CategoryItem {
  label: Category | 'All';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  name: string;
  count: number;
}

const CATEGORIES: CategoryItem[] = [
  { label: 'All', icon: Layers, color: 'text-emerald-400 bg-emerald-500/10', name: 'All', count: 0 },
  { label: 'Vehicles', icon: Car, color: 'text-blue-400 bg-blue-500/10', name: 'Vehicles', count: 120 },
  { label: 'Electronics', icon: Smartphone, color: 'text-purple-400 bg-purple-500/10', name: 'Electronics', count: 340 },
  { label: 'Real Estate', icon: Home, color: 'text-teal-400 bg-teal-500/10', name: 'Real Estate', count: 85 },
  { label: 'Fashion', icon: Shirt, color: 'text-pink-400 bg-pink-500/10', name: 'Fashion', count: 210 },
  { label: 'Home & Furniture', icon: Armchair, color: 'text-amber-400 bg-amber-500/10', name: 'Home & Furniture', count: 95 },
  { label: 'Services', icon: Wrench, color: 'text-cyan-400 bg-cyan-500/10', name: 'Services', count: 140 },
  { label: 'Jobs', icon: Briefcase, color: 'text-indigo-500 bg-indigo-500/10', name: 'Jobs', count: 60 },
  { label: 'Beauty & Health', icon: Sparkles, color: 'text-rose-400 bg-rose-500/10', name: 'Beauty & Health', count: 110 },
  { label: 'Utility & Energy', icon: Zap, color: 'text-yellow-400 bg-yellow-500/10', name: 'Utility & Energy', count: 15 },
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