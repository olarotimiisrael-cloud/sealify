import React, { useState } from 'react';
import { 
  Layout, Layers, Box, Square, Circle, Triangle, 
  Type, Image, Video, Music, Film, Code, Database, 
  Server, Monitor, Smartphone, Tablet, Laptop, 
  Palette, Eye, MousePointer, Move, RotateCcw,
  Copy, Check, ChevronDown, ChevronUp, Search,
  Download, Upload, Link, ExternalLink, Settings,
  Shield, Zap, Star, Heart, Tag, Package, Truck,
  MapPin, Clock, Calendar, Bell, MessageSquare,
  ShoppingBag, CreditCard, Wallet, Lock, Unlock,
  CheckCircle2, AlertCircle, Info, HelpCircle,
  Minus, FileText, Hash, CheckSquare, CircleDot, ToggleRight,
  PanelLeft, ChevronRight, Table, User, Award, Loader2,
  ArrowRightLeft, QrCode, Volume2, Image as ImageIcon,
  BarChart, Calculator, UserCog, GitBranch, Store
} from 'lucide-react';

const UIComponentLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'primitives' | 'forms' | 'navigation' | 'data' | 'feedback' | 'marketplace' | 'admin'>('all');

  const components = [
    // Primitives
    { name: 'Button', category: 'primitives', variants: ['Primary', 'Secondary', 'Destructive', 'Outline', 'Ghost', 'Link'], description: 'Interactive button with loading states', icon: Square },
    { name: 'Input', category: 'primitives', variants: ['Text', 'Email', 'Password', 'Number', 'Search'], description: 'Form input with validation states', icon: Type },
    { name: 'Label', category: 'primitives', variants: ['Required', 'Optional', 'Disabled'], description: 'Accessible form labels', icon: Tag },
    { name: 'Card', category: 'primitives', variants: ['Default', 'Bordered', 'Elevated', 'Interactive'], description: 'Content container with variants', icon: Square },
    { name: 'Badge', category: 'primitives', variants: ['Default', 'Success', 'Warning', 'Destructive', 'Outline'], description: 'Status indicators and tags', icon: Tag },
    { name: 'Avatar', category: 'primitives', variants: ['Image', 'Fallback', 'Group', 'Status'], description: 'User/profile representation', icon: Circle },
    { name: 'Separator', category: 'primitives', variants: ['Horizontal', 'Vertical', 'Dashed'], description: 'Visual content dividers', icon: Minus },
    { name: 'Skeleton', category: 'primitives', variants: ['Text', 'Card', 'Circular', 'Rectangular'], description: 'Loading placeholders', icon: Square },

    // Forms
    { name: 'Form', category: 'forms', variants: ['Validation', 'Submission', 'Reset', 'Field Arrays'], description: 'React Hook Form integration', icon: FileText },
    { name: 'Input OTP', category: 'forms', variants: ['4-digit', '6-digit', 'Custom'], description: 'One-time password input', icon: Hash },
    { name: 'Select', category: 'forms', variants: ['Single', 'Multi', 'Searchable', 'Groups'], description: 'Dropdown selection', icon: ChevronDown },
    { name: 'Checkbox', category: 'forms', variants: ['Single', 'Group', 'Indeterminate'], description: 'Boolean selection', icon: CheckSquare },
    { name: 'Radio Group', category: 'forms', variants: ['Horizontal', 'Vertical', 'Cards'], description: 'Single choice selection', icon: CircleDot },
    { name: 'Switch', category: 'forms', variants: ['Default', 'Sizes', 'Colors'], description: 'Toggle boolean values', icon: ToggleRight },
    { name: 'Textarea', category: 'forms', variants: ['Auto-resize', 'Character Count', 'Rich Text'], description: 'Multi-line text input', icon: Type },
    { name: 'Date Picker', category: 'forms', variants: ['Single', 'Range', 'Presets'], description: 'Calendar date selection', icon: Calendar },

    // Navigation
    { name: 'Navbar', category: 'navigation', variants: ['Desktop', 'Mobile', 'With Search', 'With Auth'], description: 'Main navigation header', icon: Layout },
    { name: 'MobileNav', category: 'navigation', variants: ['Bottom Bar', 'Drawer', 'Tabs'], description: 'Mobile bottom navigation', icon: Smartphone },
    { name: 'Sidebar', category: 'navigation', variants: ['Collapsible', 'Permanent', 'Hover'], description: 'Side navigation panel', icon: PanelLeft },
    { name: 'Breadcrumb', category: 'navigation', variants: ['Default', 'With Icons', 'Collapsed'], description: 'Hierarchical navigation', icon: ChevronRight },
    { name: 'Pagination', category: 'navigation', variants: ['Numbers', 'Prev/Next', 'Infinite Scroll'], description: 'Page navigation', icon: ChevronRight },
    { name: 'Tabs', category: 'navigation', variants: ['Default', 'Animated', 'Icons', 'Vertical'], description: 'Tabbed interface', icon: Square },
    { name: 'Dropdown Menu', category: 'navigation', variants: ['Trigger', 'Checkbox', 'Radio', 'Submenu'], description: 'Context menus', icon: ChevronDown },
    { name: 'Command Palette', category: 'navigation', variants: ['Search', 'Commands', 'Shortcuts'], description: 'Cmd+K interface', icon: Search },

    // Data Display
    { name: 'Table', category: 'data', variants: ['Sortable', 'Filterable', 'Pagination', 'Row Selection', 'Expandable'], description: 'Tabular data display', icon: Table },
    { name: 'Data Table', category: 'data', variants: ['Server-side', 'Column Visibility', 'Export CSV'], description: 'Advanced data grid', icon: Database },
    { name: 'ListingCard', category: 'marketplace', variants: ['Grid', 'List', 'Compact', 'With Actions'], description: 'Product listing card', icon: Package },
    { name: 'User Profile Card', category: 'marketplace', variants: ['Compact', 'Full', 'With Badge'], description: 'User display card', icon: User },
    { name: 'TrustScore', category: 'marketplace', variants: ['Full', 'Compact', 'Inline'], description: 'Seller reputation widget', icon: Shield },
    { name: 'PriceGuard', category: 'marketplace', variants: ['Deal', 'Fair', 'Premium'], description: 'AI price valuation', icon: Zap },
    { name: 'VerifiedBadge', category: 'marketplace', variants: ['Individual', 'Business', 'Premium', 'Student'], description: 'Trust verification badge', icon: Award },
    { name: 'CategoryCard', category: 'marketplace', variants: ['Grid', 'List', 'With Count'], description: 'Category display', icon: Box },

    // Feedback
    { name: 'Toast', category: 'feedback', variants: ['Success', 'Error', 'Warning', 'Info', 'Promise', 'Custom'], description: 'Sonner toast notifications', icon: Bell },
    { name: 'Dialog', category: 'feedback', variants: ['Alert', 'Confirm', 'Form', 'Fullscreen'], description: 'Modal dialogs', icon: Square },
    { name: 'Alert Dialog', category: 'feedback', variants: ['Destructive', 'Confirmation'], description: 'Critical confirmations', icon: AlertCircle },
    { name: 'Tooltip', category: 'feedback', variants: ['Default', 'Delayed', 'Rich Content'], description: 'Hover information', icon: Info },
    { name: 'Toast (Sonner)', category: 'feedback', variants: ['Promise', 'Action', 'Dismissible'], description: 'Modern toast library', icon: Bell },
    { name: 'Progress', category: 'feedback', variants: ['Determinate', 'Indeterminate', 'Circle'], description: 'Progress indicators', icon: Loader2 },
    { name: 'Alert', category: 'feedback', variants: ['Info', 'Success', 'Warning', 'Destructive'], description: 'Inline alerts', icon: AlertCircle },

    // Marketplace Feature Components
    { name: 'ListingCard', category: 'marketplace', variants: ['Grid', 'List', 'Compact', 'Quick View', 'Compare'], description: 'Product listing with actions', icon: Package },
    { name: 'OfferModal', category: 'marketplace', variants: ['Price Input', 'Message', 'Counter'], description: 'Price negotiation', icon: Tag },
    { name: 'SwapProposalModal', category: 'marketplace', variants: ['Item Input', 'Valuation', 'Cash Diff'], description: 'Barter/trade-in proposals', icon: ArrowRightLeft },
    { name: 'SafeMeetupModal', category: 'marketplace', variants: ['Zone Filter', 'Spot List', 'GPS Directions'], description: 'Verified safe spots', icon: MapPin },
    { name: 'InspectionChecklistModal', category: 'marketplace', variants: ['Electronics', 'Vehicles', 'Real Estate', 'General'], description: 'Category checklists', icon: CheckSquare },
    { name: 'AiVoiceOverviewModal', category: 'marketplace', variants: ['Presenter Select', 'Speed Control', 'Transcript'], description: 'AI audio briefing', icon: Volume2 },
    { name: 'StorefrontFlycardModal', category: 'marketplace', variants: ['Canvas Gen', 'Download', 'Share'], description: 'Social promo cards', icon: ImageIcon },
    { name: 'PriceHistoryChart', category: 'marketplace', variants: ['Area Chart', 'Trend Indicator'], description: 'Market trends', icon: BarChart },
    { name: 'ValuationCalculatorModal', category: 'marketplace', variants: ['Category', 'Condition', 'Age', 'Apply Price'], description: 'AI price estimator', icon: Calculator },

    // Admin Components
    { name: 'AdminEditUserModal', category: 'admin', variants: ['Profile', 'Verification', 'Bank Details', 'Status'], description: 'User management', icon: UserCog },
    { name: 'AdminSettingsModal', category: 'admin', variants: ['Profile', 'Credentials', 'Security'], description: 'Root configuration', icon: Settings },
    { name: 'SqlSchemaViewer', category: 'admin', variants: ['SQL Script', 'Mermaid ERD', 'Download'], description: 'Database schema', icon: Database },
    { name: 'DatabaseTest', category: 'admin', variants: ['Connection', 'Tables', 'Auth', 'RLS'], description: 'Connection testing', icon: CheckCircle2 },
    { name: 'MigrationExecutor', category: 'admin', variants: ['Run', 'Logs', 'Rollback'], description: 'DB migrations', icon: GitBranch },
    { name: 'DatabaseSchemaGenerator', category: 'admin', variants: ['Generate', 'Copy', 'Download'], description: 'Schema generation', icon: Code },
  ];

  const filteredComponents = components.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All', icon: Layout },
    { id: 'primitives', label: 'Primitives', icon: Square },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'navigation', label: 'Navigation', icon: Layout },
    { id: 'data', label: 'Data Display', icon: Database },
    { id: 'feedback', label: 'Feedback', icon: Bell },
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            UI Component Library
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {components.length} production-ready components built with shadcn/ui, Tailwind CSS, and TypeScript
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterCategory === cat.id
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <cat.icon className="w-3.5 h-3.5 mr-1.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredComponents.map((comp) => (
          <div
            key={comp.name}
            className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0 group-hover:scale-110 transition-transform">
                <comp.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                comp.category === 'primitives' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                comp.category === 'forms' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                comp.category === 'navigation' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                comp.category === 'data' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                comp.category === 'feedback' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                comp.category === 'marketplace' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' :
                'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {comp.category}
              </span>
            </div>

            <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              {comp.name}
            </h3>

            <p className="text-xs text-slate-400 mb-3 line-clamp-2">
              {comp.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {comp.variants.slice(0, 4).map((variant, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-medium text-slate-400">
                  {variant}
                </span>
              ))}
              {comp.variants.length > 4 && (
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[10px] font-bold">
                  +{comp.variants.length - 4} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-slate-700" />
          <p className="text-sm">No components match your search</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
          <p className="text-3xl font-black text-emerald-400">{components.length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Total Components</p>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
          <p className="text-3xl font-black text-blue-400">{components.filter(c => c.category === 'primitives').length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Primitives</p>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
          <p className="text-3xl font-black text-purple-400">{components.filter(c => c.category === 'forms').length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Forms</p>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
          <p className="text-3xl font-black text-teal-400">{components.filter(c => c.category === 'marketplace').length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Marketplace</p>
        </div>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
          <p className="text-3xl font-black text-rose-400">{components.filter(c => c.category === 'admin').length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Admin</p>
        </div>
      </div>
    </div>
  );
};

export default UIComponentLibrary;
