import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mapListingToListing } from "@/services/supabaseService";
import { appEnv } from "@/lib/env";
import { laravelAuth } from "@/lib/laravel-api";

const API_BASE = appEnv.apiBase;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const base = this.baseUrl;
    const fullPath = `${base}${endpoint}`;

    if (base.startsWith('http')) {
      const url = new URL(fullPath);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
          }
        });
      }
      return url.toString();
    }

    const url = new URL(fullPath, window.location.origin);
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
      const token = laravelAuth.getToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    if (response.status === 401) {
      if (window.location.pathname !== "/login" && window.location.pathname !== "/admin/login") {
        window.location.href = "/login";
      }
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({ message: "Request failed" }))) as { message?: string };
      throw new ApiError(response.status, errorData.message || "Request failed", errorData);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  get<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  getPublic<T>(endpoint: string, params?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "GET", params, requireAuth: false });
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
    const data = await this.post<any>("/auth/register", { email, password, full_name: fullName, phone_number: phoneNumber });
    laravelAuth.setSession(data);
    return { session: data, user: data.user };
  }

  async signIn(email: string, password: string) {
    const data = await this.post<any>("/auth/login", { email, password });
    laravelAuth.setSession(data);
    return { session: data, user: data.user };
  }

  async signOut() {
    try {
      await this.post("/auth/logout", {});
    } finally {
      laravelAuth.clearSession();
    }
  }

  async signInWithOAuth(provider: 'google' | 'apple' | 'samsung'): Promise<boolean> {
    if (provider !== 'google') {
      throw new Error(`OAuth provider "${provider}" is not configured.`);
    }
    const base = import.meta.env.VITE_API_BASE ?? '/api';
    // Redirect the browser to the backend Google OAuth URL. Google will send the
    // user back to /api/auth/google/callback, which then redirects to the frontend
    // OAuth-callback handler with a Sanctum access token.
    window.location.replace(`${base}/auth/google`);
    return true;
  }

  async sendPhoneOtp(phone: string, channel?: string): Promise<string> {
    const response = await this.post<any>("/auth/phone/otp", { phone, channel });
    return response.otpId || "otp_sent";
  }

  async verifyPhoneOtp(phone: string, code: string, otpId?: string): Promise<boolean> {
    await this.post("/auth/phone/verify", { phone, otp: code, otpId });
    return true;
  }

  async resetPassword(email: string) {
    await this.post("/auth/password/reset-request", { email });
  }

  async updatePassword(password: string) {
    throw new Error("Password reset must be completed from the emailed reset link.");
  }

  async getSession() {
    const token = laravelAuth.getToken();
    if (!token) {
      return { data: { session: null } };
    }

    try {
      const user = await this.get<any>("/auth/me");
      laravelAuth.setSession({ ...({ access_token: token, token_type: "Bearer", user }) });
      return { data: { session: { access_token: token, user } } };
    } catch {
      laravelAuth.clearSession();
      return { data: { session: null } };
    }
  }

  async getUser() {
    const { data } = await this.getSession();

    return { data: { user: data.session?.user || null } };
  }

  onAuthStateChange(_callback: (event: string, session: any) => void) {
    return {
      data: {
        subscription: {
          unsubscribe() {},
        },
      },
    };
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
  adminReferralStats: () => ["admin", "referrals", "stats"] as const,
  adminReferrals: (params?: any) => ["admin", "referrals", params] as const,
  adminReferralUser: (userId: string) => ["admin", "referrals", userId] as const,
  marketStats: () => ["market-stats"] as const,
  priceIndex: (category?: string) => ["price-index", category] as const,
  search: (query: string, filters?: any) => ["search", query, filters] as const,
  trending: () => ["trending"] as const,
  suggestions: (query: string) => ["suggestions", query] as const,
  referralMe: () => ["referral", "me"] as const,
};

const getCurrentUserId = async () => {
  const token = laravelAuth.getToken();
  if (!token) throw new Error('Authentication required');

  try {
    const user = await api.get<any>('/auth/me');
    if (user?.id) return String(user.id);
  } catch {
    laravelAuth.clearSession();
  }

  throw new Error('Authentication required');
};

const loadListings = async (sellerOnly = false) => {
  const userId = sellerOnly ? await getCurrentUserId() : null;
  const response = await api.getPublic<{ listings: any[]; total?: number }>('/listings', { limit: '100' });
  const rows = (response?.listings || []).filter((row: any) =>
    sellerOnly && userId ? String(row.seller_id) === userId : true,
  );
  return { listings: rows.map(mapListingToListing), total: response?.total ?? rows.length };
};

const loadConversationSummaries = async (userId: string) => {
  const conversationsResponse = await api.get<{ conversations: any[] }>('/conversations');
  const rows = conversationsResponse?.conversations || [];

  const listingsResponse = await api
    .getPublic<{ listings: any[] }>('/listings', { limit: '100' })
    .catch(() => ({ listings: [] as any[] }));
  const ads = listingsResponse?.listings || [];

  const otherUserIds = Array.from(
    new Set(rows.map((row: any) => String(row.other_user_id ?? '')).filter(Boolean)),
  );

  const profileEntries = await Promise.all(
    otherUserIds.map(async (id) => {
      try {
        const profile = await api.get<any>(`/users/${id}`);
        return [id, profile] as const;
      } catch {
        return [id, null] as const;
      }
    }),
  );

  const profiles = new Map<string, any>(profileEntries);

  return Promise.all(rows.map(async (row: any) => {
    const otherUserId = String(row.other_user_id ?? '');
    const profile = profiles.get(otherUserId);
    let messages: any[] = [];

    try {
      const messagesResponse = await api.get<{ messages: any[] }>(`/conversations/${row.id}/messages`);
      messages = messagesResponse?.messages || [];
    } catch {
      messages = [];
    }

    const ad = ads.find((item: any) => String(item.id) === String(row.ad_id));

    return {
      id: String(row.id),
      listingId: String(row.ad_id ?? ''),
      listingTitle: ad?.title || 'Marketplace ad',
      listingImage: (Array.isArray(ad?.images) ? ad.images[0] : '') || '',
      listingPrice: Number(ad?.price || 0),
      otherUser: {
        id: otherUserId,
        name: profile?.full_name || 'Sealify user',
        avatar: profile?.avatar_url || '',
      },
      lastMessage: row.last_message || '',
      lastMessageTime: row.last_message_time || row.created_at,
      messages: messages.map((message: any) => ({
        id: String(message.id),
        senderId: String(message.sender_id ?? ''),
        receiverId: String(message.receiver_id ?? ''),
        listingId: String(message.ad_id ?? ''),
        content: message.content,
        createdAt: message.created_at,
        isRead: Boolean(message.read),
        attachments: [],
      })),
    };
  }));
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

  const signInWithOAuth = useMutation({
    mutationFn: (provider: 'google' | 'apple' | 'samsung') => api.signInWithOAuth(provider),
  });

  return { session: session?.data?.session, user: user?.data?.user, signIn, signUp, signInWithOAuth, signOut };
}

export function useListings(filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.listings(filters),
    queryFn: () => loadListings(),
    staleTime: 1000 * 30,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: async () => {
      const row = await api.getPublic<any>(`/listings/${id}`);
      return { listing: row ? mapListingToListing(row) : null };
    },
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const created = await api.post<any>('/listings', {
        category_id: data.categoryId || data.category_id || data.category || undefined,
        subcategory_id: data.subcategoryId || data.subcategory_id || undefined,
        title: data.title,
        description: data.description,
        price: data.price,
        original_price: data.originalPrice ?? data.original_price ?? undefined,
        condition: data.condition,
        location: data.location,
        status: 'active',
        images: data.images || [],
        video_url: data.videoUrl || data.video_url || undefined,
        specifications: data.specifications || {},
      });
      return { listing: mapListingToListing(created) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings() });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const updates: Record<string, any> = {};
      const fieldMap: Record<string, string> = {
        sellerId: 'seller_id', categoryId: 'category_id', subcategoryId: 'subcategory_id', originalPrice: 'original_price',
        videoUrl: 'video_url', viewsCount: 'views_count', promotionPlanName: 'promotion_plan_name',
        promotionDurationMonths: 'promotion_duration_months', promotionStartDate: 'promotion_start_date',
        promotionEndDate: 'promotion_end_date', paymentStatus: 'payment_status', paymentProofUrl: 'payment_proof_url',
        amountPaid: 'amount_paid', createdAt: 'created_at', updatedAt: 'updated_at',
      };

      Object.entries(data).forEach(([key, value]) => {
        updates[fieldMap[key] || key] = value;
      });

      const updated = await api.put<any>(`/listings/${id}`, updates);
      return { listing: mapListingToListing(updated) };
    },
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
    mutationFn: async (id: string) => {
      await api.delete(`/listings/${id}`);
      return undefined;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings() });
    },
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: queryKeys.myListings(),
    queryFn: () => loadListings(true),
    staleTime: 1000 * 60,
  });
}

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations(),
    queryFn: async () => ({ conversations: await loadConversationSummaries(await getCurrentUserId()) }),
    staleTime: 1000 * 30,
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: async () => {
      const response = await api.get<{ messages: any[] }>(`/conversations/${conversationId}/messages`);
      return {
        messages: (response?.messages || []).map((message: any) => ({
          id: String(message.id),
          senderId: String(message.sender_id ?? ''),
          receiverId: String(message.receiver_id ?? ''),
          listingId: String(message.ad_id ?? ''),
          content: message.content,
          createdAt: message.created_at,
          isRead: Boolean(message.read),
          attachments: [],
        })),
      };
    },
    enabled: !!conversationId,
    staleTime: 1000 * 10,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; receiverId: string; content: string; attachments?: Array<{ filename: string; mime_type?: string; size: number; public_url?: string; storage_path?: string }> }) => {
      const message = await api.post<any>(`/conversations/${conversationId}/messages`, { content: content.trim() });
      return { message };
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    },
  });
}

export function useNotifications(params?: any) {
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: async () => {
      const response = await api.get<{ notifications: any[]; unreadCount?: number }>('/notifications');
      const notifications = response?.notifications || [];
      return {
        notifications,
        unreadCount: response?.unreadCount ?? notifications.filter((notification: any) => !notification.read).length,
      };
    },
    staleTime: 1000 * 30,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/read`, {});
      return undefined;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all', {});
      return undefined;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount() });
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

// Referral hooks
export function useReferralMe() {
  return useQuery({
    queryKey: queryKeys.referralMe(),
    queryFn: () => api.get("/referrals/me"),
    staleTime: 1000 * 30,
    refetchInterval: 30000,
  });
}

export function useValidateReferralCode(code?: string) {
  return useQuery({
    queryKey: ["referral", "validate", code],
    queryFn: () => api.getPublic("/referrals/validate", { code: code || "" }),
    enabled: !!code,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminReferralStats() {
  return useQuery({
    queryKey: queryKeys.adminReferralStats(),
    queryFn: () => api.get("/admin/referrals/stats"),
    staleTime: 1000 * 60,
  });
}

export function useAdminReferrals(params?: any) {
  return useQuery({
    queryKey: queryKeys.adminReferrals(params),
    queryFn: () => api.get("/admin/users", params),
    staleTime: 1000 * 60,
  });
}

export function useAdminReferralUser(userId?: string) {
  return useQuery({
    queryKey: queryKeys.adminReferralUser(userId || ""),
    queryFn: () => api.get(`/admin/referrals/${userId}`),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useGrantReferralReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      api.post(`/admin/referrals/${userId}/grant`, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReferrals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReferralUser(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReferralStats() });
    },
  });
}

export function useResetReferralCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      api.post(`/admin/referrals/${userId}/reset`, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReferrals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReferralUser(userId) });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Social graph — follows                                             */
/* ------------------------------------------------------------------ */

export function useFollowStatus(userId: string) {
  return useQuery({
    queryKey: ['follow-status', userId],
    queryFn: () => api.get<{ is_following: boolean }>(`/users/${userId}/follow/check`),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useFollowers(userId: string) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: () => api.get<{ data: any[]; links: any; meta: any }>(`/users/${userId}/followers`),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useFollowing(userId: string) {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: () => api.get<{ data: any[]; links: any; meta: any }>(`/users/${userId}/following`),
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'follow' | 'unfollow' }) => {
      const method = action === 'follow' ? 'POST' : 'DELETE';
      return api.request(`/users/${userId}/follow`, { method });
    },
    onMutate: async ({ userId, action }) => {
      await queryClient.cancelQueries({ queryKey: ['follow-status', userId] });
      const previous = queryClient.getQueryData<{ is_following: boolean }>(['follow-status', userId]);
      queryClient.setQueryData(['follow-status', userId], { is_following: action === 'follow' });
      return { previous };
    },
    onError: (err, { userId }, ctx) => {
      queryClient.setQueryData(['follow-status', userId], ctx?.previous);
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', userId] });
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Reactions                                                          */
/* ------------------------------------------------------------------ */

export function useReactions(reactionableType: string, reactionableId: string) {
  return useQuery({
    queryKey: ['reactions', reactionableType, reactionableId],
    queryFn: () =>
      api.get<{ counts: Record<string, number>; user_reaction: string | null }>('/reactions', {
        params: { reactionable_type: reactionableType, reactionable_id: reactionableId },
      }),
    enabled: !!reactionableType && !!reactionableId,
    staleTime: 1000 * 60,
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reactionableType,
      reactionableId,
      reactionType,
    }: {
      reactionableType: string;
      reactionableId: string;
      reactionType: string;
    }) => {
      return api.post('/reactions', {
        reactionable_type: reactionableType,
        reactionable_id: reactionableId,
        reaction_type: reactionType,
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['reactions', vars.reactionableType, vars.reactionableId],
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Comments                                                           */
/* ------------------------------------------------------------------ */

export function useComments(commentableType: string, commentableId: string) {
  return useQuery({
    queryKey: ['comments', commentableType, commentableId],
    queryFn: () =>
      api.get<{ data: any[]; links: any; meta: any }>('/comments', {
        params: { commentable_type: commentableType, commentable_id: commentableId },
      }),
    enabled: !!commentableType && !!commentableId,
    staleTime: 1000 * 30,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentableType,
      commentableId,
      content,
      parentId,
    }: {
      commentableType: string;
      commentableId: string;
      content: string;
      parentId?: string;
    }) => {
      return api.post('/comments', {
        commentable_type: commentableType,
        commentable_id: commentableId,
        content,
        ...(parentId ? { parent_id: parentId } : {}),
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', vars.commentableType, vars.commentableId],
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/comments/${id}`);
    },
  });
}

/* ------------------------------------------------------------------ */
/* Voice notes                                                        */
/* ------------------------------------------------------------------ */

function voiceNoteUrl(conversationId: string): string {
  const base = API_BASE.replace(/\/$/, '');
  const fullPath = `${base}/conversations/${conversationId}/voice-notes`;
  if (base.startsWith('http')) {
    return fullPath;
  }
  return new URL(fullPath, window.location.origin).toString();
}

export function useSendVoiceNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      file,
      durationSeconds,
    }: {
      conversationId: string;
      file: File;
      durationSeconds: number;
    }) => {
      const formData = new FormData();
      formData.append('voice', file);
      formData.append('duration_seconds', String(durationSeconds));
      const token = laravelAuth.getToken();
      const response = await fetch(voiceNoteUrl(conversationId), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(err.message || 'Failed to send voice note');
      }
      return response.json();
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
    },
  });
}
