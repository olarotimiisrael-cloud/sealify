import React, { useState } from 'react';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import PwaInstallButton from '../components/PwaInstallButton';
import { 
  ShieldCheck, 
  Bell, 
  Fingerprint, 
  Camera, 
  Share2, 
  User
} from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user } = useSealify();
  const [biometricEnabled, setBiometricEnabled] = useState(
    localStorage.getItem('sealify_biometric') === 'true'
  );

  const handleRequestNativePermission = async (type: 'notifications' | 'camera') => {
    if (type === 'notifications') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast.success('Push Notifications Enabled successfully!');
        } else {
          toast.error('Permission denied for device notifications');
        }
      } else {
        toast.info('Notifications requested. PWA system channel activated.');
      }
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        toast.success('Camera & Storage Access Verified!');
      } catch (e) {
        toast.error('Camera access denied or restricted by browser settings.');
      }
    }
  };

  const toggleBiometric = () => {
    const nextState = !biometricEnabled;
    setBiometricEnabled(nextState);
    localStorage.setItem('sealify_biometric', nextState.toString());
    toast.success(nextState ? 'Biometric App Lock Enabled' : 'Biometric Lock Disabled');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <SEO title="System Settings — Sealify" />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <User className="w-12 h-12 text-emerald-400 mb-3" />
          <h2 className="text-xl font-bold text-white">Login Required</h2>
          <p className="text-xs text-slate-400 mt-1">Please log in to manage your account settings and device preferences.</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 font-sans">
      <SEO title="App Control Center & Device Settings — Sealify" />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8 flex-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">App Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">Manage native device permissions, security locks, and PWA installation</p>
        </div>

        {/* PWA Direct Installation Component */}
        <section>
          <PwaInstallButton variant="card" />
        </section>

        {/* Permissions & Security */}
        <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] space-y-6 shadow-xl">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> 
            <span>Device Permissions & Security</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Push Notifications</p>
                  <p className="text-[10px] text-slate-400">Real-time price drop and buyer inquiry alerts</p>
                </div>
              </div>
              <button
                onClick={() => handleRequestNativePermission('notifications')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold rounded-xl text-xs transition-colors border border-slate-700"
              >
                ENABLE
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Camera & File Access</p>
                  <p className="text-[10px] text-slate-400">Required for item photos & verification uploads</p>
                </div>
              </div>
              <button
                onClick={() => handleRequestNativePermission('camera')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold rounded-xl text-xs transition-colors border border-slate-700"
              >
                VERIFY ACCESS
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Biometric App Lock</p>
                  <p className="text-[10px] text-slate-400">Require fingerprint or FaceID on launch</p>
                </div>
              </div>
              <button
                onClick={toggleBiometric}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  biometricEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {biometricEnabled ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
          </div>
        </section>

        {/* WhatsApp & Storefront Links */}
        <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Storefront Distribution Link</h2>
              <p className="text-xs text-slate-400">Share your direct store page on WhatsApp status or social media</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              readOnly
              value={`${window.location.origin}/seller/${user.id}`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-emerald-400 focus:outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/seller/${user.id}`);
                toast.success('Storefront URL copied to clipboard!');
              }}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-xs shadow-lg transition-transform active:scale-95"
            >
              COPY
            </button>
          </div>
        </section>
      </main>

      <MobileNav />
    </div>
  );
};

export default Settings;