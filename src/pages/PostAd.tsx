import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { CATEGORIES } from '@/data/mockData';
import { Upload, X, Plus, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function PostAd() {
  const navigate = useNavigate();
  const { addListing, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [condition, setCondition] = useState<'Brand New' | 'Like New' | 'Refurbished' | 'Used - Good' | 'Used - Fair'>('Brand New');
  const [location, setLocation] = useState(currentUser?.location || 'Ikeja, Lagos');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
  ]);

  const handleAddSampleImage = () => {
    const samples = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    ];
    const random = samples[Math.floor(Math.random() * samples.length)];
    setImages((prev) => [...prev, random]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    addListing({
      title,
      description,
      price: Number(price),
      category,
      condition,
      location,
      images,
      is_featured: false,
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Post a Free Ad</h1>
            <p className="text-xs text-slate-500">Reach thousands of buyers on Sealify today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Area */}
            <div>
              <Label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Product Images
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddSampleImage}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center p-3 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold">Add Photo</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <Label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Ad Title *
              </Label>
              <Input
                type="text"
                required
                placeholder="e.g. iPhone 14 Pro 128GB Purple"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category *
                </Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Condition *
                </Label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Like New">Like New</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Used - Good">Used - Good</option>
                  <option value="Used - Fair">Used - Fair</option>
                </select>
              </div>
            </div>

            {/* Price & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Price ($) *
                </Label>
                <Input
                  type="number"
                  required
                  placeholder="250"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Location / City *
                </Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Lekki, Lagos"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Detailed Description *
              </Label>
              <Textarea
                required
                rows={4}
                placeholder="Include details like reason for selling, age, features, accessories included..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-6 font-bold text-base shadow-md">
              Publish Ad Now
            </Button>

          </form>
        </div>

      </main>

      <MobileNav />
    </div>
  );
}