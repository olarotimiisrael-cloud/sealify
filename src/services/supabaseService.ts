import { supabase } from '@/lib/supabase';

const handleResponse = async <T>(promise: PromiseLike<{ data: T | null; error: any }>): Promise<T | null> => {
  try {
    const { data, error } = await promise;
    if (error) {
      console.warn('Supabase Operation Warning:', error.message || error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase Connection Error:', err);
    return null;
  }
};

export const storageService = {
  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    try {
      const cleanPath = `${Date.now()}_${path.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { data, error } = await supabase.storage.from(bucket).upload(cleanPath, file, {
        upsert: true,
        cacheControl: '3600'
      });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return publicUrl;
    } catch (err) {
      // Data URL fallback if bucket is missing or restricted
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    }
  }
};

export const userService = {
  async getAll() { 
    return (await handleResponse(supabase.from('users').select('*').order('created_at', { ascending: false }))) || [];
  },
  async getByEmail(email: string) { 
    return await handleResponse(supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle()); 
  },
  async getProfile(id: string) { 
    return await handleResponse(supabase.from('users').select('*').eq('id', id).maybeSingle()); 
  },
  async ensureUserExists(userProfile: any) {
    if (!userProfile || !userProfile.id) return null;
    try {
      const existing = await handleResponse(supabase.from('users').select('id').eq('id', userProfile.id).maybeSingle());
      if (!existing) {
        return await handleResponse(
          supabase.from('users').upsert([{
            id: userProfile.id,
            email: userProfile.email || `${userProfile.id}@sealify.ng`,
            full_name: userProfile.fullName || userProfile.full_name || 'Verified Seller',
            phone_number: userProfile.phoneNumber || userProfile.phone_number || '',
            avatar_url: userProfile.avatarUrl || userProfile.avatar_url || '',
            role: userProfile.role || 'seller',
            verified: userProfile.verified || false,
            verification_type: userProfile.verificationType || userProfile.verification_type || 'none',
            location: userProfile.location || 'Ogbomoso, Oyo State'
          }]).select().maybeSingle()
        );
      }
      return existing;
    } catch (e) {
      console.warn('ensureUserExists error:', e);
      return null;
    }
  },
  async update(id: string, updates: any) { 
    return await handleResponse(supabase.from('users').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().maybeSingle()); 
  },
  async create(user: any) { 
    return await handleResponse(supabase.from('users').insert([{ ...user, member_since: new Date().toISOString() }]).select().maybeSingle()); 
  },
  async delete(id: string) { 
    await supabase.from('users').delete().eq('id', id); 
  }
};

export const listingService = {
  async getAll() {
    return (await handleResponse(
      supabase
        .from('listings')
        .select('*, listing_images(image_url), users:seller_id(*)')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
    )) || [];
  },
  async create(listing: any, imageUrls: string[]) {
    // 1. Ensure seller row exists in Supabase public.users to satisfy Foreign Key constraints
    if (listing.seller_id) {
      await userService.ensureUserExists({
        id: listing.seller_id,
        fullName: listing.sellerName,
        email: listing.sellerEmail,
        phoneNumber: listing.sellerPhone,
        avatarUrl: listing.sellerAvatar,
        verified: listing.sellerVerified,
        verificationType: listing.sellerVerificationType
      });
    }

    // 2. Insert post row into listings table
    const { data, error } = await supabase.from('listings').insert([listing]).select().single();
    if (error) {
      console.warn('Supabase Listing Create Warning:', error.message || error);
    }

    const createdId = data?.id;

    // 3. Insert images into listing_images table if createdId exists
    if (createdId && imageUrls.length > 0) {
      const imgRows = imageUrls.map(url => ({ listing_id: createdId, image_url: url }));
      await supabase.from('listing_images').insert(imgRows);
    }
    return data;
  },
  async update(id: string, updates: any) { 
    await supabase.from('listings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id); 
  },
  async delete(id: string) { 
    await supabase.from('listing_images').delete().eq('listing_id', id);
    await supabase.from('listings').delete().eq('id', id); 
  }
};

export const messageService = {
  async getConversations(userId: string) {
    return (await handleResponse(
      supabase
        .from('messages')
        .select('*, listings:listing_id(id, title, price, listing_images(image_url)), sender:sender_id(full_name, avatar_url), receiver:receiver_id(full_name, avatar_url)')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
    )) || [];
  },
  async sendMessage(msg: any) { 
    await supabase.from('messages').insert([msg]); 
  }
};

export const notificationService = {
  async getAll(userId: string) { 
    return (await handleResponse(supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }))) || [];
  },
  async markRead(id: string) { 
    await supabase.from('notifications').update({ read: true }).eq('id', id); 
  },
  async clear(id: string) { 
    await supabase.from('notifications').delete().eq('id', id); 
  },
  async create(notification: any) {
    await supabase.from('notifications').insert([notification]);
  }
};

export const favoriteService = {
  async getByUserId(userId: string) {
    const data = await handleResponse<any[]>(supabase.from('favorites').select('listing_id').eq('user_id', userId));
    return data?.map((f: any) => f.listing_id) || [];
  },
  async toggle(userId: string, listingId: string, exists: boolean) {
    if (exists) {
      await supabase.from('favorites').delete().match({ user_id: userId, listing_id: listingId });
    } else {
      await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId });
    }
  }
};

export const verificationService = {
  async getAll() { 
    return (await handleResponse(supabase.from('verification_requests').select('*').order('created_at', { ascending: false }))) || [];
  },
  async create(req: any) { 
    return await handleResponse(supabase.from('verification_requests').insert([req]).select().maybeSingle()); 
  },
  async updateStatus(id: string, status: string) { 
    await supabase.from('verification_requests').update({ status }).eq('id', id); 
  }
};

export const passwordRequestService = {
  async getAll() { 
    return (await handleResponse(supabase.from('password_change_requests').select('*').order('created_at', { ascending: false }))) || [];
  },
  async create(req: any) { 
    return await handleResponse(supabase.from('password_change_requests').insert([req]).select().maybeSingle()); 
  },
  async updateStatus(id: string, status: string) { 
    await supabase.from('password_change_requests').update({ status }).eq('id', id); 
  }
};

export const promotionService = {
  async getAll() { 
    return (await handleResponse(supabase.from('promotion_payments').select('*').order('created_at', { ascending: false }))) || [];
  },
  async create(req: any) { 
    return await handleResponse(supabase.from('promotion_payments').insert([req]).select().maybeSingle()); 
  },
  async updateStatus(id: string, status: string) { 
    await supabase.from('promotion_payments').update({ status }).eq('id', id); 
  }
};

export const disputeService = {
  async getAll() { 
    return (await handleResponse(supabase.from('disputes').select('*').order('created_at', { ascending: false }))) || [];
  },
  async create(disp: any) { 
    return await handleResponse(supabase.from('disputes').insert([disp]).select().maybeSingle()); 
  },
  async updateStatus(id: string, status: string) { 
    await supabase.from('disputes').update({ status }).eq('id', id); 
  }
};

export const reportService = {
  async getAll() { 
    return (await handleResponse(supabase.from('reports').select('*').order('created_at', { ascending: false }))) || [];
  },
  async create(rep: any) { 
    return await handleResponse(supabase.from('reports').insert([rep]).select().maybeSingle()); 
  },
  async updateStatus(id: string, status: string) { 
    await supabase.from('reports').update({ status }).eq('id', id); 
  }
};

export const auditService = {
  async getAll() { 
    return (await handleResponse(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }))) || [];
  },
  async create(log: any) { 
    await supabase.from('audit_logs').insert([log]); 
  }
};

export const reviewService = {
  async getAll() { 
    return (await handleResponse(supabase.from('reviews').select('*').order('created_at', { ascending: false }))) || [];
  },
  async create(rev: any) { 
    await supabase.from('reviews').insert([rev]); 
  },
  async delete(id: string) { 
    await supabase.from('reviews').delete().eq('id', id); 
  }
};

export const buyerRequestService = {
  async getAll() { 
    return (await handleResponse(supabase.from('buyer_requests').select('*').order('created_at', { ascending: false }))) || [];
  },
  async create(req: any) { 
    await supabase.from('buyer_requests').insert([req]); 
  },
  async delete(id: string) { 
    await supabase.from('buyer_requests').delete().eq('id', id); 
  }
};

export const announcementService = {
  async getAll() { 
    return (await handleResponse(supabase.from('announcements').select('*').order('created_at', { ascending: false }))) || [];
  },
  async create(ann: any) { 
    await supabase.from('announcements').insert([ann]); 
  },
  async delete(id: string) { 
    await supabase.from('announcements').delete().eq('id', id); 
  }
};

export const systemConfigService = {
  async getAll() { 
    return (await handleResponse(supabase.from('system_config').select('*'))) || [];
  },
  async update(key: string, value: any) { 
    await supabase.from('system_config').upsert([{ key, value, updated_at: new Date().toISOString() }]); 
  }
};

export const siteSettingsService = {
  async get() { 
    return await handleResponse(supabase.from('site_settings').select('*').maybeSingle()); 
  },
  async update(settings: any) { 
    await supabase.from('site_settings').upsert([{ id: 'global', ...settings, updated_at: new Date().toISOString() }]); 
  }
};

export const safeSpotService = {
  async getAll() { 
    return (await handleResponse(supabase.from('safe_spots').select('*'))) || [];
  },
  async create(spot: any) { 
    await supabase.from('safe_spots').insert([spot]); 
  },
  async delete(id: string) { 
    await supabase.from('safe_spots').delete().eq('id', id); 
  }
};

export const promotionPlanService = {
  async getAll() { 
    return (await handleResponse(supabase.from('promotion_plans').select('*'))) || [];
  },
  async update(months: number, rate: number) { 
    await supabase.from('promotion_plans').update({ rate }).eq('months', months); 
  }
};

export const searchAlertService = {
  async getAll(userId: string) { 
    return (await handleResponse(supabase.from('search_alerts').select('*').eq('user_id', userId))) || [];
  },
  async create(alert: any) { 
    await supabase.from('search_alerts').insert([alert]); 
  },
  async delete(id: string) { 
    await supabase.from('search_alerts').delete().eq('id', id); 
  }
};

export const intrusionService = {
  async getAll() { 
    return (await handleResponse(supabase.from('intrusion_logs').select('*').order('timestamp', { ascending: false }))) || [];
  },
  async create(log: any) { 
    await supabase.from('intrusion_logs').insert([log]); 
  }
};

export const recentDealsService = {
  async getAll() { 
    return (await handleResponse(supabase.from('recent_deals').select('*').order('created_at', { ascending: false }).limit(20))) || [];
  },
  async create(deal: any) { 
    await supabase.from('recent_deals').insert([deal]); 
  }
};