import React from 'react';
import { X } from 'lucide-react';
import { ReviewForm } from './ReviewComponents';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  onAddReview: (rating: number, comment: string) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  sellerName,
  onAddReview,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <ReviewForm
          isOpen={true}
          onClose={onClose}
          onSubmit={onAddReview}
          sellerName={sellerName}
        />
      </div>
    </div>
  );
};

export default ReviewModal;