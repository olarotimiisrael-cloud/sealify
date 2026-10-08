import { supabase } from '@/integrations/supabase/client';

export async function createMissingBuckets() {
  const buckets = [
    { name: 'profile-media', public: true, fileSizeLimit: 5242880, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
    { name: 'ad-images', public: true, fileSizeLimit: 10485760, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
    { name: 'ad-videos', public: true, fileSizeLimit: 52428800, allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'] },
    { name: 'documents', public: false, fileSizeLimit: 10485760, allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'] },
    { name: 'messages', public: false, fileSizeLimit: null, allowedMimeTypes: null },
  ];

  const results = [];
  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit || undefined,
        allowedMimeTypes: bucket.allowedMimeTypes || undefined,
      });

      if (error && !error.message.includes('already exists') && !error.message.includes('Bucket')) {
        console.error(`Failed to create bucket ${bucket.name}:`, error);
        results.push({ bucket: bucket.name, success: false, error: error.message });
      } else {
        console.log(`Bucket ${bucket.name} ready`);
        results.push({ bucket: bucket.name, success: true });
      }
    } catch (e) {
      console.error(`Error creating bucket ${bucket.name}:`, e);
      results.push({ bucket: bucket.name, success: false, error: String(e) });
    }
  }
  return results;
}

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    const avatarPath = `${userId}/${Date.now()}-avatar.${file.name.split('.').pop()}`;
    const { data, error } = await supabase.storage.from('profile-media').upload(avatarPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      console.error('Avatar upload error:', error);
      return null;
    }

    const { publicUrl } = supabase.storage.from('profile-media').getPublicUrl(data.path);
    return publicUrl;
  } catch (e) {
    console.error('Failed to upload avatar:', e);
    return null;
  }
}

export async function uploadCover(userId: string, file: File): Promise<string | null> {
  try {
    const coverPath = `${userId}/${Date.now()}-cover.${file.name.split('.').pop()}`;
    const { data, error } = await supabase.storage.from('profile-media').upload(coverPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      console.error('Cover upload error:', error);
      return null;
    }

    const { publicUrl } = supabase.storage.from('profile-media').getPublicUrl(data.path);
    return publicUrl;
  } catch (e) {
    console.error('Failed to upload cover:', e);
    return null;
  }
}