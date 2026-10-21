import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ArrowLeft, MapPin, Clock, Upload, Image, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PostAd() {
  const [step, setStep] = useState<'details' | 'photos' | 'pricing' | 'review' | 'success'>('details');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    price: '',
    images: [] as string[],
    specifications: {} as Record<string, any>,
  });
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, createListing } = useSealify();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/auth/login');
    return null;
  }

  const categories = ['Vehicles', 'Property', 'Electronics', 'Fashion', 'Home & Furniture', 'Services', 'Jobs', 'Beauty & Health', 'Agriculture'];
  const conditions = ['new', 'like_new', 'good', 'fair', 'poor'];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ev.target.result as string] }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (step === 'details' && (!formData.title || !formData.description || !formData.category)) {
      toast.error('Please fill in title, description, and category');
      return;
    }
    setStep((s) => {
      const steps: any = { details: 'photos', photos: 'pricing', pricing: 'review', review: 'success' };
      return steps[s];
    });
  };

  const handlePrev = () => {
    setStep((s) => {
      const steps: any = { photos: 'details', pricing: 'photos', review: 'pricing', success: 'review' };
      return steps[s];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createListing({
        ...formData,
        price: Number(formData.price || 0),
      });
      setStep('success');
      toast.success('Listing created successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const stepProgress = { details: 25, photos: 50, pricing: 75, review: 100 };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-20 md:pb-0 font-sans">
      <SEO title="Post Free Ad — Sealify Nigeria" />
      <Navbar />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Marketplace</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Post Free Ad</h1>
          <p className="text-slate-600 text-xs sm:text-sm">Create a listing to sell your item or service in Ogbomosoland.</p>
        </div>

        {/* Progress */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-8 overflow-hidden">
          <div className={`h-full bg-emerald-600 transition-all duration-300`} style={{ width: `${stepProgress[step]}%` }}></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
          {/* Step: Details */}
          {step === 'details' && (
            <>
              <h2 className="text-xl font-black text-slate-900 mb-6">What are you selling?</h2>
              <form onSubmit={handleNext} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. iPhone 13 Pro 256GB"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="Describe your item in detail..."
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleChange('condition', e.target.value)}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="">Select condition</option>
                    {conditions.map((cond) => (
                      <option key={cond} value={cond}>{cond.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Ogbomoso, Oyo State"
                    required
                  />
                </div>
                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Continue to Photos</span>
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step: Photos */}
          {step === 'photos' && (
            <>
              <h2 className="text-xl font-black text-slate-900 mb-6">Add Photos</h2>
              <p className="text-xs text-slate-500 mb-6">Upload up to 5 clear photos of your item.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl relative group cursor-pointer">
                      {formData.images[i] ? (
                        <>
                          <img src={formData.images[i]} alt="Listing photo" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-[10px] text-slate-500 font-medium">Add Photo {i + 1}</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const newImages = [...formData.images];
                              newImages[i] = ev.target.result as string;
                              setFormData((prev) => ({ ...prev, images: newImages }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={handlePrev}
                    className="text-slate-600 hover:text-emerald-600 text-xs font-bold"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={formData.images.length === 0}
                    className={`text-xs font-bold transition-all ${
                      formData.images.length === 0
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    Continue to Pricing <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step: Pricing */}
          {step === 'pricing' && (
            <>
              <h2 className="text-xl font-black text-slate-900 mb-6">Pricing & Details</h2>
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price (?)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full px-4 py-3 text-xl text-slate-900 font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specifications (optional)</label>
                  <textarea
                    value={JSON.stringify(formData.specifications, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData((prev) => ({ ...prev, specifications: JSON.parse(e.target.value || '{}') }));
                      } catch {
                        // ignore invalid JSON input
                      }
                    }}
                    rows={4}
                    className="w-full px-4 py-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-emerald-500"
                    placeholder='{"brand": "Apple", "storage": "256GB"}'
                  />
                </div>
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="text-slate-600 hover:text-emerald-600 text-xs font-bold"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    Review Listing <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step: Review */}
          {step === 'review' && (
            <>
              <h2 className="text-xl font-black text-slate-900 mb-6">Review Your Listing</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-sm">{formData.title}</h3>
                    <p className="text-xs text-slate-500">{formData.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Category</p>
                    <p className="text-xs font-medium text-slate-900">{formData.category}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Condition</p>
                    <p className="text-xs font-medium text-slate-900">{formData.condition}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Price</p>
                    <p className="text-xs font-bold text-emerald-600">?{Number(formData.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Location</p>
                    <p className="text-xs font-medium text-slate-900">{formData.location}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Photos ({formData.images.length})</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                        <img src={img} alt="Photo" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-6">
                  <button
                    onClick={handlePrev}
                    className="text-slate-600 hover:text-emerald-600 text-xs font-bold"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl text-xs font-black transition-all ${
                      loading
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95'
                    }`}
                  >
                    {loading ? 'Creating...' : <><Plus className="w-3 h-3" /><span>Publish Listing</span></>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Listing Published!</h2>
              <p className="text-slate-600 text-xs mb-6">
                Your ad is now live on Sealify. Buyers can contact you through the app.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to={`/listing/${formData.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  View Listing
                </Link>
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl"
                >
                  Browse Marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
      <Footer />
    </div>
  );
}

