<dyad-write path="src/components/ImageUploader.tsx" description="Reusable image upload component with drag-drop, preview, and progress")
import React, { useState, useRef, useCallback } from 'react';
import { useAdImageUpload } from '@/hooks/useStorage';
import { Upload, X, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImagesChange: (images: string[]) => void;
  initialImages?: string[];
  maxImages?: number;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesChange,
  initialImages = [],
  maxImages = 10,
  maxSizeMB = 10,
  accept = 'image/jpeg,image/png,image/webp',
  className = '',
  label = 'Upload Images',
  required = false,
}) => {
  const { upload, uploading, progress, error } = useAdImageUpload();
  const [images, setImages] = useState<string[]>(initialImages);
  const [previews, setPreviews] = useState<{ file: File; preview: string; id: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const createPreviews = useCallback((files: File[]) => {
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${Math.random()}`,
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: Not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: Exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    createPreviews(validFiles);
    
    try {
      const results = await upload(validFiles);
      const urls = results.map(r => r.publicUrl);
      const newImages = [...images, ...urls];
      setImages(newImages);
      onImagesChange(newImages);
      setPreviews([]);
      toast.success(`${validFiles.length} image(s) uploaded successfully`);
    } catch (err) {
      // Error handled by upload hook
    }
  }, [images, maxImages, upload, onImagesChange, createPreviews]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const removePreview = useCallback((id: string) => {
    setPreviews(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const totalImages = images.length + previews.length;

  return (
    <div className={`relative ${className}`}>
      <label className="block">
        <div className="flex items-center justify-between mb-2">
          <label className={`text-xs font-bold text-slate-300 uppercase tracking-wider ${required ? 'text-emerald-400' : ''}`}>
            {label} <span className="text-slate-500 font-normal uppercase">({totalImages}/{maxImages})</span>
          </label>
          {uploading && (
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading...
            </div>
          )}
        </label>

        {/* Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl transition-all ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-500/5' 
              : 'border-slate-800 bg-slate-950 hover:border-emerald-500/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading || totalImages >= maxImages}
          />

          <button
            type="button"
            onClick={openFileDialog}
            disabled={uploading || totalImages >= maxImages}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer disabled:opacity-50"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30 mb-3">
              <Upload className="w-6 h-6 mx-auto" />
            </div>
            <p className="text-sm font-bold text-white mb-1">{label}</p>
            <p className="text-xs text-slate-400">
              Drag & drop or click to browse
              <br />
              <span className="font-mono text-[10px]">{maxImages} max • {maxSizeMB}MB each • JPG, PNG, WebP</span>
            </p>
          </button>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-3 space-y-2">
            {Object.entries(progress).map(([index, prog]) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>File {parseInt(index) + 1}</span>
                  <span>{prog}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${prog}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Image Previews Grid */}
        {(images.length > 0 || previews.length > 0) && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {/* Existing images */}
            {images.map((url, index) => (
              <div key={`existing-${index}`} className="relative aspect-square group">
                <img 
                  src={url} 
                  alt={`Image ${index + 1}`} 
                  className="w-full h-full object-cover rounded-xl border border-slate-800"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1.5 bg-slate-950/90 text-rose-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* New previews */}
            {previews.map((preview) => (
              <div key={preview.id} className="relative aspect-square">
                <img 
                  src={preview.preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-xl border border-slate-800 opacity-80"
                />
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                  {progress[previews.indexOf(preview)] !== undefined && (
                    <div className="text-center space-y-1">
                      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
                      <span className="text-xs font-bold text-emerald-400">
                        {progress[previews.indexOf(preview)]}%
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removePreview(preview.id)}
                  className="absolute top-1 right-1 p-1.5 bg-slate-950/90 text-rose-400 hover:text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add more button */}
            {totalImages < maxImages && !uploading && (
              <button
                type="button"
                onClick={openFileDialog}
                className="aspect-square border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 rounded-xl bg-emerald-500/5 flex flex-col items-center justify-center text-emerald-400 transition-all"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[9px] font-bold mt-1 uppercase">Add More</span>
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="mt-2 text-[10px] text-rose-400 flex items-center gap-1">
            <X className="w-3 h-3" />
            {error}
          </p>
        )}
      </label>
    </div>
  );
};

export default ImageUploader;