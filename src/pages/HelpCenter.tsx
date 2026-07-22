import React from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Info, 
  BookOpen, 
  Phone, 
  Clock, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

const HelpCenter: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3.5 py-1 rounded-full">
              <BookOpen className="w-4 h-4" />
              <span>Support Guide</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Sealify Knowledge Base
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Learn how to buy, sell, and navigate the marketplace safely
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link
              to="/faq"
              className="p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-colors space-y-2 group"
            >
              <Info className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-white">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-400">Quick answers on accounts, postings, and safety rules.</p>
            </Link>

            <Link
              to="/contact"
              className="p-5 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-colors space-y-2 group"
            >
              <Phone className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-sm text-white">Contact Customer Support</h3>
              <p className="text-xs text-slate-400">Reach our 24/7 help desk for account or dispute assistance.</p>
            </Link>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default HelpCenter;