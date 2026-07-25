import React, { useState, useRef, useEffect } from 'react';
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
  Video, FileVideo, Crown, MapPin, Calculator, Wand2, Image as ImageIcon, Shield, Loader2
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

const DEMO_PRESET_IMAGES = [
  { label: 'Smartphone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop' },
  { label: 'MacBook Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop' },
  { label: 'Toyota Vehicle', url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop' },
  { label: 'Luxury House', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop' },
  { label: 'Fashion Item', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop' },
  { label: 'Home Furniture', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop' },
];

const PostAd: React.FC = () => {
  const { createListing, isAuthenticated, user, isAdmin } = useSealify();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [featuredBoost, setFeaturedBoost] = useState(isAdmin ? true : false);
  const [customSellerName, setCustomSellerName] = useState(user?.fullName || '');

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Account Required: Please sign up or log in to post an ad on Sealify.');
      setIsAuthOpen(true);
    }
  }, [isAuthenticated]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileList = Array.from(selectedFiles);
    setRawFiles((prev) => [...prev, ...fileList]);

    fileList.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    toast.success('Photos added to upload queue');
  };

  const handleAddPresetImage = (url: string) => {
    if (images.includes(url)) {
      toast.info('This sample photo is already attached');
      return;
    }
    setImages((prev) => [...prev, url]);
    toast.success('Sample photo attached!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('You must own an account to post an ad.');
      setIsAuthOpen(true);
      return;
    }

    if (!title.trim() || !price || !description.trim() || !location.trim()) {
      toast.error('Required fields missing: Title, Price, Description, and Location are mandatory');
      return;
    }

    if (images.length === 0) {
      toast.error('At least one product photo is required');
      return;
    }

    setIsSubmitting(true);

    const success = await createListing({
      title: title.trim(),
      category,
      condition,
      price: Number(price),
      location: location.trim(),
      description: description.trim(),
      images,
      videoUrl: videoUrl || undefined,
      featured: featuredBoost,
      sellerName: isAdmin && customSellerName ? customSellerName : user?.fullName,
    }, rawFiles);

    setIsSubmitting(false);

    if (success) {
      toast.success('🎉 Classified Ad published successfully!');
      navigate('/my-ads');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO title="Post Free Classified Ad — Sealify" description="List your items, vehicles, electronics, or services for free in Ogbomosoland and across Nigeria." />
      <Navbar />

      <main className="max-w-3xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3.5 py-1 rounded-full mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Ogbomosoland & Oyo State Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Post a New Classified Ad</h1>
          <p className="text-xs text-slate-400">Items with clear photos sell <strong className="text-emerald-400">3x faster</strong></p>
        </div>

        {isAdmin && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-purple-950 border-2 border-emerald-500/50 p-5 rounded-3xl space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin Official Listing Mode</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              As an Administrator, you can post official ads with Top Ad boost enabled.
            </p>
            <div className="pt-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Display Merchant Name Override</label>
              <input
                type="text"
                value={customSellerName}
                onChange={(e) => setCustomSellerName(e.target.value)}
                placeholder="e.g. Ogbomoso Auto Hub"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 space-y-6 shadow-2xl">
          
          {/* Photo Uploader */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Product Photos * ({images.length})</span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImages(images.filter((_, i) => i !== idx));
                      setRawFiles(rawFiles.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-1 right-1 p-1 bg-slate-950/80 text-red-400 rounded-lg hover:bg-slate-900"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 flex flex-col items-center justify-center text-emerald-400 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">Upload</span>
              </button>
            </div>

            {images.length === 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {DEMO_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAddPresetImage(preset.url)}
                    className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-bold border border-slate-700 shrink-0 hover:text-white"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ad Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max 256GB"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Condition)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Price (₦ NGN) *</label>
                  <button type="button" onClick={() => setIsValuationOpen(true)} className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 hover:underline">
                    <Calculator className="w-3 h-3" /> Valuation
                  </button>
                </div>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Under G Area, Ogbomoso"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Description *</label>
                <button type="button" onClick={() => setIsAiOpen(true)} className="text-[10px] text-purple-400 font-bold flex items-center gap-1 hover:underline">
                  <Wand2 className="w-3 h-3" /> AI Assistant
                </button>
              </div>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product details..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div>
                <h4 className="font-extrabold text-xs text-white uppercase">Enable Top Ad Boost</h4>
                <p className="text-[10px] text-slate-400">Increase visibility by 5x in category feeds</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFeaturedBoost(!featuredBoost)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                featuredBoost ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                  featuredBoost ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black rounded-2xl text-base shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Publishing to Marketplace...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-6 h-6" />
                <span>{isAdmin ? 'Publish Official Free Advert' : 'Publish Classified Ad'}</span>
              </>
            )}
          </button>
        </form>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialTab="signup" />
      
      <ValuationCalculatorModal
        isOpen={isValuationOpen}
        onClose={() => setIsValuationOpen(false)}
        onApplyPrice={(suggested) => setPrice(suggested.toString())}
      />

      <AiAdAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        title={title}
        category={category}
        condition={condition}
        price={price}
        location={location}
        onApplyDescription={setDescription}
      />

      <MobileNav />
    </div>
  );
};

export default PostAd;