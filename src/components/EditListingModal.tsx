import React, { useState, useEffect } from 'react';
import { Listing, Condition } from '../types/sealify';
import { X, Edit3, Check, Video, FileVideo } from 'lucide-react';
import { toast } from 'sonner';

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
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setPrice(listing.price.toString());
      setLocation(listing.location);
      setCondition(listing.condition);
      setDescription(listing.description);
      setVideoUrl(listing.videoUrl || '');
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict compulsory field validation
    if (!title.trim() || !price || !location.trim() || !description.trim()) {
      toast.error('All fields except video are compulsory. Please fill title, price, location and description.');
      return;
    }

    onSave(listing.id, {
      title,
      price: Number(price) || listing.price,
      location,
      condition,
      description,
      videoUrl: videoUrl || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
            <Edit3 className="w-5 h-5" />
            <span>Edit Classified Ad</span>
          </div>

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
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
              className="w-full bg-slate-800 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Description *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800">
            <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Video className="w-3 h-3" />
              <span>Product Video URL (Optional)</span>
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditListingModal;