import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import MobileNav from '../components/MobileNav';
import { Category, Condition } from '../types/sealify';
import { X, Plus, ShieldCheck, Image as ImageIcon, Upload, Flame, Sparkles } from 'lucide-react';
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

const SAMPLE_UPLOADS = [
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
];

const PostAd: React.FC = () => {
  const { createListing, isAuthenticated } = useSealify();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(!isAuthenticated);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Electronics');
  const [condition, setCondition] = useState<Condition>('Like New');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Ogbomoso, Oyo State');
  const [description, setDescription] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [featuredBoost, setFeaturedBoost] = useState(false);
  const [images, setImages] = useState<string[]>([SAMPLE_UPLOADS[0]]);

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

    toast.success(`${files.length} photo(s) added successfully!`);
  };

  const handleAddSampleImage = () => {
    const nextImage = SAMPLE_UPLOADS[images.length % SAMPLE_UPLOADS.length];
    setImages((prev) => [...prev, nextImage]);
    toast.info('Sample image attached');
  };

  const handleAddCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
    toast.success('Custom image URL attached!');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    if (!title || !price || !description) {
      toast.error('Please complete all required fields');
      return;
    }

    createListing({
      title,
      category,
      condition,
      price: Number(price),
      location,
      description,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'],
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar />

      <main className="max-w-3xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black text-white">Post a New Classified Ad</h1>
          <p className="text-xs text-slate-400">Reach thousands of active buyers in Ogbomoso & across Nigeria</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Photo Upload Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Product Photos ({images.length})</label>
              <span className="text-[10px] text-slate-500">First photo will be main card cover</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700 group">
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-slate-950/80 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-emerald-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded">
                      COVER
                    </span>
                  )}
                </div>
              ))}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 flex flex-col items-center justify-center p-3 text-center gap-1 text-emerald-400 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span className="text-[10px] font-extrabold">Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={handleAddSampleImage}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-700 hover:border-slate-500 bg-slate-950/50 flex flex-col items-center justify-center p-3 text-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-bold">Add Sample</span>
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <div className="relative flex-1">
                <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Or paste web image link (https://...)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomUrl}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-xs border border-slate-700 shrink-0"
              >
                Attach
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ad Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Toyota Camry 2020 XSE or iPhone 15 Pro Max"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Price (₦ NGN) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Ogbomoso, Oyo State"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Detailed Description *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item key features, reason for selling, inclusions, warranty status, etc."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Optional TOP AD Promotion Boost Toggle */}
          <div
            onClick={() => setFeaturedBoost(!featuredBoost)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              featuredBoost
                ? 'border-amber-500 bg-amber-500/10 text-white ring-2 ring-amber-500/30'
                : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>Promote as TOP AD Highlight</span>
                  <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                    5x Boost
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">Place at top of homepage & search query results</p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={featuredBoost}
              onChange={(e) => setFeaturedBoost(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-base shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Publish Classified Ad</span>
          </button>
        </form>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <MobileNav />
    </div>
  );
};

export default PostAd;