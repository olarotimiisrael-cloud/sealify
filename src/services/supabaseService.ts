import { supabase } from '../lib/supabase';
import { 
  UserProfile, 
  Listing, 
  VerificationRequest, 
  PasswordChangeRequest, 
  PromotionPaymentRequest, 
  AdReport, 
  AuditLog, 
  SecurityIntrusionLog, 
  DisputeCase, 
  SiteSettings, 
  SearchAlert, 
  Review, 
  CategoryStats, 
  BuyerRequest, 
  Wallet, 
  Transaction,
  SafeMeetupSpotConfig,
  SystemAnnouncement,
  MarketplaceDeal
} from '../types/sealify';

// 1. User Service
export const userService = {
  getProfile: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        phoneNumber: data.phone_number,
        avatarUrl: data.avatar_url || '/logo.png',
        storeBannerUrl: data.store_banner_url,
        role: data.role,
        verified: data.verified,
        verificationType: data.verification_type,
        businessName: data.business_name,
        location: data.location,
        memberSince: new Date(data.member_since).toLocaleDateString(),
        status: data.status,
        restrictionReason: data.restriction_reason,
        appealStatus: data.appeal_status
      };
    } catch (e) {
      console.warn('userService.getProfile fallback:', e);
      return null;
    }
  },
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      if (error) throw error;
      return (data || []).map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        phoneNumber: u.phone_number,
        avatarUrl: u.avatar_url || '/logo.png',
        storeBannerUrl: u.store_banner_url,
        role: u.role,
        verified: u.verified,
        verificationType: u.verification_type,
        businessName: u.business_name,
        location: u.location,
        memberSince: new Date(u.member_since || Date.now()).toLocaleDateString(),
        status: u.status
      }));
    } catch (e) {
      console.warn('userService.getAll fallback:', e);
      return [];
    }
  },
  create: async (profile: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || profile.fullName,
          phone_number: profile.phone_number || profile.phoneNumber,
          role: profile.role || 'buyer',
          location: profile.location || 'Ogbomoso, Oyo State',
          verified: profile.verified || false,
          verification_type: profile.verification_type || 'none'
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('userService.create fallback:', e);
      return null;
    }
  },
  update: async (id: string, updates: any) => {
    try {
      const dbUpdates: any = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.storeBannerUrl !== undefined) dbUpdates.store_banner_url = updates.storeBannerUrl;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.verified !== undefined) dbUpdates.verified = updates.verified;
      if (updates.verificationType !== undefined) dbUpdates.verification_type = updates.verificationType;
      if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('userService.update fallback:', e);
      return null;
    }
  },
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('userService.delete fallback:', e);
      return false;
    }
  }
};

export const updateUser = userService.update;
export const deleteUser = userService.delete;

// 2. Listing Service
export const listingService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*, users(*), listing_images(image_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('listingService.getAll fallback:', e);
      return [];
    }
  },
  create: async (listing: any, images: string[]) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([{
          seller_id: listing.seller_id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          condition: listing.condition,
          location: listing.location,
          status: 'active',
          featured: listing.featured || false,
          specifications: listing.specifications || {}
        }])
        .select();
      
      if (error) throw error;
      const newListing = data?.[0];

      if (newListing && images && images.length > 0) {
        const imageInserts = images.map(url => ({
          listing_id: newListing.id,
          image_url: url
        }));
        await supabase.from('listing_images').insert(imageInserts);
      }

      return newListing;
    } catch (e) {
      console.warn('listingService.create fallback:', e);
      return null;
    }
  },
  update: async (id: string, updates: any) => {
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
      if (updates.specifications !== undefined) dbUpdates.specifications = updates.specifications;

      const { data, error } = await supabase
        .from('listings')
        .update(dbUpdates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('listingService.update fallback:', e);
      return null;
    }
  },
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('listingService.delete fallback:', e);
      return false;
    }
  }
};

// 3. Message Service
export const messageService = {
  sendMessage: async (msg: any) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          listing_id: msg.listing_id,
          content: msg.content
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('messageService.sendMessage fallback:', e);
      return null;
    }
  }
};

// 4. Notification Service
export const notificationService = {
  create: async (notif: any) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notif.user_id,
          type: notif.type,
          title: notif.title,
          description: notif.description,
          link_url: notif.link_url || notif.linkUrl
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('notificationService.create fallback:', e);
      return null;
    }
  },
  markRead: async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      return true;
    } catch (e) {
      console.warn('notificationService.markRead fallback:', e);
      return false;
    }
  },
  clear: async (id: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', id);
      return true;
    } catch (e) {
      console.warn('notificationService.clear fallback:', e);
      return false;
    }
  }
};

// 5. Verification Service
export const verificationService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('verification_requests').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('verificationService.getAll fallback:', e);
      return [];
    }
  },
  create: async (req: any) => {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .insert([{
          user_id: req.userId,
          user_name: req.userName,
          user_email: req.userEmail,
          type: req.type,
          doc_type: req.docType,
          doc_number: req.docNumber,
          doc_url: req.docUrl
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('verificationService.create fallback:', e);
      return null;
    }
  },
  updateStatus: async (id: string, status: string) => {
    try {
      await supabase.from('verification_requests').update({ status }).eq('id', id);
      return true;
    } catch (e) {
      console.warn('verificationService.updateStatus fallback:', e);
      return false;
    }
  }
};

// 6. Password Request Service
export const passwordRequestService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('password_requests').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('passwordRequestService.getAll fallback:', e);
      return [];
    }
  },
  create: async (req: any) => {
    try {
      const { data, error } = await supabase
        .from('password_requests')
        .insert([{
          user_id: req.userId,
          user_email: req.userEmail,
          user_name: req.userName,
          nin: req.nin,
          id_document_url: req.id_document_url,
          new_password: req.newPassword,
          reason: req.reason
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('passwordRequestService.create fallback:', e);
      return null;
    }
  },
  updateStatus: async (id: string, status: string) => {
    try {
      await supabase.from('password_requests').update({ status }).eq('id', id);
      return true;
    } catch (e) {
      console.warn('passwordRequestService.updateStatus fallback:', e);
      return false;
    }
  }
};

// 7. Promotion Service
export const promotionService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('promotion_payments').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('promotionService.getAll fallback:', e);
      return [];
    }
  },
  create: async (req: any) => {
    try {
      const { data, error } = await supabase
        .from('promotion_payments')
        .insert([{
          user_id: req.userId,
          listing_id: req.listingId,
          amount: req.amount,
          payment_method: req.paymentMethod,
          payment_proof_url: req.paymentProofUrl,
          plan_name: req.planName,
          duration_months: req.durationMonths
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('promotionService.create fallback:', e);
      return null;
    }
  },
  updateStatus: async (id: string, status: string) => {
    try {
      await supabase.from('promotion_payments').update({ status }).eq('id', id);
      return true;
    } catch (e) {
      console.warn('promotionService.updateStatus fallback:', e);
      return false;
    }
  }
};

// 8. Dispute Service
export const disputeService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('disputes').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('disputeService.getAll fallback:', e);
      return [];
    }
  },
  create: async (disp: any) => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .insert([{
          user_id: disp.userId,
          user_email: disp.userEmail,
          receipt_ref: disp.receiptRef,
          item_title: disp.itemTitle,
          counterparty: disp.counterparty,
          category: disp.category,
          reason: disp.reason,
          details: disp.details,
          evidence_url: disp.evidenceUrl
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('disputeService.create fallback:', e);
      return null;
    }
  },
  updateStatus: async (id: string, status: string) => {
    try {
      await supabase.from('disputes').update({ status }).eq('id', id);
      return true;
    } catch (e) {
      console.warn('disputeService.updateStatus fallback:', e);
      return false;
    }
  }
};

// 9. Report Service
export const reportService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('reports').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('reportService.getAll fallback:', e);
      return [];
    }
  },
  create: async (rep: any) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          listing_id: rep.listingId,
          listing_title: rep.listingTitle,
          reporter_name: rep.reporterName,
          reason: rep.reason,
          details: rep.details
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('reportService.create fallback:', e);
      return null;
    }
  },
  updateStatus: async (id: string, status: string) => {
    try {
      await supabase.from('reports').update({ status }).eq('id', id);
      return true;
    } catch (e) {
      console.warn('reportService.updateStatus fallback:', e);
      return false;
    }
  }
};

// 10. Audit Service
export const auditService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('audit_logs').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('auditService.getAll fallback:', e);
      return [];
    }
  },
  create: async (log: any) => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([{
          action: log.action,
          details: log.details,
          type: log.type
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('auditService.create fallback:', e);
      return null;
    }
  }
};

// 11. Review Service
export const reviewService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('reviews').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('reviewService.getAll fallback:', e);
      return [];
    }
  },
  create: async (rev: any) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          seller_id: rev.sellerId,
          buyer_id: rev.buyerId,
          buyer_name: rev.buyerName,
          buyer_avatar: rev.buyerAvatar,
          rating: rev.rating,
          comment: rev.comment
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('reviewService.create fallback:', e);
      return null;
    }
  },
  delete: async (id: string) => {
    try {
      await supabase.from('reviews').delete().eq('id', id);
      return true;
    } catch (e) {
      console.warn('reviewService.delete fallback:', e);
      return false;
    }
  }
};

// 12. Buyer Request Service
export const buyerRequestService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('buyer_requests').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('buyerRequestService.getAll fallback:', e);
      return [];
    }
  },
  create: async (req: any) => {
    try {
      const { data, error } = await supabase
        .from('buyer_requests')
        .insert([{
          user_id: req.userId,
          user_name: req.userName,
          user_avatar: req.userAvatar,
          title: req.title,
          category: req.category,
          max_budget: req.maxBudget,
          location: req.location,
          description: req.description
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('buyerRequestService.create fallback:', e);
      return null;
    }
  },
  delete: async (id: string) => {
    try {
      await supabase.from('buyer_requests').delete().eq('id', id);
      return true;
    } catch (e) {
      console.warn('buyerRequestService.delete fallback:', e);
      return false;
    }
  }
};

// 13. Favorite Service
export const favoriteService = {
  getByUserId: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []).map(f => f.listing_id);
    } catch (e) {
      console.warn('favoriteService.getByUserId fallback:', e);
      return [];
    }
  },
  toggle: async (userId: string, listingId: string, exists: boolean) => {
    try {
      if (exists) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId);
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: userId, listing_id: listingId }]);
      }
      return true;
    } catch (e) {
      console.warn('favoriteService.toggle fallback:', e);
      return false;
    }
  }
};

// 14. Announcement Service
export const announcementService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('announcements').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('announcementService.getAll fallback:', e);
      return [];
    }
  },
  create: async (ann: any) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([{
          title: ann.title,
          message: ann.message,
          type: ann.type,
          active: ann.active
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('announcementService.create fallback:', e);
      return null;
    }
  },
  delete: async (id: string) => {
    try {
      await supabase.from('announcements').delete().eq('id', id);
      return true;
    } catch (e) {
      console.warn('announcementService.delete fallback:', e);
      return false;
    }
  }
};

// 15. System Config Service
export const systemConfigService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('system_configs').select('*');
      if (error) throw error;
      const config: any = {};
      (data || []).forEach(c => {
        config[c.key] = c.value;
      });
      return config;
    } catch (e) {
      console.warn('systemConfigService.getAll fallback:', e);
      return {};
    }
  },
  update: async (key: string, value: boolean) => {
    try {
      await supabase
        .from('system_configs')
        .upsert([{ key, value }], { onConflict: 'key' });
      return true;
    } catch (e) {
      console.warn('systemConfigService.update fallback:', e);
      return false;
    }
  }
};

// 16. Site Settings Service
export const siteSettingsService = {
  get: async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').maybeSingle();
      if (error) throw error;
      return data || null;
    } catch (e) {
      console.warn('siteSettingsService.get fallback:', e);
      return null;
    }
  },
  update: async (settings: any) => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert([settings])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('siteSettingsService.update fallback:', e);
      return null;
    }
  }
};

// 17. Safe Spot Service
export const safeSpotService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('safe_spots').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('safeSpotService.getAll fallback:', e);
      return [];
    }
  },
  create: async (spot: any) => {
    try {
      const { data, error } = await supabase
        .from('safe_spots')
        .insert([{
          name: spot.name,
          zone: spot.zone,
          category: spot.category,
          address: spot.address,
          distance: spot.distance,
          hours: spot.hours,
          cctv_verified: spot.cctvVerified
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('safeSpotService.create fallback:', e);
      return null;
    }
  },
  delete: async (id: string) => {
    try {
      await supabase.from('safe_spots').delete().eq('id', id);
      return true;
    } catch (e) {
      console.warn('safeSpotService.delete fallback:', e);
      return false;
    }
  }
};

// 18. Promotion Plan Service
export const promotionPlanService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('promotion_plans').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('promotionPlanService.getAll fallback:', e);
      return [];
    }
  }
};

// 19. Search Alert Service
export const searchAlertService = {
  getAll: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('search_alerts')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('searchAlertService.getAll fallback:', e);
      return [];
    }
  },
  create: async (alert: any) => {
    try {
      const { data, error } = await supabase
        .from('search_alerts')
        .insert([{
          user_id: alert.user_id,
          query: alert.query,
          category: alert.category,
          max_price: alert.maxPrice,
          location: alert.location
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('searchAlertService.create fallback:', e);
      return null;
    }
  },
  delete: async (id: string) => {
    try {
      await supabase.from('search_alerts').delete().eq('id', id);
      return true;
    } catch (e) {
      console.warn('searchAlertService.delete fallback:', e);
      return false;
    }
  }
};

// 20. Intrusion Service
export const intrusionService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('intrusion_logs').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('intrusionService.getAll fallback:', e);
      return [];
    }
  },
  create: async (log: any) => {
    try {
      const { data, error } = await supabase
        .from('intrusion_logs')
        .insert([{
          attempted_email: log.attempted_email,
          media_status: log.media_status,
          timestamp: log.timestamp
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('intrusionService.create fallback:', e);
      return null;
    }
  }
};

// 21. Recent Deals Service
export const recentDealsService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.from('recent_deals').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('recentDealsService.getAll fallback:', e);
      return [];
    }
  },
  create: async (deal: any) => {
    try {
      const { data, error } = await supabase
        .from('recent_deals')
        .insert([{
          item_title: deal.item_title,
          price: deal.price,
          location: deal.location,
          time: deal.time
        }])
        .select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.warn('recentDealsService.create fallback:', e);
      return null;
    }
  }
};

// 22. Storage Service
export const storageService = {
  uploadFile: async (bucket: string, path: string, file: File) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
        
      return publicUrlData.publicUrl;
    } catch (e) {
      console.warn('storageService.uploadFile fallback:', e);
      return '';
    }
  }
};