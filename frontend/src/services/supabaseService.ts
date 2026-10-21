import { laravelApi, laravelRequest, laravelAuth } from '@/lib/laravel-api';
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

const handleError = (error: any, operation: string) => {
  console.error(`[Laravel Error] ${operation}:`, error);
  toast.error(`Database error: ${error?.message || 'Unknown error'}`);
  throw error;
};

const CATEGORY_LABELS: Record<string, string> = {
  vehicles: 'Vehicles',
  real_estate: 'Real Estate',
  electronics: 'Electronics',
  fashion: 'Fashion',
  home_furniture: 'Home & Furniture',
  services: 'Services',
  jobs: 'Jobs',
  beauty_health: 'Beauty & Health',
  utility_energy: 'Utility & Energy',
  solar_clean_energy: 'Solar & Clean Energy',
};

export const mapProfileToUser = (row: any): DbUser => {
  const email = row.email || row.auth_email || '';
  return {
    id: row.id,
    email: email,
    authEmail: row.auth_email || email,
    emailConfirmedAt: row.email_confirmed_at,
    lastSignInAt: row.last_sign_in_at,
    fullName: row.full_name || email || 'Sealify User',
    phoneNumber: row.phone_number || '',
    avatarUrl: row.avatar_url || '',
    storeBannerUrl: row.cover_url || undefined,
    bio: row.bio || undefined,
    role: row.role || 'buyer',
    verified: Boolean(row.verified),
    verificationType: row.verification_type || 'none',
    businessName: row.business_name || undefined,
    businessCategory: row.business_category || undefined,
    businessAddress: row.business_address || undefined,
    businessHours: row.business_hours || undefined,
    bankName: row.bank_name || undefined,
    accountNumber: row.account_number || undefined,
    accountName: row.account_name || undefined,
    websiteUrl: row.website_url || undefined,
    instagramHandle: row.instagram_handle || undefined,
    twitterHandle: row.twitter_handle || undefined,
    whatsappNumber: row.whatsapp_number || undefined,
    emailNotifications: row.email_notifications,
    whatsappNotifications: row.whatsapp_notifications,
    hidePhonePublicly: row.hide_phone_publicly,
    hideLocationPublicly: row.hide_location_publicly,
    memberSince: row.member_since || row.created_at || new Date().toISOString(),
    location: row.location || 'Ogbomoso, Oyo State',
    status: row.status || 'active',
    restrictionReason: row.restriction_reason || undefined,
    appealStatus: row.appeal_status || 'none',
    totalValueTraded: Number(row.total_value_traded || 0),
    completedDeals: Number(row.completed_deals || 0),
    verifiedCredentials: row.verified_credentials,
    trustScore: row.trust_score,
    credentialExpiryWarningDate: row.credential_expiry_warning_date,
    verificationPreferences: row.verification_preferences,
  };
}

export const mapListingToListing = (row: any): DbListing => {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const imageRows = Array.isArray(row.ad_images)
    ? [...row.ad_images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    : [];
  const images = Array.isArray(row.images) && row.images.length > 0
    ? row.images
    : imageRows.map((image) => image.image_url).filter(Boolean);

  return {
    id: row.id,
    sellerId: row.seller_id,
    sellerName: row.seller_name || profile?.full_name || 'Sealify Seller',
    sellerPhone: row.seller_phone || profile?.phone_number || '',
    sellerAvatar: row.seller_avatar || profile?.avatar_url || '',
    sellerVerified: Boolean(row.seller_verified ?? profile?.verified),
    sellerVerificationType: row.seller_verification_type || profile?.verification_type || 'none',
    title: row.title,
    description: row.description,
    price: Number(row.price || 0),
    originalPrice: row.original_price == null ? undefined : Number(row.original_price),
    category: (CATEGORY_LABELS[row.category_id] || row.category_id || 'Services') as any,
    condition: row.condition,
    location: row.location || 'Ogbomoso, Oyo State',
    status: row.status || 'active',
    images,
    videoUrl: row.video_url || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    viewsCount: Number(row.views_count || 0),
    featured: Boolean(row.featured),
    promotionDurationMonths: row.promotion_duration_months == null ? undefined : Number(row.promotion_duration_months),
    promotionPlanName: row.promotion_plan_name || undefined,
    promotionStartDate: row.promotion_start_date || undefined,
    promotionEndDate: row.promotion_end_date || undefined,
    paymentStatus: row.payment_status || 'pending',
    paymentProofUrl: row.payment_proof_url || undefined,
    amountPaid: row.amount_paid == null ? undefined : Number(row.amount_paid),
    specifications: row.specifications || {},
  } as DbListing;
};
const snakeCase = (value: string) => value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toDbRow = (data: Record<string, any> = {}) => Object.entries(data).reduce((row: Record<string, any>, [key, value]) => {
  if (value !== undefined) {
    row[snakeCase(key)] = value;
  }

  return row;
}, {});

const toNumberArray = (values: any[] = []) => values.map((value) => Number(value));

const db = laravelApi.data;

export const userService = {
  getProfile: async (id: string): Promise<DbUser | null> => {
    try {
      const row = await db.get<any>(`profiles/${id}`);
      return mapProfileToUser(row);
    } catch (e) {
      return handleError('getProfile', e, null);
    }
  },

  getAll: async (): Promise<DbUser[]> => {
    try {
      const rows = await db.list<any>('profiles', { sort_by: 'created_at', sort_dir: 'desc' });
      return (rows || []).map(mapProfileToUser);
    } catch (e) {
      return handleError('getAllUsers', e, []);
    }
  },

  create: async (profile: Partial<DbUser>): Promise<DbUser | null> => {
    try {
      const row = await db.create<any>('profiles', toDbRow(profile));
      return row ? mapProfileToUser(row) : null;
    } catch (e) {
      return handleError('createUser', e, null);
    }
  },

  update: async (id: string, updates: Partial<DbUser>): Promise<DbUser | null> => {
    try {
      const row = await db.update<any>('profiles', id, toDbRow(updates));
      return row ? mapProfileToUser(row) : null;
    } catch (e) {
      return handleError('updateUser', e, null);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.destroy('profiles', id);
      return true;
    } catch (e) {
      return handleError('deleteUser', e, false);
    }
  },
};

const fetchListingRows = async () => {
  const response = await laravelRequest<{ listings: any[] }>('/listings', { auth: false });
  return response?.listings || [];
};

export const listingService = {
  getAll: async (): Promise<DbListing[]> => {
    try {
      const rows = await fetchListingRows();
      return rows.map(mapListingToListing);
    } catch (e) {
      return handleError('getAllListings', e, []);
    }
  },

  create: async (listing: Partial<DbListing>, images: string[]): Promise<DbListing | null> => {
    try {
      const row = toDbRow(listing as Record<string, any>);
      const created = await db.create<any>('ads', row);

      if (images && images.length > 0 && created?.id) {
        const imageRows = images.map((url, index) => ({
          ad_id: created.id,
          image_url: url,
          sort_order: index,
        }));

        await Promise.all(imageRows.map((imageRow) => db.create<any>('ad_images', imageRow)));
      }

      return created;
    } catch (e) {
      return handleError('createListing', e, null);
    }
  },

  update: async (id: string, updates: Partial<DbListing>): Promise<DbListing | null> => {
    try {
      return await db.update<any>('ads', id, toDbRow(updates as Record<string, any>));
    } catch (e) {
      return handleError('updateListing', e, null);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.destroy('ads', id);
      return true;
    } catch (e) {
      return handleError('deleteListing', e, false);
    }
  },
};

export const categoryService = {
  getAll: async (): Promise<DbCategory[]> => {
    try {
      return await db.list<DbCategory>('categories', { is_active: '1', sort_by: 'sort_order', sort_dir: 'asc' });
    } catch (e) {
      return handleError('getCategories', e, []);
    }
  },

  getWithSubcategories: async (): Promise<(DbCategory & { subcategories: DbSubcategory[] })[]> => {
    try {
      const [categories, subcategories] = await Promise.all([
        db.list<DbCategory>('categories', { is_active: '1', sort_by: 'sort_order', sort_dir: 'asc' }),
        db.list<DbSubcategory>('subcategories', { is_active: '1', sort_by: 'sort_order', sort_dir: 'asc' }),
      ]);

      return (categories || []).map((category) => ({
        ...category,
        subcategories: (subcategories || []).filter((subcategory) => subcategory.category_id === category.id),
      }));
    } catch (e) {
      return handleError('getCategoriesWithSubs', e, []);
    }
  },

  create: async (category: Partial<DbCategory>): Promise<DbCategory | null> => {
    try {
      return await db.create<DbCategory>('categories', toDbRow(category as Record<string, any>));
    } catch (e) {
      return handleError('createCategory', e, null);
    }
  },

  update: async (id: string, updates: Partial<DbCategory>): Promise<DbCategory | null> => {
    try {
      return await db.update<DbCategory>('categories', id, toDbRow(updates as Record<string, any>));
    } catch (e) {
      return handleError('updateCategory', e, null);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.destroy('categories', id);
      return true;
    } catch (e) {
      return handleError('deleteCategory', e, false);
    }
  },
};

export const subcategoryService = {
  getAll: async (): Promise<DbSubcategory[]> => {
    try {
      return await db.list<DbSubcategory>('subcategories', { is_active: '1', sort_by: 'sort_order', sort_dir: 'asc' });
    } catch (e) {
      return handleError('getSubcategories', e, []);
    }
  },

  create: async (subcategory: Partial<DbSubcategory>): Promise<DbSubcategory | null> => {
    try {
      return await db.create<DbSubcategory>('subcategories', toDbRow(subcategory as Record<string, any>));
    } catch (e) {
      return handleError('createSubcategory', e, null);
    }
  },

  update: async (id: string, updates: Partial<DbSubcategory>): Promise<DbSubcategory | null> => {
    try {
      return await db.update<DbSubcategory>('subcategories', id, toDbRow(updates as Record<string, any>));
    } catch (e) {
      return handleError('updateSubcategory', e, null);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.destroy('subcategories', id);
      return true;
    } catch (e) {
      return handleError('deleteSubcategory', e, false);
    }
  },
};

const createSimpleService = <T>(resource: string) => ({
  getAll: async (): Promise<T[]> => {
    try {
      return await db.list<T>(resource, { sort_by: 'created_at', sort_dir: 'desc' });
    } catch (e) {
      return handleError(`get${resource}`, e, []);
    }
  },

  create: async (data: Record<string, any>): Promise<T | null> => {
    try {
      return await db.create<T>(resource, toDbRow(data));
    } catch (e) {
      return handleError(`create${resource}`, e, null);
    }
  },

  updateStatus: async (id: string, status: string): Promise<boolean> => {
    try {
      await db.update(resource, id, { status });
      return true;
    } catch (e) {
      return handleError(`update${resource}`, e, false);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.destroy(resource, id);
      return true;
    } catch (e) {
      return handleError(`delete${resource}`, e, false);
    }
  },
});

export const messageService = {
  sendMessage: async (message: Record<string, any>): Promise<any | null> => {
    try {
      return await db.create<any>('messages', toDbRow(message));
    } catch (e) {
      return handleError('sendMessage', e, null);
    }
  },
};

export const notificationService = {
  getAll: async (): Promise<any[]> => {
    try {
      return await db.list<any>('notifications', { sort_by: 'created_at', sort_dir: 'desc' });
    } catch (e) {
      return handleError('getNotifications', e, []);
    }
  },

  create: async (notification: Record<string, any>): Promise<any | null> => {
    try {
      return await db.create<any>('notifications', toDbRow(notification));
    } catch (e) {
      return handleError('createNotification', e, null);
    }
  },

  markNotificationRead: async (id: string): Promise<boolean> => {
    try {
      await db.update('notifications', id, { read: true });
      return true;
    } catch (e) {
      return handleError('markNotificationRead', e, false);
    }
  },

  clearNotification: async (id: string): Promise<boolean> => {
    try {
      await db.destroy('notifications', id);
      return true;
    } catch (e) {
      return handleError('clearNotification', e, false);
    }
  },
};

export const verificationService = createSimpleService<DbVerificationRequest>('verification_requests');
export const passwordRequestService = createSimpleService<DbPasswordRequest>('password_requests');
export const promotionService = createSimpleService<DbPromotionPayment>('promotion_payments');
export const disputeService = createSimpleService<DbDisputeCase>('disputes');
export const reportService = createSimpleService<DbReport>('reports');
export const reviewService = createSimpleService<DbReview>('reviews');
export const buyerRequestService = createSimpleService<DbBuyerRequest>('buyer_requests');
export const announcementService = createSimpleService<DbSystemAnnouncement>('announcements');
export const auditService = createSimpleService<DbAuditLog>('audit_logs');
export const intrusionService = createSimpleService<DbIntrusionLog>('intrusion_logs');
export const recentDealsService = createSimpleService<DbMarketplaceDeal>('recent_deals');

export const systemConfigService = {
  getAll: async (): Promise<DbSystemConfig[]> => {
    try {
      return await db.list<DbSystemConfig>('system_configs');
    } catch (e) {
      return handleError('getSystemConfigs', e, []);
    }
  },

  updateConfig: async (key: string, value: boolean): Promise<boolean> => {
    try {
      const rows = await db.list<DbSystemConfig>('system_configs', { key });
      const existing = rows?.[0];

      if (existing?.id) {
        await db.update('system_configs', existing.id, { value: { enabled: value } });
      } else {
        await db.create('system_configs', { key, value: { enabled: value } });
      }

      return true;
    } catch (e) {
      return handleError('updateSystemConfig', e, false);
    }
  },
};

export const siteSettingsService = {
  get: async (): Promise<DbSiteSettings | null> => {
    try {
      const rows = await db.list<DbSiteSettings>('site_settings', { is_active: '1' });
      return rows?.[0] || null;
    } catch (e) {
      return handleError('getSiteSettings', e, null);
    }
  },

  updateSettings: async (settings: Partial<DbSiteSettings>): Promise<DbSiteSettings | null> => {
    try {
      const current = await siteSettingsService.get();

      if (current?.id) {
        return await db.update<DbSiteSettings>('site_settings', current.id, toDbRow(settings as Record<string, any>));
      }

      return await db.create<DbSiteSettings>('site_settings', toDbRow(settings as Record<string, any>));
    } catch (e) {
      return handleError('updateSiteSettings', e, null);
    }
  },
};

export const safeSpotService = {
  getAll: async (): Promise<DbSafeSpot[]> => {
    try {
      return await db.list<DbSafeSpot>('safe_spots', { is_active: '1', sort_by: 'created_at', sort_dir: 'desc' });
    } catch (e) {
      return handleError('getSafeSpots', e, []);
    }
  },

  create: async (spot: Partial<DbSafeSpot>): Promise<DbSafeSpot | null> => {
    try {
      return await db.create<DbSafeSpot>('safe_spots', toDbRow(spot as Record<string, any>));
    } catch (e) {
      return handleError('createSafeSpot', e, null);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.destroy('safe_spots', id);
      return true;
    } catch (e) {
      return handleError('deleteSafeSpot', e, false);
    }
  },
};

export const promotionPlanService = {
  getAll: async (): Promise<DbPromotionPlan[]> => {
    try {
      return await db.list<DbPromotionPlan>('promotion_plans', { is_active: '1', sort_by: 'months', sort_dir: 'asc' });
    } catch (e) {
      return handleError('getPromotionPlans', e, []);
    }
  },
};

export const searchAlertService = {
  getAll: async (userId: string): Promise<DbSearchAlert[]> => {
    try {
      return await db.list<DbSearchAlert>('search_alerts', { user_id: userId, sort_by: 'created_at', sort_dir: 'desc' });
    } catch (e) {
      return handleError('getSearchAlerts', e, []);
    }
  },

  create: async (alert: Record<string, any>): Promise<any | null> => {
    try {
      return await db.create<any>('search_alerts', toDbRow(alert));
    } catch (e) {
      return handleError('createSearchAlert', e, null);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await db.destroy('search_alerts', id);
      return true;
    } catch (e) {
      return handleError('deleteSearchAlert', e, false);
    }
  },
};

export const storageService = {
  uploadFile: async (bucket: string, path: string, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);

      const token = laravelAuth.getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/uploads`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data.url as string;
    } catch (e) {
      handleError('uploadFile', e);
      throw e;
    }
  },
};

export const favoriteService = {
  getByUserId: async (userId: string): Promise<string[]> => {
    try {
      const rows = await db.list<any>('favorites', { user_id: userId });
      return (rows || []).map((row) => String(row.listing_id));
    } catch (e) {
      return handleError('getFavorites', e, []);
    }
  },

  toggleFavorite: async (userId: string, listingId: string, exists: boolean): Promise<boolean> => {
    try {
      if (exists) {
        const rows = await db.list<any>('favorites', { user_id: userId, listing_id: listingId });
        const row = rows?.[0];

        if (row?.id) {
          await db.destroy('favorites', row.id);
        }
      } else {
        await db.create('favorites', { user_id: userId, listing_id: listingId });
      }

      return true;
    } catch (e) {
      return handleError('toggleFavorite', e, false);
    }
  },
};

export const ratingsService = {
  getAverage: async (userId: string): Promise<number> => {
    try {
      const reviews = await db.list<any>('reviews', { seller_id: userId });
      const ratings = toNumberArray((reviews || []).map((review) => review.rating));
      if (!ratings.length) return 0;
      return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    } catch (e) {
      return handleError('getAverageRating', e, 0);
    }
  },
};
