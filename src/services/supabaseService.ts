import { supabase } from '@/lib/supabase';

// Helper to catch 'relation does not exist' and return empty array
const safeQuery = async (query: any) => {
  const { data, error } = await query;
  if (error && error.code === 'PGRST116') return null; // No rows
  if (error && error.code === '42P01') return []; // Table missing
  if (error) throw error;
  return data;
};

export const userService = {
  async getAll(): Promise<any[]> {
    return (await safeQuery(supabase.from('users').select('*').order('created_at', { ascending: false }))) || [];
  },
  async getByEmail(email: string): Promise<any | null> {
    const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
    if (error && error.code === '42P01') return null;
    return data;
  },
  async create(user: any) {
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    await supabase.from('users').delete().eq('id', id);
  }
};

export const listingService = {
  async getAll(): Promise<any[]> {
    return (await safeQuery(supabase.from('listings').select('*, listing_images(image_url), users:seller_id(full_name, avatar_url, verified, verification_type, phone_number, business_name)').order('created_at', { ascending: false }))) || [];
  },
  async create(listing: any, imageUrls: string[]) {
    const { data, error } = await supabase.from('listings').insert([listing]).select().single();
    if (error) throw error;
    if (imageUrls.length > 0) {
      const images = imageUrls.map(url => ({ listing_id: data.id, image_url: url }));
      await supabase.from('listing_images').insert(images);
    }
    return data;
  },
  async update(id: string, updates: any) {
    await supabase.from('listings').update(updates).eq('id', id);
  },
  async delete(id: string) {
    await supabase.from('listings').delete().eq('id', id);
  }
};

export const messageService = {
  async getConversations(userId: string): Promise<any[]> {
    return (await safeQuery(supabase.from('messages').select('*, listings:listing_id(id, title, price, listing_images(image_url)), sender:sender_id(full_name, avatar_url), receiver:receiver_id(full_name, avatar_url)').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at', { ascending: false }))) || [];
  },
  async sendMessage(msg: any) {
    await supabase.from('messages').insert([msg]);
  }
};

export const favoriteService = {
  async getByUserId(userId: string): Promise<string[]> {
    const data = await safeQuery(supabase.from('favorites').select('listing_id').eq('user_id', userId));
    return data?.map((f: any) => f.listing_id) || [];
  },
  async toggle(userId: string, listingId: string) {
    const { data: existing } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('listing_id', listingId).maybeSingle();
    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('favorites').insert([{ user_id: userId, listing_id: listingId }]);
      return true;
    }
  }
};

export const notificationService = {
  async getAll(userId: string): Promise<any[]> {
    return (await safeQuery(supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }))) || [];
  },
  async markRead(id: string) { await supabase.from('notifications').update({ read: true }).eq('id', id); },
  async clear(id: string) { await supabase.from('notifications').delete().eq('id', id); }
};

export const verificationService = {
  async getAll() { return (await safeQuery(supabase.from('verification_requests').select('*').order('created_at', { ascending: false }))) || []; },
  async create(req: any) { await supabase.from('verification_requests').insert([req]); },
  async updateStatus(id: string, status: string) { await supabase.from('verification_requests').update({ status }).eq('id', id); }
};

export const passwordRequestService = {
  async getAll() { return (await safeQuery(supabase.from('password_change_requests').select('*').order('created_at', { ascending: false }))) || []; },
  async create(req: any) { await supabase.from('password_change_requests').insert([req]); },
  async updateStatus(id: string, status: string) { await supabase.from('password_change_requests').update({ status }).eq('id', id); }
};

export const promotionService = {
  async getAll() { return (await safeQuery(supabase.from('promotion_payments').select('*').order('created_at', { ascending: false }))) || []; },
  async create(req: any) { await supabase.from('promotion_payments').insert([req]); },
  async updateStatus(id: string, status: string) { await supabase.from('promotion_payments').update({ status }).eq('id', id); }
};

export const disputeService = {
  async getAll() { return (await safeQuery(supabase.from('disputes').select('*').order('created_at', { ascending: false }))) || []; },
  async create(disp: any) { await supabase.from('disputes').insert([disp]); },
  async updateStatus(id: string, status: string) { await supabase.from('disputes').update({ status }).eq('id', id); }
};

export const reportService = {
  async getAll() { return (await safeQuery(supabase.from('reports').select('*').order('created_at', { ascending: false }))) || []; },
  async create(rep: any) { await supabase.from('reports').insert([rep]); },
  async updateStatus(id: string, status: string) { await supabase.from('reports').update({ status }).eq('id', id); }
};

export const reviewService = {
  async getAll() { return (await safeQuery(supabase.from('reviews').select('*').order('created_at', { ascending: false }))) || []; },
  async create(rev: any) { await supabase.from('reviews').insert([rev]); },
  async delete(id: string) { await supabase.from('reviews').delete().eq('id', id); }
};

export const buyerRequestService = {
  async getAll() { return (await safeQuery(supabase.from('buyer_requests').select('*').order('created_at', { ascending: false }))) || []; },
  async create(req: any) { await supabase.from('buyer_requests').insert([req]); },
  async delete(id: string) { await supabase.from('buyer_requests').delete().eq('id', id); }
};

export const auditService = {
  async getAll() { return (await safeQuery(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }))) || []; },
  async create(log: any) { await supabase.from('audit_logs').insert([log]); }
};

export const intrusionService = {
  async getAll() { return (await safeQuery(supabase.from('intrusion_logs').select('*').order('timestamp', { ascending: false }))) || []; },
  async create(log: any) { await supabase.from('intrusion_logs').insert([log]); }
};

export const announcementService = {
  async getAll() { return (await safeQuery(supabase.from('announcements').select('*').order('created_at', { ascending: false }))) || []; },
  async create(ann: any) { await supabase.from('announcements').insert([ann]); },
  async delete(id: string) { await supabase.from('announcements').delete().eq('id', id); }
};

export const searchAlertService = {
  async getAll(userId: string) { return (await safeQuery(supabase.from('search_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false }))) || []; },
  async create(alert: any) { await supabase.from('search_alerts').insert([alert]); },
  async delete(id: string) { await supabase.from('search_alerts').delete().eq('id', id); }
};

export const safeSpotService = {
  async getAll() { return (await safeQuery(supabase.from('safe_spots').select('*'))) || []; },
  async create(spot: any) { await supabase.from('safe_spots').insert([spot]); },
  async delete(id: string) { await supabase.from('safe_spots').delete().eq('id', id); }
};

export const systemConfigService = {
  async getAll() { return (await safeQuery(supabase.from('system_config').select('*'))) || []; },
  async update(key: string, value: boolean) { await supabase.from('system_config').upsert({ key, value }); }
};

export const siteSettingsService = {
  async get() { const data = await safeQuery(supabase.from('site_settings').select('*').maybeSingle()); return data; },
  async update(settings: any) { await supabase.from('site_settings').upsert(settings); }
};

export const promotionPlanService = {
  async getAll() { return (await safeQuery(supabase.from('promotion_plans').select('*'))) || []; },
  async updateRate(months: number, rate: number) { await supabase.from('promotion_plans').update({ rate }).eq('months', months); }
};

export const recentDealsService = {
  async getAll() { return (await safeQuery(supabase.from('recent_deals').select('*').order('time', { ascending: false }))) || []; },
  async create(deal: any) { await supabase.from('recent_deals').insert([deal]); }
};