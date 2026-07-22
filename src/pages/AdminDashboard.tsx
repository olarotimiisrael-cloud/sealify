import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { 
  Shield, Package, Activity, Layers, RefreshCw, LayoutGrid, Edit3, Trash2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, categories, addCategory, deleteCategory, analytics, listings
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'categories' | 'users' | 'listings'>('analytics');
  const [newCatName, setNewCatName] = useState('');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black">Restricted Access</h2>
        <p className="text-slate-400 text-xs mt-2">Only administrators can access this terminal.</p>
        <Link to="/" className="mt-6 px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">Back Home</Link>
      </div>
    );
  }

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    addCategory({ name: newCatName, iconName: 'LayoutGrid', count: 0, color: 'bg-emerald-500' });
    setNewCatName('');
    toast.success("Category added successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">System Terminal</h1>
              <p className="text-xs text-slate-400">Manage infrastructure, categories, and real-time monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>ANALYTICS</button>
            <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'categories' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>CATEGORIES</button>
          </div>
        </div>

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400"><Activity className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Live Visitors</span></div>
                <p className="text-3xl font-black text-white">{analytics.visitors}</p>
                <div className="w-full h-8"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analytics.sessionsPerMinute.map(v => ({v}))}><Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-blue-400"><Package className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Active Ads</span></div>
                <p className="text-3xl font-black text-white">{listings.length}</p>
                <p className="text-[10px] text-slate-500">+12% from yesterday</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-purple-400"><Layers className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Total Categories</span></div>
                <p className="text-3xl font-black text-white">{categories.length}</p>
                <p className="text-[10px] text-slate-500">Infrastructure stable</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400"><RefreshCw className="w-4 h-4 animate-spin-slow" /><span className="text-[10px] font-bold uppercase">System Uptime</span></div>
                <p className="text-3xl font-black text-white">99.9%</p>
                <p className="text-[10px] text-emerald-500">Healthy</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl h-64">
              <h3 className="text-xs font-black text-slate-400 uppercase mb-4">Traffic Stream (Real-time)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.sessionsPerMinute.map((v, i) => ({ t: i, v }))}>
                  <defs>
                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form onSubmit={handleAddCat} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-wrap gap-4 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Category Name</label>
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm" placeholder="e.g. Industrial Machines" />
              </div>
              <button type="submit" className="bg-emerald-500 text-slate-950 px-6 py-2 rounded-xl font-black text-xs h-10 shadow-lg">ADD CATEGORY</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${cat.color} bg-opacity-20 text-emerald-400`}><LayoutGrid className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-sm text-white">{cat.name}</p>
                      <p className="text-[10px] text-slate-500">{cat.count} listings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;