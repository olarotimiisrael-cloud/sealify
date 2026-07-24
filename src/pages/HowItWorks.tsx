import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import TutorialVideo from '../components/TutorialVideo';
import { 
  ShieldCheck, 
  Zap, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight,
  Sparkles,
  Lock,
  Download,
  FileText,
  Users,
  Building2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const FAQS = [
  {
    q: 'How does Sealify protect me from fraudulent sellers?',
    a: 'Sealify mandates National Identity (NIN) or CAC registration for verified badges. Furthermore, we provide mapped safe exchange spots (such as Ogbomoso Police HQ or LAUTECH Gate) and digital sales receipts.'
  },
  {
    q: 'Are there any fees for posting a classified ad?',
    a: 'No! Basic classified postings on Sealify are 100% FREE. You only pay if you choose to boost your advert with Top Ad promotions for 5x extra visibility.'
  },
  {
    q: 'How do I pay the seller safely?',
    a: 'Never send commitment fees or upfront bank deposits. Meet the seller in person at a verified safe spot, inspect the product, and complete the transfer or cash handover directly.'
  },
  {
    q: 'Can I get delivery to my home or campus hostel?',
    a: 'Yes! Use our Local Dispatch Estimator inside product pages to calculate bike rider and doorstep courier rates across Under G, Takie Square, Sabo Market, and Ibadan.'
  }
];

const HowItWorks: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleDownloadPDFGuide = () => {
    const guideContent = `================================================
SEALIFY NIGERIA — OFFICIAL USER STARTER GUIDE
================================================
Node Zone: Ogbomoso District & Oyo State Hub

1. HOW TO POST A FREE CLASSIFIED AD:
   - Click "Post Free Ad" on the top navigation bar.
   - Upload clear photos of your product.
   - Use our AI Assistant to generate high-conversion description copy.
   - Set fair resale price using the NGN Smart Estimator.

2. VERIFICATION & BADGES:
   - Go to "My Ads" -> "Apply for Verified Badge".
   - Upload NIN card or CAC RC document.
   - Admin approval takes 24 hours.

3. SAFE TRADING PROTOCOL:
   - Meet at mapped Safe Spots (Ogbomoso Police HQ, Shopping Malls).
   - Run the Physical Inspection Checklist inside chat.
   - Generate official Digital Sales Invoices.

Contact Support: support@sealify.ng | +234 813 120 8468
================================================`;

    const blob = new Blob([guideContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sealify_User_Starter_Guide_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('📄 Official Sealify User Starter Guide downloaded!');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-16 md:pb-0 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <SEO 
        title="How it Works & Platform Tutorial — Sealify Nigeria" 
        description="Learn how to buy, sell, and trade safely on Ogbomoso's most trusted classifieds marketplace. Watch our AI video guide."
      />
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 py-8 sm:py-12 flex-1 space-y-12 sm:space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/5">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Discover the Ecosystem</span>
          </div>
          <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tighter leading-none">
            Trading in Ogbomoso,<br/>
            <span className="text-emerald-500">Perfected by AI.</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Sealify is more than a marketplace. It's a secure node network connecting verified buyers and sellers with forensic-grade security and smart logistics.
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleDownloadPDFGuide}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-extrabold rounded-2xl text-xs border border-emerald-500/30 flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Download Starter PDF Guide</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">100%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Free Classified Ads</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-blue-400">50+</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safe Exchange Spots</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-amber-400">5x</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Buyer Leads</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-purple-400">24/7</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Moderation</p>
          </div>
        </div>

        {/* AI Video Component with African Presenter */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <Zap className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">Visual Intelligence Briefing</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Presenter Amina • African English</p>
               </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-tighter bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
               <span>AUDIO VISUAL ACTIVE</span>
            </div>
          </div>
          
          <TutorialVideo />
        </section>

        {/* Step-by-Step Instructions Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Selling Track */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-2">
               <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30 mb-4">
                  <Camera className="w-7 h-7" />
               </div>
               <h3 className="text-2xl font-black text-white">1. Selling on Sealify</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Convert inventory into liquidity</p>
            </div>

            <div className="space-y-6 relative z-10">
               {[
                 { title: 'Capture & List Free', desc: 'Upload clear photos and use our AI Assistant to generate high-conversion descriptions instantly.' },
                 { title: 'Identity Verification', desc: 'Submit your NIN or Business RC to get the Verified Badge, increasing buyer trust by 500%.' },
                 { title: 'Smart Promotion', desc: 'Enable "Top Ad Boost" to pin your listing at the top of category feeds across Ogbomosoland.' }
               ].map((step, i) => (
                 <div key={i} className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-emerald-500 shrink-0 mt-0.5 group-hover:border-emerald-500/50 transition-colors">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                       <h4 className="font-bold text-sm text-white">{step.title}</h4>
                       <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <Link to="/post-ad" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 text-xs">
               <span>Start Selling Now</span>
               <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Buying Track */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 space-y-2">
               <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/30 mb-4">
                  <ShoppingBag className="w-7 h-7" />
               </div>
               <h3 className="text-2xl font-black text-white">2. Buying with Confidence</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Locate, inspect, and acquire items</p>
            </div>

            <div className="space-y-6 relative z-10">
               {[
                 { title: 'Discovery & Filtering', desc: 'Use Magic Search (Cmd+K) to find exactly what you need in specific neighborhoods like Under G or Takie.' },
                 { title: 'Secure Negotiation', desc: 'Chat directly with sellers through our encrypted messaging. Propose prices and schedule meetups.' },
                 { title: 'Safe Zone Inspection', desc: 'Meet in one of our 50+ Verified Safe Exchange Spots (Police HQs, Libraries) for item testing.' }
               ].map((step, i) => (
                 <div key={i} className="flex gap-4 items-start group">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-blue-400 shrink-0 mt-0.5 group-hover:border-blue-400/50 transition-colors">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                       <h4 className="font-bold text-sm text-white">{step.title}</h4>
                       <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <Link to="/" className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-blue-400 border border-blue-500/30 font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 text-xs">
               <span>Explore Marketplace</span>
               <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </section>

        {/* Interactive FAQ Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-10 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Frequently Asked Onboarding Questions</h2>
              <p className="text-xs text-slate-400">Everything you need to know about trading safely on Sealify</p>
            </div>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div key={index} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-colors">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 text-left font-bold text-sm text-white flex justify-between items-center gap-4 hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-500'}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-900 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Trust & Safety Banner */}
        <section className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-[2.5rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
             <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-950 border-4 border-emerald-500/50 rounded-full flex items-center justify-center shadow-2xl shrink-0">
                <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
             </div>
             
             <div className="space-y-6 text-center md:text-left flex-1">
                <div className="space-y-2">
                   <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Forensic Trust Protocol</h3>
                   <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">Every transaction on Sealify is protected by our triple-layer security framework: ID Verification, Safe Meetup Mapping, and Formal Trade Arbitration.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                   <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4 shrink-0" /> 100% ID Verified
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-emerald-500/20">
                      <MapPin className="w-4 h-4 shrink-0" /> Safe Meetup Zones
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Secure Handover
                   </div>
                </div>
             </div>
          </div>
        </section>

      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default HowItWorks;