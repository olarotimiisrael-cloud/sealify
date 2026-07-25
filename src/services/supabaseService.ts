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
    const raw = await handleResponse(supabase.from('users').select('*').order('created_at', { ascending: false }));
    if (!raw) return [];
    return raw.map((u: any) => ({
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      phoneNumber: u.phone_number,
      avatarUrl: u.avatar_url,
      storeBannerUrl: u.store_banner_url,
      bio: u.bio,
      role: u.role,
      verified: u.verified,
      verificationType: u.verification_type,
      businessName: u.business_name,
      cacNumber: u.cac_number,
      businessHours: u.business_hours,
      bankName: u.bank_name,
      accountNumber: u.account_number,
      accountName: u.account_name,
      websiteUrl: u.website_url,
      instagramHandle: u.instagram_handle,
      twitterHandle: u.twitter_handle,
      whatsappNumber: u.whatsapp_number,
      emailNotifications: u.email_notifications ?? true,
      whatsappNotifications: u.whatsapp_notifications ?? true,
      hidePhonePublicly: u.hide_phone_publicly ?? false,
      hideLocationPublicly: u.hide_location_publicly ?? false,
      memberSince: u.member_since,
      location: u.location,
      status: u.status,
      restrictionReason: u.restriction_reason,
      appealStatus: u.appeal_status
    }));
  },
  async getByEmail(email: string) { 
    const u = await handleResponse(supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle());
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      phoneNumber: u.phone_number,
      avatarUrl: u.avatar_url,
      storeBannerUrl: u.store_banner_url,
      bio: u.bio,
      role: u.role,
      verified: u.verified,
      verificationType: u.verification_type,
      businessName: u.business_name,
      cacNumber: u.cac_number,
      businessHours: u.business_hours,
      bankName: u.bank_name,
      accountNumber: u.account_number,
      accountName: u.account_name,
      websiteUrl: u.website_url,
      instagramHandle: u.instagram_handle,
      twitterHandle: u.twitter_handle,
      whatsappNumber: u.whatsapp_number,
      emailNotifications: u.email_notifications ?? true,
      whatsappNotifications: u.whatsapp_notifications ?? true,
      hidePhonePublicly: u.hide_phone_publicly ?? false,
      hideLocationPublicly: u.hide_location_publicly ?? false,
      memberSince: u.member_since,
      location: u.location,
      status: u.status
    };
  },
  async getProfile(id: string) { 
    const u = await handleResponse(supabase.from('users').select('*').eq('id', id).maybeSingle()); 
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      phoneNumber: u.phone_number,
      avatarUrl: u.avatar_url,
      storeBannerUrl: u.store_banner_url,
      bio: u.bio,
      role: u.role,
      verified: u.verified,
      verificationType: u.verification_type,
      businessName: u.business_name,
      cacNumber: u.cac_number,
      businessHours: u.business_hours,
      bankName: u.bank_name,
      accountNumber: u.account_number,
      accountName: u.account_name,
      websiteUrl: u.website_url,
      instagramHandle: u.instagram_handle,
      twitterHandle: u.twitter_handle,
      whatsappNumber: u.whatsapp_number,
      emailNotifications: u.email_notifications ?? true,
      whatsappNotifications: u.whatsapp_notifications ?? true,
      hidePhonePublicly: u.hide_phone_publicly ?? false,
      hideLocationPublicly: u.hide_location_publicly ?? false,
      memberSince: u.member_since,
      location: u.location,
      status: u.status
    };
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
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.storeBannerUrl !== undefined) dbUpdates.store_banner_url = updates.storeBannerUrl;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.verified !== undefined) dbUpdates.verified = updates.verified;
    if (updates.verificationType !== undefined) dbUpdates.verification_type = updates.verificationType;
    if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
    if (updates.cacNumber !== undefined) dbUpdates.cac_number = updates.cacNumber;
    if (updates.businessHours !== undefined) dbUpdates.business_hours = updates.businessHours;
    if (updates.bankName !== undefined) dbUpdates.bank_name = updates.bankName;
    if (updates.accountNumber !== undefined) dbUpdates.account_number = updates.accountNumber;
    if (updates.accountName !== undefined) dbUpdates.account_name = updates.accountName;
    if (updates.websiteUrl !== undefined) dbUpdates.website_url = updates.websiteUrl;
    if (updates.instagramHandle !== undefined) dbUpdates.instagram_handle = updates.instagramHandle;
    if (updates.twitterHandle !== undefined) dbUpdates.twitter_handle = updates.twitterHandle;
    if (updates.whatsappNumber !== undefined) dbUpdates.whatsapp_number = updates.whatsappNumber;
    if (updates.emailNotifications !== undefined) dbUpdates.email_notifications = updates.emailNotifications;
    if (updates.whatsappNotifications !== undefined) dbUpdates.whatsapp_notifications = updates.whatsappNotifications;
    if (updates.hidePhonePublicly !== undefined) dbUpdates.hide_phone_publicly = updates.hidePhonePublicly;
    if (updates.hideLocationPublicly !== undefined) dbUpdates.hide_location_publicly = updates.hideLocationPublicly;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    return await handleResponse(supabase.from('users').update(dbUpdates).eq('id', id).select().maybeSingle()); 
  },
  async create(user: any) { 
    return await handleResponse(supabase.from('users').insert([{
      id: user.id,
      email: user.email,
      full_name: user.full_name || user.fullName,
      phone_number: user.phone_number || user.phoneNumber,
      role: user.role || 'buyer',
      status: user.status || 'active',
      location: user.location || 'Ogbomoso, Oyo State',
      member_since: new Date().toISOString()
    }]).select().maybeSingle()); 
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

    const { data, error } = await supabase.from('listings').insert([{
      seller_id: listing.seller_id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      condition: listing.condition,
      location: listing.location,
      status: listing.status || 'active',
      featured: listing.featured || false,
      specifications: listing.specifications || {}
    }]).select().single();

    if (error) {
      console.warn('Supabase Listing Create Warning:', error.message || error);
    }

    const createdId = data?.id;

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