import React from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Info, 
  BookOpen, 
  Phone, 
  Clock, 
  Sparkles, 
  CheckCircle2,
  MessageCircle,
  Radio,
  ExternalLink,
  Users
} from 'lucide-react';

const HelpCenter: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO 
        title="Knowledge Base & Support — Sealify Nigeria"
        description="Learn how to post classified ads, verify vendor status, and join our official WhatsApp community for real-time support."
      />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3.5 py-1 rounded-full">
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

        {/* Community Support & Channels Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-black text-white">Community & Real-time Support</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp Channel */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 w-fit">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Official Broadcast Channel</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Stay updated with the latest platform releases, feature announcements, security notices, and product updates directly on WhatsApp.
                  </p>
                </div>
              </div>
              <a 
                href="https://whatsapp.com/channel/0029VaqFIYEC6ZvlrPCLql1R" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 w-full py-3 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-emerald-500/30"
              >
                <span>Follow Channel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* WhatsApp Group */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20 w-fit">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Discussion & Support Group</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Community discussion and support group for Sealify users. Connect with peers, share feedback, report issues, and collaborate.
                  </p>
                </div>
              </div>
              <a 
                href="https://chat.whatsapp.com/F0iRCn1r1z2JQuKLoRhmw4?s=cl&p=a&ilr=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>Join Community Group</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Verified Sealify Official Support Network • Ogbomosoland
          </p>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default HelpCenter;