import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const STORAGE_BUCKETS = {
  AVATARS: 'profile-media',
  AD_IMAGES: 'ad-images',
  AD_VIDEOS: 'ad-videos',
  DOCUMENTS: 'documents',
} as const;

export type BucketName = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

const MAX_SIZES = {
  avatar: 5 * 1024 * 1024,
  adImage: 10 * 1024 * 1024,
  adVideo: 50 * 1024 * 1024,
  document: 10 * 1024 * 1024,
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

/**
 * Validate file before upload
 */
function validateFile(file: File, type: 'avatar' | 'adImage' | 'adVideo' | 'document'): { valid: boolean; error?: string } {
  const maxSize = MAX_SIZES[type];
  
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
  }

  const allowedTypes = {
    avatar: ALLOWED_IMAGE_TYPES,
    adImage: ALLOWED_IMAGE_TYPES,
    adVideo: ALLOWED_VIDEO_TYPES,
    document: ALLOWED_DOCUMENT_TYPES,
  };

  if (!allowedTypes[type].includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes[type].join(', ')}` };
  }

  return { valid: true };
}

/**
 * Generate unique file path
 */
function generateFilePath(bucket: BucketName, userId: string, fileName: string, folder?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = fileName.split('.').pop() || '';
  const baseName = fileName.replace(/\.[^/.]+$/, '').substring(0, 50);
  
  const folderPath = folder ? `${folder}/` : '';
  return `${folderPath}${userId}/${timestamp}-${random}-${baseName}.${ext}`;
}

/**
 * Upload file to Supabase Storage with progress tracking
 */
export async function uploadFile(
  userId: string,
  options: UploadOptions
): Promise<UploadResult> {
  const { bucket, file, folder, onProgress } = options;
  
  // Determine file type for validation
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
    default:
      fileType = 'adImage';
  }

  const validation = validateFile(file, fileType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const filePath = generateFilePath(bucket, userId, options.fileName || file.name, folder);
  const fullPath = `${bucket}/${filePath}`;

  try {
    // Upload with resumable support for large files
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        // Enable resumable uploads for files > 5MB
        ...(file.size > 5 * 1024 * 1024 && {
          duplex: 'half' as const,
        }),
      });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('duplicate')) {
        // File already exists, try with new name
        const newFilePath = generateFilePath(bucket, userId, `${Date.now()}-${file.name}`, folder);
        const { data: retryData, error: retryError } = await supabase.storage
          .from(bucket)
          .upload(newFilePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });
        
        if (retryError) throw retryError;
        return {
          path: newFilePath,
          publicUrl: supabase.storage.from(bucket).getPublicUrl(newFilePath).data.publicUrl,
          fullPath: `${bucket}/${newFilePath}`,
        };
      }
      throw error;
    }

    if (onProgress) onProgress(100);

    return {
      path: data.path,
      publicUrl: supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl,
      fullPath: `${bucket}/${data.path}`,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple files with progress
 */
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

/**
 * Delete file from storage
 */
export async function deleteFile(bucket: BucketName, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(bucket: BucketName, paths: string[]): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete files error:', error);
    return false;
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Get signed URL for private files (expires in 1 hour)
 */
export async function getSignedUrl(bucket: BucketName, path: string, expiresIn = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL error:', error);
    return null;
  }
}

/**
 * List files in a folder
 */
export async function listFiles(bucket: BucketName, folder: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder);
    if (error) throw error;
    return data.map(file => `${folder}/${file.name}`).filter(Boolean);
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

/**
 * Create storage bucket (admin only)
 */
export async function createBucket(
  bucketName: string,
  options: { public?: boolean; fileSizeLimit?: number; allowedMimeTypes?: string[] } = {}
): Promise<boolean> {
  try {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: options.public ?? false,
      file_size_limit: options.fileSizeLimit,
      allowed_mime_types: options.allowedMimeTypes,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Create bucket error:', error);
    return false;
  }
}

/**
 * Initialize default buckets (run once on setup)
 */
export async function initializeBuckets(): Promise<void> {
  const buckets = [
    {
      name: STORAGE_BUCKETS.AVATARS,
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    },
    {
      name: STORAGE_BUCKETS.AD_IMAGES,
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    },
    {
      name: STORAGE_BUCKETS.AD_VIDEOS,
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ALLOWED_VIDEO_TYPES,
    },
    {
      name: STORAGE_BUCKETS.DOCUMENTS,
      public: false, // Private for KYC documents
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ALLOWED_DOCUMENT_TYPES,
    },
  ];

  for (const bucket of buckets) {
    try {
      await createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      });
    } catch (error) {
      // Bucket might already exist
      console.log(`Bucket ${bucket.name} setup:`, error);
    }
  }
}

// React hooks for file uploads
import { useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';

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
