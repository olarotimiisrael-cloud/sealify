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
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: Partial<DbUser>): Promise<DbUser> {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id: string): Promise<void> {
    await supabase.from('users').delete().eq('id', id);
  }
};

// Listing Service
export const listingService = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        listing_images(image_url),
        users!seller_id(full_name, avatar_url, verified, verification_type, phone_number)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  async create(listing: any, imageUrls: string[]): Promise<void> {
    const { data, error } = await supabase.from('listings').insert([listing]).select().single();
    if (error) throw error;

    if (imageUrls.length > 0) {
      const images = imageUrls.map(url => ({
        listing_id: data.id,
        image_url: url
      }));
      await supabase.from('listing_images').insert(images);
    }
  },
  async update(id: string, updates: Partial<DbListing>): Promise<void> {
    const { error } = await supabase.from('listings').update(updates).eq('id', id);
    if (error) throw error;
  },
  async delete(id: string): Promise<void> {
    await supabase.from('listings').delete().eq('id', id);
  }
};

// Messaging
export const messageService = {
  async getConversations(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        listings(title, price, listing_images(image_url)),
        sender:users!sender_id(full_name, avatar_url),
        receiver:users!receiver_id(full_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  async sendMessage(msg: any) {
    const { data, error } = await supabase.from('messages').insert([msg]).select().single();
    if (error) throw error;
    return data;
  }
};

// Favorites / Saved Items
export const favoriteService = {
  async getByUserId(userId: string): Promise<string[]> {
    const { data } = await supabase.from('favorites').select('listing_id').eq('user_id', userId);
    return data?.map(f => f.listing_id) || [];
  },
  async toggle(userId: string, listingId: string) {
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .maybeSingle();

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('favorites').insert([{ user_id: userId, listing_id: listingId }]);
      return true;
    }
  }
};

// Notification Service
export const notificationService = {
  async getAll(userId: string): Promise<DbNotification[]> {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },
  async markRead(id: string) { await supabase.from('notifications').update({ read: true }).eq('id', id); },
  async clear(id: string) { await supabase.from('notifications').delete().eq('id', id); }
};

// Request Services
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

// Moderation & Support
export const disputeService = {
  async getAll(): Promise<DbDisputeCase[]> {
    const { data } = await supabase.from('disputes').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(disp: any) { await supabase.from('disputes').insert([disp]); },
  async updateStatus(id: string, status: string) { await supabase.from('disputes').update({ status }).eq('id', id); }
};

export const reportService = {
  async getAll(): Promise<DbReport[]> {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(rep: any) { await supabase.from('reports').insert([rep]); },
  async updateStatus(id: string, status: string) { await supabase.from('reports').update({ status }).eq('id', id); }
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

// Security & Logs
export const auditService = {
  async getAll(): Promise<DbAuditLog[]> {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(log: any) { await supabase.from('audit_logs').insert([log]); }
};

export const intrusionService = {
  async getAll(): Promise<DbIntrusionLog[]> {
    const { data } = await supabase.from('intrusion_logs').select('*').order('timestamp', { ascending: false });
    return data || [];
  },
  async create(log: any) { await supabase.from('intrusion_logs').insert([log]); }
};

// Config & Settings
export const announcementService = {
  async getAll(): Promise<DbAnnouncement[]> {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    return data || [];
  },
  async create(ann: any) { await supabase.from('announcements').insert([ann]); },
  async delete(id: string) { await supabase.from('announcements').delete().eq('id', id); }
};

export const searchAlertService = {
  async getAll(userId: string): Promise<DbSearchAlert[]> {
    const { data } = await supabase.from('search_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  },
  async create(alert: any) { await supabase.from('search_alerts').insert([alert]); },
  async delete(id: string) { await supabase.from('search_alerts').delete().eq('id', id); }
};

export const safeSpotService = {
  async getAll(): Promise<any[]> {
    const { data } = await supabase.from('safe_spots').select('*');
    return data || [];
  },
  async create(spot: any) { await supabase.from('safe_spots').insert([spot]); },
  async delete(id: string) { await supabase.from('safe_spots').delete().eq('id', id); }
};

export const systemConfigService = {
  async getAll(): Promise<any[]> {
    const { data } = await supabase.from('system_config').select('*');
    return data || [];
  },
  async update(key: string, value: boolean) { await supabase.from('system_config').upsert({ key, value }); }
};

export const siteSettingsService = {
  async get(): Promise<DbSiteSettings | null> {
    const { data } = await supabase.from('site_settings').select('*').maybeSingle();
    return data;
  },
  async update(settings: any) { await supabase.from('site_settings').upsert(settings); }
};

export const promotionPlanService = {
  async getAll(): Promise<any[]> {
    const { data } = await supabase.from('promotion_plans').select('*');
    return data || [];
  },
  async updateRate(months: number, rate: number) { await supabase.from('promotion_plans').update({ rate }).eq('months', months); }
};

export const recentDealsService = {
  async getAll(): Promise<DbRecentDeal[]> {
    const { data } = await supabase.from('recent_deals').select('*').order('time', { ascending: false });
    return data || [];
  },
  async create(deal: any) { await supabase.from('recent_deals').insert([deal]); }
};