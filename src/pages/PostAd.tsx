import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import MobileNav from '../components/MobileNav';
import { Category, Condition } from '../types/sealify';
import { X, Plus, ShieldCheck, Image as ImageIcon, Upload, Flame, Video, FileVideo } from 'lucide-react';
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
];

const CONDITIONS: Condition[] = [
  'Brand New',
  'Like New',
  'Used - Good',
  'Used - Fair',
];

const PostAd: React.FC = () => {
  const { createListing, isAuthenticated, user } = useSealify();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(!isAuthenticated);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Electronics');
  const [condition, setCondition] = useState<Condition>('Like New');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState(user?.location || 'Ogbomoso, Oyo State');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [featuredBoost, setFeaturedBoost] = useState(false);

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
      setIsAuthOpen(true);
      return;
    }

    // Strict validation for compulsory fields
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
      featured: featuredBoost
    });

    navigate('/my-ads');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-3xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Post a New Classified Ad</h1>
          <p className="text-xs text-slate-400">Items with clear photos and video sell <strong className="text-emerald-400">3x faster</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 space-y-6 shadow-2xl">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Compulsory Photos *</label>
              <span className="text-[10px] text-slate-500">Add up to 10 photos</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                  <img src={img} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 p-1 bg-slate-950/80 text-red-400 rounded-lg"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 flex flex-col items-center justify-center text-emerald-400 transition-all"><Upload className="w-5 h-5" /><span className="text-[9px] font-bold mt-1">Add Photo</span></button>
            </div>

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
                  <button type="button" onClick={() => setVideoUrl('')} className="absolute top-3 right-3 p-2 bg-slate-900/90 text-red-400 rounded-xl shadow-lg border border-slate-700"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <>
                  <input type="file" ref={videoInputRef} onChange={handleVideoUpload} accept="video/*" className="hidden" />
                  <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full py-4 rounded-2xl border-2 border-dashed border-purple-500/20 hover:border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10 flex flex-col items-center justify-center gap-2 text-purple-400 transition-all group">
                    <div className="p-2 bg-slate-900 rounded-xl group-hover:scale-110 transition-transform"><FileVideo className="w-6 h-6" /></div>
                    <div className="text-center">
                      <p className="text-xs font-bold">Attach Short Walk-around Video</p>
                      <p className="text-[10px] text-slate-500 font-medium">Show details from every angle to build buyer trust</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Listing Title *</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Clean Toyota Camry 2018 XSE" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Condition *</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500">
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Price (₦ NGN) *</label>
                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Store / Seller Location *</label>
                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Under G Area, Ogbomoso" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Full Description *</label>
              <textarea rows={5} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide all technical details, reason for selling, etc." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-base shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            <span>Publish Professional Ad</span>
          </button>
        </form>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default PostAd;