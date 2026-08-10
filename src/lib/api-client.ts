import { createClient } from "@supabase/supabase-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private supabase: ReturnType<typeof createClient>;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.baseUrl = API_BASE;
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!
    );

    this.loadTokens();

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.setTokens(session.access_token, session.refresh_token, session.expires_at!);
      } else {
        this.clearTokens();
      }
    });
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem("sb-access-token");
    this.refreshToken = localStorage.getItem("sb-refresh-token");
    const expiry = localStorage.getItem("sb-token-expiry");
    this.tokenExpiry = expiry ? parseInt(expiry) : 0;
  }

  private setTokens(access: string, refresh: string, expiresAt: number) {
    this.accessToken = access;
    this.refreshToken = refresh;
    this.tokenExpiry = expiresAt * 1000;
    localStorage.setItem("sb-access-token", access);
    localStorage.setItem("sb-refresh-token", refresh);
    localStorage.setItem("sb-token-expiry", String(expiresAt * 1000));
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;
    localStorage.removeItem("sb-access-token");
    localStorage.removeItem("sb-refresh-token");
    localStorage.removeItem("sb-token-expiry");
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      if (!this.refreshToken) throw new Error("No refresh token");

      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: this.refreshToken,
      });

      if (error || !data.session) {
        this.clearTokens();
        throw new Error("Session expired");
      }

      this.setTokens(data.session.access_token, data.session.refresh_token, data.session.expires_at!);
      return data.session.access_token;
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async getValidAccessToken(): Promise<string | null> {
    if (!this.accessToken) return null;

    if (Date.now() >= this.tokenExpiry - 30000) {
      try {
        return await this.refreshAccessToken();
      } catch {
        this.clearTokens();
        return null;
      }
    }

    return this.accessToken;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    return url.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, requireAuth = true, headers = {}, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint, params);
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (requireAuth) {
      const token = await this.getValidAccessToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    if (response.status === 401) {
      this.clearTokens();
      if (window.location.pathname !== "/login" && window.location.pathname !== "/admin/login") {
        window.location.href = "/login";
      }
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Request failed" }));
      throw new ApiError(response.status, errorData.message || "Request failed", errorData);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  get<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, { method: "POST", body: JSON.stringify(data) });
  }

  put<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, { method: "PUT", body: JSON.stringify(data) });
  }

  patch<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async signUp(email: string, password: string, fullName: string, phoneNumber?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phoneNumber } },
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.clearTokens();
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  }

  async updatePassword(password: string) {
    const { error } = await this.supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = new ApiClient();

export const queryKeys = {
  user: () => ["user"] as const,
  session: () => ["session"] as const,
  listings: (filters?: Record<string, any>) => ["listings", filters] as const,
  listing: (id: string) => ["listing", id] as const,
  categories: () => ["categories"] as const,
  featuredListings: () => ["listings", "featured"] as const,
  profile: (id: string) => ["profile", id] as const,
  myListings: () => ["my-listings"] as const,
  savedListings: () => ["saved-listings"] as const,
  wallet: () => ["wallet"] as const,
  transactions: (params?: any) => ["transactions", params] as const,
  conversations: () => ["conversations"] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
  notifications: (params?: any) => ["notifications", params] as const,
  unreadCount: () => ["notifications", "unread"] as const,
  adminStats: () => ["admin", "stats"] as const,
  adminUsers: (params?: any) => ["admin", "users", params] as const,
  adminListings: (params?: any) => ["admin", "listings", params] as const,
  adminReports: (params?: any) => ["admin", "reports", params] as const,
  adminDisputes: (params?: any) => ["admin", "disputes", params] as const,
  adminVerifications: (params?: any) => ["admin", "verifications", params] as const,
  adminPromotions: (params?: any) => ["admin", "promotions", params] as const,
  adminAuditLogs: (params?: any) => ["admin", "audit-logs", params] as const,
  adminIntrusionLogs: (params?: any) => ["admin", "intrusion-logs", params] as const,
  marketStats: () => ["market-stats"] as const,
  priceIndex: (category?: string) => ["price-index", category] as const,
  search: (query: string, filters?: any) => ["search", query, filters] as const,
  trending: () => ["trending"] as const,
  suggestions: (query: string) => ["suggestions", query] as const,
};

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: queryKeys.session(),
    queryFn: () => api.getSession(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: user } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => api.getUser(),
    enabled: !!session?.data?.session,
    staleTime: 1000 * 60 * 5,
  });

  const signIn = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => api.signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    },
  });

  const signUp = useMutation({
    mutationFn: ({ email, password, fullName, phoneNumber }: { email: string; password: string; fullName: string; phoneNumber?: string }) =>
      api.signUp(email, password, fullName, phoneNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    },
  });

  const signOut = useMutation({
    mutationFn: () => api.signOut(),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return { session: session?.data?.session, user: user?.data?.user, signIn, signUp, signOut };
}

export function useListings(filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.listings(filters),
    queryFn: () => api.get<{ listings: any[]; total: number }>("/listings", filters),
    staleTime: 1000 * 30,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: () => api.get<{ listing: any }>(`/listings/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/listings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings() });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/listings/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listing(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings() });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings() });
    },
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: queryKeys.myListings(),
    queryFn: () => api.get<{ listings: any[] }>("/listings", { seller: "me" }),
    staleTime: 1000 * 60,
  });
}

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations(),
    queryFn: () => api.get<{ conversations: any[] }>("/conversations"),
    staleTime: 1000 * 30,
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => api.get<{ messages: any[] }>(`/conversations/${conversationId}/messages`),
    enabled: !!conversationId,
    staleTime: 1000 * 10,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, receiverId, content }: { conversationId: string; receiverId: string; content: string }) =>
      api.post("/conversations", { conversationId, receiverId, content }),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    },
  });
}

export function useNotifications(params?: any) {
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: () => api.get<{ notifications: any[]; unreadCount: number }>("/notifications", params),
    staleTime: 1000 * 30,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.put("/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount() });
    },
  });
}

export function useWallet() {
  return useQuery({
    queryKey: queryKeys.wallet(),
    queryFn: () => api.get<{ wallet: any }>("/wallet"),
    staleTime: 1000 * 60,
  });
}

export function useTransactions(params?: any) {
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: () => api.get<{ transactions: any[] }>("/wallet/transactions", params),
    staleTime: 1000 * 60,
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => api.post("/wallet/payout", { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet() });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: () => api.get("/admin/stats"),
    staleTime: 1000 * 60,
  });
}

export function useAdminUsers(params?: any) {
  return useQuery({
    queryKey: queryKeys.adminUsers(params),
    queryFn: () => api.get("/admin/users", params),
    staleTime: 1000 * 60,
  });
}

export function useAdminListings(params?: any) {
  return useQuery({
    queryKey: queryKeys.adminListings(params),
    queryFn: () => api.get("/admin/listings", params),
    staleTime: 1000 * 60,
  });
}

export function useAdminReports(params?: any) {
  return useQuery({
    queryKey: queryKeys.adminReports(params),
    queryFn: () => api.get("/admin/reports", params),
    staleTime: 1000 * 60,
  });
}

export function useAdminDisputes(params?: any) {
  return useQuery({
    queryKey: queryKeys.adminDisputes(params),
    queryFn: () => api.get("/admin/disputes", params),
    staleTime: 1000 * 60,
  });
}

export function useAdminVerifications(params?: any) {
  return useQuery({
    queryKey: queryKeys.adminVerifications(params),
    queryFn: () => api.get("/admin/verifications", params),
    staleTime: 1000 * 60,
  });
}

export function useAdminPromotions(params?: any) {
  return useQuery({
    queryKey: queryKeys.adminPromotions(params),
    queryFn: () => api.get("/admin/promotions", params),
    staleTime: 1000 * 60,
  });
}

export function useAdminAuditLogs(params?: any) {
  return useQuery({
    queryKey: queryKeys.adminAuditLogs(params),
    queryFn: () => api.get("/admin/audit-logs", params),
    staleTime: 1000 * 60,
  });
}

export function useAdminIntrusionLogs(params?: any) {
  return useQuery({
    queryKey: queryKeys.adminIntrusionLogs(params),
    queryFn: () => api.get("/admin/intrusion-logs", params),
    staleTime: 1000 * 60,
  });
}

export function useMarketStats() {
  return useQuery({
    queryKey: queryKeys.marketStats(),
    queryFn: () => api.get("/market-insights/stats"),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePriceIndex(category?: string) {
  return useQuery({
    queryKey: queryKeys.priceIndex(category),
    queryFn: () => api.get("/market-insights/price-index", { category }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearch(query: string, filters?: any) {
  return useQuery({
    queryKey: queryKeys.search(query, filters),
    queryFn: () => api.get("/search", { q: query, ...filters }),
    enabled: query.length >= 2,
    staleTime: 1000 * 60,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: queryKeys.trending(),
    queryFn: () => api.get("/search/trending"),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSuggestions(query: string) {
  return useQuery({
    queryKey: queryKeys.suggestions(query),
    queryFn: () => api.get("/search/suggestions", { q: query }),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}