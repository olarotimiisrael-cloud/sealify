import { uploadFileWithToken } from '@/lib/upload';

export async function createMissingBuckets() {
  return [];
}

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    const avatarPath = `profile-media/${userId}/${Date.now()}-avatar.${file.name.split('.').pop()}`;
    return await uploadFileWithToken(file, avatarPath);
  } catch (e) {
    console.error('Failed to upload avatar:', e);
    return null;
  }
}

export async function uploadCover(userId: string, file: File): Promise<string | null> {
  try {
    const coverPath = `profile-media/${userId}/${Date.now()}-cover.${file.name.split('.').pop()}`;
    return await uploadFileWithToken(file, coverPath);
  } catch (e) {
    console.error('Failed to upload cover:', e);
    return null;
  }
}
