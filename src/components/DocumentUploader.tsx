void;
  initialDocuments?: string[];
  maxDocuments?: number;
  accept?: string;
  label?: string;
  required?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onDocumentsChange,
  initialDocuments = [],
  maxDocuments = 5,
  accept = 'image/jpeg,image/png,application/pdf',
  label = 'Upload Verification Documents',
  required = false,
}) => {
  const { upload, uploading, progress, error } = useDocumentUpload();
  const [documents, setDocuments] = useState<string[]>(initialDocuments);
  const [previews, setPreviews] = useState<{ file: File; preview: string; id: string; type: 'image' | 'pdf' }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeMB = 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const createPreviews = useCallback((files: File[]) => {
    const newPreviews = files.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    const validFiles = fileArray.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Only JPG, PNG, and PDF files allowed`);
        return false;
      }
      if (file.size > maxSizeBytes) {
        toast.error(`${file.name}: Exceeds ${maxSizeMB}MB limit`);
        return false;
      }
      return true;
    });

    if (documents.length + validFiles.length > maxDocuments) {
      toast.error(`Maximum ${maxDocuments} documents allowed`);
      return;
    }

    createPreviews(validFiles);
    
    try {
      const results = await upload(validFiles);
      const urls = results.map(r => r.publicUrl);
      const newDocuments = [...documents, ...urls];
      setDocuments(newDocuments);
      onDocumentsChange(newDocuments);
      setPreviews([]);
      toast.success(`${validFiles.length} document(s) uploaded`);
    } catch (err) {
      // Error handled by hook
    }
  }, [documents, maxDocuments, upload, onDocumentsChange, createPreviews]);

  const removeDocument = useCallback((index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    setDocuments(newDocuments);
    onDocumentsChange(newDocuments);
  }, [documents, onDocumentsChange]);

  const removePreview = useCallback((id: string) => {
    setPreviews(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const totalDocs = documents.length + previews.length;

  return (
    <div className="relative">
      <label className="block">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {label} <span className="text-slate-500 font-normal uppercase">({totalDocs}/{maxDocuments})</span>
          </label>
          {uploading && (
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading...
            </div>
          )}
        </label>

        <div
          className={`relative border-2 border-dashed rounded-2xl transition-all ${
            uploading ? 'border-slate-800 bg-slate-950' : 'border-slate-800 bg-slate-950 hover:border-emerald-500/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            disabled={uploading || totalDocs >= maxDocuments}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || totalDocs >= maxDocuments}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer disabled:opacity-50"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30 mb-3">
              <Upload className="w-6 h-6 mx-auto" />
            </div>
            <p className="text-sm font-bold text-white mb-1">{label}</p>
            <p className="text-xs text-slate-400">
              Drag & drop or click to browse
              <br />
              <span className="font-mono text-[10px]">{maxDocuments} max • {maxSizeMB}MB each • JPG, PNG, PDF</span>
            </p>
          </button>
        </div>

        {uploading && (
          <div className="mt-3 space-y-2">
            {Object.entries(progress).map(([index, prog]) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Document {parseInt(index) + 1}</span>
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

        {error && (
          <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {(documents.length > 0 || previews.length > 0) && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attached Documents</p>
            <div className="space-y-2">
              {documents.map((url, index) => (
                <div key={`existing-${index}`} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">Document {index + 1}</p>
                    <p className="text-[10px] text-slate-400">Uploaded • Ready for review</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newDocs = documents.filter((_, i) => i !== index);
                      setDocuments(newDocs);
                      // Note: In production, also delete from storage
                    }}
                    className="p-1.5 text-rose-400 hover:text-white rounded-lg"
                    title="Remove document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {previews.map((preview) => (
                <div key={preview.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    {preview.type === 'pdf' ? <FileText className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{preview.file.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {(preview.file.size / 1024 / 1024).toFixed(2)} MB • 
                      {progress[previews.indexOf(preview)] !== undefined 
                        ? `Uploading... ${progress[previews.indexOf(preview)]}%`
                        : 'Pending upload'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePreview(preview.id)}
                    className="p-1.5 text-rose-400 hover:text-white rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-2 text-[10px] text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </label>
    </div>
  );
};

export default DocumentUploader;