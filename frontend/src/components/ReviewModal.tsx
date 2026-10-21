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
    <div className="fixed inset-0 z-50 bg-white/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
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

