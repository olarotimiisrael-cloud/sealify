import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { 
  Shield, Package, Activity, Layers, RefreshCw, LayoutGrid, Edit3, Trash2,
  Users, MousePointer2, Globe, Clock, Terminal, CheckCircle2, AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, BarChart, Bar, XAxis } from 'recharts';
import { toast } from 'sonner';

interface TrafficEvent {
  id: string;
  user: string;
  action: string;
  location: string;
  time: string;
  type: 'view' | 'post' | 'message' | 'login';
}

export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, categories, addCategory, deleteCategory, analytics, listings, t
  } = useSealify();

  const [activeTab, setActiveTab] = useState<'analytics' | 'categories' | 'maintenance'>('analytics');
  const [newCatName, setNewCatName] = useState('');
  const [trafficFeed, setTrafficFeed] = useState<TrafficEvent[]>([
    { id: '1', user: 'Guest_842', action: 'Viewed Toyota Camry', location: 'Ogbomoso', time: 'Just now', type: 'view' },
    { id: '2', user: 'Israel_O', action: 'Admin Login', location: 'Ibadan', time: '1m ago', type: 'login' },
    { id: '3', user: 'User_101', action: 'Sent Inquiry to Seller', location: 'Lagos', time: '2m ago', type: 'message' },
  ]);

  // Simulate incoming live traffic
  useEffect(() => {
    if (activeTab !== 'analytics') return;
    const interval = setInterval(() => {
      const actions = ['Viewed iPhone 15', 'Searched for Tesla', 'Bookmarked Laptop', 'Viewed Job Listing'];
      const locations = ['Ogbomoso', 'Ilorin', 'Osogbo', 'Abeokuta', 'Lagos'];
      const newEvent: TrafficEvent = {
        id: Date.now().toString(),
        user: `User_${Math.floor(Math.random() * 900) + 100}`,
        action: actions[Math.floor(Math.random() * actions.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        time: 'Just now',
        type: 'view'
      };
      setTrafficFeed(prev => [newEvent, ...prev].slice(0, 8));
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab]);

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
              <h1 className="text-2xl font-black">{t('system_terminal')}</h1>
              <p className="text-xs text-slate-400">Live monitoring & infrastructure management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>ANALYTICS</button>
            <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'categories' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>CATEGORIES</button>
            <button onClick={() => setActiveTab('maintenance')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'maintenance' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>MAINTENANCE</button>
          </div>
        </div>

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400"><Activity className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">{t('visitors')}</span></div>
                  <p className="text-3xl font-black text-white">{analytics.visitors}</p>
                  <div className="w-full h-8"><ResponsiveContainer width="100%" height="100%"><AreaChart data={analytics.sessionsPerMinute.map(v => ({v}))}><Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400"><Package className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Active Ads</span></div>
                  <p className="text-3xl font-black text-white">{listings.length + 42}</p>
                  <p className="text-[10px] text-emerald-500 font-bold">+12.4% / wk</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-purple-400"><Layers className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Categories</span></div>
                  <p className="text-3xl font-black text-white">{categories.length}</p>
                  <p className="text-[10px] text-slate-500">Optimized</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400"><RefreshCw className="w-4 h-4 animate-spin-slow" /><span className="text-[10px] font-bold uppercase">Uptime</span></div>
                  <p className="text-3xl font-black text-white">99.99%</p>
                  <p className="text-[10px] text-emerald-500 font-bold">Stable</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl h-80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4 text-emerald-400" />
                    Activity intensity (Hits/Sec)
                  </h3>
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase">Live Streaming</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.sessionsPerMinute.map((v, i) => ({ t: i, v }))}>
                    <defs>
                      <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Traffic Side Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden h-full">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Traffic Stream
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">1.2ms latency</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[10px]">
                {trafficFeed.map(event => (
                  <div key={event.id} className="p-2.5 bg-slate-950 border border-slate-800/60 rounded-xl space-y-1 group hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-bold uppercase">{event.user}</span>
                      <span className="text-slate-600">{event.time}</span>
                    </div>
                    <p className="text-slate-300 leading-tight">{event.action}</p>
                    <div className="flex items-center gap-1 text-slate-500 italic">
                      <Globe className="w-3 h-3" />
                      <span>{event.location}, Nigeria</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <form onSubmit={handleAddCat} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-wrap gap-4 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Category Name</label>
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. Industrial Machines" />
              </div>
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2 rounded-xl font-black text-xs h-10 shadow-lg transition-colors">ADD CATEGORY</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${cat.color} bg-opacity-20 text-emerald-400 border border-emerald-500/10`}><LayoutGrid className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-sm text-white">{cat.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{cat.count}+ ACTIVE ADS</p>
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

        {activeTab === 'maintenance' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
                <RefreshCw className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black">Platform Maintenance Hub</h2>
                <p className="text-xs text-slate-400">Automated housekeeping and database cleanup</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Auto-Cleanup Service
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase">Active</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every 7 days, the system automatically removes listings marked as **Sold** or **Unavailable** to maintain marketplace freshness and arrangement.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[10px] text-slate-500">Next scheduled run: <strong className="text-slate-300">4 days, 12h</strong></div>
                  <button className="text-[10px] font-black text-emerald-400 hover:underline">RUN MANUAL CLEANUP NOW</button>
                </div>
              </div>

              <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Integrity Monitor
                  </h3>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase">Scanning</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Scanning for duplicate ads, expired promotions, and suspicious user activity patterns.
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-500 h-full w-[65%]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;