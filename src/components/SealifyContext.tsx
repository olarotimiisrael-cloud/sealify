>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  adminEmail: string;
  adminPassword: string;
  adminPin: string;
  updateAdminCredentials: (email: string, password: string, pin: string) => void;
  
  systemConfig: Record<string, boolean | number>;
  updateSystemConfig: (updates: Record<string, boolean | number>) => void;
  
  siteSettings: { siteName: string; siteDescription: string; ogImage: string; contactEmail: string; contactPhone: string } | null;
  updateSiteSettings: (settings: Partial<{ siteName: string; siteDescription: string; ogImage: string; contactEmail: string; contactPhone: string }>) => void;
  
  promotionPlans: { months: number; label: string; rate: number; badge?: string; isActive: boolean }[];
  updatePromotionPlanRate: (months: number, rate: number) => void;
  
  safeSpots: SafeMeetupSpotConfig[];
  addSafeSpot: (spot: SafeMeetupSpotConfig) => Promise<void>;
  deleteSafeSpot: (id: string) => Promise<void>;
  
  exportDatabaseBackup: () => void;
  
  language: 'en' | 'yo' | 'ha' | 'ig' | 'zh';
  setLanguage: (lang: 'en' | 'yo' | 'ha' | 'ig' | 'zh') => void;
  t: (key: string) => string;
  
  categories: CategoryConfig[];
  subcategories: any[];
  addCategory: (category: CategoryConfig) => void;
  deleteCategory: (id: string) => void;
  updateCategory: (id: string, name: string) => void;
  
  analytics: { visitors: number; totalAds: number; soldAds: number; revenue: number; userGrowth: number; categoryDistribution: { name: string; count: number }[] };
  marketStats: CategoryStats[];
  
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: { email: string; password: string; fullName: string; phoneNumber: string }) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<string>;
  verifyPhoneOtp: (phone: string, code: string) => Promise<boolean>;
  adminLogin: (email: string, password: string, pin: string) => Promise<boolean>;
  logout: () => void;
  
  listings: Listing[];
  allUsers: UserProfile[];
  updateUser: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  addUser: (user: UserProfile) => void;
  deleteUser: (id: string) => void;
  bulkUpdateUsers: (ids: string[], updates: Partial<UserProfile>) => void;
  bulkDeleteUsers: (ids: string[]) => void;
  bulkUpdateListings: (ids: string[], updates: Partial<Listing>) => void;
  bulkDeleteListings: (ids: string[]) => void;
  
  savedListingIds: string[];
  recentlyViewedIds: string[];
  userInterests: Record<string, number>;
  addRecentlyViewed: (id: string) => void;
  toggleSaveListing: (id: string) => Promise<void>;
  isSaved: (id: string) => boolean;
  
  filters: SearchFilter;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilter>>;
  resetFilters: () => void;
  activeCategory: Category | 'All';
  setActiveCategory: (category: Category | 'All') => void;
  
  compareListingIds: string[];
  toggleCompareListing: (id: string) => void;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  
  createListing: (data: Omit<Listing, 'id' | 'sellerId' | 'createdAt' | 'viewsCount' | 'status'>, files?: File[]) => Promise<boolean>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => void;
  markAsSold: (id: string) => void;
  toggleFeaturedListing: (id: string) => Promise<void>;
  promoteListing: (id: string, durationMonths: number, planName: string) => Promise<void>;
  
  conversations: Conversation[];
  sendMessage: (listingId: string, receiverId: string, content: string) => void;
  
  notifications: AppNotification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  broadcastMassNotification: (data: { target: string; title: string; message: string }) => void;
  dispatchPromotionalEmailDigest: () => void;
  
  passwordRequests: any[];
  submitPasswordRequest: (request: any) => Promise<void>;
  processPasswordRequest: (id: string, status: string) => Promise<void>;
  verificationRequests: any[];
  submitVerificationRequest: (request: any) => Promise<void>;
  processVerificationRequest: (id: string, status: string) => Promise<void>;
  promotionPaymentRequests: any[];
  submitPromotionPaymentRequest: (request: any) => Promise<void>;
  processPromotionPaymentRequest: (id: string, status: string) => Promise<void>;
  announcements: SystemAnnouncement[];
  addAnnouncement: (announcement: Omit<SystemAnnouncement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  toggleAnnouncement: (id: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  reports: any[];
  submitReport: (report: any) => Promise<void>;
  processReport: (id: string, status: string) => Promise<void>;
  disputeCases: any[];
  submitDisputeCase: (dispute: any) => Promise<void>;
  processDisputeCase: (id: string, status: string) => Promise<void>;
  auditLogs: any[];
  addAuditLog: (action: string, details: string, type: string) => void;
  recentDeals: any[];
  sealDeal: (listingTitle: string, buyerName: string, price: number) => void;
  intrusionLogs: any[];
  recordIntrusion: (attemptedEmail: string, metadata: string) => void;
  
  searchAlerts: SearchAlert[];
  saveSearchAlert: (alert: Omit<SearchAlert, 'id' | 'userId' | 'createdAt' | 'matchCount' | 'isActive'>) => Promise<void>;
  deleteSearchAlert: (id: string) => Promise<void>;
  
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  
  buyerRequests: BuyerRequest[];
  createBuyerRequest: (request: Omit<BuyerRequest, 'id' | 'createdAt' | 'responsesCount'>) => Promise<void>;
  deleteBuyerRequest: (id: string) => Promise<void>;
  
  wallet: Wallet | null;
  transactions: Transaction[];
  requestPayout: (amount: number) => Promise<void>;
  
  loading: boolean;
  isSyncing: boolean;
  lastSyncTime: string;
  syncDatabase: () => Promise<void>;
  error: string | null;
}

const SealifyContext = createContext<SealifyContextType | undefined>(undefined);

const MOCK_CATEGORIES: CategoryConfig[] = [
  { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 3, color: 'bg-blue-500' },
  { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 3, color: 'bg-purple-500' },
  { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 3, color: 'bg-teal-500' },
  { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 3, color: 'bg-pink-500' },
  { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 3, color: 'bg-amber-500' },
  { id: 'services', name: 'Services', iconName: 'Wrench', count: 3, color: 'bg-cyan-500' },
  { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 3, color: 'bg-indigo-500' },
  { id: 'beauty', name: 'Beauty & Health', iconName: 'Sparkles', count: 3, color: 'bg-rose-500' },
  { id: 'utility', name: 'Utility & Energy', iconName: 'Zap', count: 3, color: 'bg-yellow-500' },
  { id: 'solar', name: 'Solar & Clean Energy', iconName: 'Sun', count: 3, color: 'bg-yellow-500' },
];

const MOCK_MARKET_STATS: CategoryStats[] = [
  { category: 'Vehicles', avgPrice: 2500000, minPrice: 500000, maxPrice: 10000000, totalAds: 15, demandScore: 78, trend: 'up' },
  { category: 'Electronics', avgPrice: 180000, minPrice: 25000, maxPrice: 1200000, totalAds: 42, demandScore: 92, trend: 'up' },
  { category: 'Real Estate', avgPrice: 450000, minPrice: 150000, maxPrice: 5000000, totalAds: 28, demandScore: 65, trend: 'stable' },
  { category: 'Fashion', avgPrice: 35000, minPrice: 5000, maxPrice: 200000, totalAds: 35, demandScore: 58, trend: 'down' },
  { category: 'Home & Furniture', avgPrice: 120000, minPrice: 20000, maxPrice: 800000, totalAds: 22, demandScore: 71, trend: 'up' },
  { category: 'Services', avgPrice: 50000, minPrice: 5000, maxPrice: 300000, totalAds: 18, demandScore: 60, trend: 'stable' },
  { category: 'Jobs', avgPrice: 50000, minPrice: 20000, maxPrice: 200000, totalAds: 12, demandScore: 85, trend: 'up' },
  { category: 'Beauty & Health', avgPrice: 15000, minPrice: 2000, maxPrice: 100000, totalAds: 25, demandScore: 75, trend: 'up' },
  { category: 'Utility & Energy', avgPrice: 150000, minPrice: 20000, maxPrice: 600000, totalAds: 20, demandScore: 68, trend: 'stable' },
  { category: 'Solar & Clean Energy', avgPrice: 350000, minPrice: 50000, maxPrice: 3000000, totalAds: 10, demandScore: 88, trend: 'up' },
];

const MOCK_SAFE_SPOTS: SafeMeetupSpotConfig[] = [
  { id: '1', name: 'Ogbomoso Divisional Police HQ', zone: 'Police HQ', category: 'Police Safe Zone', address: 'Police Headquarters, Ogbomoso, Oyo State', distance: 'Central Hub', hours: '24/7', cctvVerified: true },
  { id: '2', name: 'LAUTECH Main Gate Security Post', zone: 'LAUTECH Area', category: 'Police Safe Zone', address: 'LAUTECH Main Gate, Ogbomoso, Oyo State', distance: 'Campus Entry', hours: '24/7', cctvVerified: true },
  { id: '3', name: 'Under G Shopping Complex', zone: 'LAUTECH Area', category: 'Shopping Mall', address: 'Under G Market, Ogbomoso, Oyo State', distance: 'Student Hub', hours: '8:00 AM - 8:00 PM', cctvVerified: true },
  { id: '4', name: 'Takie Square Mall', zone: 'Takie / Center', category: 'Shopping Mall', address: 'Takie Square, Ogbomoso, Oyo State', distance: 'City Center', hours: '9:00 AM - 7:00 PM', cctvVerified: true },
  { id: '5', name: 'Sabo Market Security Post', zone: 'Sabo Market Zone', category: 'Police Safe Zone', address: 'Sabo Market, Ogbomoso, Oyo State', distance: 'Market Center', hours: '7:00 AM - 6:00 PM', cctvVerified: true },
  { id: '6', name: 'Ogbomoso Public Library', zone: 'Takie / Center', category: 'Public Library', address: 'Public Library, Ogbomoso, Oyo State', distance: 'Quiet Zone', hours: '8:00 AM - 6:00 PM', cctvVerified: true },
  { id: '7', name: 'Adenike Area Café Hub', zone: 'LAUTECH Area', category: 'Café', address: 'Adenike Junction, Ogbomoso, Oyo State', distance: 'Student Area', hours: '7:00 AM - 10:00 PM', cctvVerified: true },
  { id: '8', name: 'General Hospital Security Post', zone: 'Police HQ', category: 'Police Safe Zone', address: 'LAUTECH Teaching Hospital, Ogbomoso', distance: 'Hospital Zone', hours: '24/7', cctvVerified: true },
  { id: '9', name: 'Oja Oba Market Security', zone: 'Sabo Market Zone', category: 'Police Safe Zone', address: 'Oja Oba Market, Ogbomoso', distance: 'Market Center', hours: '7:00 AM - 6:00 PM', cctvVerified: true },
  { id: '10', name: 'Ilorin Garage Park Office', zone: 'Takie / Center', category: 'Café', address: 'Ilorin Garage, Takie, Ogbomoso', distance: 'Transport Hub', hours: '6:00 AM - 8:00 PM', cctvVerified: true },
];

const MOCK_PROMOTION_PLANS = [
  { months: 1, label: '1 Month', rate: 15000, badge: 'STARTER', isActive: true },
  { months: 3, label: '3 Months', rate: 39000, badge: 'POPULAR', isActive: true },
  { months: 6, label: '6 Months', rate: 66000, badge: 'BEST VALUE', isActive: true },
  { months: 12, label: '12 Months', rate: 108000, badge: 'ENTERPRISE', isActive: true },
];

const MOCK_SYSTEM_CONFIG = {
  maintenanceMode: false,
  autoApproveAds: true,
  requireIdForPosting: false,
  aiSpamFilter: true,
  maxImagesPerAd: 10,
  maxFileSizeMb: 20,
};

const MOCK_SITE_SETTINGS = {
  siteName: 'Sealify Nigeria',
  siteDescription: 'Nigeria\'s Trusted Local Marketplace for Ogbomosoland & Oyo State.',
  ogImage: '/og-image.png',
  contactEmail: 'support@sealify.ng',
  contactPhone: '+234 813 120 8468',
};

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: { home: 'Home', sell: 'Sell', search_placeholder: 'Search anything in Ogbomoso...', trusted_marketplace: 'Trusted Local Marketplace', browse_categories: 'Browse Categories', notifications: 'Notifications', inbox: 'Inbox', saved: 'Saved', account: 'Account', login: 'Login / Register', trending: 'Trending Classifieds', post_free_ad: 'Post Free Ad', language: 'Language', analytics: 'Analytics', visitors: 'Live Visitors', total_ads: 'Total Ads', sold_confirm: 'Confirm this item is sold?', sold_confirm_desc: 'Once confirmed, we will notify interested buyers.', my_ads: 'My Ads', stats: 'Stats', edit: 'Edit', promote: 'Promote', mark_sold: 'Mark Sold', delete: 'Delete', recommended_for_you: 'Recommended for You', ai_matched: 'AI Interest Matched', vendors: 'Vendors', safety: 'Safety', settings: 'Settings', logout: 'Sign Out', welcome: 'Welcome back', search_btn: 'Search', all_categories: 'All Categories', safe_escrow: 'Safe Escrow', requests: 'Requests', insights: 'Insights', online_now: 'online now', neighborhood_hubs: 'Neighborhood Hubs', neighborhood_desc: 'Filter by campus zones in Ogbomoso', verified_merchants: 'Verified Merchants', verified_merchants_desc: 'Discover trusted stores & vendors in Ogbomosoland', top_ads: 'Promoted Top Ads', top_ads_desc: 'Handpicked, admin-approved verified deals broadcasted across Sealify', boost_active: '5X BOOST ACTIVE', explore_promoted: 'Explore All Promoted', view_all: 'View All', reset_filter: 'Reset Filter', marketplace_feed: 'Marketplace Feed', search_alerts: 'Search Alerts', compare: 'Compare', filters: 'Filters', clear: 'Clear', visit_storefront: 'Visit Storefront', active_ads_count: 'Active Ads', cac_verified: 'CAC & ID Verified' },
  yo: { home: 'Ile', sell: 'Fi nkan tà', search_placeholder: 'Wa ohunkohun ni Ogbomoso...', trusted_marketplace: 'Ọjà Agbegbe ti O Gbẹkẹle', browse_categories: 'Awọn Ẹka Ọjà', notifications: 'Iwifunni', inbox: 'Apo-Igbọwọle', saved: 'Ti Fipamọ', account: 'Akaunti', login: 'Wọle / Forukọsilẹ', trending: 'Awọn Ọjà Tuntun', post_free_ad: 'Taja Lọfẹ', language: 'Èdè', analytics: 'Atupale', visitors: 'Awọn Alejo', total_ads: 'Gbogbo Ipolowo', sold_confirm: 'Ṣe o ti ta nkan yii?', sold_confirm_desc: 'Nigbati o ba jẹrisi, a yoo sọ fun awọn ti o nifẹ si.', my_ads: 'Awọn Ọjà Mi', stats: 'Iṣiro', edit: 'Ṣatunṣe', promote: 'Gbe soke', mark_sold: 'Ti tà', delete: 'Pa rẹ', recommended_for_you: 'A ṣe iṣeduro fun ọ', ai_matched: 'AI Nife Baramu', vendors: 'Awọn Onijaja', safety: 'Aabo', settings: 'Eto', logout: 'Jade', welcome: 'Kaabo pada', search_btn: 'Wa', all_categories: 'Gbogbo Ẹka', safe_escrow: 'Aabo Escrow', requests: 'Awọn Ebe', insights: 'Inú Rẹ', online_now: 'wa lori intanẹẹti', neighborhood_hubs: 'Agbegbe Hubs', neighborhood_desc: 'Mu nipasẹ awọn agbegbe ile-iwe ni Ogbomoso', verified_merchants: 'Awọn Onijaja ti A Jẹrisi', verified_merchants_desc: 'Iwari awon ile itaja to daju ni Ogbomoso', top_ads: 'Ipolowo Oga', top_ads_desc: 'Awọn adehun ti a fọwọsi ti a gbe soke lori Sealify', boost_active: 'AGBARA 5X WA LORI RẸ', explore_promoted: 'Duba Duka Ipolowo Oga', view_all: 'Wo Gbogbo Rẹ', reset_filter: 'Mú Ṣatunṣe Kúrò', marketplace_feed: 'Akawe Ọjà', search_alerts: 'Awọn Iwifunni Aawọ', compare: 'Agbekalẹ Ṣe Papọ', filters: 'Awọn Aṣayan', clear: 'Mú kúrò', visit_storefront: 'Wọ Inú Itaja', active_ads_count: 'Awọn Ọjà ti o wa', cac_verified: 'Jẹrisi CAC pẹlu ID' },
  ha: { home: 'Gida', sell: 'Sanya Talla', search_placeholder: 'Nemi komai a Ogbomoso...', trusted_marketplace: 'Kasuwa Mai Amintattu', browse_categories: 'Rukunoni Kasuwa', notifications: 'Sanarwa', inbox: 'Saƙonni', saved: 'Ajiye', account: 'Asusu', login: 'Shiga / Rajista', trending: 'Abubuwan Yayi', post_free_ad: 'Sanya Talla Kyauta', language: 'Harshe', analytics: 'Kididdiga', visitors: 'Masu Kallo', total_ads: 'Dukan Talla', sold_confirm: 'An sayar da wannan?', sold_confirm_desc: 'Za mu sanar da masu sha\'awa.', my_ads: 'Tallata Ta', stats: 'Kididdiga', edit: 'Gyara', promote: 'Haɓaka', mark_sold: 'An Sayar', delete: 'Goge', recommended_for_you: 'An ba ku shawara', ai_matched: 'AI Ta Dace', vendors: 'Masu Sayarwa', safety: 'Tsaro', settings: 'Saituna', logout: 'Fita', welcome: 'Barka da dawowa', search_btn: 'Nema', all_categories: 'Duk Rukunoni', safe_escrow: 'Amintaccen Escrow', requests: 'Mabuƙata', insights: 'Kasuwa Insights', online_now: 'suna yanar gizo', neighborhood_hubs: 'Yankunan Kasuwa', neighborhood_desc: 'Zaɓi ta yankunan makarantu a Ogbomoso', verified_merchants: 'Masanan Kasuwa', verified_merchants_desc: 'Nemi shagunan da aka amince da su a Ogbomoso', top_ads: 'Tallan Sama', top_ads_desc: 'Kyakkyawan tallace-tallace da aka tabbatar akan Sealify', boost_active: 'HABAKA 5X NA AIKI', explore_promoted: 'Duba Duka Tallan Sama', view_all: 'Duba Dukkanin', reset_filter: 'Sake Saita Filter', marketplace_feed: 'Ciyarwar Kasuwa', search_alerts: 'Sanarwa Bincike', compare: 'Kwatanta', filters: 'Saita Filters', clear: 'A goge', visit_storefront: 'Shiga Shago', active_ads_count: 'Tallan da ke Aiki', cac_verified: 'Tabbataccen CAC & ID' },
  ig: { home: 'Ụlọ', sell: 'Gbaa Ahịa', search_placeholder: 'Chọọ ihe ọ bụla n\'Ogbomoso...', trusted_marketplace: 'Ahịa Mpaghara A Kwenyere', browse_categories: 'Lee Ụdị Ahịa', notifications: 'Ọkwa', inbox: 'Mpaghara Ozi', saved: 'Ihe A Zọpụtara', account: 'Akaụntụ', login: 'Banye / Debanye Inyom', trending: 'Ahịa Na-agba Ọsọ', post_free_ad: 'Bipụta Ahịa n\'Efere', language: 'Asụsụ', analytics: 'Nyocha Ahịa', visitors: 'Ndị Na-ele Inyom', total_ads: 'Ahịa Niile', sold_confirm: 'Ì resiela ihe a?', sold_confirm_desc: 'Mba ị kwadoro, anyị ga-agwa ndị chọrọ ịzụ.', my_ads: 'Ahịa m', stats: 'Ndekọ', edit: 'Nwere', promote: 'Bulie Ahịa', mark_sold: 'Resiela', delete: 'Kpochapụ', recommended_for_you: 'Ihe A tụrụ Aro ma gị', ai_matched: 'Nkwado AI', vendors: 'Ndị Na-ere Ahịa', safety: 'Nchekwa', settings: 'Nseta', logout: 'Pụọ', welcome: 'Nnọọ ọzọ', search_btn: 'Chọọ', all_categories: 'Ụdị Niile', safe_escrow: 'Nchekwa Ego', requests: 'Arịrịọ Ahịa', insights: 'Nyocha Ahịa', online_now: 'nọ na intanetị', neighborhood_hubs: 'Mpaghara Agbataobi', neighborhood_desc: 'Chọọ site na mpaghara Mahadum na Ogbomoso', verified_merchants: 'Ndị Ahịa A Kwenyere', verified_merchants_desc: 'Chọta ụlọ ahịa a tụkwasịrị obi n\'Ogbomoso', top_ads: 'Ahịa Kachasị Mma', top_ads_desc: 'Ahịa a kwadoro ma bulie elu na Sealify', boost_active: 'NWALITE 5X NA-AÑỤ ỌRỤ', explore_promoted: 'Lee Ahịa Kachasị Mma Niile', view_all: 'Hụ Niile', reset_filter: 'Hichapụ Filter', marketplace_feed: 'Nri Ahịa', search_alerts: 'Ọkwa Nchọgharị', compare: 'Samanata', filters: 'Nyocha', clear: 'Kpochapụ', visit_storefront: 'Banye Ụlọ Ahịa', active_ads_count: 'Ahịa Na-arụ Ọrụ', cac_verified: 'CAC na ID a kwadoro' },
  zh: { home: '首页', sell: '发布', search_placeholder: '在 Ogbomoso 搜索商品...', trusted_marketplace: '值得信赖的本地市场', browse_categories: '浏览分类', notifications: '通知', inbox: '收件箱', saved: '收藏', account: '账户', login: '登录 / 注册', trending: '热门商品', post_free_ad: '免费发布广告', language: '语言', analytics: '数据分析', visitors: '在线访客', total_ads: '广告总数', sold_confirm: '确认商品已售出？', sold_confirm_desc: '确认后我们将通知感兴趣的买家。', my_ads: '我的广告', stats: '统计', edit: '编辑', promote: '推广', mark_sold: '标记售出', delete: '删除', recommended_for_you: '为你推荐', ai_matched: 'AI 匹配', vendors: '优质商家', safety: '安全中心', settings: '设置', logout: '退出登录', welcome: '欢迎回来', search_btn: '搜索', all_categories: '全部分类', safe_escrow: '安全托管', requests: '求购需求', insights: '市场洞察', online_now: '在线', neighborhood_hubs: '社区圈子', neighborhood_desc: '按 Ogbomoso 校园圈子筛选', verified_merchants: '认证商家', verified_merchants_desc: '探索 Ogbomoso 值得信赖的优质商家', top_ads: '热门推荐', top_ads_desc: '经过 Sealify 官方审核推荐的精选优质交易', boost_active: '5倍曝光加速中', explore_promoted: '查看全部热门推荐', view_all: '查看全部', reset_filter: '重置筛选', marketplace_feed: '市场商品流', search_alerts: '搜索订阅', compare: '商品对比', filters: '高级筛选', clear: '清除', visit_storefront: '进店逛逛', active_ads_count: '在线商品', cac_verified: 'CAC企业与身份认证' }
};

export const SealifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@sealify.ng');
  const [adminPassword, setAdminPassword] = useState('sealify2024');
  const [adminPin, setAdminPin] = useState('123456');
  const [systemConfig, setSystemConfig] = useState<Record<string, boolean | number>>(MOCK_SYSTEM_CONFIG);
  const [siteSettings, setSiteSettings] = useState(MOCK_SITE_SETTINGS);
  const [promotionPlans, setPromotionPlans] = useState(MOCK_PROMOTION_PLANS);
  const [safeSpots, setSafeSpots] = useState(MOCK_SAFE_SPOTS);
  const [language, setLanguage] = useState<'en' | 'yo' | 'ha' | 'ig' | 'zh'>('en');
  const [categories, setCategories] = useState<CategoryConfig[]>(MOCK_CATEGORIES);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    visitors: 12450, totalAds: 247, soldAds: 89, revenue: 2850000, userGrowth: 12.5,
    categoryDistribution: [
      { name: 'Vehicles', count: 15 }, { name: 'Electronics', count: 42 }, { name: 'Real Estate', count: 28 },
      { name: 'Fashion', count: 35 }, { name: 'Home & Furniture', count: 22 }, { name: 'Services', count: 18 },
      { name: 'Jobs', count: 12 }, { name: 'Beauty & Health', count: 25 }, { name: 'Utility & Energy', count: 20 },
      { name: 'Solar & Clean Energy', count: 10 },
    ]
  });
  const [marketStats] = useState<CategoryStats[]>(MOCK_MARKET_STATS);
  const [listings, setListings] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState<SearchFilter>({ query: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' });
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [compareListingIds, setCompareListingIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [promotionPaymentRequests, setPromotionPaymentRequests] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [disputeCases, setDisputeCases] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [recentDeals, setRecentDeals] = useState<any[]>([]);
  const [intrusionLogs, setIntrusionLogs] = useState<any[]>([]);
  const [searchAlerts, setSearchAlerts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [buyerRequests, setBuyerRequests] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());
  const [error, setError] = useState<string | null>(null);

  const updateAdminCredentials = (email: string, password: string, pin: string) => {
    setAdminEmail(email); setAdminPassword(password); setAdminPin(pin);
    localStorage.setItem('sealify_admin_email', email);
    localStorage.setItem('sealify_admin_password', password);
    localStorage.setItem('sealify_admin_pin', pin);
  };

  const t = (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;

  const login = async (email: string, password: string) => {
    try {
      await api.signIn(email, password);
      const { data: { user } } = await api.getUser();
      setUser(user);
      setIsAdmin(false);
      return true;
    } catch { return false; }
  };

  const adminLogin = async (email: string, password: string, pin: string) => {
    if (email === adminEmail && password === adminPassword && pin === adminPin) {
      const adminUser = { id: 'admin_1', email: adminEmail, fullName: 'Sealify Admin', phoneNumber: '+234 813 120 8468', avatarUrl: '/logo.png', role: 'admin', verified: true, verificationType: 'premium', businessName: 'Sealify National Hub', memberSince: 'Jan 2023', location: 'Ogbomoso, Oyo State' };
      setUser(adminUser);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const signup = async (data: { email: string; password: string; fullName: string; phoneNumber: string }) => {
    await api.signUp(data.email, data.password, data.fullName, data.phoneNumber);
  };

  const sendPhoneOtp = async (phone: string) => Math.floor(100000 + Math.random() * 900000).toString();
  const verifyPhoneOtp = async (phone: string, code: string) => true;

  const logout = () => { setUser(null); setIsAdmin(false); api.signOut(); };

  const addRecentlyViewed = (id: string) => setRecentlyViewedIds(p => { const f = p.filter(i => i !== id); return [id, ...f].slice(0, 20); });

  const toggleSaveListing = async (id: string) => {
    if (user) setSavedListingIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  };

  const isSaved = (id: string) => savedListingIds.includes(id);

  const resetFilters = () => setFilters({ query: '', category: 'All', minPrice: null, maxPrice: null, condition: 'All', location: '', sortBy: 'newest' });

  const toggleCompareListing = (id: string) => setCompareListingIds(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p);
  const isInCompare = (id: string) => compareListingIds.includes(id);
  const clearCompare = () => setCompareListingIds([]);

  const createListing = async (data: any, files?: File[]) => {
    if (!user) return false;
    try {
      await api.post("/listings", { ...data, id: `lst_${Date.now()}`, sellerId: user.id, sellerName: user.fullName, sellerPhone: user.phoneNumber || '', sellerAvatar: user.avatarUrl || '', sellerVerified: user.verified || false, sellerVerificationType: user.verificationType, status: 'active', viewsCount: 1, createdAt: new Date().toLocaleString(), images: data.images || [], specifications: data.specifications || {} });
      toast.success('Your ad was posted successfully!');
      return true;
    } catch { return false; }
  };

  const updateListing = async (id: string, updates: any) => setListings(p => p.map(l => l.id === id ? { ...l, ...updates } : l));
  const deleteListing = (id: string) => setListings(p => p.filter(l => l.id !== id));
  const markAsSold = (id: string) => setListings(p => p.map(l => l.id === id ? { ...l, status: 'sold' } : l));
  const toggleFeaturedListing = async (id: string) => { const l = listings.find(x => x.id === id); if (l) await updateListing(id, { featured: !l.featured }); };
  const promoteListing = async (id: string, durationMonths: number, planName: string) => await updateListing(id, { featured: true, promotionPlanName: planName, promotionDurationMonths: durationMonths });

  const sendMessage = (listingId: string, receiverId: string, content: string) => {
    if (!user) return;
    const listing = listings.find(l => l.id === listingId);
    const newConv: any = { id: `conv_${Date.now()}`, listingId, listingTitle: listing?.title || 'Unknown Item', listingImage: listing?.images[0] || '', listingPrice: listing?.price || 0, otherUser: { id: receiverId, name: 'Seller', avatar: '' }, lastMessage: content, lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), messages: [{ id: `msg_${Date.now()}`, senderId: user.id, receiverId, listingId, content, createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isRead: false }] };
    setConversations(p => [newConv, ...p]);
  };

  const addNotification = (notification: any) => setNotifications(p => [{ ...notification, id: `notif_${Date.now()}`, read: false, createdAt: new Date().toISOString() }, ...p]);

  const markNotificationRead = async (id: string) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllNotificationsRead = async () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const clearNotification = async (id: string) => setNotifications(p => p.filter(n => n.id !== id));
  const broadcastMassNotification = (data: any) => toast.success(`Broadcast sent to ${data.target}`);
  const dispatchPromotionalEmailDigest = () => toast.success('Weekly digest dispatched!');

  const submitPasswordRequest = async (request: any) => setPasswordRequests(p => [{ ...request, id: `pwd_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }, ...p]);
  const processPasswordRequest = async (id: string, status: string) => setPasswordRequests(p => p.map(r => r.id === id ? { ...r, status } : r));
  const submitVerificationRequest = async (request: any) => setVerificationRequests(p => [{ ...request, id: `ver_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }, ...p]);
  const processVerificationRequest = async (id: string, status: string) => setVerificationRequests(p => p.map(r => r.id === id ? { ...r, status } : r));
  const submitPromotionPaymentRequest = async (request: any) => setPromotionPaymentRequests(p => [{ ...request, id: `promo_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }, ...p]);
  const processPromotionPaymentRequest = async (id: string, status: string) => setPromotionPaymentRequests(p => p.map(r => r.id === id ? { ...r, status } : r));
  const addAnnouncement = async (announcement: any) => setAnnouncements(p => [{ ...announcement, id: `ann_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...p]);
  const toggleAnnouncement = async (id: string) => setAnnouncements(p => p.map(a => a.id === id ? { ...a, active: !a.active } : a));
  const deleteAnnouncement = async (id: string) => setAnnouncements(p => p.filter(a => a.id !== id));
  const submitReport = async (report: any) => setReports(p => [{ ...report, id: `rep_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }, ...p]);
  const processReport = async (id: string, status: string) => setReports(p => p.map(r => r.id === id ? { ...r, status } : r));
  const submitDisputeCase = async (dispute: any) => setDisputeCases(p => [{ ...dispute, id: `disp_${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }, ...p]);
  const processDisputeCase = async (id: string, status: string) => setDisputeCases(p => p.map(d => d.id === id ? { ...d, status } : d));
  const addAuditLog = (action: string, details: string, type: string) => setAuditLogs(p => [{ id: `audit_${Date.now()}`, action, details, type, createdAt: new Date().toISOString() }, ...p]);
  const sealDeal = (listingTitle: string, buyerName: string, price: number) => setRecentDeals(p => [{ id: `deal_${Date.now()}`, itemTitle: listingTitle, price, location: user?.location || 'Ogbomoso', time: 'Just now' }, ...p]);
  const recordIntrusion = (attemptedEmail: string, metadata: string) => setIntrusionLogs(p => [{ id: `intr_${Date.now()}`, attemptedEmail, deviceInfo: metadata, mediaCaptured: false, mediaStatus: 'N/A', status: 'flagged', ipAddress: '0.0.0.0', userAgent: metadata, timestamp: new Date().toISOString() }, ...p]);

  const saveSearchAlert = async (alert: any) => { if (user) setSearchAlerts(p => [{ ...alert, id: `alert_${Date.now()}`, userId: user.id, createdAt: new Date().toISOString(), matchCount: 0, isActive: true }, ...p]); };
  const deleteSearchAlert = async (id: string) => setSearchAlerts(p => p.filter(a => a.id !== id));
  const addReview = async (review: any) => setReviews(p => [{ ...review, id: `rev_${Date.now()}`, createdAt: new Date().toISOString() }, ...p]);
  const deleteReview = async (id: string) => setReviews(p => p.filter(r => r.id !== id));
  const createBuyerRequest = async (request: any) => setBuyerRequests(p => [{ ...request, id: `req_${Date.now()}`, createdAt: new Date().toISOString(), responsesCount: 0 }, ...p]);
  const deleteBuyerRequest = async (id: string) => setBuyerRequests(p => p.filter(r => r.id !== id));
  const requestPayout = async (amount: number) => { if (!wallet || wallet.balance < amount) { toast.error('Insufficient balance'); return; } setWallet(p => p ? { ...p, balance: p.balance - amount, pendingBalance: p.pendingBalance + amount } : null); setTransactions(p => [{ id: `txn_${Date.now()}`, walletId: wallet?.id || '', type: 'payout', amount: -amount, status: 'pending', description: 'Withdrawal to bank', createdAt: new Date().toISOString() }, ...p]); toast.success(`Payout of ₦${amount.toLocaleString()} requested`); };

  const syncDatabase = async () => { setIsSyncing(true); await new Promise(r => setTimeout(r, 1000)); setIsSyncing(false); setLastSyncTime(new Date().toLocaleTimeString()); toast.success('Database synchronized'); };

  const addUser = (newUser: any) => setAllUsers(p => [newUser, ...p]);
  const deleteUser = (id: string) => setAllUsers(p => p.filter(u => u.id !== id));
  const updateUser = async (id: string, updates: any) => { setAllUsers(p => p.map(u => u.id === id ? { ...u, ...updates } : u)); if (user?.id === id) setUser(p => p ? { ...p, ...updates } : null); };
  const bulkUpdateUsers = (ids: string[], updates: any) => setAllUsers(p => p.map(u => ids.includes(u.id) ? { ...u, ...updates } : u));
  const bulkDeleteUsers = (ids: string[]) => setAllUsers(p => p.filter(u => !ids.includes(u.id)));
  const bulkUpdateListings = (ids: string[], updates: any) => setListings(p => p.map(l => ids.includes(l.id) ? { ...l, ...updates } : l));
  const bulkDeleteListings = (ids: string[]) => setListings(p => p.filter(l => !ids.includes(l.id)));

  const exportDatabaseBackup = () => { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ listings, allUsers, reviews, siteSettings }, null, 2)); const dlAnchorElem = document.createElement('a'); dlAnchorElem.setAttribute("href", dataStr); dlAnchorElem.setAttribute("download", `Sealify_DB_Backup_${Date.now()}.json`); dlAnchorElem.click(); toast.success("Database Backup Exported!"); };

  const addSafeSpot = async (spot: any) => setSafeSpots(p => [...p, { ...spot, id: `spot_${Date.now()}` }]);
  const deleteSafeSpot = async (id: string) => setSafeSpots(p => p.filter(s => s.id !== id));
  const updatePromotionPlanRate = (months: number, rate: number) => setPromotionPlans(p => p.map(p => p.months === months ? { ...p, rate } : p));
  const addCategory = (category: any) => setCategories(p => [...p, category]);
  const deleteCategory = (id: string) => setCategories(p => p.filter(c => c.id !== id));
  const updateCategory = (id: string, name: string) => setCategories(p => p.map(c => c.id === id ? { ...c, name: name as any } : c));

  const signup = async (data: { email: string; password: string; fullName: string; phoneNumber: string }) => {
    await api.signUp(data.email, data.password, data.fullName, data.phoneNumber);
  };

  const sendPhoneOtp = async (phone: string) => Math.floor(100000 + Math.random() * 900000).toString();
  const verifyPhoneOtp = async (phone: string, code: string) => true;

  const adminLogin = async (email: string, password: string, pin: string) => {
    if (email === adminEmail && password === adminPassword && pin === adminPin) {
      const adminUser = { id: 'admin_1', email: adminEmail, fullName: 'Sealify Admin', phoneNumber: '+234 813 120 8468', avatarUrl: '/logo.png', role: 'admin', verified: true, verificationType: 'premium', businessName: 'Sealify National Hub', memberSince: 'Jan 2023', location: 'Ogbomoso, Oyo State' };
      setUser(adminUser);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => { setUser(null); setIsAdmin(false); api.signOut(); };

  const signup = async (data: { email: string; password: string; fullName: string; phoneNumber: string }) => {
    await api.signUp(data.email, data.password, data.fullName, data.phoneNumber);
  };

  // Initialize from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('sealify_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setIsAdmin(parsed.role === 'admin');
    }
    const savedAdminEmail = localStorage.getItem('sealify_admin_email');
    if (savedAdminEmail) setAdminEmail(savedAdminEmail);
    const savedAdminPass = localStorage.getItem('sealify_admin_password');
    if (savedAdminPass) setAdminPassword(savedAdminPass);
    const savedAdminPin = localStorage.getItem('sealify_admin_pin');
    if (savedAdminPin) setAdminPin(savedAdminPin);
    setLoading(false);
  }, []);

  const contextValue = useMemo(() => ({
    user, setUser, isAuthenticated: !!user, isAdmin, adminEmail, adminPassword, adminPin, updateAdminCredentials,
    systemConfig, updateSystemConfig: (updates: Record<string, boolean | number>) => setSystemConfig(p => ({ ...p, ...updates })),
    siteSettings, updateSiteSettings: (settings: Partial<typeof siteSettings>) => setSiteSettings(p => ({ ...p, ...settings })),
    promotionPlans, updatePromotionPlanRate, safeSpots, addSafeSpot, deleteSafeSpot, exportDatabaseBackup,
    language, setLanguage, t: (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key,
    categories, subcategories, addCategory, deleteCategory, updateCategory,
    analytics: { visitors: 12450, totalAds: 247, soldAds: 89, revenue: 2850000, userGrowth: 12.5, categoryDistribution: [{ name: 'Vehicles', count: 15 }, { name: 'Electronics', count: 42 }, { name: 'Real Estate', count: 28 }, { name: 'Fashion', count: 35 }, { name: 'Home & Furniture', count: 22 }, { name: 'Services', count: 18 }, { name: 'Jobs', count: 12 }, { name: 'Beauty & Health', count: 25 }, { name: 'Utility & Energy', count: 20 }, { name: 'Solar & Clean Energy', count: 10 }] },
    marketStats: MOCK_MARKET_STATS,
    login, signup, sendPhoneOtp, verifyPhoneOtp, adminLogin, logout,
    listings, allUsers, updateUser, addUser, deleteUser, bulkUpdateUsers, bulkDeleteUsers, bulkUpdateListings, bulkDeleteListings,
    savedListingIds, recentlyViewedIds, userInterests, addRecentlyViewed, toggleSaveListing, isSaved,
    filters, setFilters, resetFilters, activeCategory, setActiveCategory,
    compareListingIds, toggleCompareListing, isInCompare, clearCompare,
    createListing, updateListing, deleteListing, markAsSold, toggleFeaturedListing, promoteListing,
    conversations, sendMessage,
    notifications, markNotificationRead, markAllNotificationsRead, clearNotification, addNotification, broadcastMassNotification, dispatchPromotionalEmailDigest,
    passwordRequests, submitPasswordRequest, processPasswordRequest, verificationRequests, submitVerificationRequest, processVerificationRequest, promotionPaymentRequests, submitPromotionPaymentRequest, processPromotionPaymentRequest, announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement, reports, submitReport, processReport, disputeCases, submitDisputeCase, processDisputeCase, auditLogs, addAuditLog, recentDeals, sealDeal, intrusionLogs, recordIntrusion,
    searchAlerts, saveSearchAlert, deleteSearchAlert, reviews, addReview, deleteReview, buyerRequests, createBuyerRequest, deleteBuyerRequest,
    wallet, transactions, requestPayout, loading, isSyncing, lastSyncTime, syncDatabase, error
  }), [user, isAdmin, adminEmail, adminPassword, adminPin, systemConfig, siteSettings, promotionPlans, safeSpots, language, categories, subcategories, listings, allUsers, savedListingIds, recentlyViewedIds, userInterests, filters, activeCategory, compareListingIds, conversations, notifications, wallet, transactions, loading, isSyncing, lastSyncTime, error]);

  return <SealifyContext.Provider value={contextValue}>{children}</SealifyContext.Provider>;
};

export const useSealify = () => {
  const context = useContext(SealifyContext);
  if (!context) throw new Error('useSealify must be used within SealifyProvider');
  return context;
};