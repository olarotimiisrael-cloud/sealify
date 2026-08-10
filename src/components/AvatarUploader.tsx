void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

const SIZE_CLASSES = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
};

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  onAvatarChange,
  size = 'lg',
  editable = true,
}) => {
  const { upload, uploading, progress, error } = useAvatarUpload();
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar must be less than 5MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      const results = await upload([file]);
      const url = results[0].publicUrl;
      onAvatarChange(url);
      setPreview(url);
      toast.success('Avatar updated successfully!');
    } catch (err) {
      setPreview(currentAvatar || null);
    }
  }, [upload, onAvatarChange, currentAvatar]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const removeAvatar = useCallback(() => {
    onAvatarChange('');
    setPreview(null);
    toast.success('Avatar removed');
  }, [onAvatarChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const displaySize = SIZE_CLASSES[size];

  if (!editable) {
    return (
      <div className="relative inline-block">
        {preview ? (
          <img 
            src={preview} 
            alt="Avatar" 
            className={`${displaySize} rounded-2xl object-cover border-2 border-emerald-500`}
          />
        ) : (
          <div className={`${displaySize} rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-500`}>
            <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <div className="relative">
        {preview ? (
          <img 
            src={preview} 
            alt="Avatar preview" 
            className={`${displaySize} rounded-2xl object-cover border-2 border-emerald-500 shadow-lg`}
          />
        ) : (
          <div className={`${displaySize} rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-500`}>
            <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}

        {editable && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <button
              type="button"
              onClick={openFileDialog}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-lg font-black hover:scale-105 transition-transform disabled:opacity-50"
              title={currentAvatar ? "Change Avatar" : "Upload Avatar"}
            >
              <Camera className="w-4 h-4" />
            </button>

            {currentAvatar && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={uploading}
                className="absolute bottom-0 left-0 p-2 bg-rose-500 text-white rounded-xl shadow-lg font-black hover:scale-105 transition-transform"
                title="Remove Avatar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {uploading && (
        <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>Uploading avatar...</span>
            <span>{progress[0] || 0}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
              style={{ width: `${progress[0] || 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-rose-400 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default AvatarUploader;