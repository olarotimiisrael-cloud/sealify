import { supabase } from '../lib/supabase';
import { 
  DbUser, 
  DbListing, 
  DbVerificationRequest, 
  DbPasswordRequest, 
  DbPromotionPayment, 
  DbReport, 
  DbAuditLog, 
  DbDisputeCase, 
  DbSiteSettings, 
  DbSearchAlert, 
  DbReview, 
  DbCategoryStats, 
  DbBuyerRequest, 
  DbWallet, 
  DbTransaction,
  DbSafeSpot,
  DbSystemAnnouncement,
  DbMarketplaceDeal,
  DbCategory,
  DbSubcategory,
  DbSystemConfig,
  DbPromotionPlan,
  DbIntrusionLog
} from '../types/sealify';
import { toast } from 'sonner';

const handleSupabaseError = (error: any, operation: string) => {
  console.error(`[Supabase Error] ${operation}:`, error);
  toast.error(`Database error: ${error?.message || 'Unknown error'}`);
  throw error;
};

export const userService = {
  getProfile: async (id: string): Promise<DbUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) handleSupabaseError(error, 'getProfile');
      return data;
    } catch (e) {
      console.error('getProfile failed:', e);
      return null;
    }
  },
  
  getAll: async (): Promise<DbUser[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) handleSupabaseError(error, 'getAllUsers');
      return data || [];
    } catch (e) {
      console.error('getAllUsers failed:', e);
      return [];
    }
  },
  
  create: async (profile: Partial<DbUser>): Promise<DbUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([profile])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createUser');
      return data;
    } catch (e) {
      console.error('createUser failed:', e);
      return null;
    }
  },
  
  update: async (id: string, updates: Partial<DbUser>): Promise<DbUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'updateUser');
      return data;
    } catch (e) {
      console.error('updateUser failed:', e);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) handleSupabaseError(error, 'deleteUser');
      return true;
    } catch (e) {
      console.error('deleteUser failed:', e);
      return false;
    }
  }
};

export const listingService = {
  getAll: async (): Promise<DbListing[]> => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          users!listings_seller_id_fkey(*),
          listing_images(image_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) handleSupabaseError(error, 'getAllListings');
      return data || [];
    } catch (e) {
      console.error('getAllListings failed:', e);
      return [];
    }
  },
  
  create: async (listing: Partial<DbListing>, images: string[]): Promise<DbListing | null> => {
    try {
      const { data: newListing, error } = await supabase
        .from('listings')
        .insert([listing])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createListing');
      if (!newListing) return null;
      
      if (images && images.length > 0) {
        const imageInserts = images.map((url, index) => ({
          listing_id: newListing.id,
          image_url: url,
          sort_order: index
        }));
        const { error: imgError } = await supabase.from('listing_images').insert(imageInserts);
        if (imgError) console.error('Image insert error:', imgError);
      }
      
      return newListing;
    } catch (e) {
      console.error('createListing failed:', e);
      return null;
    }
  },
  
  update: async (id: string, updates: Partial<DbListing>): Promise<DbListing | null> => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'updateListing');
      return data;
    } catch (e) {
      console.error('updateListing failed:', e);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);
      
      if (error) handleSupabaseError(error, 'deleteListing');
      return true;
    } catch (e) {
      console.error('deleteListing failed:', e);
      return false;
    }
  }
};

export const categoryService = {
  getAll: async (): Promise<DbCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) handleSupabaseError(error, 'getCategories');
      return data || [];
    } catch (e) {
      console.error('getCategories failed:', e);
      return [];
    }
  },
  
  getWithSubcategories: async (): Promise<(DbCategory & { subcategories: DbSubcategory[] })[]> => {
    try {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (catError) handleSupabaseError(catError, 'getCategoriesWithSubs');
      
      const { data: subcategories, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (subError) handleSupabaseError(subError, 'getSubcategories');
      
      return (categories || []).map(cat => ({
        ...cat,
        subcategories: (subcategories || []).filter(sub => sub.category_id === cat.id)
      }));
    } catch (e) {
      console.error('getCategoriesWithSubs failed:', e);
      return [];
    }
  },
  
  create: async (category: Partial<DbCategory>): Promise<DbCategory | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createCategory');
      return data;
    } catch (e) {
      console.error('createCategory failed:', e);
      return null;
    }
  },
  
  update: async (id: string, updates: Partial<DbCategory>): Promise<DbCategory | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'updateCategory');
      return data;
    } catch (e) {
      console.error('updateCategory failed:', e);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) handleSupabaseError(error, 'deleteCategory');
      return true;
    } catch (e) {
      console.error('deleteCategory failed:', e);
      return false;
    }
  }
};

export const subcategoryService = {
  getAll: async (): Promise<DbSubcategory[]> => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) handleSupabaseError(error, 'getSubcategories');
      return data || [];
    } catch (e) {
      console.error('getSubcategories failed:', e);
      return [];
    }
  },
  
  create: async (subcategory: Partial<DbSubcategory>): Promise<DbSubcategory | null> => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .insert([subcategory])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createSubcategory');
      return data;
    } catch (e) {
      console.error('createSubcategory failed:', e);
      return null;
    }
  },
  
  update: async (id: string, updates: Partial<DbSubcategory>): Promise<DbSubcategory | null> => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'updateSubcategory');
      return data;
    } catch (e) {
      console.error('updateSubcategory failed:', e);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);
      
      if (error) handleSupabaseError(error, 'deleteSubcategory');
      return true;
    } catch (e) {
      console.error('deleteSubcategory failed:', e);
      return false;
    }
  }
};

export const messageService = {
  sendMessage: async (msg: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([msg])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'sendMessage');
      return data;
    } catch (e) {
      console.error('sendMessage failed:', e);
      return null;
    }
  }
};

export const notificationService = {
  create: async (notif: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notif])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createNotification');
      return data;
    } catch (e) {
      console.error('createNotification failed:', e);
      return null;
    }
  },
  
  markNotificationRead: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) handleSupabaseError(error, 'markNotificationRead');
      return true;
    } catch (e) {
      console.error('markNotificationRead failed:', e);
      return false;
    }
  },
  
  clearNotification: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) handleSupabaseError(error, 'clearNotification');
      return true;
    } catch (e) {
      console.error('clearNotification failed:', e);
      return false;
    }
  }
};

export const verificationService = {
  getAll: async (): Promise<DbVerificationRequest[]> => {
    try {
      const { data, error } = await supabase.from('verification_requests').select('*').order('created_at', { ascending: false });
      if (error) handleSupabaseError(error, 'getVerifications');
      return data || [];
    } catch (e) {
      console.error('getVerifications failed:', e);
      return [];
    }
  },
  
  create: async (req: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .insert([req])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createVerification');
      return data;
    } catch (e) {
      console.error('createVerification failed:', e);
      return null;
    }
  },
  
  updateStatus: async (id: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('verification_requests').update({ status }).eq('id', id);
      if (error) handleSupabaseError(error, 'updateVerificationStatus');
      return true;
    } catch (e) {
      console.error('updateVerificationStatus failed:', e);
      return false;
    }
  }
};

export const passwordRequestService = {
  getAll: async (): Promise<DbPasswordRequest[]> => {
    try {
      const { data, error } = await supabase.from('password_requests').select('*').order('created_at', { ascending: false });
      if (error) handleSupabaseError(error, 'getPasswordRequests');
      return data || [];
    } catch (e) {
      console.error('getPasswordRequests failed:', e);
      return [];
    }
  },
  
  create: async (req: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('password_requests')
        .insert([req])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createPasswordRequest');
      return data;
    } catch (e) {
      console.error('createPasswordRequest failed:', e);
      return null;
    }
  },
  
  updateStatus: async (id: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('password_requests').update({ status }).eq('id', id);
      if (error) handleSupabaseError(error, 'updatePasswordRequestStatus');
      return true;
    } catch (e) {
      console.error('updatePasswordRequestStatus failed:', e);
      return false;
    }
  }
};

export const promotionService = {
  getAll: async (): Promise<DbPromotionPayment[]> => {
    try {
      const { data, error } = await supabase.from('promotion_payments').select('*').order('created_at', { ascending: false });
      if (error) handleSupabaseError(error, 'getPromotions');
      return data || [];
    } catch (e) {
      console.error('getPromotions failed:', e);
      return [];
    }
  },
  
  create: async (req: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('promotion_payments')
        .insert([req])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createPromotion');
      return data;
    } catch (e) {
      console.error('createPromotion failed:', e);
      return null;
    }
  },
  
  updateStatus: async (id: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('promotion_payments').update({ status }).eq('id', id);
      if (error) handleSupabaseError(error, 'updatePromotionStatus');
      return true;
    } catch (e) {
      console.error('updatePromotionStatus failed:', e);
      return false;
    }
  }
};

export const disputeService = {
  getAll: async (): Promise<DbDisputeCase[]> => {
    try {
      const { data, error } = await supabase.from('disputes').select('*').order('created_at', { ascending: false });
      if (error) handleSupabaseError(error, 'getDisputes');
      return data || [];
    } catch (e) {
      console.error('getDisputes failed:', e);
      return [];
    }
  },
  
  create: async (disp: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .insert([disp])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createDispute');
      return data;
    } catch (e) {
      console.error('createDispute failed:', e);
      return null;
    }
  },
  
  updateStatus: async (id: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('disputes').update({ status }).eq('id', id);
      if (error) handleSupabaseError(error, 'updateDisputeStatus');
      return true;
    } catch (e) {
      console.error('updateDisputeStatus failed:', e);
      return false;
    }
  }
};

export const reportService = {
  getAll: async (): Promise<DbReport[]> => {
    try {
      const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (error) handleSupabaseError(error, 'getReports');
      return data || [];
    } catch (e) {
      console.error('getReports failed:', e);
      return [];
    }
  },
  
  create: async (rep: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([rep])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createReport');
      return data;
    } catch (e) {
      console.error('createReport failed:', e);
      return null;
    }
  },
  
  updateStatus: async (id: string, status: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('reports').update({ status }).eq('id', id);
      if (error) handleSupabaseError(error, 'updateReportStatus');
      return true;
    } catch (e) {
      console.error('updateReportStatus failed:', e);
      return false;
    }
  }
};

export const auditService = {
  getAll: async (): Promise<DbAuditLog[]> => {
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (error) handleSupabaseError(error, 'getAuditLogs');
      return data || [];
    } catch (e) {
      console.error('getAuditLogs failed:', e);
      return [];
    }
  },
  
  create: async (log: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([log])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createAuditLog');
      return data;
    } catch (e) {
      console.error('createAuditLog failed:', e);
      return null;
    }
  }
};

export const reviewService = {
  getAll: async (): Promise<DbReview[]> => {
    try {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (error) handleSupabaseError(error, 'getReviews');
      return data || [];
    } catch (e) {
      console.error('getReviews failed:', e);
      return [];
    }
  },
  
  create: async (rev: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([rev])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createReview');
      return data;
    } catch (e) {
      console.error('createReview failed:', e);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) handleSupabaseError(error, 'deleteReview');
      return true;
    } catch (e) {
      console.error('deleteReview failed:', e);
      return false;
    }
  }
};

export const buyerRequestService = {
  getAll: async (): Promise<DbBuyerRequest[]> => {
    try {
      const { data, error } = await supabase.from('buyer_requests').select('*').order('created_at', { ascending: false });
      if (error) handleSupabaseError(error, 'getBuyerRequests');
      return data || [];
    } catch (e) {
      console.error('getBuyerRequests failed:', e);
      return [];
    }
  },
  
  create: async (req: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('buyer_requests')
        .insert([req])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createBuyerRequest');
      return data;
    } catch (e) {
      console.error('createBuyerRequest failed:', e);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('buyer_requests').delete().eq('id', id);
      if (error) handleSupabaseError(error, 'deleteBuyerRequest');
      return true;
    } catch (e) {
      console.error('deleteBuyerRequest failed:', e);
      return false;
    }
  }
};

export const announcementService = {
  getAll: async (): Promise<DbSystemAnnouncement[]> => {
    try {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) handleSupabaseError(error, 'getAnnouncements');
      return data || [];
    } catch (e) {
      console.error('getAnnouncements failed:', e);
      return [];
    }
  },
  
  create: async (ann: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([ann])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createAnnouncement');
      return data;
    } catch (e) {
      console.error('createAnnouncement failed:', e);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) handleSupabaseError(error, 'deleteAnnouncement');
      return true;
    } catch (e) {
      console.error('deleteAnnouncement failed:', e);
      return false;
    }
  }
};

export const systemConfigService = {
  getAll: async (): Promise<DbSystemConfig[]> => {
    try {
      const { data, error } = await supabase.from('system_configs').select('*');
      if (error) handleSupabaseError(error, 'getSystemConfig');
      return data || [];
    } catch (e) {
      console.error('getSystemConfig failed:', e);
      return [];
    }
  },
  
  updateConfig: async (key: string, value: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('system_configs')
        .upsert([{ key, value }], { onConflict: 'key' });
      if (error) handleSupabaseError(error, 'updateSystemConfig');
      return true;
    } catch (e) {
      console.error('updateSystemConfig failed:', e);
      return false;
    }
  }
};

export const siteSettingsService = {
  get: async (): Promise<DbSiteSettings | null> => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').maybeSingle();
      if (error) handleSupabaseError(error, 'getSiteSettings');
      return data;
    } catch (e) {
      console.error('getSiteSettings failed:', e);
      return null;
    }
  },
  
  updateSettings: async (settings: Partial<DbSiteSettings>): Promise<DbSiteSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert([{ ...settings, updated_at: new Date().toISOString() }])
        .select()
        .single();
      if (error) handleSupabaseError(error, 'updateSiteSettings');
      return data;
    } catch (e) {
      console.error('updateSiteSettings failed:', e);
      return null;
    }
  }
};

export const safeSpotService = {
  getAll: async (): Promise<DbSafeSpot[]> => {
    try {
      const { data, error } = await supabase.from('safe_spots').select('*').eq('is_active', true);
      if (error) handleSupabaseError(error, 'getSafeSpots');
      return data || [];
    } catch (e) {
      console.error('getSafeSpots failed:', e);
      return [];
    }
  },
  
  create: async (spot: Partial<DbSafeSpot>): Promise<DbSafeSpot | null> => {
    try {
      const { data, error } = await supabase
        .from('safe_spots')
        .insert([spot])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createSafeSpot');
      return data;
    } catch (e) {
      console.error('createSafeSpot failed:', e);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('safe_spots').delete().eq('id', id);
      if (error) handleSupabaseError(error, 'deleteSafeSpot');
      return true;
    } catch (e) {
      console.error('deleteSafeSpot failed:', e);
      return false;
    }
  }
};

export const promotionPlanService = {
  getAll: async (): Promise<DbPromotionPlan[]> => {
    try {
      const { data, error } = await supabase.from('promotion_plans').select('*').eq('is_active', true);
      if (error) handleSupabaseError(error, 'getPromotionPlans');
      return data || [];
    } catch (e) {
      console.error('getPromotionPlans failed:', e);
      return [];
    }
  }
};

export const searchAlertService = {
  getAll: async (userId: string): Promise<DbSearchAlert[]> => {
    try {
      const { data, error } = await supabase
        .from('search_alerts')
        .select('*')
        .eq('user_id', userId);
      if (error) handleSupabaseError(error, 'getSearchAlerts');
      return data || [];
    } catch (e) {
      console.error('getSearchAlerts failed:', e);
      return [];
    }
  },
  
  create: async (alert: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('search_alerts')
        .insert([alert])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createSearchAlert');
      return data;
    } catch (e) {
      console.error('createSearchAlert failed:', e);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('search_alerts').delete().eq('id', id);
      if (error) handleSupabaseError(error, 'deleteSearchAlert');
      return true;
    } catch (e) {
      console.error('deleteSearchAlert failed:', e);
      return false;
    }
  }
};

export const intrusionService = {
  getAll: async (): Promise<DbIntrusionLog[]> => {
    try {
      const { data, error } = await supabase.from('intrusion_logs').select('*').order('timestamp', { ascending: false });
      if (error) handleSupabaseError(error, 'getIntrusionLogs');
      return data || [];
    } catch (e) {
      console.error('getIntrusionLogs failed:', e);
      return [];
    }
  },
  
  create: async (log: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('intrusion_logs')
        .insert([log])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createIntrusionLog');
      return data;
    } catch (e) {
      console.error('createIntrusionLog failed:', e);
      return null;
    }
  }
};

export const recentDealsService = {
  getAll: async (): Promise<DbMarketplaceDeal[]> => {
    try {
      const { data, error } = await supabase.from('recent_deals').select('*').order('time', { ascending: false });
      if (error) handleSupabaseError(error, 'getRecentDeals');
      return data || [];
    } catch (e) {
      console.error('getRecentDeals failed:', e);
      return [];
    }
  },
  
  create: async (deal: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('recent_deals')
        .insert([deal])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createRecentDeal');
      return data;
    } catch (e) {
      console.error('createRecentDeal failed:', e);
      return null;
    }
  }
};

export const storageService = {
  uploadFile: async (bucket: string, path: string, file: File): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: true });
      
      if (error) handleSupabaseError(error, 'uploadFile');
      
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      
      return publicUrlData.publicUrl;
    } catch (e) {
      console.error('uploadFile failed:', e);
      return '';
    }
  }
};

export const favoriteService = {
  getByUserId: async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', userId);
      
      if (error) handleSupabaseError(error, 'getFavorites');
      return (data || []).map(f => f.listing_id);
    } catch (e) {
      console.error('getFavorites failed:', e);
      return [];
    }
  },
  
  toggleFavorite: async (userId: string, listingId: string, exists: boolean): Promise<boolean> => {
    try {
      if (exists) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId);
        if (error) handleSupabaseError(error, 'removeFavorite');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: userId, listing_id: listingId }]);
        if (error) handleSupabaseError(error, 'addFavorite');
      }
      return true;
    } catch (e) {
      console.error('toggleFavorite failed:', e);
      return false;
    }
  }
};