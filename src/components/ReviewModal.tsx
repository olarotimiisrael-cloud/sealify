import React, { useState } from 'react';
import { X, Star, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  onAddReview: (rating: number, comment: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  sellerName,
  onAddReview,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a brief comment about your experience');
      return;
    }
    onAddReview(rating, comment);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative text-slate-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-inner">
              <Star className="w-8 h-8 fill-emerald-400/20" />
            </div>
            <h3 className="font-black text-xl text-white tracking-tight">Rate Your Experience</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Trading with <strong className="text-emerald-400">{sellerName}</strong>
            </p>
          </div>

          <div className="flex justify-center items-center gap-3 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-125 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                      : 'text-slate-800 fill-slate-800'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Describe the transaction</label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Item was exactly as described, smooth meetup at safe zone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-tight">
              Your feedback helps keep the Ogbomoso community safe and trustworthy. All reviews are monitored for policy compliance.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <Send className="w-4 h-4" />
            <span>Publish Review</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;