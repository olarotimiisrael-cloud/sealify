import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Video, FileVideo, Crown, Sparkles, MapPin, AlertTriangle, Navigation, Calculator, Wand2, Image as ImageIcon, Check, Shield
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

const LOCAL_NEIGHBORHOODS = [
  'Under G Area, Ogbomoso',
  'LAUTECH Main Gate, Ogbomoso',
  'Takie Square, Ogbomoso',
  'Sabo Market, Ogbomoso',
  'Aroje, Ogbomoso',
  'Adenike Area, Ogbomoso',
  'Akala Way, Ogbomoso',
  'Ibadan, Oyo State',
];

const DEMO_PRESET_IMAGES = [
  { label: 'Smartphone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop' },
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop' },
  { label: 'Vehicle', url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop' },
  { label: 'Apartment', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop' },
  { label: 'Fashion', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop' },
  { label: 'Service / Business', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop' },
];

const PostAd: React.FC = () => {
  const { createListing, isAuthenticated, user, isAdmin } = useSealify();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Electronics');
  const [condition, setCondition] = useState<Condition>('Like New');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState(user?.location || 'Under G Area, Ogbomoso');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [featuredBoost, setFeaturedBoost] = useState(isAdmin ? true : false);
  const [customSellerName, setCustomSellerName] = useState(user?.fullName || '');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Account Required: Please sign up or log in to post an ad on Sealify.');
      setIsAuthOpen(true);
    }
  }, [isAuthenticated]);

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetectingLocation(false);
          setLocation('Ogbomoso Central, Oyo State');
          toast.success('Location set to Ogbomoso Central Area via GPS!');
        },
        () => {
          setIsDetectingLocation(false);
          setLocation('Takie Square, Ogbomoso');
          toast.info('Defaulted to Takie Square, Ogbomoso');
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetectingLocation(false);
      setLocation('Takie Square, Ogbomoso');
      toast.info('Set to Takie Square, Ogbomoso');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    toast.success('Photo added');
  };

  const handleAddPresetImage = (url: string) => {
    if (images.includes(url)) {
      toast.info('This sample photo is already attached');
      return;
    }
    setImages((prev) => [...prev, url]);
    toast.success('Sample photo attached!');
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Video size must be less than 20MB');
        return;
      }
      setVideoUrl(URL.createObjectURL(file));
      toast.success('Short video attached successfully!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('You must own an account to post an ad.');
      setIsAuthOpen(true);
      return;
    }

    if (user?.status && user.status !== 'active') {
       toast.error('Account Restricted: You cannot post new advertisements while your account is restricted.');
       return;
    }

    if (!title.trim() || !price || !description.trim() || !location.trim()) {
      toast.error('Compulsory fields missing: Title, Price, Description, and Location are required');
      return;
    }

    if (images.length === 0) {
      toast.error('At least one product photo is required');
      return;
    }

    createListing({
      title,
      category,
      condition,
      price: Number(price),
      location,
      description,
      images,
      videoUrl: videoUrl || undefined,
      featured: featuredBoost,
      sellerName: isAdmin && customSellerName ? customSellerName : user?.fullName,
    });

    toast.success(
      isAdmin 
        ? '🎉 Official Admin Advert published 100% free with Top Ad boost enabled!' 
        : featuredBoost ? '🎉 Ad posted with Top Ad Boost enabled!' : '🎉 Classified Ad published successfully!'
    );
    navigate('/my-ads');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 font-sans">
      <SEO title="Post Free Classified Ad — Sealify" description="List your items, vehicles, electronics, or services for free in Ogbomosoland and across Nigeria." />
      <Navbar />

      <main className="max-w-3xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        {user?.status && user.status !== 'active' && (
           <div className="bg-rose-500/10 border-2 border-rose-500/30 p-6 rounded-[2.5rem] flex flex-col items-center text-center gap-4 animate-pulse">
              <AlertTriangle className="w-12 h-12 text-rose-500" />
              <div>
                <h2 className="text-xl font-black text-white">Posting Privileges Revoked</h2>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">Your account has been restricted by administrators. New postings are disabled until further notice.</p>
              </div>
              <Link to="/my-ads" className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg">View Restriction Reason</Link>
           </div>
        )}

        {(!user?.status || user.status === 'active') && (
           <>
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3.5 py-1 rounded-full mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Ogbomosoland & Oyo State Marketplace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Post a New Classified Ad</h1>
                <p className="text-xs text-slate-400">Items with clear photos and video sell <strong className="text-emerald-400">3x faster</strong></p>
              </div>

              {/* Admin Special Mode Banner */}
              {isAdmin && (
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-purple-950 border-2 border-emerald-500/50 p-5 rounded-3xl space-y-3 shadow-2xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Admin Official Listing Mode</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    As a Sealify Administrator, you can post unlimited <strong>100% FREE official adverts</strong> for vendor services, local store offerings, or partner products with complimentary Top Ad promotion.
                  </p>
                  <div className="pt-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Display Merchant / Brand Name Override (Optional)</label>
                    <input
                      type="text"
                      value={customSellerName}
                      onChange={(e) => setCustomSellerName(e.target.value)}
                      placeholder="e.g. LAUTECH Shuttle Services or Ogbomoso Auto Hub"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 space-y-6 shadow-2xl">
                
                {/* Photo Uploader */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      <span>Product / Service Photos * ({images.length} added)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                        <img src={img} alt="Product upload" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-slate-950/80 text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 flex flex-col items-center justify-center text-emerald-400 transition-all cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[9px] font-bold mt-1">Upload</span>
                    </button>
                  </div>

                  {/* Sample presets for quick testing */}
                  {images.length === 0 && (
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Sample Stock Photos:</p>
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                        {DEMO_PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleAddPresetImage(preset.url)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-lg text-[10px] font-bold border border-slate-800 shrink-0 transition-colors"
                          >
                            + {preset.label} Photo
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Attachment */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Video className="w-4 h-4 text-purple-400" />
                        <span>Product / Service Video (Optional)</span>
                      </label>
                    </div>

                    {videoUrl ? (
                      <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-purple-500/30">
                        <video src={videoUrl} className="w-full h-full object-cover" controls />
                        <button
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="absolute top-3 right-3 p-2 bg-slate-900/90 text-red-400 rounded-xl"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input type="file" ref={videoInputRef} onChange={handleVideoUpload} accept="video/*" className="hidden" />
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full py-4 rounded-2xl border-2 border-dashed border-purple-500/20 hover:border-purple-500/50 bg-purple-500/5 flex flex-col items-center justify-center gap-2 text-purple-400 transition-all group"
                        >
                          <FileVideo className="w-6 h-6" />
                          <p className="text-xs font-bold">Attach Short Video Demonstration</p>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Listing Details */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Listing Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Professional Laptop Repair & Servicing or Toyota Camry 2018"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
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
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
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
                        <button
                          type="button"
                          onClick={() => setIsValuationOpen(true)}
                          className="text-[10px] text-emerald-400 font-bold"
                        >
                          <Calculator className="w-3.5 h-3.5 inline mr-1" />
                          Estimate Worth
                        </button>
                      </div>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 4500000"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-extrabold"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Store / Location *</label>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={isDetectingLocation}
                          className="text-[10px] text-emerald-400 font-bold"
                        >
                          <Navigation className={`w-3 h-3 inline mr-1 ${isDetectingLocation ? 'animate-spin-slow' : ''}`} />
                          Detect GPS
                        </button>
                      </div>
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

                  {/* Neighborhood Location Chips */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Ogbomoso Areas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {LOCAL_NEIGHBORHOODS.map((nh) => (
                        <button
                          key={nh}
                          type="button"
                          onClick={() => setLocation(nh)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            location === nh
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {nh.split(',')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Description *</label>
                      <button
                        type="button"
                        onClick={() => setIsAiAssistantOpen(true)}
                        className="px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-lg border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 hover:bg-purple-500/20 transition-colors"
                      >
                        <Wand2 className="w-3 h-3 text-amber-300" />
                        <span>AI Assistant</span>
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide technical specs, condition details, service guarantees..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <div>
                      <h4 className="font-extrabold text-xs text-white">Enable Top Ad Boost</h4>
                      <p className="text-[11px] text-slate-400">Pin listing at the top of category feeds for 5x visibility</p>
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
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-base shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <ShieldCheck className="w-6 h-6" />
                  <span>{isAdmin ? 'Publish Official Free Advert' : 'Publish Classified Ad'}</span>
                </button>
              </form>
           </>
        )}
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialTab="signup" />
      <ValuationCalculatorModal
        isOpen={isValuationOpen}
        onClose={() => setIsValuationOpen(false)}
        onApplyPrice={(suggested) => setPrice(suggested.toString())}
      />
      <AiAdAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        title={title}
        category={category}
        condition={condition}
        price={price}
        location={location}
        onApplyDescription={(genText) => setDescription(genText)}
      />
      <MobileNav />
    </div>
  );
};

export default PostAd;