import React from 'react';
import { useSealify } from '../context/SealifyContext';
import { usePwaInstall } from '../hooks/usePwaInstall';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import { Download, ShieldCheck, Smartphone, Bell, Fingerprint, Camera, Mic, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user, updateUser } = useSealify();
  const { isInstallable, install } = usePwaInstall();

  const handleRequestNativePermission = async (type: 'notifications' | 'camera') => {
    if (type === 'notifications') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') toast.success('Notifications Enabled');
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        toast.success('Camera Access Verified');
      } catch (e) {
        toast.error('Camera access denied by system');
      }
    }
  };

  if (!user) return <div className="p-20 text-center">Login Required</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEO title="System Settings" />
      <Navbar />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        <h1 className="text-3xl font-black">App Control Center</h1>

        {/* PWA Section */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
           <div className="flex items-center gap-3">
              <Download className="text-emerald-400" />
              <h2 className="text-lg font-bold">Native App Installation</h2>
           </div>
           <p className="text-xs text-slate-400">Install Sealify on your home screen for the best mobile experience, offline access, and fast loading.</p>
           {isInstallable ? (
             <button onClick={install} className="w-full py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">INSTALL SEALIFY APP</button>
           ) : (
             <div className="p-3 bg-slate-950 rounded-xl text-[10px] text-slate-500 border border-slate-800 text-center">App is already installed or your browser doesn't support PWA</div>
           )}
        </section>

        {/* Permissions & Security */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
           <h2 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="text-blue-400" /> Device Permissions</h2>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                 <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-400" />
                    <div>
                       <p className="text-sm font-bold">Push Notifications</p>
                       <p className="text-[10px] text-slate-500">Real-time deal and message alerts</p>
                    </div>
                 </div>
                 <button onClick={() => handleRequestNativePermission('notifications')} className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-bold">ENABLE</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                 <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-emerald-400" />
                    <div>
                       <p className="text-sm font-bold">Biometric Lock</p>
                       <p className="text-[10px] text-slate-500">Secure app with fingerprint or FaceID</p>
                    </div>
                 </div>
                 <input type="checkbox" className="accent-emerald-500" checked={user.verified} onChange={() => toast.info('Biometric profile updated')} />
              </div>
           </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
           <h2 className="text-lg font-bold flex items-center gap-2"><Share2 className="text-amber-400" /> WhatsApp Direct Link</h2>
           <p className="text-xs text-slate-400">Share your direct store link with customers on WhatsApp.</p>
           <div className="flex gap-2">
              <input readOnly value={`${window.location.origin}/seller/${user.id}`} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs font-mono" />
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/seller/${user.id}`); toast.success('Link Copied'); }} className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs">COPY</button>
           </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
};

export default Settings;