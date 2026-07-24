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
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async getByEmail(email: string): Promise<DbUser | null> {
    const { data } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    return data;
  },
  async create(user: Omit<DbUser, 'id' | 'created_at' | 'updated_at'>): Promise<DbUser> {
    const { data, error } = await supabase.from('users').insert([{ ...user, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: Partial<DbUser>): Promise<DbUser> {
    const { data, error } = await supabase.from('users').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id: string): Promise<void> {
    await supabase.from('users').delete().eq('id', id);
  }
};

// Listing Service
export const listingService = {
  async getAll(): Promise<DbListing[]> {
    const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(listing: Omit<DbListing, 'id' | 'created_at' | 'updated_at'>): Promise<DbListing> {
    const { data, error } = await supabase.from('listings').insert([{ ...listing, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: Partial<DbListing>): Promise<DbListing> {
    const { data, error } = await supabase.from('listings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id: string): Promise<void> {
    await supabase.from('listings').delete().eq('id', id);
  }
};

// Messaging & Conversations
export const messageService = {
  async getConversations(userId: string): Promise<DbConversation[]> {
    const { data } = await supabase.from('conversations').select('*').or(`participant_1.eq.${userId},participant_2.eq.${userId}`).order('updated_at', { ascending: false });
    return data || [];
  },
  async sendMessage(msg: any) {
    const { data, error } = await supabase.from('messages').insert([{ ...msg, read: false, created_at: new Date().toISOString() }]).select().single();
    if (error) throw error;
    return data;
  }
};

// Notifications
export const notificationService = {
  async create(notif: any) {
    await supabase.from('notifications').insert([{ ...notif, read: false, created_at: new Date().toISOString() }]);
  }
};

// Admin & Support Services
export const verificationService = {
  async getAll(): Promise<DbVerificationRequest[]> {
    const { data } = await supabase.from('verification_requests').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(req: any) { await supabase.from('verification_requests').insert([req]); },
  async updateStatus(id: string, status: string) { await supabase.from('verification_requests').update({ status }).eq('id', id); }
};

export const passwordRequestService = {
  async getAll(): Promise<DbPasswordRequest[]> {
    const { data } = await supabase.from('password_change_requests').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(req: any) { await supabase.from('password_change_requests').insert([req]); },
  async updateStatus(id: string, status: string) { await supabase.from('password_change_requests').update({ status }).eq('id', id); }
};

export const promotionService = {
  async getAll(): Promise<DbPromotionPayment[]> {
    const { data } = await supabase.from('promotion_payments').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(req: any) { await supabase.from('promotion_payments').insert([req]); },
  async updateStatus(id: string, status: string) { await supabase.from('promotion_payments').update({ status }).eq('id', id); }
};

export const disputeService = {
  async getAll(): Promise<DbDisputeCase[]> {
    const { data } = await supabase.from('dispute_cases').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(disp: any) { await supabase.from('dispute_cases').insert([disp]); },
  async updateStatus(id: string, status: string) { await supabase.from('dispute_cases').update({ status }).eq('id', id); }
};

export const reportService = {
  async getAll(): Promise<DbReport[]> {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(rep: any) { await supabase.from('reports').insert([rep]); },
  async updateStatus(id: string, status: string) { await supabase.from('reports').update({ status }).eq('id', id); }
};

export const auditService = {
  async getAll(): Promise<DbAuditLog[]> {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(log: any) {
    const { data } = await supabase.from('audit_logs').insert([log]).select().single();
    return data;
  }
};

export const reviewService = {
  async getAll(): Promise<DbReview[]> {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(rev: any) { await supabase.from('reviews').insert([rev]); },
  async delete(id: string) { await supabase.from('reviews').delete().eq('id', id); }
};

export const buyerRequestService = {
  async getAll(): Promise<DbBuyerRequest[]> {
    const { data } = await supabase.from('buyer_requests').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(req: any) { await supabase.from('buyer_requests').insert([req]); },
  async delete(id: string) { await supabase.from('buyer_requests').delete().eq('id', id); }
};

export const intrusionService = {
  async getAll(): Promise<DbIntrusionLog[]> {
    const { data } = await supabase.from('intrusion_logs').select('*').order('timestamp', { ascending: false });
    return data || [];
  },
  async create(log: any) { await supabase.from('intrusion_logs').insert([log]); }
};

export const announcementService = {
  async getAll(): Promise<DbAnnouncement[]> {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    return data || [];
  }
};

export const searchAlertService = {
  async create(alert: any) { await supabase.from('search_alerts').insert([alert]); },
  async delete(id: string) { await supabase.from('search_alerts').delete().eq('id', id); }
};

export const systemConfigService = {
  async getAll(): Promise<DbSystemConfig[]> {
    const { data } = await supabase.from('system_config').select('*');
    return data || [];
  },
  async update(key: string, value: boolean) { await supabase.from('system_config').upsert({ key, value, updated_at: new Date().toISOString() }); }
};

export const siteSettingsService = {
  async get(): Promise<DbSiteSettings | null> {
    const { data } = await supabase.from('site_settings').select('*').single();
    return data;
  },
  async update(settings: Partial<DbSiteSettings>) { await supabase.from('site_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('id', 'global'); }
};

export const recentDealsService = {
  async getAll(): Promise<DbRecentDeal[]> {
    const { data } = await supabase.from('recent_deals').select('*').order('time', { ascending: false });
    return data || [];
  },
  async create(deal: any) { await supabase.from('recent_deals').insert([deal]); }
};

export const adminStatsService = {
  async getDashboardStats() { return { totalRevenue: 2400000, activePromos: 42 }; }
};