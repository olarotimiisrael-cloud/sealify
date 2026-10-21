import { useCallback, useState } from 'react';
import { uploadFileWithToken } from '@/lib/upload';
import { useAuth } from '@/components/AuthProvider';

export const STORAGE_BUCKETS = {
  AVATARS: 'profile-media',
  AD_IMAGES: 'ad-images',
  AD_VIDEOS: 'ad-videos',
  DOCUMENTS: 'documents',
  MESSAGES: 'messages',
} as const;

export type BucketName = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

const MAX_SIZES = {
  avatar: 5 * 1024 * 1024,
  adImage: 10 * 1024 * 1024,
  adVideo: 50 * 1024 * 1024,
  document: 10 * 1024 * 1024,
  message: Infinity,
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

interface UploadOptions {
  bucket: BucketName;
  file: File;
  fileName?: string;
  folder?: string;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  path: string;
  publicUrl: string;
  fullPath: string;
}

function validateFile(
  file: File,
  type: 'avatar' | 'adImage' | 'adVideo' | 'document' | 'message'
): { valid: boolean; error?: string } {
  const maxSize = MAX_SIZES[type];

  if (file.size > maxSize) {
    if (maxSize === Infinity) {
      return { valid: true };
    }
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
  }

  const allowedTypes: Record<string, string[]> = {
    avatar: ALLOWED_IMAGE_TYPES,
    adImage: ALLOWED_IMAGE_TYPES,
    adVideo: ALLOWED_VIDEO_TYPES,
    document: ALLOWED_DOCUMENT_TYPES,
    message: [],
  };

  if (type === 'message') {
    const DANGEROUS_TYPES = ['application/x-msdownload', 'application/javascript'];
    if (DANGEROUS_TYPES.includes(file.type)) {
      return { valid: false, error: `Dangerous file type rejected: ${file.type}` };
    }
    return { valid: true };
  }

  if (!allowedTypes[type].includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes[type].join(', ')}` };
  }

  return { valid: true };
}

function generateFilePath(bucket: BucketName, userId: string, fileName: string, folder?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = fileName.split('.').pop() || '';
  const baseName = fileName.replace(/\.[^/.]+$/, '').substring(0, 50);

  const folderPath = folder ? `${folder}/` : '';
  return `${folderPath}${userId}/${timestamp}-${random}-${baseName}.${ext}`;
}

export async function uploadFile(
  userId: string,
  options: UploadOptions
): Promise<UploadResult> {
  const { bucket, file, folder, onProgress } = options;

  let fileType: 'avatar' | 'adImage' | 'adVideo' | 'document';
  switch (bucket) {
    case STORAGE_BUCKETS.AVATARS:
      fileType = 'avatar';
      break;
    case STORAGE_BUCKETS.AD_IMAGES:
      fileType = 'adImage';
      break;
    case STORAGE_BUCKETS.AD_VIDEOS:
      fileType = 'adVideo';
      break;
    case STORAGE_BUCKETS.DOCUMENTS:
      fileType = 'document';
      break;
    case STORAGE_BUCKETS.MESSAGES:
      fileType = 'message';
      break;
    default:
      fileType = 'adImage';
  }

  const validation = validateFile(file, fileType as any);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const filePath = generateFilePath(bucket, userId, options.fileName || file.name, folder);
  const fullPath = `${bucket}/${filePath}`;

  try {
    const publicUrl = await uploadFileWithToken(file, fullPath);

    if (onProgress) onProgress(100);

    return { path: filePath, publicUrl, fullPath };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function uploadFiles(
  userId: string,
  files: File[],
  bucket: BucketName,
  folder?: string,
  onFileProgress?: (index: number, progress: number) => void,
  onFileComplete?: (index: number, result: UploadResult) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadFile(userId, {
        bucket,
        file: files[i],
        folder,
        onProgress: (progress) => onFileProgress?.(i, progress),
      });

      results.push(result);
      onFileComplete?.(i, result);
    } catch (error) {
      console.error(`Failed to upload file ${i}:`, error);
      throw error;
    }
  }

  return results;
}

export async function deleteFile(_bucket: BucketName, _path: string): Promise<boolean> {
  return true;
}

export async function deleteFiles(_bucket: BucketName, _paths: string[]): Promise<boolean> {
  return true;
}

export function getPublicUrl(bucket: BucketName, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${bucket}/${path}`;
}

export async function getSignedUrl(_bucket: BucketName, _path: string, _expiresIn = 3600): Promise<string | null> {
  return null;
}

export async function listFiles(_bucket: BucketName, _folder: string): Promise<string[]> {
  return [];
}

export async function createBucket(
  _bucketName: string,
  _options: { public?: boolean; fileSizeLimit?: number; allowedMimeTypes?: string[] } = {}
): Promise<boolean> {
  return true;
}

export async function initializeBuckets(): Promise<void> {
  return undefined;
}

export function useFileUpload(bucket: BucketName, folder?: string) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (files: File[]) => {
    if (!user) throw new Error('User not authenticated');
    if (files.length === 0) return [];

    setUploading(true);
    setError(null);
    setProgress({});

    try {
      const results = await uploadFiles(user.id, Array.from(files), bucket, folder,
        (index, progress) => setProgress(prev => ({ ...prev, [index]: progress })),
        (index, result) => {
          setProgress(prev => ({ ...prev, [index]: 100 }));
        }
      );

      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setProgress({});
    }
  }, [user, bucket, folder]);

  return { upload, uploading, progress, error };
}

export function useAvatarUpload() {
  return useFileUpload('profile-media', 'avatars');
}

export function useAdImageUpload() {
  return useFileUpload('ad-images', 'listings');
}

export function useAdVideoUpload() {
  return useFileUpload('ad-videos', 'listings');
}

export function useDocumentUpload() {
  return useFileUpload('documents', 'kyc');
}

export function useMessageUpload() {
  return useFileUpload('messages', 'messages');
}
