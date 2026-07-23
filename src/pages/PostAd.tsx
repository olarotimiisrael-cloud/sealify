import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import ValuationCalculatorModal from '../components/ValuationCalculatorModal';
import { Category, Condition } from '../types/sealify';
import { 
  X, Plus, ShieldCheck, Image as ImageIcon, Upload, Flame, 
  Video, FileVideo, Crown, Sparkles, MapPin, Check, Info, Lock, AlertTriangle, Navigation, Calculator
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

const LOCAL_LOCATIONS = [
  'Under G Area, Ogbomoso',
  'LAUTECH Main Gate, Ogbomoso',
  'Takie Square, Ogbomoso',
  'Sabo Market, Ogbomoso',
  'Aroje, Ogbomoso',
  'Akala Way, Ogbomoso',
  'General Area, Ogbomoso',
  'Ibadan, Oyo State',
  'Ilorin Road, Oyo State',
];

const PostAd: React.FC = () => {
  const { createListing, isAuthenticated, user } = useSealify();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isValuationOpen, setIsValuationOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Electronics');
  const [condition, setCondition] = useState<Condition>('Like New');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState(user?.location || 'Under G Area, Ogbomoso');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [featuredBoost, setFeaturedBoost] = useState(false);
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
        (position) => {
          setIsDetectingLocation(false);
          setLocation('Ogbomoso Central, Oyo State');
          toast.success('Location set to Ogbomoso Central Area via GPS!');
        },
        (error) => {
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
       toast.error('Account Restricted: You cannot post new advertisements while your account is restricted. Please check your dashboard for details.');
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
    });

    toast.success(featuredBoost ? '🎉 Ad posted with Top Ad Boost enabled!' : '🎉 Classified Ad published successfully!');
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

        {!isAuthenticated && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-200 gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <span>You must own a Sealify account to post advertisements and list items for sale.</span>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-400 transition-colors shrink-0"
            >
              Sign Up Now
            </button>
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

              <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 space-y-6 shadow-2xl">
                {/* Photos Upload Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <span>Product Photos *</span>
                      <span className="text-emerald-400 text-[10px] lowercase font-normal">(1st photo is cover)</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Up to 10 photos</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                        <img src={img} alt="Product upload" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-emerald-500 text-slate-950 text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                            COVER
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-slate-950/80 text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 flex flex-col items-center justify-center text-emerald-400 transition-all hover:bg-emerald-500/10"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-[9px] font-bold mt-1">Add Photo</span>
                    </button>
                  </div>

                  {/* Video Attachment Section */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Video className="w-4 h-4 text-purple-400" />
                        <span>Product Video (Optional)</span>
                      </label>
                      <span className="text-[9px] text-slate-500 px-2 py-0.5 bg-slate-800 rounded">Max 20MB</span>
                    </div>

                    {videoUrl ? (
                      <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-purple-500/30">
                        <video src={videoUrl} className="w-full h-full object-cover" controls />
                        <button
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="absolute top-3 right-3 p-2 bg-slate-900/90 text-red-400 rounded-xl shadow-lg border border-slate-700 hover:bg-slate-900"
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
                          className="w-full py-4 rounded-2xl border-2 border-dashed border-purple-500/20 hover:border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-2 text-purple-400 transition-all group"
                        >
                          <div className="p-2 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">
                            <FileVideo className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold">Attach Short Walk-around Video</p>
                            <p className="text-[10px] text-slate-500 font-medium">Show details from every angle to build buyer trust</p>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Listing Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Clean Toyota Camry 2018 XSE"
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
                        <button
                          type="button"
                          onClick={() => setIsValuationOpen(true)}
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>Estimate Worth</span>
                        </button>
                      </div>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 4500000"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Store / Location *</label>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={isDetectingLocation}
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <Navigation className="w-3 h-3 animate-spin-slow" />
                          <span>{isDetectingLocation ? 'Detecting...' : 'Detect GPS'}</span>
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

                  {/* Location quick chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Select Area:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {LOCAL_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocation(loc)}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                            location === loc
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Description *</label>
                    <textarea
                      rows={5}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide technical specs, reason for selling, contact window, or warranty details..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Top Ad Boost Toggle Option */}
                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40 shrink-0">
                      <Crown className="w-5 h-5 fill-amber-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs text-white">Enable Top Ad Boost</h4>
                        <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">5x Boost</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Pin your listing at the top of category feeds for maximum views</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFeaturedBoost(!featuredBoost)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                      featuredBoost ? 'bg-amber-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-slate-950 transition-transform shadow ${
                        featuredBoost ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-base shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-6 h-6" />
                  <span>Publish Professional Ad</span>
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
      <MobileNav />
    </div>
  );
};

export default PostAd;