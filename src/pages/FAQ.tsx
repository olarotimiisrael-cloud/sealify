import React from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import { 
  ShieldCheck, 
  Info, 
  BookOpen, 
  Phone, 
  Mail, 
  Sparkles, 
  CheckCircle2,
  Radio,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

const FAQ: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO 
        title="Frequently Asked Questions — Sealify Nigeria"
        description="Find answers to common questions about posting ads, safe meetup zones, and joining our official WhatsApp broadcast channel."
      />
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
                  <p className="font-bold text-white mb-1">How do I stay updated with news and security alerts?</p>
                  <div className="text-slate-400 leading-relaxed space-y-2">
                    <p>You can join our official WhatsApp Broadcast Channel to receive real-time news on features, security notices, and marketplace updates.</p>
                    <a 
                      href="https://whatsapp.com/channel/0029VaqFIYEC6ZvlrPCLql1R" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-400 font-bold hover:underline"
                    >
                      <Radio className="w-3.5 h-3.5" /> Follow Sealify Channel <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
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
                  <p className="font-bold text-white mb-1">Is there a group for discussion and reporting issues?</p>
                  <div className="text-slate-400 leading-relaxed space-y-2">
                    <p>Yes, we have an active Community Support Group where you can share feedback, report issues, and collaborate with other users.</p>
                    <a 
                      href="https://chat.whatsapp.com/F0iRCn1r1z2JQuKLoRhmw4?s=cl&p=a&ilr=1" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-teal-400 font-bold hover:underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Join Support Group <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
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