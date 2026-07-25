import React, { useState, useEffect, useRef } from 'react';
import { X, Edit3, Check, Video, FileVideo, Plus, Image as ImageIcon, Upload, CheckCircle2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Listing, Condition } from '../types/sealify';

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  onSave: (id: string, updated: Partial<Listing>) => void;
}

const CONDITIONS: Condition[] = [
  'Brand New',
  'Like New',
  'Used - Good',
  'Used - Fair',
];

export const EditListingModal: React.FC<EditListingModalProps> = ({
  isOpen,
  onClose,
  listing,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState<Condition>('Like New');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setPrice(listing.price.toString());
      setLocation(listing.location);
      setCondition(listing.condition);
      setDescription(listing.description);
      setImages(listing.images || []);
      setVideoUrl(listing.videoUrl || null);
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

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
      toast.success('Video attached');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !price || !location.trim() || !description.trim()) {
      toast.error('Please fill all mandatory fields.');
      return;
    }

    if (images.length === 0) {
      toast.error('At least one photo is required');
      return;
    }

    onSave(listing.id, {
      title,
      price: Number(price) || listing.price,
      location,
      condition,
      description,
      images,
      videoUrl: videoUrl || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
            <Edit3 className="w-5 h-5" />
            <span>Edit Classified Ad</span>
          </div>

          {/* Image Manager */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Manage Ad Photos ({images.length})</span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                  <img src={img} alt="Upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-slate-950/80 text-red-400 rounded-lg hover:bg-slate-900"
                  >
                    <X className="w-3 h-3" />
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
                <span className="text-[9px] font-bold mt-1 uppercase">Add</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ad Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Price (₦ NGN) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-extrabold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Condition)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Description *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Video Manager */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Video className="w-3.5 h-3.5" />
                <span>Update Product Video</span>
              </label>

              {videoUrl ? (
                <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-purple-500/30">
                  <video src={videoUrl} className="w-full h-full object-cover" controls />
                  <button
                    type="button"
                    onClick={() => setVideoUrl(null)}
                    className="absolute top-3 right-3 p-1.5 bg-slate-900/90 text-red-400 rounded-lg"
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
                    className="w-full py-6 rounded-2xl border-2 border-dashed border-purple-500/20 hover:border-purple-500/50 bg-purple-500/5 flex flex-col items-center justify-center gap-2 text-purple-400 transition-all"
                  >
                    <FileVideo className="w-5 h-5" />
                    <p className="text-[10px] font-bold uppercase">Replace Video Attachment</p>
                  </button>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Listing Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditListingModal;