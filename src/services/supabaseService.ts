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
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async getByEmail(email: string): Promise<DbUser | null> {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
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
    const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
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

// Request Management Services
export const verificationService = {
  async getAll(): Promise<DbVerificationRequest[]> {
    const { data } = await supabase.from('verification_requests').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async updateStatus(id: string, status: string) {
    await supabase.from('verification_requests').update({ status }).eq('id', id);
  }
};

export const passwordRequestService = {
  async getAll(): Promise<DbPasswordRequest[]> {
    const { data } = await supabase.from('password_change_requests').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async updateStatus(id: string, status: string) {
    await supabase.from('password_change_requests').update({ status }).eq('id', id);
  }
};

export const promotionService = {
  async getAll(): Promise<DbPromotionPayment[]> {
    const { data } = await supabase.from('promotion_payments').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async updateStatus(id: string, status: string) {
    await supabase.from('promotion_payments').update({ status }).eq('id', id);
  }
};

export const disputeService = {
  async getAll(): Promise<DbDisputeCase[]> {
    const { data } = await supabase.from('dispute_cases').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async updateStatus(id: string, status: string) {
    await supabase.from('dispute_cases').update({ status }).eq('id', id);
  }
};

export const reportService = {
  async getAll(): Promise<DbReport[]> {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async updateStatus(id: string, status: string) {
    await supabase.from('reports').update({ status }).eq('id', id);
  }
};

// Audit & Metadata
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
  async delete(id: string) {
    await supabase.from('reviews').delete().eq('id', id);
  }
};

export const buyerRequestService = {
  async getAll(): Promise<DbBuyerRequest[]> {
    const { data } = await supabase.from('buyer_requests').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async delete(id: string) {
    await supabase.from('buyer_requests').delete().eq('id', id);
  }
};

export const intrusionService = {
  async getAll(): Promise<DbIntrusionLog[]> {
    const { data } = await supabase.from('intrusion_logs').select('*').order('timestamp', { ascending: false });
    return data || [];
  }
};

export const announcementService = {
  async getAll(): Promise<DbAnnouncement[]> {
    const { data } = await supabase.from('announcements').select('*');
    return data || [];
  }
};

// Stubs for message/notification flow
export const messageService = { async sendMessage(m: any) {} };
export const notificationService = { async create(n: any) {} };
export const searchAlertService = { async create(a: any) {}, async delete(id: string) {} };
export const systemConfigService = { async getAll() { return []; }, async update(k: string, v: boolean) {} };
export const siteSettingsService = { async get() { return null; }, async update(s: any) {} };
export const recentDealsService = { async getAll() { return []; } };