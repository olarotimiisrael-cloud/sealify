import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  title: string;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  title,
}) => {
  if (!isOpen || images.length === 0) return null;

  const handlePrev = () => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="space-y-0.5">
          <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">{title}</h3>
          <p className="text-xs text-slate-400 font-mono">
            Photo {currentIndex + 1} of {images.length}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl border border-slate-800 transition-colors"
          title="Close full-screen preview"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Full Image View */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden select-none">
        <img
          src={images[currentIndex]}
          alt={`${title} full view`}
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 p-3 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full border border-slate-700/80 backdrop-blur-md transition-transform active:scale-95"
              title="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-6 p-3 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full border border-slate-700/80 backdrop-blur-md transition-transform active:scale-95"
              title="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto py-2 px-4 no-scrollbar z-10">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onIndexChange(idx)}
              className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                idx === currentIndex ? 'border-emerald-500 scale-105 opacity-100' : 'border-slate-800 opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LightboxModal;