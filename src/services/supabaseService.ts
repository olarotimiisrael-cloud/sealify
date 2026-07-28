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

// Helper to handle Supabase errors properly
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`[Supabase Error] ${operation}:`, error);
  toast.error(`Database error: ${error?.message || 'Unknown error'}`);
  throw error;
};

// 1. User Service
export const userService = {
  getProfile: async (id: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) handleSupabaseError(error, 'getProfile');
      if (!data) return null;
      
      return mapDbUserToProfile(data);
    } catch (e) {
      console.error('getProfile failed:', e);
      return null;
    }
  },
  
  getAll: async (): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) handleSupabaseError(error, 'getAllUsers');
      return (data || []).map(mapDbUserToProfile);
    } catch (e) {
      console.error('getAllUsers failed:', e);
      return [];
    }
  },
  
  create: async (profile: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const dbUser = {
        id: profile.id,
        email: profile.email,
        full_name: profile.fullName,
        phone_number: profile.phoneNumber,
        avatar_url: profile.avatarUrl || '/logo.png',
        store_banner_url: profile.storeBannerUrl,
        bio: profile.bio,
        role: profile.role || 'buyer',
        location: profile.location || 'Ogbomoso, Oyo State',
        verified: profile.verified || false,
        verification_type: profile.verificationType || 'none',
        business_name: profile.businessName,
        cac_number: profile.cacNumber,
        business_hours: profile.businessHours,
        bank_name: profile.bankName,
        account_number: profile.accountNumber,
        account_name: profile.accountName,
        website_url: profile.websiteUrl,
        instagram_handle: profile.instagramHandle,
        twitter_handle: profile.twitterHandle,
        whatsapp_number: profile.whatsappNumber,
        status: profile.status || 'active',
        member_since: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([dbUser])
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createUser');
      if (!data) return null;
      
      return mapDbUserToProfile(data);
    } catch (e) {
      console.error('createUser failed:', e);
      return null;
    }
  },
  
  update: async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const dbUpdates: any = {};
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
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      dbUpdates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'updateUser');
      if (!data) return null;
      
      return mapDbUserToProfile(data);
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

// Map database user to UserProfile type
function mapDbUserToProfile(data: any): UserProfile {
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    phoneNumber: data.phone_number,
    avatarUrl: data.avatar_url || '/logo.png',
    storeBannerUrl: data.store_banner_url,
    bio: data.bio,
    role: data.role,
    verified: data.verified,
    verificationType: data.verification_type,
    businessName: data.business_name,
    cacNumber: data.cac_number,
    businessHours: data.business_hours,
    bankName: data.bank_name,
    accountNumber: data.account_number,
    accountName: data.account_name,
    websiteUrl: data.website_url,
    instagramHandle: data.instagram_handle,
    twitterHandle: data.twitter_handle,
    whatsappNumber: data.whatsapp_number,
    location: data.location,
    memberSince: data.member_since ? new Date(data.member_since).toLocaleDateString() : new Date().toLocaleDateString(),
    status: data.status,
    restrictionReason: data.restriction_reason,
    appealStatus: data.appeal_status
  };
}

export const updateUser = userService.update;
export const deleteUser = userService.delete;

// 2. Listing Service
export const listingService = {
  getAll: async (): Promise<any[]> => {
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
  
  create: async (listing: any, images: string[]): Promise<any> => {
    try {
      const { data: newListing, error } = await supabase
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
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createListing');
      if (!newListing) return null;
      
      if (images && images.length > 0) {
        const imageInserts = images.map(url => ({
          listing_id: newListing.id,
          image_url: url
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
  
  update: async (id: string, updates: any): Promise<any> => {
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
      if (updates.promotionPlanName !== undefined) dbUpdates.promotion_plan_name = updates.promotionPlanName;
      if (updates.promotionDurationMonths !== undefined) dbUpdates.promotion_duration_months = updates.promotionDurationMonths;
      if (updates.promotionStartDate !== undefined) dbUpdates.promotion_start_date = updates.promotionStartDate;
      if (updates.promotionEndDate !== undefined) dbUpdates.promotion_end_date = updates.promotionEndDate;
      if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.paymentProofUrl !== undefined) dbUpdates.payment_proof_url = updates.paymentProofUrl;
      if (updates.amountPaid !== undefined) dbUpdates.amount_paid = updates.amountPaid;
      dbUpdates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('listings')
        .update(dbUpdates)
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

// 3. Message Service
export const messageService = {
  sendMessage: async (msg: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          listing_id: msg.listing_id,
          content: msg.content
        }])
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

// 4. Notification Service
export const notificationService = {
  create: async (notif: any): Promise<any> => {
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
        .select()
        .single();
      
      if (error) handleSupabaseError(error, 'createNotification');
      return data;
    } catch (e) {
      console.error('createNotification failed:', e);
      return null;
    }
  },
  
  markRead: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) handleSupabaseError(error, 'markNotificationRead');
      return true;
    } catch (e) {
      console.error('markNotificationRead failed:', e);
      return false;
    }
  },
  
  clear: async (id: string): Promise<boolean> => {
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

// 5. Verification Service
export const verificationService = {
  getAll: async (): Promise<any[]> => {
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
        .insert([{
          user_id: req.userId,
          user_name: req.userName,
          user_email: req.userEmail,
          type: req.type,
          doc_type: req.docType,
          doc_number: req.docNumber,
          doc_url: req.docUrl
        }])
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

// 6. Password Request Service
export const passwordRequestService = {
  getAll: async (): Promise<any[]> => {
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
        .insert([{
          user_id: req.userId,
          user_email: req.userEmail,
          user_name: req.userName,
          nin: req.nin,
          id_document_url: req.id_document_url,
          new_password: req.newPassword,
          reason: req.reason
        }])
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

// 7. Promotion Service
export const promotionService = {
  getAll: async (): Promise<any[]> => {
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
        .insert([{
          user_id: req.userId,
          listing_id: req.listingId,
          amount: req.amount,
          payment_method: req.paymentMethod,
          payment_proof_url: req.paymentProofUrl,
          plan_name: req.planName,
          duration_months: req.durationMonths
        }])
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

// 8. Dispute Service
export const disputeService = {
  getAll: async (): Promise<any[]> => {
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

// 9. Report Service
export const reportService = {
  getAll: async (): Promise<any[]> => {
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
        .insert([{
          listing_id: rep.listingId,
          listing_title: rep.listingTitle,
          reporter_name: rep.reporterName,
          reason: rep.reason,
          details: rep.details
        }])
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

// 10. Audit Service
export const auditService = {
  getAll: async (): Promise<any[]> => {
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
        .insert([{
          action: log.action,
          details: log.details,
          type: log.type
        }])
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

// 11. Review Service
export const reviewService = {
  getAll: async (): Promise<any[]> => {
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
        .insert([{
          seller_id: rev.sellerId,
          buyer_id: rev.buyerId,
          buyer_name: rev.buyerName,
          buyer_avatar: rev.buyerAvatar,
          rating: rev.rating,
          comment: rev.comment
        }])
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

// 12. Buyer Request Service
export const buyerRequestService = {
  getAll: async (): Promise<any[]> => {
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

// 13. Favorite Service
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
  
  toggle: async (userId: string, listingId: string, exists: boolean): Promise<boolean> => {
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

// 14. Announcement Service
export const announcementService = {
  getAll: async (): Promise<any[]> => {
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
        .insert([{
          title: ann.title,
          message: ann.message,
          type: ann.type,
          active: ann.active
        }])
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

// 15. System Config Service
export const systemConfigService = {
  getAll: async (): Promise<any> => {
    try {
      const { data, error } = await supabase.from('system_configs').select('*');
      if (error) handleSupabaseError(error, 'getSystemConfig');
      const config: any = {};
      (data || []).forEach(c => { config[c.key] = c.value; });
      return config;
    } catch (e) {
      console.error('getSystemConfig failed:', e);
      return {};
    }
  },
  
  update: async (key: string, value: boolean): Promise<boolean> => {
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

// 16. Site Settings Service
export const siteSettingsService = {
  get: async (): Promise<any> => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').maybeSingle();
      if (error) handleSupabaseError(error, 'getSiteSettings');
      return data || null;
    } catch (e) {
      console.error('getSiteSettings failed:', e);
      return null;
    }
  },
  
  update: async (settings: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert([settings])
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

// 17. Safe Spot Service
export const safeSpotService = {
  getAll: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase.from('safe_spots').select('*');
      if (error) handleSupabaseError(error, 'getSafeSpots');
      return data || [];
    } catch (e) {
      console.error('getSafeSpots failed:', e);
      return [];
    }
  },
  
  create: async (spot: any): Promise<any> => {
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

// 18. Promotion Plan Service
export const promotionPlanService = {
  getAll: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase.from('promotion_plans').select('*');
      if (error) handleSupabaseError(error, 'getPromotionPlans');
      return data || [];
    } catch (e) {
      console.error('getPromotionPlans failed:', e);
      return [];
    }
  }
};

// 19. Search Alert Service
export const searchAlertService = {
  getAll: async (userId: string): Promise<any[]> => {
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
        .insert([{
          user_id: alert.user_id,
          query: alert.query,
          category: alert.category,
          max_price: alert.maxPrice,
          location: alert.location
        }])
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

// 20. Intrusion Service
export const intrusionService = {
  getAll: async (): Promise<any[]> => {
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
        .insert([{
          attempted_email: log.attempted_email,
          media_status: log.media_status,
          timestamp: log.timestamp
        }])
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

// 21. Recent Deals Service
export const recentDealsService = {
  getAll: async (): Promise<any[]> => {
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
        .insert([{
          item_title: deal.item_title,
          price: deal.price,
          location: deal.location,
          time: deal.time
        }])
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

// 22. Storage Service
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

// Import toast for error notifications
import { toast } from 'sonner';