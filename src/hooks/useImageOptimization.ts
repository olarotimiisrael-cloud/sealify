import { useCallback, useRef } from 'react';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export function useImageOptimization() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const compressImage = useCallback((
    file: File,
    options: CompressionOptions = {}
  ): Promise<File> => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85,
      format = 'webp',
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;

        if (!ctxRef.current) {
          ctxRef.current = canvas.getContext('2d');
        }
        const ctx = ctxRef.current!;

        ctx.drawImage(img, 0, 0, width, height);
        
        const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + `.${format}`, {
              type: mimeType,
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const compressMultiple = useCallback(async (
    files: File[],
    options: CompressionOptions = {}
  ): Promise<File[]> => {
    const results = await Promise.all(
      files.map(file => compressImage(file, options))
    );
    return results;
  }, []);

  return { compressImage, compressMultiple };
}