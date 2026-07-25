import { Category, Listing, UserProfile, Conversation } from '@/types/sealify';

export const CATEGORIES = [
  { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 3, color: 'bg-blue-500' },
  { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 3, color: 'bg-purple-500' },
  { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 3, color: 'bg-teal-500' },
  { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 3, color: 'bg-pink-500' },
  { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 3, color: 'bg-amber-500' },
  { id: 'services', name: 'Services', iconName: 'Wrench', count: 3, color: 'bg-cyan-500' },
  { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 3, color: 'bg-indigo-500' },
  { id: 'beauty', name: 'Beauty & Health', iconName: 'Sparkles', count: 3, color: 'bg-rose-500' },
  { id: 'utility', name: 'Utility & Energy', iconName: 'Zap', count: 3, color: 'bg-yellow-500' },
];

interface CatalogItem {
  title: string;
  image: string;
  desc: string;
  price: number;
  cond: 'Brand New' | 'Like New' | 'Used - Good' | 'Used - Fair';
  featured: boolean;
  loc?: string;
}

const CATALOG_DATA: Record<Category, CatalogItem[]> = {
  'Vehicles': [
    {
      title: 'Qlink Target 200cc Motorbike (Strong Engine)',
      image: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?w=800&auto=format&fit=crop',
      desc: '🔥 OGBOMOSO SPECIAL: Super clean Qlink Target motorbike. Perfect for students and commercial transport. Strong chassis, fuel efficient, and registered with local numbers. Buy and drive!',
      price: 485000,
      cond: 'Used - Good',
      featured: true,
      loc: 'Under G Area, Ogbomoso'
    },
    {
      title: 'Toyota Camry 2010 (Muscle) - Tokunbo Standard',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop',
      desc: 'Muscle Camry with ice cold AC, original first body paint, clean leather interior. Located at Takie Square for easy inspection.',
      price: 6800000,
      cond: 'Like New',
      featured: false,
      loc: 'Takie Square, Ogbomoso'
    },
    {
      title: 'Bajaj Pulsar 150cc (Campus Ride)',
      image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800&auto=format&fit=crop',
      desc: 'Efficient Bajaj Pulsar 150. Ideal for getting around LAUTECH campus. Low mileage and well maintained by a student.',
      price: 320000,
      cond: 'Used - Good',
      featured: false,
      loc: 'LAUTECH Gate, Ogbomoso'
    }
  ],
  'Electronics': [
    {
      title: 'HP EliteBook 840 G5 (Student/Work Laptop)',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
      desc: '⚡ BEST FOR STUDENTS: Core i5, 8GB RAM, 256GB SSD. Long battery life for LAUTECH lecture halls. Premium aluminum body.',
      price: 245000,
      cond: 'Like New',
      featured: true,
      loc: 'Under G, Ogbomoso'
    },
    {
      title: 'iPhone 13 Pro 128GB (Blue) - 92% Battery',
      image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop',
      desc: 'Super clean iPhone 13 Pro. Factory unlocked, FaceID active, original screen. No faults at all.',
      price: 780000,
      cond: 'Like New',
      featured: false,
      loc: 'Adenike Area, Ogbomoso'
    },
    {
      title: 'Starlink Gen 2 Kit (Ogbomoso Delivery)',
      image: 'https://images.unsplash.com/photo-1647414800315-77983c271871?w=800&auto=format&fit=crop',
      desc: 'Brand new Starlink Gen 2. Solve your internet issues in Ogbomoso once and for all. Setup assistance available.',
      price: 520000,
      cond: 'Brand New',
      featured: false,
      loc: 'General Area, Ogbomoso'
    }
  ],
  'Real Estate': [
    {
      title: 'Executive Self-Contain in Under G (LAUTECH)',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
      desc: '👑 FEATURED HOSTEL: Tiled room, running water (borehole), prepaid meter, secured gate. 5 minutes walk to LAUTECH gate.',
      price: 280000,
      cond: 'Like New',
      featured: true,
      loc: 'Under G, Ogbomoso'
    },
    {
      title: 'Standard Plot of Land in Aroje (Phase 1)',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop',
      desc: '60ft by 120ft dry land in a developing neighborhood. C of O in process. Perfect for residential building.',
      price: 1800000,
      cond: 'Brand New',
      featured: false,
      loc: 'Aroje Area, Ogbomoso'
    },
    {
      title: 'Commercial Shop for Rent at Takie Square',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
      desc: 'Prime business location right in the heart of Takie. High foot traffic, suitable for boutique or pharmacy.',
      price: 450000,
      cond: 'Used - Good',
      featured: false,
      loc: 'Takie, Ogbomoso'
    }
  ],
  'Fashion': [
    {
      title: 'Premium Ogbomoso Handmade Aso-Oke Set',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop',
      desc: '🔥 LOCAL PRIDE: High quality traditional Aso-Oke set for weddings and occasions. Hand-woven by local masters in Sabo.',
      price: 125000,
      cond: 'Brand New',
      featured: true,
      loc: 'Sabo Market, Ogbomoso'
    },
    {
      title: 'Nike Air Force 1 - White (Campus Trend)',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop',
      desc: 'Clean AF1 in various sizes. Comfortable and stylish for daily campus wear.',
      price: 35000,
      cond: 'Brand New',
      featured: false,
      loc: 'Under G, Ogbomoso'
    },
    {
      title: 'Men Designer Leather Palm Slippers',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop',
      desc: 'Strong leather palms, durable sole. Perfect for Ogbomoso weather and casual outings.',
      price: 18000,
      cond: 'Brand New',
      featured: false,
      loc: 'Takie, Ogbomoso'
    }
  ],
  'Home & Furniture': [
    {
      title: '7-Seater Royal Sofa Set (Ogbomoso Finish)',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop',
      desc: '🛋️ TOP DEAL: Luxurious sofa set for your living room. Built with strong wood and premium fabric. Quality you can trust.',
      price: 450000,
      cond: 'Brand New',
      featured: true,
      loc: 'General Area, Ogbomoso'
    },
    {
      title: 'Mouka Orthopedic Queen Mattress (6x6)',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop',
      desc: 'Standard queen size mattress for better sleep. 10-year warranty from Mouka. Free delivery in Under G.',
      price: 195000,
      cond: 'Brand New',
      featured: false,
      loc: 'LAUTECH Gate, Ogbomoso'
    },
    {
      title: 'Modern Student Study Desk & Chair',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop',
      desc: 'Strong wooden desk with drawer and matching chair. Perfect for student reading corners.',
      price: 45000,
      cond: 'Brand New',
      featured: false,
      loc: 'Adenike, Ogbomoso'
    }
  ],
  'Services': [
    {
      title: 'Solar Power & Inverter Installation (2.5kVA)',
      image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop',
      desc: '⚡ BYE NEPA: Complete solar setup for hostels and small homes. Runs fans, laptops, and bulbs 24/7. Expert installation.',
      price: 580000,
      cond: 'Brand New',
      featured: true,
      loc: 'Ogbomoso Hub'
    },
    {
      title: 'Professional Laptop Repair & Software Fix',
      image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop',
      desc: 'We fix all laptop issues (screen, battery, keyboard, OS). Located at Under G for quick campus service.',
      price: 5000,
      cond: 'Brand New',
      featured: false,
      loc: 'Under G, Ogbomoso'
    },
    {
      title: 'Event Catering & Cake Baking (Ogbomoso)',
      image: 'https://images.unsplash.com/photo-1535141123063-3bb610932e47?w=800&auto=format&fit=crop',
      desc: 'Professional catering for weddings, birthdays, and campus events. Delicious cakes and local meals.',
      price: 25000,
      cond: 'Brand New',
      featured: false,
      loc: 'Sabo Area, Ogbomoso'
    }
  ],
  'Jobs': [
    {
      title: 'Delivery Riders Needed (Ogbomoso Logistics)',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
      desc: '💼 URGENT: Hiring dispatch riders for local Ogbomoso deliveries. Must have a valid motorbike license and good local knowledge.',
      price: 65000,
      cond: 'Brand New',
      featured: true,
      loc: 'Takie, Ogbomoso'
    },
    {
      title: 'Sales Assistant at Ogbomoso Boutique',
      image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&auto=format&fit=crop',
      desc: 'Friendly sales assistant needed for a retail shop at Sabo. Previous experience is a plus.',
      price: 35000,
      cond: 'Brand New',
      featured: false,
      loc: 'Sabo Market, Ogbomoso'
    },
    {
      title: 'Hostel Security Guard (Night Shift)',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop',
      desc: 'Reliable person needed for night security at a large student hostel in Under G area.',
      price: 40000,
      cond: 'Brand New',
      featured: false,
      loc: 'Under G, Ogbomoso'
    }
  ],
  'Beauty & Health': [
    {
      title: 'Organic Skincare & Glowing Serum Set',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop',
      desc: '✨ FEATURED: Authentic Ogbomoso black soap and organic glowing oils. Tested and trusted for glowing skin.',
      price: 15000,
      cond: 'Brand New',
      featured: true,
      loc: 'General Area, Ogbomoso'
    },
    {
      title: 'Unisex Perfume Oils (Long Lasting)',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop',
      desc: 'Small but mighty perfume oils. Smells expensive but very affordable for students.',
      price: 3500,
      cond: 'Brand New',
      featured: false,
      loc: 'LAUTECH Gate, Ogbomoso'
    },
    {
      title: 'Professional Salon & Hairdressing (Under G)',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&auto=format&fit=crop',
      desc: 'Expert hair braiding and wig installation. Get that campus glow-up at our studio.',
      price: 8000,
      cond: 'Brand New',
      featured: false,
      loc: 'Under G, Ogbomoso'
    }
  ],
  'Utility & Energy': [
    {
      title: 'Elepaq SV2200 Constant Generator (Clean)',
      image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&auto=format&fit=crop',
      desc: '⚡ MUST HAVE: Fuel efficient Elepaq generator. Ideal for hostels to run fans, TV, and recharge devices during blackouts.',
      price: 185000,
      cond: 'Used - Good',
      featured: true,
      loc: 'Under G, Ogbomoso'
    },
    {
      title: 'Luminous 220Ah Inverter Battery',
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop',
      desc: 'Deep cycle tubular battery for solar and inverter systems. Very reliable and long lasting.',
      price: 240000,
      cond: 'Brand New',
      featured: false,
      loc: 'Ogbomoso Hub'
    },
    {
      title: 'Rechargeable LED Fan with Solar Panel',
      image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&auto=format&fit=crop',
      desc: 'Stay cool during the heat with this solar rechargeable fan. Includes light and phone charging port.',
      price: 38000,
      cond: 'Brand New',
      featured: false,
      loc: 'Takie, Ogbomoso'
    }
  ]
};

export const MOCK_LISTINGS: Listing[] = Object.keys(CATALOG_DATA).flatMap((catKey, catIdx) => {
  const items = CATALOG_DATA[catKey as Category];
  return items.map((item, itemIdx) => ({
    id: `lst_${catKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${itemIdx + 1}`,
    sellerId: 'usr_1',
    sellerName: 'Adebowale Ogunleye',
    sellerPhone: '+234 803 000 0000',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
    sellerVerified: true,
    sellerVerificationType: 'business',
    title: item.title,
    description: item.desc,
    price: item.price,
    category: catKey as Category,
    condition: item.cond,
    location: item.loc || 'Ogbomoso, Oyo State',
    status: 'active',
    images: [item.image],
    viewsCount: Math.floor(Math.random() * 500) + 100,
    createdAt: 'Just now',
    featured: item.featured,
    promotionPlanName: item.featured ? 'Top Ad Boost' : undefined,
    promotionDurationMonths: item.featured ? 1 : undefined
  }));
});

export const ALL_MOCK_USERS: UserProfile[] = [
  {
    id: 'usr_admin_default',
    email: 'admin@sealify.ng',
    fullName: 'Sealify Official',
    phoneNumber: '+234 813 120 8468',
    avatarUrl: '/logo.png',
    storeBannerUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop',
    role: 'admin',
    verified: true,
    verificationType: 'premium',
    businessName: 'Sealify National Hub',
    memberSince: 'Jan 2023',
    location: 'Ogbomoso, Oyo State',
  },
  {
    id: 'usr_1',
    email: 'adebowale@gmail.com',
    fullName: 'Adebowale Ogunleye',
    phoneNumber: '+234 803 000 0000',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
    storeBannerUrl: '',
    role: 'seller',
    verified: true,
    verificationType: 'business',
    businessName: 'Ogunleye Motors Ogbomoso',
    memberSince: 'Mar 2023',
    location: 'Takie, Ogbomoso',
  }
];

export const MOCK_USER = ALL_MOCK_USERS[0];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    listingId: 'lst_vehicles_1',
    listingTitle: 'Qlink Target 200cc Motorbike (Strong Engine)',
    listingImage: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?w=800&auto=format&fit=crop',
    listingPrice: 485000,
    otherUser: {
      id: 'usr_1',
      name: 'Adebowale Ogunleye',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
    },
    lastMessage: 'Is the motorbike available for inspection at Takie today?',
    lastMessageTime: '10:42 AM',
    messages: [
      {
        id: 'msg_1',
        senderId: 'usr_1',
        receiverId: 'usr_admin_default',
        listingId: 'lst_vehicles_1',
        content: 'Hello, I saw your Qlink Target bike listing on Sealify!',
        createdAt: '10:30 AM',
      },
      {
        id: 'msg_2',
        senderId: 'usr_admin_default',
        receiverId: 'usr_1',
        listingId: 'lst_vehicles_1',
        content: 'Hi Adebowale! Yes, it is in excellent condition and ready for test ride.',
        createdAt: '10:35 AM',
      },
      {
        id: 'msg_3',
        senderId: 'usr_1',
        receiverId: 'usr_admin_default',
        listingId: 'lst_vehicles_1',
        content: 'Is the motorbike available for inspection at Takie today?',
        createdAt: '10:42 AM',
      },
    ],
  },
  {
    id: 'conv_2',
    listingId: 'lst_electronics_1',
    listingTitle: 'HP EliteBook 840 G5 (Student/Work Laptop)',
    listingImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
    listingPrice: 245000,
    otherUser: {
      id: 'usr_1',
      name: 'Adebowale Ogunleye',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop',
    },
    lastMessage: 'What is your final price for student pickup?',
    lastMessageTime: 'Yesterday',
    messages: [
      {
        id: 'msg_4',
        senderId: 'usr_1',
        receiverId: 'usr_admin_default',
        listingId: 'lst_electronics_1',
        content: 'What is your final price for student pickup?',
        createdAt: 'Yesterday',
      },
    ],
  },
];

export const MOCK_MESSAGES: any[] = [];