import React from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { 
  ShieldCheck, 
  Info, 
  BookOpen, 
  Phone, 
  Mail, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

const FAQ: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3.5 py-1 rounded-full">
              <Info className="w-4 h-4" />
              <span>Help Center</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Find instant answers to common questions about buying and selling on Sealify
            </p>
          </div>

          <div className="space-y-6 pt-2">
            <div className="space-y-3">
              <h2 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider">General Questions</h2>
              <div className="space-y-2 text-xs">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                  <p className="font-bold text-white mb-1">What is Sealify?</p>
                  <p className="text-slate-400 leading-relaxed">Sealify is a local classifieds marketplace connecting buyers and sellers in Ogbomoso, Oyo State, and across Nigeria.</p>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                  <p className="font-bold text-white mb-1">Is posting an ad free?</p>
                  <p className="text-slate-400 leading-relaxed">Yes! Listing products and browsing classifieds is 100% free for all users.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider">Safety & Transactions</h2>
              <div className="space-y-2 text-xs">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                  <p className="font-bold text-white mb-1">How do safe meetup spots work?</p>
                  <p className="text-slate-400 leading-relaxed">You can choose verified safe exchange zones (such as police stations or CCTV-monitored shopping malls) directly within chat messages.</p>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                  <p className="font-bold text-white mb-1">How do I verify my account?</p>
                  <p className="text-slate-400 leading-relaxed">Go to "My Ads" and click "Get Verified Badge" to submit your government ID or business certificate for approval.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default FAQ;