import { apiUrl } from '@/lib/env';
import { laravelAuth } from '@/lib/laravel-api';

export interface UploadResponse {
  url?: string;
  path?: string;
}

export async function uploadFileWithToken(file: File, path: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);

  const headers: Record<string, string> = {};
  const token = laravelAuth.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(apiUrl('/uploads'), {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (error: any) {
    throw new Error(error?.message || 'Upload failed');
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}) as { message?: string });
    throw new Error(payload?.message || 'Upload failed');
  }

  const data = (await response.json()) as UploadResponse;
  if (!data?.url) throw new Error('Upload failed');
  return data.url;
}
