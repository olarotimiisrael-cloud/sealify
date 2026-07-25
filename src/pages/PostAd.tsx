import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import SEO from '../components/SEO';
import { Plus, Camera, Video, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Category, Listing } from '../types/sealify';

const PostAd: React.FC = () => {
  const { createListing, isAuthenticated } = useSealify();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    title: '', category: 'Electronics' as Category, condition: 'Like New', 
    price: '', location: 'Ogbomoso', description: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Login required');
    if (files.length === 0) return toast.error('Add at least one photo');

    setIsSubmitting(true);
    
    // Casting to satisfy the Listing type requirement
    const listingData: Partial<Listing> = {
      title: form.title,
      category: form.category as Category,
      condition: form.condition as any,
      price: Number(form.price),
      location: form.location,
      description: form.description
    };

    const success = await createListing(listingData, files);

    setIsSubmitting(false);
    if (success) {
      toast.success('Listing live on Ogbomoso Node!');
      navigate('/my-ads');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEO title="Post Classified Ad" />
      <Navbar />
      <main className="max-w-2xl mx-auto w-full px-4 py-12 space-y-8">
        <h1 className="text-3xl font-black">Launch a New Advert</h1>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Product Photos</label>
            <div className="grid grid-cols-4 gap-2">
              {previews.map((p, i) => (
                <img key={i} src={p} className="aspect-square object-cover rounded-xl border border-slate-800" />
              ))}
              <label className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                <Plus className="text-slate-600" />
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <input placeholder="Ad Title" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <div className="grid grid-cols-2 gap-2">
               <input type="number" placeholder="Price (NGN)" className="bg-slate-950 border border-slate-800 rounded-xl p-3" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
               <input placeholder="Neighborhood" className="bg-slate-950 border border-slate-800 rounded-xl p-3" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
            </div>
            <textarea placeholder="Full Description" rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            <span>PUBLISH TO MARKETPLACE</span>
          </button>
        </form>
      </main>
      <MobileNav />
    </div>
  );
};

export default PostAd;