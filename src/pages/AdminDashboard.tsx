import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { usePwaInstall } from '../hooks/usePwaInstall';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import { Download, Users, Package, Activity, Share2, ShieldCheck, Database, BellRing } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, listings, allUsers } = useSealify();
  const { isInstallable, install } = usePwaInstall();

  if (!isAdmin) return <div className="p-20 text-center">Unauthorized Access</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20">
      <SEO title="Admin Terminal" />
      <Navbar />
      
      <main className="max-w-7xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Sealify Master Control</h1>
              <p className="text-xs text-slate-500 font-mono">NODE_ADMIN: {user?.email}</p>
           </div>
           <div className="flex gap-2">
             <button onClick={() => toast.info('Starting DB Sync...')} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400"><Database className="w-5 h-5" /></button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase">Registered Users</span>
              <p className="text-3xl font-black text-white">{allUsers.length}</p>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase">Active Ad Nodes</span>
              <p className="text-3xl font-black text-emerald-400">{listings.length}</p>
           </div>
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase">Live Connections</span>
              <p className="text-3xl font-black text-blue-400">142</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* PWA Distro */}
           <section className="bg-emerald-900/10 border border-emerald-500/20 p-8 rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-3">
                 <Download className="text-emerald-400 w-8 h-8" />
                 <h2 className="text-xl font-black">App Distribution Utility</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Ensure all vendors have the app installed. One-click install for the current session or share the direct link to the Ogbomoso support groups.</p>
              
              <div className="flex flex-col gap-3">
                 {isInstallable && <button onClick={install} className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl shadow-xl">INSTALL ON THIS DEVICE</button>}
                 <button onClick={() => { navigator.clipboard.writeText(window.location.origin); toast.success('PWA Link Copied'); }} className="w-full py-4 bg-slate-900 border border-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span>COPY SHAREABLE APP LINK</span>
                 </button>
              </div>
           </section>

           <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-3">
                 <BellRing className="text-purple-400 w-8 h-8" />
                 <h2 className="text-xl font-black">Node Broadcast</h2>
              </div>
              <p className="text-xs text-slate-400">Send a system-wide push notification to all active devices.</p>
              <textarea rows={3} placeholder="Enter broadcast message..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs focus:border-purple-500 outline-none" />
              <button className="w-full py-3 bg-purple-600 text-white font-black rounded-2xl text-xs">DISPATCH SYSTEM ALERT</button>
           </section>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default AdminDashboard;