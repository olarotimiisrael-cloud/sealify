import { supabase } from '@/lib/supabase';

// Helper for unified error handling in production
// Using PromiseLike to support Supabase query builders
const handleResponse = async <T>(promise: PromiseLike<{ data: T | null; error: any }>) => {
  const { data, error } = await promise;
  if (error) {
    console.error('Supabase Execution Error:', error.message);
    throw error;
  }
  return data;
};

export const userService = {
  async getAll() {
    return handleResponse(supabase.from('users').select('*').order('created_at', { ascending: false }));
  },
  async getByEmail(email: string) {
    return handleResponse(supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle());
  },
  async getProfile(id: string) {
    return handleResponse(supabase.from('users').select('*').eq('id', id).maybeSingle());
  },
  async update(id: string, updates: any) {
    return handleResponse(supabase.from('users').update(updates).eq('id', id).select().single());
  },
  async create(user: any) {
    return handleResponse(supabase.from('users').insert([user]).select().single());
  },
  async delete(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  }
};

export const listingService = {
  async getAll() {
    return handleResponse(supabase
      .from('listings')
      .select('*, listing_images(image_url), users:seller_id(*)')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
    );
  },
  async create(listing: any, images: string[]) {
    const data: any = await handleResponse(supabase.from('listings').insert([listing]).select().single());
    if (images.length > 0) {
      const imgRows = images.map(url => ({ listing_id: data.id, image_url: url }));
      await handleResponse(supabase.from('listing_images').insert(imgRows));
    }
    return data;
  },
  async update(id: string, updates: any) {
    const { error } = await supabase.from('listings').update(updates).eq('id', id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) throw error;
  }
};

export const messageService = {
  async getConversations(userId: string) {
    return handleResponse(supabase
      .from('messages')
      .select('*, listings:listing_id(id, title, price, listing_images(image_url)), sender:sender_id(full_name, avatar_url), receiver:receiver_id(full_name, avatar_url)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false }));
  },
  async sendMessage(msg: any) {
    const { error } = await supabase.from('messages').insert([msg]);
    if (error) throw error;
  }
};

export const notificationService = {
  async getAll(userId: string) {
    return handleResponse(supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }));
  },
  async markRead(id: string) { 
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
  },
  async clear(id: string) { 
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
  }
};

export const favoriteService = {
  async getByUserId(userId: string) {
    const data: any[] | null = await handleResponse(supabase.from('favorites').select('listing_id').eq('user_id', userId));
    return data?.map((f: any) => f.listing_id) || [];
  }
};

export const verificationService = {
  async getAll() { return handleResponse(supabase.from('verification_requests').select('*').order('created_at', { ascending: false })); },
  async create(req: any) { 
    const { error } = await supabase.from('verification_requests').insert([req]);
    if (error) throw error;
  },
  async updateStatus(id: string, status: string) { 
    const { error } = await supabase.from('verification_requests').update({ status }).eq('id', id);
    if (error) throw error;
  }
};

export const passwordRequestService = {
  async getAll() { return handleResponse(supabase.from('password_change_requests').select('*').order('created_at', { ascending: false })); },
  async create(req: any) { 
    const { error } = await supabase.from('password_change_requests').insert([req]);
    if (error) throw error;
  },
  async updateStatus(id: string, status: string) { 
    const { error } = await supabase.from('password_change_requests').update({ status }).eq('id', id);
    if (error) throw error;
  }
};

export const promotionService = {
  async getAll() { return handleResponse(supabase.from('promotion_payments').select('*').order('created_at', { ascending: false })); },
  async create(req: any) { 
    const { error } = await supabase.from('promotion_payments').insert([req]);
    if (error) throw error;
  },
  async updateStatus(id: string, status: string) { 
    const { error } = await supabase.from('promotion_payments').update({ status }).eq('id', id);
    if (error) throw error;
  }
};

export const disputeService = {
  async getAll() { return handleResponse(supabase.from('disputes').select('*').order('created_at', { ascending: false })); },
  async create(disp: any) { 
    const { error } = await supabase.from('disputes').insert([disp]);
    if (error) throw error;
  },
  async updateStatus(id: string, status: string) { 
    const { error } = await supabase.from('disputes').update({ status }).eq('id', id);
    if (error) throw error;
  }
};

export const reportService = {
  async getAll() { return handleResponse(supabase.from('reports').select('*').order('created_at', { ascending: false })); },
  async create(rep: any) { 
    const { error } = await supabase.from('reports').insert([rep]);
    if (error) throw error;
  },
  async updateStatus(id: string, status: string) { 
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (error) throw error;
  }
};

export const auditService = {
  async getAll() { return handleResponse(supabase.from('audit_logs').select('*').order('created_at', { ascending: false })); },
  async create(log: any) { 
    const { error } = await supabase.from('audit_logs').insert([log]);
    if (error) throw error;
  }
};

export const intrusionService = {
  async getAll() { return handleResponse(supabase.from('intrusion_logs').select('*').order('timestamp', { ascending: false })); },
  async create(log: any) { 
    const { error } = await supabase.from('intrusion_logs').insert([log]);
    if (error) throw error;
  }
};

export const reviewService = {
  async getAll() { return handleResponse(supabase.from('reviews').select('*').order('created_at', { ascending: false })); },
  async create(rev: any) { 
    const { error } = await supabase.from('reviews').insert([rev]);
    if (error) throw error;
  },
  async delete(id: string) { 
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
  }
};

export const buyerRequestService = {
  async getAll() { return handleResponse(supabase.from('buyer_requests').select('*').order('created_at', { ascending: false })); },
  async create(req: any) { 
    const { error } = await supabase.from('buyer_requests').insert([req]);
    if (error) throw error;
  },
  async delete(id: string) { 
    const { error } = await supabase.from('buyer_requests').delete().eq('id', id);
    if (error) throw error;
  }
};

export const announcementService = {
  async getAll() { return handleResponse(supabase.from('announcements').select('*').order('created_at', { ascending: false })); },
  async create(ann: any) { 
    const { error } = await supabase.from('announcements').insert([ann]);
    if (error) throw error;
  },
  async delete(id: string) { 
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }
};

export const systemConfigService = {
  async getAll() { return handleResponse(supabase.from('system_config').select('*')); },
  async update(key: string, value: boolean) { 
    const { error } = await supabase.from('system_config').upsert({ key, value });
    if (error) throw error;
  }
};

export const siteSettingsService = {
  async get() { return handleResponse(supabase.from('site_settings').select('*').maybeSingle()); },
  async update(settings: any) { 
    const { error } = await supabase.from('site_settings').upsert(settings);
    if (error) throw error;
  }
};

export const promotionPlanService = {
  async getAll() { return handleResponse(supabase.from('promotion_plans').select('*')); },
  async updateRate(months: number, rate: number) { 
    const { error } = await supabase.from('promotion_plans').update({ rate }).eq('months', months);
    if (error) throw error;
  }
};

export const safeSpotService = {
  async getAll() { return handleResponse(supabase.from('safe_spots').select('*')); },
  async create(spot: any) { 
    const { error } = await supabase.from('safe_spots').insert([spot]);
    if (error) throw error;
  },
  async delete(id: string) { 
    const { error } = await supabase.from('safe_spots').delete().eq('id', id);
    if (error) throw error;
  }
};

export const searchAlertService = {
  async getAll(userId: string) { return handleResponse(supabase.from('search_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false })); },
  async create(alert: any) { 
    const { error } = await supabase.from('search_alerts').insert([alert]);
    if (error) throw error;
  },
  async delete(id: string) { 
    const { error } = await supabase.from('search_alerts').delete().eq('id', id);
    if (error) throw error;
  }
};

export const recentDealsService = {
  async getAll() { return handleResponse(supabase.from('recent_deals').select('*').order('time', { ascending: false })); },
  async create(deal: any) { 
    const { error } = await supabase.from('recent_deals').insert([deal]);
    if (error) throw error;
  }
};