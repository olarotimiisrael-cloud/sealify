import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapListingToListing } from "@/services/supabaseService";
import { appEnv } from "@/lib/env";

const API_BASE = appEnv.apiBase;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private authClient = supabase;

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
      const { data: { session } } = await this.authClient.auth.getSession();
      if (session?.access_token) {
        requestHeaders["Authorization"] = `Bearer ${session.access_token}`;
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
      const errorData = await response.json().catch(() => ({ message: "Request failed" }));
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
    const { data, error } = await this.authClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phoneNumber }, emailRedirectTo: `${window.location.origin}/verify` },
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.authClient.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  }

  async signOut() {
    await this.authClient.auth.signOut();
  }

  async resetPassword(email: string) {
    const { error } = await this.authClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  }

  async updatePassword(password: string) {
    const { error } = await this.authClient.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  }

  getSession() {
    return this.authClient.auth.getSession();
  }

  getUser() {
    return this.authClient.auth.getUser();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.authClient.auth.onAuthStateChange(callback);
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
  marketStats: () => ["market-stats"] as const,
  priceIndex: (category?: string) => ["price-index", category] as const,
  search: (query: string, filters?: any) => ["search", query, filters] as const,
  trending: () => ["trending"] as const,
  suggestions: (query: string) => ["suggestions", query] as const,
};

const listingSelect = "*, profiles!ads_seller_id_fkey(*), ad_images(image_url, sort_order)";

const mapListingUpdates = (updates: Record<string, any>) => {
  const fieldMap: Record<string, string> = {
    sellerId: "seller_id", categoryId: "category_id", subcategoryId: "subcategory_id", originalPrice: "original_price",
    videoUrl: "video_url", viewsCount: "views_count", promotionPlanName: "promotion_plan_name",
    promotionDurationMonths: "promotion_duration_months", promotionStartDate: "promotion_start_date",
    promotionEndDate: "promotion_end_date", paymentStatus: "payment_status", paymentProofUrl: "payment_proof_url",
    amountPaid: "amount_paid", createdAt: "created_at", updatedAt: "updated_at",
  };
  return Object.entries(updates).reduce((mapped: Record<string, any>, [key, value]) => {
    mapped[fieldMap[key] || key] = value;
    return mapped;
  }, {});
};

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Authentication required");
  return data.user.id;
};

const loadListings = async (sellerOnly = false) => {
  const userId = sellerOnly ? await getCurrentUserId() : null;
  let query = supabase.from("ads").select(listingSelect, { count: "exact" }).order("created_at", { ascending: false });
  if (sellerOnly && userId) query = query.eq("seller_id", userId);
  const { data, error, count } = await query;
  if (error) throw error;
  return { listings: (data || []).map(mapListingToListing), total: count || data?.length || 0 };
};

const loadConversationSummaries = async (userId: string) => {
  const { data: rows, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order("last_message_time", { ascending: false });
  if (error) throw error;

  return Promise.all((rows || []).map(async (row: any) => {
    const otherUserId = row.participant_1 === userId ? row.participant_2 : row.participant_1;
    const [adResult, profileResult] = await Promise.all([
      supabase.from("ads").select("id, title, price, images").eq("id", row.ad_id).maybeSingle(),
      supabase.from("profiles").select("id, full_name, avatar_url").eq("id", otherUserId).maybeSingle(),
    ]);
    return {
      id: row.id,
      listingId: row.ad_id,
      listingTitle: adResult.data?.title || "Marketplace ad",
      listingImage: adResult.data?.images?.[0] || "",
      listingPrice: Number(adResult.data?.price || 0),
      otherUser: { id: otherUserId, name: profileResult.data?.full_name || "Sealify user", avatar: profileResult.data?.avatar_url || "" },
      lastMessage: row.last_message || "",
      lastMessageTime: row.last_message_time || row.created_at,
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

  return { session: session?.data?.session, user: user?.data?.user, signIn, signUp, signOut };
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
      const { data, error } = await supabase.from("ads").select(listingSelect).eq("id", id).maybeSingle();
      if (error) throw error;
      return { listing: data ? mapListingToListing(data) : null };
    },
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const userId = await getCurrentUserId();
      const { data: created, error } = await supabase.from("ads").insert({
        seller_id: userId,
        category_id: data.categoryId || data.category_id || data.category || null,
        subcategory_id: data.subcategoryId || data.subcategory_id || null,
        title: data.title,
        description: data.description,
        price: data.price,
        original_price: data.originalPrice ?? data.original_price ?? null,
        condition: data.condition,
        location: data.location,
        status: "active",
        images: data.images || [],
        video_url: data.videoUrl || data.video_url || null,
        specifications: data.specifications || {},
      }).select(listingSelect).single();
      if (error) throw error;
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
      const { data: updated, error } = await supabase.from("ads").update(mapListingUpdates(data)).eq("id", id).select(listingSelect).single();
      if (error) throw error;
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
      const { error } = await supabase.from("ads").delete().eq("id", id);
      if (error) throw error;
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
      const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
      if (error) throw error;
      return {
        messages: (data || []).map((message: any) => ({
          id: message.id,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          listingId: message.ad_id,
          content: message.content,
          createdAt: message.created_at,
          isRead: Boolean(message.read),
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
    mutationFn: async ({ conversationId, receiverId, content }: { conversationId: string; receiverId: string; content: string }) => {
      const senderId = await getCurrentUserId();
      const { data: conversation, error: conversationError } = await supabase.from("conversations").select("*").eq("id", conversationId).single();
      if (conversationError) throw conversationError;
      const { data: message, error: messageError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        ad_id: conversation.ad_id,
        content: content.trim(),
        status: "sent",
        read: false,
      }).select().single();
      if (messageError) throw messageError;
      const unreadUpdate = conversation.participant_1 === receiverId
        ? { last_message: content.trim(), last_message_time: new Date().toISOString(), unread_count_1: Number(conversation.unread_count_1 || 0) + 1 }
        : { last_message: content.trim(), last_message_time: new Date().toISOString(), unread_count_2: Number(conversation.unread_count_2 || 0) + 1 };
      const { error: updateError } = await supabase.from("conversations").update(unreadUpdate).eq("id", conversationId);
      if (updateError) throw updateError;
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
      const userId = await getCurrentUserId();
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) throw error;
      const notifications = data || [];
      return { notifications, unreadCount: notifications.filter((notification: any) => !notification.read).length };
    },
    staleTime: 1000 * 30,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
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
      const userId = await getCurrentUserId();
      const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId);
      if (error) throw error;
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
