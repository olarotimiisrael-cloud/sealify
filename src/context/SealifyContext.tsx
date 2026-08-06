const safeParseJSON = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch (e) {
    console.warn(`Failed to parse ${key} from localStorage:`, e);
    localStorage.removeItem(key);
    return fallback;
  }
};

const getStoredCustomListings = (): Listing[] => {
  return safeParseJSON<Listing[]>('sealify_custom_listings', []);
};

const saveStoredCustomListings = (customListings: Listing[]) => {
  try {
    localStorage.setItem('sealify_custom_listings', JSON.stringify(customListings));
  } catch (e) {
    console.error('Failed to write custom listings to localStorage:', e);
  }
};

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [error, setError] = useState<string | null>(null);

  const [adminEmail, setAdminEmail] = useState<string>(() => localStorage.getItem('sealify_admin_email') || 'admin@sealify.ng');
  const [adminPassword, setAdminPassword] = useState<string>(() => localStorage.getItem('sealify_admin_password') || 'Admin1234');
  const [adminPin, setAdminPin] = useState<string>(() => localStorage.getItem('sealify_admin_pin') || '336699');

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sealify_active_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed.role === 'admin') {
        const sessionToken = sessionStorage.getItem('sealify_admin_session_token');
        const expectedToken = generateAdminSessionToken(adminEmail);
        if (!sessionToken || sessionToken !== expectedToken) {
          console.warn('🚨 SECURITY ALERT: Unverified or tampered admin session token detected.');
          return { ...parsed, role: 'buyer', status: 'active' };
        }
      }
      return { ...parsed, status: 'active' };
    } catch (e) {
      console.warn('Failed to parse user from localStorage:', e);
      localStorage.removeItem('sealify_active_user');
      return null;
    }
  });

  const isAdmin = useMemo(() => {
    if (!user || user.role !== 'admin') return false;
    const sessionToken = sessionStorage.getItem('sealify_admin_session_token');
    const expectedToken = generateAdminSessionToken(adminEmail);
    return sessionToken === expectedToken;
  }, [user, adminEmail]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sealify_active_user', JSON.stringify({ ...user, status: 'active' }));
    } else {
      localStorage.removeItem('sealify_active_user');
      sessionStorage.removeItem('sealify_admin_session_token');
    }
  }, [user]);

  const [userInterests, setUserInterests] = useState<Record<string, number>>(() =>
    safeParseJSON<Record<string, number>>('sealify_interests', {})
  );

  const updateAdminCredentials = (newEmail: string, newPassword: string, newPin: string) => {
    setAdminEmail(newEmail);
    setAdminPassword(newPassword);
    setAdminPin(newPin);
    localStorage.setItem('sealify_admin_email', newEmail);
    localStorage.setItem('sealify_admin_password', newPassword);
    localStorage.setItem('sealify_admin_pin', newPin);
    if (user?.role === 'admin') {
      const newToken = generateAdminSessionToken(newEmail);
      sessionStorage.setItem('sealify_admin_session_token', newToken);
    }
    toast.success('🔒 Official Admin Credentials updated successfully!');
  };

  const [listings, setListings] = useState<Listing[]>(() => {
    const localCustom = getStoredCustomListings();
    const mockIds = new Set(MOCK_LISTINGS.map(l => l.id));
    const customOnly = localCustom.filter(l => !mockIds.has(l.id));
    return [...customOnly, ...MOCK_LISTINGS];
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(ALL_MOCK_USERS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordChangeRequest[]>([]);
  const [promotionPaymentRequests, setPromotionPaymentRequests] = useState<PromotionPaymentRequest[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<BuyerRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [reports, setReports] = useState<AdReport[]>([]);
  const [disputeCases, setDisputeCases] = useState<DisputeCase[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [savedListingIds, setSavedListingIds] = useState<string[]>(() =>
    safeParseJSON<string[]>('sealify_saved', ['lst_2'])
  );
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() =>
    safeParseJSON<string[]>('sealify_recently_viewed', [])
  );
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [language, setLanguage] = useState<SupportedLanguage>(() =>
    (localStorage.getItem('sealify_language') as SupportedLanguage) || 'en'
  );

  const [filters, setFilters] = useState<FilterState>(() =>
    safeParseJSON<FilterState>('sealify_filters', {
      searchQuery: '',
      category: 'All',
      minPrice: null,
      maxPrice: null,
      condition: 'All',
      location: '',
      sortBy: 'newest'
    })
  );

  const [categories, setCategories] = useState([
    { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 0, color: 'bg-blue-500' },
    { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 0, color: 'bg-purple-500' },
    { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 0, color: 'bg-teal-500' },
    { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 0, color: 'bg-pink-500' },
    { id: 'home_furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 0, color: 'bg-amber-500' },
    { id: 'services', name: 'Services', iconName: 'Wrench', count: 0, color: 'bg-cyan-500' },
    { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 0, color: 'bg-indigo-500' },
    { id: 'beauty_health', name: 'Beauty & Health', iconName: 'Sparkles', count: 0, color: 'bg-rose-500' },
    { id: 'utility_energy', name: 'Utility & Energy', iconName: 'Zap', count: 0, color: 'bg-yellow-500' },
    { id: 'solar_clean_energy', name: 'Solar & Clean Energy', iconName: 'Sun', count: 0, color: 'bg-yellow-500' },
  ]);

  const [subcategories, setSubcategories] = useState<{ id: string, categoryId: string, name: string, description: string, iconName: string, listingType: 'product' | 'service', specFields: any }[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [intrusionLogs, setIntrusionLogs] = useState<SecurityIntrusionLog[]>([]);
  const [safeSpots, setSafeSpots] = useState<SafeMeetupSpotConfig[]>([]);
  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>([]);
  const [recentDeals, setRecentDeals] = useState<MarketplaceDeal[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({ maintenanceMode: false, autoApproveAds: true, requireIdForPosting: false, aiSpamFilter: true });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ siteName: 'Sealify Nigeria', siteDescription: "Nigeria's Trusted Local Marketplace.", ogImage: '/og-image.png', logoUrl: '/logo.png', contactEmail: 'support@sealify.ng', contactPhone: '+234 813 120 8468' });
  const [promotionPlans, setPromotionPlans] = useState<PromotionPlanConfig[]>([
    { months: 1, label: '1 Month', rate: 15000, badge: 'STARTER' },
    { months: 3, label: '3 Months', rate: 13000, badge: 'POPULAR' },
    { months: 6, label: '6 Months', rate: 11000, badge: 'BEST VALUE' },
    { months: 12, label: '12 Months', rate: 9000, badge: 'ENTERPRISE' },
  ]);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    localStorage.setItem('sealify_interests', JSON.stringify(userInterests));
  }, [userInterests]);

  useEffect(() => {
    localStorage.setItem('sealify_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('sealify_filters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('sealify_saved', JSON.stringify(savedListingIds));
  }, [savedListingIds]);

  useEffect(() => {
    localStorage.setItem('sealify_recently_viewed', JSON.stringify(recentlyViewedIds));
  }, [recentlyViewedIds]);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    if (user) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        ...n,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      notificationService.create({ user_id: user.id, ...n }).catch(() => {});
    }
  }, [user]);

  const addAuditLog = useCallback((action: string, details: string, type: AuditLog['type']) => {
    auditService.create({ action, details, type, created_at: new Date().toISOString() }).then(() => fetchData());
  }, []);

  const fetchData = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const [
        dbUsers,
        dbListings,
        dbCategories,
        dbSubcats,
        dbVerifications,
        dbPasswords,
        dbPromotions,
        dbReviews,
        dbReports,
        dbDisputes,
        dbAudit,
        dbThreats,
        dbSpots,
        dbDeals,
        dbMeta,
        dbConfigs,
        dbAnnouncements,
        dbRecentDeals,
        dbSearchAlerts,
        dbFavorites,
        dbWallet,
        dbTransactions,
        dbBuyerRequests,
        dbMessages,
        dbNotifications,
      ] = await Promise.allSettled([
        userService.getAll(),
        listingService.getAll(),
        categoryService.getAll(),
        subcategoryService.getAll(),
        verificationService.getAll(),
        passwordRequestService.getAll(),
        promotionService.getAll(),
        reviewService.getAll(),
        reportService.getAll(),
        disputeService.getAll(),
        auditService.getAll(),
        intrusionService.getAll(),
        safeSpotService.getAll(),
        recentDealsService.getAll(),
        siteSettingsService.get(),
        systemConfigService.getAll(),
        announcementService.getAll(),
        recentDealsService.getAll(),
        searchAlertService.getAll(user?.id || ''),
        favoriteService.getByUserId(user?.id || ''),
        (async () => {
          const { data } = await supabase.from('wallets').select('*').eq('user_id', user?.id || '').single();
          return data;
        })(),
        (async () => {
          const { data } = await supabase.from('transactions').select('*').eq('wallet_id', wallet?.id || '').order('created_at', { ascending: false });
          return data;
        })(),
        buyerRequestService.getAll(),
        (async () => {
          const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(100);
          return data;
        })(),
        (async () => {
          const { data } = await supabase.from('notifications').select('*').eq('user_id', user?.id || '').order('created_at', { ascending: false }).limit(50);
          return data;
        })(),
      ]);

      if (dbUsers.status === 'fulfilled' && dbUsers.value && dbUsers.value.length > 0) {
        setAllUsers(dbUsers.value as any);
      }
      if (dbListings.status === 'fulfilled' && dbListings.value && dbListings.value.length > 0) {
        const fetchedFromDb = dbListings.value.map((l: any) => ({
          id: l.id,
          sellerId: l.seller_id,
          sellerName: '',
          sellerPhone: '',
          sellerAvatar: '',
          sellerVerified: false,
          sellerVerificationType: undefined,
          title: l.title,
          description: l.description,
          price: l.price,
          originalPrice: l.original_price,
          category: l.category_id as Category,
          condition: l.condition as Condition,
          location: l.location,
          status: l.status || 'active',
          images: l.listing_images?.map((img: any) => img.image_url) || (l.images ? l.images : []),
          videoUrl: l.video_url,
          createdAt: l.created_at,
          viewsCount: l.views_count || 0,
          featured: l.featured,
          promotionDurationMonths: l.promotion_duration_months,
          promotionPlanName: l.promotion_plan_name,
          promotionStartDate: l.promotion_start_date,
          promotionEndDate: l.promotion_end_date,
          paymentStatus: l.payment_status,
          paymentProofUrl: l.payment_proof_url,
          amountPaid: l.amount_paid,
          specifications: l.specifications
        }));
        const localCustom = getStoredCustomListings();
        const dbIds = new Set(fetchedFromDb.map(item => item.id));
        const uniqueLocal = localCustom.filter(item => !dbIds.has(item.id));
        setListings([...uniqueLocal, ...fetchedFromDb]);
      } else {
        const mockIds = new Set(MOCK_LISTINGS.map(item => item.id));
        const localCustom = getStoredCustomListings();
        const uniqueLocal = localCustom.filter(item => !mockIds.has(item.id));
        setListings([...uniqueLocal, ...MOCK_LISTINGS]);
      }
      if (dbCategories.status === 'fulfilled' && dbCategories.value) {
        setCategories(dbCategories.value.map(c => ({
          id: c.id, name: c.name, iconName: c.icon_name, color: c.color, count: 0
        })));
      }
      if (dbSubcats.status === 'fulfilled' && dbSubcats.value) {
        setSubcategories(dbSubcats.value.map(s => ({
          id: s.id, categoryId: s.category_id, name: s.name, description: s.description,
          iconName: s.icon_name, listingType: s.listing_type, specFields: s.spec_fields
        })));
      }
      if (dbVerifications.status === 'fulfilled' && dbVerifications.value) setVerificationRequests(dbVerifications.value as any);
      if (dbPasswords.status === 'fulfilled' && dbPasswords.value) setPasswordRequests(dbPasswords.value as any);
      if (dbPromotions.status === 'fulfilled' && dbPromotions.value) setPromotionPaymentRequests(dbPromotions.value as any);
      if (dbReviews.status === 'fulfilled' && dbReviews.value) setReviews(dbReviews.value as any);
      if (dbReports.status === 'fulfilled' && dbReports.value) setReports(dbReports.value as any);
      if (dbDisputes.status === 'fulfilled' && dbDisputes.value) setDisputeCases(dbDisputes.value as any);
      if (dbAudit.status === 'fulfilled' && dbAudit.value) setAuditLogs(dbAudit.value as any);
      if (dbThreats.status === 'fulfilled' && dbThreats.value) setIntrusionLogs(dbThreats.value as any);
      if (dbSpots.status === 'fulfilled' && dbSpots.value && dbSpots.value.length > 0) setSafeSpots(dbSpots.value as any);
      if (dbDeals.status === 'fulfilled' && dbDeals.value) setRecentDeals(dbDeals.value.map((d: any) => ({ id: d.id, itemTitle: d.item_title, price: d.price, location: d.location, time: d.time })));
      if (dbMeta.status === 'fulfilled' && dbMeta.value) setSiteSettings(dbMeta.value as any);
      if (dbConfigs.status === 'fulfilled' && dbConfigs.value) {
        const configObj: any = {};
        dbConfigs.value.forEach(c => configObj[c.key] = c.value);
        setSystemConfig(configObj);
      }
      if (dbAnnouncements.status === 'fulfilled' && dbAnnouncements.value) setAnnouncements(dbAnnouncements.value as any);
      if (dbRecentDeals.status === 'fulfilled' && dbRecentDeals.value) setRecentDeals(dbRecentDeals.value as any);
      if (dbSearchAlerts.status === 'fulfilled' && dbSearchAlerts.value) setSearchAlerts(dbSearchAlerts.value as any);
      if (dbFavorites.status === 'fulfilled' && dbFavorites.value) setSavedListingIds(dbFavorites.value.map(f => f.listing_id));
      if (dbWallet.status === 'fulfilled' && dbWallet.value) setWallet(dbWallet.value as any);
      if (dbTransactions.status === 'fulfilled' && dbTransactions.value) setTransactions(dbTransactions.value as any);
      if (dbBuyerRequests.status === 'fulfilled' && dbBuyerRequests.value) setBuyerRequests(dbBuyerRequests.value as any);
      if (dbMessages.status === 'fulfilled' && dbMessages.value) {
        // Messages handled separately
      }
      if (dbNotifications.status === 'fulfilled' && dbNotifications.value) setNotifications(dbNotifications.value as any);

    } catch (err) {
      console.error('fetchData error:', err);
      setError('Failed to sync with database');
    } finally {
      setIsSyncing(false);
    }
  }, [user, isSyncing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewedIds(p => [id, ...p.filter(i => i !== id)].slice(0, 10));
    const item = listings.find(l => l.id === id);
    if (item) {
      setUserInterests(prev => ({
        ...prev,
        [item.category]: (prev[item.category] || 0) + 1
      }));
    }
  }, [listings]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'password123'
      });
      if (error) {
        toast.error(error.message);
        return false;
      }
      if (!data.user) {
        toast.error('Authentication failed - no user returned');
        return false;
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profile) {
        setUser({ ...profile, status: 'active' } as any);
      } else {
        console.log('Profile not found in DB, creating...');
        const newProfile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || 'User',
          phone_number: data.user.user_metadata?.phone || '',
          avatar_url: '',
          role: 'buyer',
          verified: false,
          verification_type: 'none',
          location: 'Ogbomoso, Oyo State',
          member_since: new Date().toISOString(),
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const { data: created } = await supabase.from('profiles').insert([newProfile]).select().single();
        if (created) {
          setUser(created);
        } else {
          setUser(newProfile);
        }
      }
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || 'Authentication failure.');
      return false;
    }
  };

  const dispatchWelcomeGreetingEmail = (userId: string, userEmail: string, userName: string) => {
    const welcomeNotif: AppNotification = {
      id: `notif_welcome_${Date.now()}`,
      type: 'system',
      title: `Welcome to Sealify, ${userName}! 🎉`,
      description: 'Your account is now active. Start exploring verified deals in Ogbomoso and beyond. Need help? Check our Safety Center or join our WhatsApp community.',
      linkUrl: '/how-it-works',
      read: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [welcomeNotif, ...prev]);
    notificationService.create({
      user_id: userId,
      type: 'system',
      title: `Welcome to Sealify, ${userName}! 🎉`,
      description: 'Your account is now active. Start exploring verified deals in Ogbomoso and beyond.',
      link_url: '/how-it-works'
    }).catch(() => {});
    addAuditLog('Welcome Onboarding Dispatched', `Welcome message & Sealify onboarding dispatched to ${userEmail} (${userName})`, 'user');
  };

  const dispatchPromotionalEmailDigest = useCallback(() => {
    const featuredPromos = listings.filter(l => l.featured || l.viewsCount > 100).slice(0, 3);
    const promoTitles = featuredPromos.map(l => `• ${l.title} (₦${l.price.toLocaleString()})`).join('\n');
    allUsers.forEach(u => {
      notificationService.create({
        user_id: u.id,
        type: 'promotion',
        title: '📬 Weekly Sealify Digest — Top Picks for You',
        description: `Here are this week's hottest verified deals in Ogbomoso:\n${promoTitles}`,
        link_url: '/'
      }).catch(() => {});
    });
    toast.success(`📧 Promotional digest dispatched to all ${allUsers.length} user accounts!`);
  }, [listings, allUsers, addAuditLog]);

  const signup = async (data: Partial<UserProfile> & { password?: string }) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email!,
        password: data.password!,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phoneNumber,
          },
          emailRedirectTo: window.location.origin
        }
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!authData.user) {
        toast.error('Signup failed - no user created');
        return;
      }
      const newUserId = authData.user.id;
      const newProfile = {
        id: newUserId,
        email: data.email!,
        full_name: data.fullName || 'New User',
        phone_number: data.phoneNumber || '',
        avatar_url: '',
        role: 'buyer',
        verified: false,
        verification_type: 'none',
        location: 'Ogbomoso, Oyo State',
        member_since: new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data: created, error: profileError } = await supabase.from('profiles').insert([newProfile]).select().single();
      if (profileError) {
        console.warn('Profile DB insert notice:', profileError);
      }
      if (!created) {
        toast.error('Failed to create user profile in database. Please contact support.');
        return;
      }
      dispatchWelcomeGreetingEmail(newUserId, data.email!, data.fullName!);
      toast.success(`🎉 Welcome to Sealify, ${data.fullName}! Your account is active and unrestricted.`, { duration: 6000 });
      fetchData();
    } catch (err: any) {
      console.error('Signup error:', err);
      toast.error(err.message || "Signup failed.");
    }
  };

  const adminLogin = async (email: string, pass: string, pin?: string): Promise<boolean> => {
    if (email.toLowerCase().trim() === adminEmail.toLowerCase().trim() && pass === adminPassword && pin === adminPin) {
      const adminProfile: UserProfile = {
        id: 'usr_admin_default',
        email: adminEmail,
        fullName: 'Sealify Official',
        phoneNumber: '+234 813 120 8468',
        avatarUrl: '/logo.png',
        role: 'admin',
        verified: true,
        verificationType: 'premium',
        businessName: 'Sealify National Hub',
        memberSince: 'Jan 2023',
        location: 'Ogbomoso, Oyo State'
      };
      const sessionToken = generateAdminSessionToken(adminEmail);
      sessionStorage.setItem('sealify_admin_session_token', sessionToken);
      setUser(adminProfile);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sealify_active_user');
    sessionStorage.removeItem('sealify_admin_session_token');
    toast.info('Logged out successfully.');
  };

  const updateUser = async (id: string, data: Partial<UserProfile>) => {
    setAllUsers(prev =>
      prev.map(u => u.id === id ? { ...u, ...data } : u)
    );
    if (user?.id === id) {
      setUser(prev => prev ? ({ ...prev, ...data }) : null);
    }
    const updated = await userService.update(id, data);
    if (updated === null) {
      toast.error('Failed to update user. Please try again.');
      fetchData();
      return;
    }
    fetchData();
  };

  const deleteUser = async (id: string) => {
    if (user?.id === id) logout();
    await userService.delete(id);
    fetchData();
  };

  const addUser = async (data: Partial<UserProfile>) => {
    const newUserId = `usr_${Date.now()}`;
    const newUser = {
      id: newUserId,
      email: data.email!,
      full_name: data.fullName || 'New User',
      phone_number: data.phoneNumber || '',
      avatar_url: '',
      role: data.role || 'buyer',
      verified: false,
      verification_type: 'none' as VerificationBadgeType,
      business_name: data.businessName || '',
      business_category: data.businessCategory || '',
      business_address: data.businessAddress || '',
      cac_number: data.cacNumber || '',
      business_hours: data.businessHours || 'Mon - Sat: 8:00 AM - 7:00 PM',
      bank_name: data.bankName || '',
      account_number: data.accountNumber || '',
      account_name: data.accountName || '',
      website_url: data.websiteUrl || '',
      instagram_handle: data.instagramHandle || '',
      twitter_handle: data.twitterHandle || '',
      whatsapp_number: data.whatsappNumber || '',
      email_notifications: data.emailNotifications ?? true,
      whatsapp_notifications: data.whatsappNotifications ?? true,
      hide_phone_publicly: data.hidePhonePublicly ?? false,
      hide_location_publicly: data.hideLocationPublicly ?? false,
      location: data.location || 'Ogbomoso, Oyo State',
      member_since: new Date().toISOString(),
      status: 'active' as UserStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    try {
      const created = await userService.create(newUser);
      if (created === null) {
        throw new Error('Failed to create user');
      }
      const newUserProfile: UserProfile = {
        id: newUserId,
        email: newUser.email,
        fullName: newUser.full_name,
        phoneNumber: newUser.phone_number,
        avatarUrl: newUser.avatar_url,
        role: newUser.role,
        verified: newUser.verified,
        verificationType: newUser.verification_type,
        businessName: newUser.business_name,
        cacNumber: newUser.cac_number,
        businessHours: newUser.business_hours,
        bankName: newUser.bank_name,
        accountNumber: newUser.account_number,
        accountName: newUser.account_name,
        websiteUrl: newUser.website_url,
        instagramHandle: newUser.instagram_handle,
        twitterHandle: newUser.twitter_handle,
        location: newUser.location
      };
      setAllUsers(prev => [...prev, newUserProfile]);
      if (user?.id === newUserId) {
        setUser(newUserProfile);
      }
      fetchData();
    } catch (err: any) {
      toast.error(`Failed to create user: ${err.message ?? 'Unknown error'}`);
      fetchData();
    }
  };

  const checkSearchAlertsForListing = useCallback((listing: Listing) => {
    searchAlerts.forEach(alert => {
      const matchesQuery = !alert.query || listing.title.toLowerCase().includes(alert.query.toLowerCase());
      const matchesCategory = alert.category === 'All' || alert.category === listing.category;
      const matchesPrice = alert.maxPrice === null || listing.price <= alert.maxPrice;
      const matchesLocation = alert.location === 'Any Location' || listing.location.toLowerCase().includes(alert.location.toLowerCase());
      if (matchesQuery && matchesCategory && matchesPrice && matchesLocation) {
        addNotification({
          type: 'alert_match',
          title: 'New Matching Listing!',
          description: `"${listing.title}" matches your saved search "${alert.query}"`,
          linkUrl: `/listing/${listing.id}`
        });
      }
    });
  }, [searchAlerts, addNotification]);

  const createListing = async (data: Partial<Listing>, files?: File[]): Promise<boolean> => {
    try {
      let uploadedUrls: string[] = data.images || [];
      if (files && files.length > 0) {
        try {
          const newUrls = await Promise.all(
            files.map(file => storageService.uploadFile('listing-photos', `lst_${Date.now()}`, file))
          );
          const validUrls = newUrls.filter(Boolean);
          if (validUrls.length > 0) {
            uploadedUrls = [...uploadedUrls, ...validUrls];
          }
        } catch (e) {
          console.warn('Storage upload error, using local image representations:', e);
        }
      }
      if (uploadedUrls.length === 0) {
        uploadedUrls = ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'];
      }
      const { data: dbResult, error } = await listingService.create({
        seller_id: user?.id,
        title: data.title,
        description: data.description,
        price: data.price,
        category_id: data.category,
        subcategory_id: data.subcategory,
        condition: data.condition,
        location: data.location,
        images: uploadedUrls,
        video_url: data.videoUrl,
        specifications: data.specifications,
        featured: data.featured,
        promotion_plan_name: data.promotionPlanName,
        promotion_duration_months: data.promotionDurationMonths,
        promotion_start_date: data.promotionStartDate,
        promotion_end_date: data.promotionEndDate,
        payment_status: data.paymentStatus,
        payment_proof_url: data.paymentProofUrl,
        amount_paid: data.amountPaid
      }, uploadedUrls);
      if (error) {
        console.warn('Listing DB insert notice:', error);
      }
      const newListing: Listing = {
        id: dbResult?.id || `lst_user_${Date.now()}`,
        sellerId: user?.id || 'usr_guest',
        sellerName: user?.fullName || 'You',
        sellerPhone: user?.phoneNumber || '',
        sellerAvatar: user?.avatarUrl || '/logo.png',
        sellerVerified: user?.verified ?? false,
        sellerVerificationType: user?.verificationType,
        title: data.title || '',
        description: data.description || '',
        price: data.price || 0,
        category: data.category || 'Electronics',
        condition: data.condition || 'Like New',
        location: data.location || 'Ogbomoso, Oyo State',
        status: 'active',
        images: uploadedUrls,
        videoUrl: data.videoUrl,
        createdAt: 'Just now',
        viewsCount: 1,
        featured: data.featured,
        promotionDurationMonths: data.promotionDurationMonths,
        promotionPlanName: data.promotionPlanName,
        promotionStartDate: data.promotionStartDate,
        promotionEndDate: data.promotionEndDate,
        paymentStatus: data.paymentStatus,
        paymentProofUrl: data.paymentProofUrl,
        amountPaid: data.amountPaid,
        specifications: data.specifications
      };
      setListings(prev => [newListing, ...prev]);
      checkSearchAlertsForListing(newListing);
      return true;
    } catch (e: any) {
      toast.error(e.message || 'Failed to publish listing.');
      return false;
    }
  };

  const updateListing = async (id: string, updatedData: Partial<Listing>) => {
    setListings(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
    const currentStored = getStoredCustomListings();
    const updatedStored = currentStored.map(item => item.id === id ? { ...item, ...updatedData } : item);
    saveStoredCustomListings(updatedStored);
    await listingService.update(id, updatedData);
    fetchData();
  };

  const deleteListing = async (id: string) => {
    setListings(prev => prev.filter(item => item.id !== id));
    const currentStored = getStoredCustomListings();
    const updatedStored = currentStored.filter(item => item.id !== id);
    saveStoredCustomListings(updatedStored);
    await listingService.delete(id);
    fetchData();
  };

  const markAsSold = async (id: string) => {
    setListings(prev => prev.map(item => item.id === id ? { ...item, status: 'sold' as const } : item));
    const currentStored = getStoredCustomListings();
    const updatedStored = currentStored.map(item => item.id === id ? { ...item, status: 'sold' as const } : item);
    saveStoredCustomListings(updatedStored);
    await listingService.update(id, { status: 'sold' });
    fetchData();
  };

  const t = useCallback((key: string) => TRANSLATIONS[language]?.[key] || key, [language]);

  const sendMessage = async (lId: string, rId: string, content: string) => {
    const targetListing = listings.find(l => l.id === lId);
    const recipientUser = allUsers.find(u => u.id === rId);
    if (!targetListing || !recipientUser) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: user?.id || 'usr_guest',
      receiverId: rId,
      listingId: lId,
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversations(prev => {
      const existingConvIndex = prev.findIndex(c => c.listingId === lId && (c.otherUser.id === rId || c.otherUser.id === user?.id));
      if (existingConvIndex !== -1) {
        const updated = [...prev];
        const conv = updated[existingConvIndex];
        updated[existingConvIndex] = {
          ...conv,
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [...conv.messages, newMsg]
        };
        return updated;
      } else {
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          listingId: lId,
          listingTitle: targetListing.title,
          listingImage: targetListing.images[0],
          listingPrice: targetListing.price,
          otherUser: {
            id: rId,
            name: recipientUser.fullName || targetListing.sellerName || 'Verified Merchant',
            avatar: recipientUser.avatarUrl || targetListing.sellerAvatar || '/logo.png'
          },
          lastMessage: content,
          lastMessageTime: 'Just now',
          messages: [newMsg]
        };
        return [newConv, ...prev];
      }
    });
    await messageService.sendMessage({ sender_id: user?.id || 'usr_guest', receiver_id: rId, listing_id: lId, content });
  };

  const marketStats: CategoryStats[] = useMemo(() => {
    return categories.map(cat => {
      const catAds = listings.filter(l => l.category === cat.name);
      const prices = catAds.map(l => l.price);
      return {
        category: cat.name as Category,
        avgPrice: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        totalAds: catAds.length,
        demandScore: Math.min(100, Math.round(catAds.length * 15)),
        trend: 'up'
      };
    });
  }, [listings, categories]);

  const analytics = useMemo((): AnalyticsData => {
    return {
      visitors: 142 + Math.floor(Math.random() * 20),
      activeAds: listings.filter(l => l.status === 'active').length,
      totalChats: conversations.length,
      totalRevenue: promotionPaymentRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0),
      userGrowth: Math.round((allUsers.length / 10) * 100) / 10,
      categoryDistribution: categories.map(c => ({ name: c.name, count: listings.filter(l => l.category === c.name).length, color: c.color })),
      activeSessions: [{ id: 'sess_1', user: 'Guest_Node', action: 'Searching', time: 'Just now' }]
    };
  }, [listings, allUsers, conversations, promotionPaymentRequests, categories]);

  const contextValue = useMemo(() => ({
    user, setUser, isAuthenticated: !!user, isAdmin,
    adminEmail, adminPassword, adminPin, updateAdminCredentials,
    systemConfig, updateSystemConfig: (upd) => { setSystemConfig(p => ({...p, ...upd})); Object.entries(upd).forEach(([k, v]) => systemConfigService.update(k, v as boolean)); },
    siteSettings, updateSiteSettings: (s) => { setSiteSettings(p => ({...p, ...s})); siteSettingsService.update(s); addAuditLog('Site Meta Updated', 'Modified global site description/contact', 'broadcast'); },
    promotionPlans, updatePromotionPlanRate: (m, r) => setPromotionPlans(p => p.map(plan => plan.months === m ? {...plan, rate: r} : plan)),
    safeSpots, addSafeSpot: (s) => safeSpotService.create(s).then(() => fetchData()), deleteSafeSpot: (id) => safeSpotService.delete(id).then(() => fetchData()),
    exportDatabaseBackup: () => { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ listings, allUsers, reviews, siteSettings }, null, 2)); const dlAnchorElem = document.createElement('a'); dlAnchorElem.setAttribute("href", dataStr); dlAnchorElem.setAttribute("download", `Sealify_DB_Backup_${Date.now()}.json`); dlAnchorElem.click(); toast.success("Database Backup Exported!"); },
    language, setLanguage, t, categories, subcategories,
    addCategory: (c) => { setCategories(prev => [...prev, c]); categoryService.create(c).then(() => fetchData()); },
    deleteCategory: (id) => { setCategories(p => p.filter(c => c.id !== id)); categoryService.delete(id).then(() => fetchData()); },
    updateCategory: (id, name) => { setCategories(p => p.map(c => c.id === id ? {...c, name} : c)); categoryService.update(id, { name }).then(() => fetchData()); },
    analytics, marketStats, login, signup, sendPhoneOtp: async () => Math.floor(100000 + Math.random() * 900000).toString(), verifyPhoneOtp: async () => true,
    adminLogin, logout, listings, allUsers, updateUser, addUser, deleteUser,
    bulkUpdateUsers: (ids, upd) => ids.forEach(id => updateUser(id, upd)), bulkDeleteUsers: (ids) => ids.forEach(id => deleteUser(id)),
    bulkUpdateListings: (ids, upd) => ids.forEach(id => updateListing(id, upd)), bulkDeleteListings: (ids) => ids.forEach(id => deleteListing(id)),
    savedListingIds, recentlyViewedIds, userInterests, addRecentlyViewed,
    toggleSaveListing: async (id) => { if (user) { const exists = savedListingIds.includes(id); await favoriteService.toggle(user.id, id, exists); setSavedListingIds(p => exists ? p.filter(i => i !== id) : [...p, id]); } },
    isSaved: (id) => savedListingIds.includes(id), filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
    activeCategory, setActiveCategory: (c) => setFilters(f => ({...f, category: c})),
    compareListingIds, toggleCompareListing: (id) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p),
    isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
    createListing, updateListing, deleteListing, markAsSold, toggleFeaturedListing: async (id) => updateListing(id, { featured: !listings.find(l => l.id === id)?.featured }), promoteListing: async (id, dur, plan) => updateListing(id, { featured: true, promotionPlanName: plan, promotionDurationMonths: dur }),
    conversations, sendMessage,
    notifications, markNotificationRead: (id) => notificationService.markRead(id).then(() => fetchData()),
    markAllNotificationsRead: () => Promise.all(notifications.map(n => notificationService.markRead(n.id))).then(() => fetchData()),
    clearNotification: (id) => notificationService.clear(id).then(() => fetchData()),
    addNotification,
    broadcastMassNotification: (title, message, targetRole = 'all') => {
      allUsers.forEach(u => {
        notificationService.create({
          user_id: u.id,
          type: 'system',
          title,
          description: message,
          link_url: '/'
        }).catch(() => {});
      });
      addAuditLog('Mass Broadcast', `Headline: ${title}`, 'broadcast');
      toast.success(`Broadcasted: ${title}`);
    },
    dispatchPromotionalEmailDigest,
    passwordRequests, submitPasswordRequest: (r) => passwordRequestService.create(r).then(() => fetchData()),
    processPasswordRequest: (id, s) => passwordRequestService.updateStatus(id, s).then(() => fetchData()),
    verificationRequests, submitVerificationRequest: (r) => verificationService.create(r).then(() => fetchData()),
    processVerificationRequest: (id, s) => verificationService.updateStatus(id, s).then(() => { addAuditLog('Verification Processed', `Request ID ${id} set to ${s}`, 'verification'); fetchData(); }),
    promotionPaymentRequests, submitPromotionPaymentRequest: (r) => promotionService.create(r).then(() => fetchData()),
    processPromotionPaymentRequest: (id, s) => promotionService.updateStatus(id, s).then(() => { addAuditLog('Finance Approval', `Promotion Payment ID ${id} ${s}`, 'finance'); fetchData(); }),
    announcements, addAnnouncement: (a) => announcementService.create(a).then(() => fetchData()), toggleAnnouncement: (id) => announcementService.delete(id).then(() => fetchData()), deleteAnnouncement: (id) => announcementService.delete(id).then(() => fetchData()),
    reports, submitReport: (r) => reportService.create(r).then(() => fetchData()), processReport: (id) => reportService.updateStatus(id, 'resolved').then(() => fetchData()),
    disputeCases, submitDisputeCase: (d) => disputeService.create(d).then(() => fetchData()),
    processDisputeCase: (id, s) => disputeService.updateStatus(id, s).then(() => { addAuditLog('Dispute Mediated', `Dispute ID ${id} set to ${s}`, 'dispute'); fetchData(); }),
    auditLogs, addAuditLog,
    recentDeals, sealDeal: (l, b, p) => recentDealsService.create({ item_title: l, price: p, location: user?.location || 'Ogbomoso', time: 'Just now' }).then(() => fetchData()),
    intrusionLogs, recordIntrusion: (e, m) => intrusionService.create({ attempted_email: e, media_status: m, timestamp: new Date().toISOString() }).then(() => { addAuditLog('Unauthorized Access Attempt', `Email: ${e} | Payload: ${m}`, 'intrusion'); fetchData(); }),
    searchAlerts, saveSearchAlert: (a) => searchAlertService.create({ ...a, user_id: user?.id }).then(() => fetchData()),
    deleteSearchAlert: (id) => searchAlertService.delete(id).then(() => fetchData()),
    reviews, addReview: (r) => reviewService.create(r).then(() => fetchData()), deleteReview: (id) => reviewService.delete(id).then(() => fetchData()),
    buyerRequests, createBuyerRequest: (r) => buyerRequestService.create(r).then(() => fetchData()), deleteBuyerRequest: (id) => buyerRequestService.delete(id).then(() => fetchData()),
    wallet, transactions, requestPayout: async (amount: number) => {
      if (!wallet || wallet.balance < amount) {
        toast.error('Insufficient balance');
        return;
      }
      setWallet(prev => prev ? { ...prev, balance: prev.balance - amount, pendingBalance: prev.pendingBalance + amount } : null);
      setTransactions(prev => [{ id: `txn_${Date.now()}`, walletId: wallet?.id || '', type: 'payout', amount: -amount, status: 'pending', description: 'Withdrawal to bank', createdAt: new Date().toISOString() }, ...prev]);
      toast.success(`Payout of ₦${amount.toLocaleString()} requested`);
    },
    loading, isSyncing, lastSyncTime, syncDatabase: fetchData, error
  }), [
    user, isAdmin, adminEmail, adminPassword, adminPin, systemConfig, siteSettings, promotionPlans, safeSpots,
    language, categories, subcategories, analytics, marketStats, login, signup, adminLogin, logout,
    listings, allUsers, updateUser, addUser, deleteUser, savedListingIds, recentlyViewedIds, userInterests,
    addRecentlyViewed, toggleSaveListing: async (id) => { if (user) { const exists = savedListingIds.includes(id); await favoriteService.toggle(user.id, id, exists); setSavedListingIds(p => exists ? p.filter(i => i !== id) : [...p, id]); } },
    isSaved: (id) => savedListingIds.includes(id), filters, setFilters, resetFilters: () => setFilters({ searchQuery: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' }),
    activeCategory, setActiveCategory: (c) => setFilters(f => ({...f, category: c})),
    compareListingIds, toggleCompareListing: (id) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p),
    isInCompare: (id) => compareListingIds.includes(id), clearCompare: () => setCompareListingIds([]),
    createListing, updateListing, deleteListing, markAsSold, conversations, sendMessage,
    notifications, markNotificationRead: (id) => notificationService.markRead(id).then(() => fetchData()),
    markAllNotificationsRead: () => Promise.all(notifications.map(n => notificationService.markRead(n.id))).then(() => fetchData()),
    clearNotification: (id) => notificationService.clear(id).then(() => fetchData()),
    addNotification, broadcastMassNotification, dispatchPromotionalEmailDigest,
    passwordRequests, verificationRequests, promotionPaymentRequests, announcements,
    reports, disputeCases, auditLogs, recentDeals, intrusionLogs, searchAlerts,
    reviews, buyerRequests, wallet, transactions, loading, isSyncing, lastSyncTime, syncDatabase: fetchData, error
  ]);

  return (
    <SealifyContext.Provider value={contextValue}>
      {children}
    </SealifyContext.Provider>
  );
};

export const useSealify = () => {
  const context = useContext(SealifyContext);
  if (!context) throw new Error('useSealify must be used within SealifyProvider');
  return context;
};