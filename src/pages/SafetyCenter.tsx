import React from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import { ShieldCheck, MapPin, AlertTriangle, CheckCircle, Smartphone, Lock, Eye, Users } from 'lucide-react';

const SafetyCenter: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <SEO 
        title="Trust & Safety Center — Sealify Nigeria" 
        description="Learn about verified safe exchange spots, fraud prevention guidelines, and transaction security rules on Sealify." 
      />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
            <ShieldCheck className="w-5 h-5" />
            <span>Sealify Trust & Safety Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Your Security is Our Priority</h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Follow these essential guidelines to ensure every transaction in the Sealify marketplace is 100% secure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit border border-blue-500/20">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Safe Exchange Zones</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Always use our <strong>Verified Safe Meetup Spots</strong>. We've mapped police stations and CCTV-monitored malls in Ogbomoso and beyond specifically for item handovers.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl w-fit border border-amber-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Payment Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never pay upfront. We strictly advise against advance deposits or wire transfers before physical inspection. Pay only after you've "sealed" the deal in person.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-black flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Spotting Common Scams
            </h2>

            <div className="space-y-3">
              {[
                { title: 'The "Out of Town" Seller', desc: 'Sellers claiming they are currently away and asking for "commitment fees" or shipping costs upfront.' },
                { title: 'Fake Payment Alerts', desc: 'Fraudulent SMS or email alerts that look like bank transfers. Always check your actual mobile banking app.' },
                { title: 'Overpayment Scams', desc: 'Buyers "accidentally" sending too much and asking for the difference back before the check clears.' },
                { title: 'Off-Platform Links', desc: 'Users asking you to click external links to "view photos" or "verify identity". Stay on Sealify.' },
              ].map((scam, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl">
                  <div className="text-slate-600 font-black text-xl">0{i+1}</div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">{scam.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{scam.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-emerald-500 p-6 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <p className="font-black text-sm">Help Us Stay Safe</p>
                <p className="text-xs font-bold opacity-80 uppercase tracking-tighter">Report suspicious activity immediately</p>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-slate-950 text-white rounded-xl font-black text-xs shadow-lg hover:scale-105 transition-transform">
              REPORT INCIDENT
            </button>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default SafetyCenter;