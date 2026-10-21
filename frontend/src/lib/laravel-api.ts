import { apiUrl } from '@/lib/env';

const TOKEN_KEY = 'sealify_access_token';
const USER_KEY = 'sealify_user';

export type LaravelUser = {
  id: number | string;
  email: string;
  full_name: string;
  role?: string;
  status?: string;
};

type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: LaravelUser;
};

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

export const laravelAuth = {
  getToken(): string | null {
    return getStorage()?.getItem(TOKEN_KEY) || null;
  },

  setSession(data: AuthResponse) {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(TOKEN_KEY, data.access_token);
    storage.setItem(USER_KEY, JSON.stringify(data.user || null));
  },

  getStoredUser(): LaravelUser | null {
    const raw = getStorage()?.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as LaravelUser;
    } catch {
      return null;
    }
  },

  clearSession() {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
  },
};

export async function laravelRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  let body: string | undefined;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const auth = options.auth !== false;
  if (auth) {
    const token = laravelAuth.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl(path), {
    method: options.method || 'GET',
    headers,
    body,
  });

  if (response.status === 401) {
    laravelAuth.clearSession();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData?.message || errorData?.error || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const laravelApi = {
  register(email: string, password: string, fullName: string, phoneNumber?: string) {
    return laravelRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { email, password, full_name: fullName, phone_number: phoneNumber },
      auth: false,
    });
  },

  login(email: string, password: string) {
    return laravelRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
  },

  logout() {
    return laravelRequest<{ success: boolean }>('/auth/logout', { method: 'POST' });
  },

  me() {
    return laravelRequest<LaravelUser>('/auth/me');
  },

  data: {
    list<T>(resource: string, params: Record<string, string> = {}) {
      const query = new URLSearchParams(params).toString();
      const suffix = query ? `?${query}` : '';
      return laravelRequest<T[]>(`/data/${resource}${suffix}`, { auth: false });
    },

    get<T>(resource: string, id: string | number) {
      return laravelRequest<T>(`/data/${resource}/${id}`);
    },

    create<T>(resource: string, body: Record<string, unknown>) {
      return laravelRequest<T>(`/data/${resource}`, { method: 'POST', body });
    },

    update<T>(resource: string, id: string | number, body: Record<string, unknown>) {
      return laravelRequest<T>(`/data/${resource}/${id}`, { method: 'PUT', body });
    },

    destroy<T = { success: boolean }>(resource: string, id: string | number) {
      return laravelRequest<T>(`/data/${resource}/${id}`, { method: 'DELETE' });
    },
  },
};
