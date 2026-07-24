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
    if (error) {
      console.warn('Fallback: users table not found or restricted. Verify SQL schema.');
      return [];
    }
    return data || [];
  },

  async getByEmail(email: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) return null;
    return data;
  },

  async create(user: Omit<DbUser, 'id' | 'created_at' | 'updated_at'>): Promise<DbUser> {
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        ...user, 
        id: crypto.randomUUID(), 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }])
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
  }
};

// Listing Service
export const listingService = {
  async getAll(): Promise<DbListing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  async create(listing: Omit<DbListing, 'id' | 'created_at' | 'updated_at'>): Promise<DbListing> {
    const { data, error } = await supabase
      .from('listings')
      .insert([{ 
        ...listing, 
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }])
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
  }
};

// Announcement Service
export const announcementService = {
  async getAll(): Promise<DbAnnouncement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*');
    return data || [];
  },
  async create(ann: any) {
    const { data, error } = await supabase.from('announcements').insert([ann]).select().single();
    return data;
  },
  async update(id: string, updates: any) {
    await supabase.from('announcements').update(updates).eq('id', id);
  },
  async delete(id: string) {
    await supabase.from('announcements').delete().eq('id', id);
  }
};

// Audit Service
export const auditService = {
  async getAll(): Promise<DbAuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  },
  async create(log: any) {
    const { data, error } = await supabase.from('audit_logs').insert([log]).select().single();
    return data;
  }
};

// Other services kept as placeholders or minimal implementations for system flow
export const messageService = { async sendMessage(m: any) { return { id: 'msg_'+Date.now() }; } };
export const notificationService = { async create(n: any) {} };
export const verificationService = { async getAll() { return []; }, async create(r: any) { return r; }, async updateStatus(id: string, s: string) {}, subscribeToChanges(c: any) { return { unsubscribe: () => {} }; } };
export const passwordRequestService = { async getAll() { return []; }, async create(r: any) { return r; }, async updateStatus(id: string, s: string) {}, subscribeToChanges(c: any) { return { unsubscribe: () => {} }; } };
export const promotionService = { async getAll() { return []; }, async create(p: any) { return p; }, async updateStatus(id: string, s: string) {}, subscribeToChanges(c: any) { return { unsubscribe: () => {} }; } };
export const disputeService = { async getAll() { return []; }, async create(d: any) { return d; }, async updateStatus(id: string, s: string) {}, subscribeToChanges(c: any) { return { unsubscribe: () => {} }; } };
export const reportService = { async getAll() { return []; }, async create(r: any) { return r; }, async updateStatus(id: string, s: string) {}, subscribeToChanges(c: any) { return { unsubscribe: () => {} }; } };
export const reviewService = { async getAll() { return []; }, async create(r: any) { return r; }, async delete(id: string) {}, subscribeToChanges(c: any) { return { unsubscribe: () => {} }; } };
export const buyerRequestService = { async getAll() { return []; }, async create(r: any) { return r; }, async delete(id: string) {}, subscribeToChanges(c: any) { return { unsubscribe: () => {} }; } };
export const searchAlertService = { async create(a: any) {}, async delete(id: string) {} };
export const systemConfigService = { async getAll() { return []; }, async update(k: string, v: boolean) {}, subscribeToChanges(c: any) { return { unsubscribe: () => {} }; } };
export const siteSettingsService = { async get() { return null; }, async update(s: any) {} };
export const intrusionService = { async getAll() { return []; }, async create(l: any) { return l; }, subscribeToChanges(c: any) { return { unsubscribe: () => {} }; } };
export const recentDealsService = { async getAll() { return []; }, async create(d: any) { return d; } };
export const adminStatsService = { async getDashboardStats() { return {}; } };