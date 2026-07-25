import { supabase } from '@/lib/supabase';

const handleResponse = async <T>(promise: PromiseLike<{ data: T | null; error: any }>) => {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
};

export const storageService = {
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
      cacheControl: '3600'
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  }
};

export const userService = {
  async getAll() { return handleResponse(supabase.from('users').select('*').order('created_at', { ascending: false })); },
  async getByEmail(email: string) { return handleResponse(supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle()); },
  async getProfile(id: string) { return handleResponse(supabase.from('users').select('*').eq('id', id).maybeSingle()); },
  async update(id: string, updates: any) { return handleResponse(supabase.from('users').update(updates).eq('id', id).select().single()); },
  async create(user: any) { return handleResponse(supabase.from('users').insert([user]).select().single()); },
  async delete(id: string) { await supabase.from('users').delete().eq('id', id); }
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
  async create(listing: any, imageUrls: string[]) {
    const data: any = await handleResponse(supabase.from('listings').insert([listing]).select().single());
    if (imageUrls.length > 0) {
      const imgRows = imageUrls.map(url => ({ listing_id: data.id, image_url: url }));
      await handleResponse(supabase.from('listing_images').insert(imgRows));
    }
    return data;
  },
  async update(id: string, updates: any) { await supabase.from('listings').update(updates).eq('id', id); },
  async delete(id: string) { await supabase.from('listings').delete().eq('id', id); }
};

export const messageService = {
  async getConversations(userId: string) {
    return handleResponse(supabase
      .from('messages')
      .select('*, listings:listing_id(id, title, price, listing_images(image_url)), sender:sender_id(full_name, avatar_url), receiver:receiver_id(full_name, avatar_url)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false }));
  },
  async sendMessage(msg: any) { await supabase.from('messages').insert([msg]); }
};

export const notificationService = {
  async getAll(userId: string) { return handleResponse(supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })); },
  async markRead(id: string) { await supabase.from('notifications').update({ read: true }).eq('id', id); },
  async clear(id: string) { await supabase.from('notifications').delete().eq('id', id); }
};

export const favoriteService = {
  async getByUserId(userId: string) {
    const data: any[] | null = await handleResponse(supabase.from('favorites').select('listing_id').eq('user_id', userId));
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