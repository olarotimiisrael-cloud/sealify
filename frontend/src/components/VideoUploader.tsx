import React, { useCallback, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Video, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAdVideoUpload } from '@/lib/storage';

interface VideoUploaderProps {
  onVideoChange: (video: string | null) => void;
  initialVideo?: string;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoChange,
  initialVideo,
  maxSizeMB = 50,
  accept = 'video/mp4,video/webm,video/quicktime',
}) => {
  const { upload, uploading, progress, error } = useAdVideoUpload();
  const [preview, setPreview] = useState<string | null>(initialVideo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileSelect = useCallback(async (file: File) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only MP4, WebM, and MOV videos allowed');
      return;
    }
    if (file.size > maxSizeBytes) {
      toast.error(`Video must be less than ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      const results = await upload([file]);
      const url = results[0].publicUrl;
      onVideoChange(url);
      setPreview(url);
      toast.success('Video uploaded successfully!');
    } catch (err) {
      setPreview(initialVideo || null);
    }
  }, [upload, onVideoChange, initialVideo]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const removeVideo = useCallback(() => {
    onVideoChange(null);
    setPreview(null);
    toast.success('Video removed');
  }, [onVideoChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!preview) {
    return (
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video bg-white border-2 border-dashed border-slate-200 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all disabled:opacity-50"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-500/30 mb-3">
            <Video className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-sm font-bold text-slate-900 mb-1">Upload Video</p>
          <p className="text-xs text-slate-600">
            Drag & drop or click to browse
            <br />
            <span className="font-mono text-[10px]">Max {maxSizeMB}MB • MP4, WebM, MOV</span>
          </p>
        </button>

        {error && (
          <p className="mt-2 text-[10px] text-rose-600 flex items-center gap-1 justify-center">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        src={preview}
        controls
        className="w-full aspect-video rounded-2xl bg-white"
        poster={preview}
      />

      {uploading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="bg-white/90 p-6 rounded-2xl border border-slate-200 text-center w-64">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-900 mb-1">Uploading video...</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                style={{ width: `${progress[0] || 0}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs font-bold text-emerald-600">{progress[0] || 0}%</p>
          </div>
        </div>
      )}

      <div className="absolute top-2 right-2 flex gap-1">
        {initialVideo && (
          <button
            type="button"
            onClick={removeVideo}
            disabled={uploading}
            className="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-600 hover:text-slate-900 rounded-xl transition-colors"
            title="Remove video"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            const a = document.createElement('a');
            a.href = preview!;
            a.download = 'listing-video.mp4';
            a.click();
          }}
          className="p-2 bg-slate-100/80 hover:bg-slate-200 text-slate-300 hover:text-slate-900 rounded-xl backdrop-blur-sm transition-colors"
          title="Download video"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </button>
      </div>

      {error && (
        <div className="absolute bottom-2 left-2 right-2 p-2 bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-600 text-xs flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoUploader;


