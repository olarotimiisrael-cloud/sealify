import { supabase } from '@/lib/supabase';
import type { 
  DbUser, DbListing, DbMessage, DbConversation, DbNotification,
  DbVerificationRequest, DbPasswordRequest, DbPromotionPayment,
  DbDisputeCase, DbReport, DbAuditLog, DbReview, DbBuyerRequest,
  DbSearchAlert, DbAnnouncement, DbSystemConfig, DbSiteSettings,
  DbIntrusionLog, DbRecentDeal
} from '@/lib/supabase';

// User Service
export const userService = {
  async getAll(): Promise<DbUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async getByEmail(email: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error) return null;
    return data;
  },

  async create(user: Omit<DbUser, 'id' | 'created_at' | 'updated_at'>): Promise<DbUser> {
    const { data, error } = await supabase
      .from('users')
      .insert([{ ...user, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DbUser>): Promise<DbUser> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, callback)
      .subscribe();
  }
};

// Listing Service
export const listingService = {
  async getAll(): Promise<DbListing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<DbListing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  async getBySeller(sellerId: string): Promise<DbListing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(listing: Omit<DbListing, 'id' | 'created_at' | 'updated_at'>): Promise<DbListing> {
    const { data, error } = await supabase
      .from('listings')
      .insert([{ ...listing, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DbListing>): Promise<DbListing> {
    const { data, error } = await supabase
      .from('listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async incrementViews(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_views', { listing_id: id });
    if (error) console.error('Failed to increment views:', error);
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('listings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, callback)
      .subscribe();
  }
};

// Message Service
export const messageService = {
  async getConversations(userId: string): Promise<DbConversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getMessages(conversationId: string): Promise<DbMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async sendMessage(message: Omit<DbMessage, 'id' | 'created_at' | 'read'>): Promise<DbMessage> {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ ...message, read: false, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    
    // Update conversation last message
    await supabase
      .from('conversations')
      .update({ 
        last_message: message.content, 
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', message.conversation_id || '');
    
    return data;
  },

  async createConversation(conversation: Omit<DbConversation, 'id' | 'created_at' | 'updated_at'>): Promise<DbConversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ ...conversation, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToMessages(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages_${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};

// Notification Service
export const notificationService = {
  async getByUser(userId: string): Promise<DbNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(notification: Omit<DbNotification, 'id' | 'created_at'>): Promise<DbNotification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...notification, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (error) throw error;
  },

  async markAllRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  subscribeToUserNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications_${userId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};

// Verification Request Service
export const verificationService = {
  async getAll(): Promise<DbVerificationRequest[]> {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPending(): Promise<DbVerificationRequest[]> {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(request: Omit<DbVerificationRequest, 'id' | 'created_at'>): Promise<DbVerificationRequest> {
    const { data, error } = await supabase
      .from('verification_requests')
      .insert([{ ...request, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<DbVerificationRequest> {
    const { data, error } = await supabase
      .from('verification_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('verification_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verification_requests' }, callback)
      .subscribe();
  }
};

// Password Request Service
export const passwordRequestService = {
  async getAll(): Promise<DbPasswordRequest[]> {
    const { data, error } = await supabase
      .from('password_change_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPending(): Promise<DbPasswordRequest[]> {
    const { data, error } = await supabase
      .from('password_change_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(request: Omit<DbPasswordRequest, 'id' | 'created_at'>): Promise<DbPasswordRequest> {
    const { data, error } = await supabase
      .from('password_change_requests')
      .insert([{ ...request, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'approved' | 'declined'): Promise<DbPasswordRequest> {
    const { data, error } = await supabase
      .from('password_change_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('password_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'password_change_requests' }, callback)
      .subscribe();
  }
};

// Promotion Payment Service
export const promotionService = {
  async getAll(): Promise<DbPromotionPayment[]> {
    const { data, error } = await supabase
      .from('promotion_payments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPending(): Promise<DbPromotionPayment[]> {
    const { data, error } = await supabase
      .from('promotion_payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(payment: Omit<DbPromotionPayment, 'id' | 'created_at'>): Promise<DbPromotionPayment> {
    const { data, error } = await supabase
      .from('promotion_payments')
      .insert([{ ...payment, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<DbPromotionPayment> {
    const { data, error } = await supabase
      .from('promotion_payments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('promotion_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotion_payments' }, callback)
      .subscribe();
  }
};

// Dispute Service
export const disputeService = {
  async getAll(): Promise<DbDisputeCase[]> {
    const { data, error } = await supabase
      .from('dispute_cases')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<DbDisputeCase[]> {
    const { data, error } = await supabase
      .from('dispute_cases')
      .select('*')
      .neq('status', 'resolved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(dispute: Omit<DbDisputeCase, 'id' | 'created_at'>): Promise<DbDisputeCase> {
    const { data, error } = await supabase
      .from('dispute_cases')
      .insert([{ ...dispute, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'pending' | 'in_review' | 'resolved'): Promise<DbDisputeCase> {
    const { data, error } = await supabase
      .from('dispute_cases')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('dispute_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dispute_cases' }, callback)
      .subscribe();
  }
};

// Report Service
export const reportService = {
  async getAll(): Promise<DbReport[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPending(): Promise<DbReport[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(report: Omit<DbReport, 'id' | 'created_at'>): Promise<DbReport> {
    const { data, error } = await supabase
      .from('reports')
      .insert([{ ...report, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'resolved' | 'dismissed'): Promise<DbReport> {
    const { data, error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('report_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, callback)
      .subscribe();
  }
};

// Audit Log Service
export const auditService = {
  async getAll(): Promise<DbAuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(log: Omit<DbAuditLog, 'id' | 'created_at'>): Promise<DbAuditLog> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{ ...log, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('audit_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, callback)
      .subscribe();
  }
};

// Review Service
export const reviewService = {
  async getBySeller(sellerId: string): Promise<DbReview[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAll(): Promise<DbReview[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(review: Omit<DbReview, 'id' | 'created_at'>): Promise<DbReview> {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ ...review, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('review_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, callback)
      .subscribe();
  }
};

// Buyer Request Service
export const buyerRequestService = {
  async getAll(): Promise<DbBuyerRequest[]> {
    const { data, error } = await supabase
      .from('buyer_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(request: Omit<DbBuyerRequest, 'id' | 'created_at' | 'responses_count'>): Promise<DbBuyerRequest> {
    const { data, error } = await supabase
      .from('buyer_requests')
      .insert([{ ...request, responses_count: 0, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('buyer_requests')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('buyer_request_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'buyer_requests' }, callback)
      .subscribe();
  }
};

// Search Alert Service
export const searchAlertService = {
  async getByUser(userId: string): Promise<DbSearchAlert[]> {
    const { data, error } = await supabase
      .from('search_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(alert: Omit<DbSearchAlert, 'id' | 'created_at' | 'match_count'>): Promise<DbSearchAlert> {
    const { data, error } = await supabase
      .from('search_alerts')
      .insert([{ ...alert, match_count: 0, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('search_alerts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Announcement Service
export const announcementService = {
  async getAll(): Promise<DbAnnouncement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getActive(): Promise<DbAnnouncement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(announcement: Omit<DbAnnouncement, 'id' | 'created_at'> & { created_at?: string }): Promise<DbAnnouncement> {
    const { data, error } = await supabase
      .from('announcements')
      .insert([{ created_at: new Date().toISOString(), ...announcement }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DbAnnouncement>): Promise<DbAnnouncement> {
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('announcement_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, callback)
      .subscribe();
  }
};

// System Config Service
export const systemConfigService = {
  async getAll(): Promise<DbSystemConfig[]> {
    const { data, error } = await supabase
      .from('system_config')
      .select('*');
    if (error) throw error;
    return data || [];
  },

  async update(key: string, value: boolean): Promise<DbSystemConfig> {
    const { data, error } = await supabase
      .from('system_config')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('system_config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_config' }, callback)
      .subscribe();
  }
};

// Site Settings Service
export const siteSettingsService = {
  async get(): Promise<DbSiteSettings | null> {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    if (error) return null;
    return data;
  },

  async update(settings: Partial<DbSiteSettings>): Promise<DbSiteSettings> {
    const { data, error } = await supabase
      .from('site_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', '1')
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// Intrusion Log Service
export const intrusionService = {
  async getAll(): Promise<DbIntrusionLog[]> {
    const { data, error } = await supabase
      .from('intrusion_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(log: Omit<DbIntrusionLog, 'id'>): Promise<DbIntrusionLog> {
    const { data, error } = await supabase
      .from('intrusion_logs')
      .insert([log])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('intrusion_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'intrusion_logs' }, callback)
      .subscribe();
  }
};

// Recent Deals Service
export const recentDealsService = {
  async getAll(): Promise<DbRecentDeal[]> {
    const { data, error } = await supabase
      .from('recent_deals')
      .select('*')
      .order('time', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data || [];
  },

  async create(deal: Omit<DbRecentDeal, 'id'>): Promise<DbRecentDeal> {
    const { data, error } = await supabase
      .from('recent_deals')
      .insert([deal])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('recent_deals_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'recent_deals' }, callback)
      .subscribe();
  }
};

// Admin Stats Service
export const adminStatsService = {
  async getDashboardStats() {
    const [
      { count: totalUsers },
      { count: totalListings },
      { count: activeListings },
      { count: totalMessages },
      { count: pendingVerifications },
      { count: pendingPasswords },
      { count: pendingPromotions },
      { count: activeDisputes },
      { count: pendingReports }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('password_change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('promotion_payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('dispute_cases').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    return {
      totalUsers: totalUsers || 0,
      totalListings: totalListings || 0,
      activeListings: activeListings || 0,
      totalMessages: totalMessages || 0,
      pendingVerifications: pendingVerifications || 0,
      pendingPasswords: pendingPasswords || 0,
      pendingPromotions: pendingPromotions || 0,
      activeDisputes: activeDisputes || 0,
      pendingReports: pendingReports || 0
    };
  }
};