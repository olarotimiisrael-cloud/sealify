import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import ValuationCalculatorModal from '../components/ValuationCalculatorModal';
import AiAdAssistantModal from '../components/AiAdAssistantModal';
import { Category, Condition } from '../types/sealify';
import { 
  X, Plus, ShieldCheck, Upload, 
  Video, FileVideo, Crown, MapPin, Calculator, Wand2, Image as ImageIcon, Shield, Loader2, Sliders, Check, ChevronRight, ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES: Category[] = [
  'Vehicles',
  'Electronics',
  'Real Estate',
  'Fashion',
  'Home & Furniture',
  'Services',
  'Jobs',
  'Beauty & Health',
  'Utility & Energy',
];

const CONDITIONS: Condition[] = [
  'Brand New',
  'Like New',
  'Used - Good',
  'Used - Fair',
];

const CATEGORY_KEYWORDS: Record<string, Category> = {
  'iphone': 'Electronics',
  'samsung': 'Electronics',
  'laptop': 'Electronics',
  'macbook': 'Electronics',
  'car': 'Vehicles',
  'toyota': 'Vehicles',
  'bike': 'Vehicles',
  'motor': 'Vehicles',
  'house': 'Real Estate',
  'hostel': 'Real Estate',
  'apartment': 'Real Estate',
  'land': 'Real Estate',
  'dress': 'Fashion',
  'shoes': 'Fashion',
  'shirt': 'Fashion',
  'chair': 'Home & Furniture',
  'table': 'Home & Furniture',
  'bed': 'Home & Furniture',
  'solar': 'Utility & Energy',
  'generator': 'Utility & Energy',
  'battery': 'Utility & Energy',
};

const PostAd: React.FC = () => {
  const { createListing, isAuthenticated, user, isAdmin } = useSealify();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Electronics');
  const [condition, setCondition] = useState<Condition>('Like New');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState(user?.location || 'Under G Area, Ogbomoso');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [featuredBoost, setFeaturedBoost] = useState(isAdmin ? true : false);
  const [specs, setSpecs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
    }
  }, [isAuthenticated]);

  // AI Category Suggestion logic
  useEffect(() => {
    if (title.length > 3) {
      const words = title.toLowerCase().split(' ');
      for (const word of words) {
        if (CATEGORY_KEYWORDS[word]) {
          setCategory(CATEGORY_KEYWORDS[word]);
          break;
        }
      }
    }
  }, [title]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    const fileList = Array.from(selectedFiles);
    setRawFiles((prev) => [...prev, ...fileList]);
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setImages((prev) => [...prev, event.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
    toast.success('Photos added to queue');
  };

  const handleNext = () => {
    if (step === 1 && (!title.trim() || images.length === 0)) {
      toast.error('Please provide a title and at least one photo');
      return;
    }
    if (step === 2 && !price) {
      toast.error('Please enter a valid asking price');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    setIsSubmitting(true);
    const success = await createListing({
      title, category, condition, price: Number(price), location, description, images, featured: featuredBoost, specifications: specs
    }, rawFiles);
    setIsSubmitting(false);
    if (success) navigate('/my-ads');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col pb-20 font-sans">
      <SEO title="Create New Ad — Sealify Nigeria" />
      <Navbar />

      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-8 flex-1">
        {/* Form Progress Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${step >= s ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${step >= s ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {s === 1 ? 'Details' : s === 2 ? 'Pricing' : 'Confirm'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">1. Product Media & Title</label>
                
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 p-1 bg-slate-950/80 text-rose-400 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 flex flex-col items-center justify-center text-emerald-400 transition-all">
                    <Plus className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase mt-1">Add Photo</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ad Title (e.g. Clean 2012 Toyota Corolla)"
                    className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:outline-none transition-all placeholder:text-slate-700"
                  />
                  <p className="text-[9px] text-slate-500 font-bold ml-1 flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-500" /> AI will suggest category based on your title</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">2. Classification</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:border-emerald-500 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:border-emerald-500 outline-none">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button type="button" onClick={handleNext} className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 text-xs uppercase tracking-widest">
                <span>Continue to Pricing</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">3. Asking Price (₦)</label>
                     <button type="button" onClick={() => setIsValuationOpen(true)} className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">VALUATION TOOL</button>
                  </div>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter amount in NGN"
                    className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-2xl px-5 py-4 text-2xl font-black text-emerald-400 focus:outline-none transition-all"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">4. Exchange Location</label>
                  <div className="relative">
                     <MapPin className="w-5 h-5 text-emerald-500 absolute left-4 top-4" />
                     <input
                       type="text"
                       required
                       value={location}
                       onChange={(e) => setLocation(e.target.value)}
                       className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white focus:outline-none transition-all"
                     />
                  </div>
               </div>

               <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="p-4 bg-slate-800 text-white rounded-2xl transition-all active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
                  <button type="button" onClick={handleNext} className="flex-1 py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-transform active:scale-95">
                    <span>Continue to Description</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">5. Final Description</label>
                     <button type="button" onClick={() => setIsAiOpen(true)} className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20 flex items-center gap-1"><Wand2 className="w-3 h-3" /> AI GENERATE</button>
                  </div>
                  <textarea
                    rows={6}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe condition, faults, or why you are selling..."
                    className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-3xl p-5 text-sm font-medium text-white focus:outline-none transition-all leading-relaxed"
                  />
               </div>

               <div className="p-4 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />
                    <div>
                      <p className="text-[11px] font-black text-white uppercase">TOP AD Highlighting</p>
                      <p className="text-[9px] text-slate-400 font-bold">Recommended for faster local pickup</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setFeaturedBoost(!featuredBoost)} className={`w-12 h-6 rounded-full transition-all relative p-0.5 ${featuredBoost ? 'bg-amber-500' : 'bg-slate-800'}`}><div className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${featuredBoost ? 'translate-x-6' : 'translate-x-0'}`}></div></button>
               </div>

               <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="p-4 bg-slate-800 text-white rounded-2xl transition-all active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-emerald-500 disabled:bg-slate-800 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-transform active:scale-95">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    <span>{isSubmitting ? 'Publishing...' : 'Publish Verified Ad'}</span>
                  </button>
               </div>
            </div>
          )}
        </form>

        <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-start gap-4">
           <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><ShieldCheck className="w-5 h-5" /></div>
           <div className="space-y-1">
              <p className="text-xs font-black text-white uppercase tracking-widest">Sealify Safety Protocol</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                 All ads are manually reviewed by the Ogbomoso Node team. Ensure your photos are original. Using stock photos may lead to ad restriction.
              </p>
           </div>
        </div>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialTab="signup" />
      <ValuationCalculatorModal isOpen={isValuationOpen} onClose={() => setIsValuationOpen(false)} onApplyPrice={(s) => setPrice(s.toString())} />
      <AiAdAssistantModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} title={title} category={category} condition={condition} price={price} location={location} onApplyDescription={setDescription} />
      <MobileNav />
    </div>
  );
};

export default PostAd;