import { Category, Listing, UserProfile } from '@/types/sealify';

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
  featured: boolean; // 1 per category is featured promotional ad
}

const CATALOG_DATA: Record<Category, CatalogItem[]> = {
  'Vehicles': [
    {
      title: 'Toyota Camry 2022 Hybrid LE (Promotional Top Ad)',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop',
      desc: '🔥 TOP AD PROMOTION: Super clean Tokunbo standard Toyota Camry Hybrid LE 2022 model. Smooth engine, factory leather, active reverse camera, original duty papers verified.',
      price: 18500000,
      cond: 'Like New',
      featured: true
    },
    {
      title: 'Mercedes Benz C300 Luxury Sedan',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop',
      desc: 'Full option Mercedes Benz C300 with panoramic sunroof, ambient lighting, keyless entry. Located at Takie Roundabout, Ogbomoso.',
      price: 14200000,
      cond: 'Like New',
      featured: false
    },
    {
      title: 'Lexus RX 350 AWD SUV',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop',
      desc: 'Clean Lexus RX 350 SUV. Powerful V6 engine, first body paint, ice-cold AC, genuine custom documents.',
      price: 16800000,
      cond: 'Used - Good',
      featured: false
    }
  ],
  'Electronics': [
    {
      title: 'Apple iPhone 15 Pro Max 256GB (Promotional Top Ad)',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
      desc: '⚡ PROMOTED DEAL: Brand new factory unlocked iPhone 15 Pro Max in Natural Titanium. 100% battery health, full box and original Type-C cable included.',
      price: 1350000,
      cond: 'Brand New',
      featured: true
    },
    {
      title: 'Apple MacBook Pro M3 14-inch',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
      desc: 'Space Black MacBook Pro M3 chip with 18GB RAM and 512GB SSD. Perfect for software development and 4K editing in LAUTECH Under G.',
      price: 1950000,
      cond: 'Like New',
      featured: false
    },
    {
      title: 'Sony PlayStation 5 Disc Console + 2 Controllers',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop',
      desc: 'PS5 Disc Edition console in mint condition. Comes with 2 DualSense controllers, HDMI 2.1 cable, and EA FC24 pre-installed.',
      price: 680000,
      cond: 'Like New',
      featured: false
    }
  ],
  'Real Estate': [
    {
      title: 'Luxury 4 Bedroom Detached Duplex in Aroje (Promotional Top Ad)',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop',
      desc: '👑 FEATURED REAL ESTATE: Newly built 4-bedroom fully detached duplex with modern fitted kitchen, pop ceiling, parking for 5 cars, C of O title papers ready.',
      price: 65000000,
      cond: 'Brand New',
      featured: true
    },
    {
      title: 'Modern 2 Bedroom Student Apartment Rental',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
      desc: 'Clean 2-bedroom flat with running borehole water, prepaid meter, fully tiled rooms near LAUTECH Main Gate.',
      price: 450000,
      cond: 'Like New',
      featured: false
    },
    {
      title: 'Commercial Storefront & Hub Space in Takie',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
      desc: 'Prime commercial shop suitable for boutique, pharmacy, or tech store right at Takie Square, Ogbomoso.',
      price: 1200000,
      cond: 'Brand New',
      featured: false
    }
  ],
  'Fashion': [
    {
      title: 'Nike Air Jordan 1 High OG Sneakers (Promotional Top Ad)',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop',
      desc: '🔥 PROMOTED FASHION: 100% Original Nike Air Jordan 1 High sneakers. EU Sizes 41-45 available for immediate dispatch in Ogbomoso.',
      price: 65000,
      cond: 'Brand New',
      featured: true
    },
    {
      title: 'Men Luxury Designer Chronograph Wristwatch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
      desc: 'Waterproof stainless steel chronograph watch with date display. Includes luxury leather gift presentation box.',
      price: 48000,
      cond: 'Brand New',
      featured: false
    },
    {
      title: 'Handcrafted Traditional Agbada & Native Wear',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop',
      desc: 'Premium Aso-Oke native Agbada 3-piece set sewn by master tailors in Sabo Market, Ogbomoso.',
      price: 85000,
      cond: 'Brand New',
      featured: false
    }
  ],
  'Home & Furniture': [
    {
      title: 'Modern 7-Seater Sectional Leather Sofa Set (Promotional Top Ad)',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop',
      desc: '🛋️ TOP AD PROMOTION: High-density foam 7-seater L-shaped leather sofa set with plush throw pillows. Stylish dark grey finish for modern homes.',
      price: 380000,
      cond: 'Like New',
      featured: true
    },
    {
      title: 'Solid Mahogany Wood 6-Seater Dining Set',
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop',
      desc: 'Handcrafted mahogany dining table with 6 cushioned chairs. Durable build for long-lasting dining room elegance.',
      price: 260000,
      cond: 'Like New',
      featured: false
    },
    {
      title: 'Orthopedic Queen Size Bed Frame & Mattress',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop',
      desc: 'High-quality Mouka Orthopedic Queen Mattress (6x6) with sturdy wooden bed frame. Great back support.',
      price: 195000,
      cond: 'Like New',
      featured: false
    }
  ],
  'Services': [
    {
      title: '5kVA Solar Hybrid Inverter Installation Service (Promotional Top Ad)',
      image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop',
      desc: '⚡ TOP AD SERVICE: Professional engineering installation of 3.5kVA to 10kVA solar hybrid inverters and lithium batteries across Oyo State.',
      price: 150000,
      cond: 'Brand New',
      featured: true
    },
    {
      title: 'Professional CCTV & Security Alarm Installation',
      image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop',
      desc: 'Complete 8-camera Hikvision CCTV installation with mobile live monitoring setup for homes and businesses.',
      price: 180000,
      cond: 'Brand New',
      featured: false
    },
    {
      title: 'Architectural Blueprint & Building Design Consultancy',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop',
      desc: 'Custom 2D/3D building designs, structural drawings, and approval processing for properties in Ogbomoso.',
      price: 120000,
      cond: 'Brand New',
      featured: false
    }
  ],
  'Jobs': [
    {
      title: 'Senior Full-Stack React Developer (Remote / Hybrid) (Promotional Top Ad)',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
      desc: '💼 FEATURED JOB: Hiring Senior Web Developer with experience in React, TypeScript, and Node.js. Competitive NGN salary package.',
      price: 450000,
      cond: 'Brand New',
      featured: true
    },
    {
      title: 'Store Manager & Sales Executive Position in Takie',
      image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&auto=format&fit=crop',
      desc: 'Urgent hiring for experienced retail manager to oversee inventory and customer service in Takie Square retail outlet.',
      price: 120000,
      cond: 'Brand New',
      featured: false
    },
    {
      title: 'Graphics Designer & Social Media Handler',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop',
      desc: 'Creative designer needed for Canva, Photoshop, and Instagram reel content creation for local brand marketing.',
      price: 90000,
      cond: 'Brand New',
      featured: false
    }
  ],
  'Beauty & Health': [
    {
      title: 'Organic Skincare & Glowing Serum Complete Set (Promotional Top Ad)',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop',
      desc: '✨ FEATURED BEAUTY: Dermatologist tested organic vitamin C facial serum, moisturizing body lotion, and exfoliation scrub set.',
      price: 35000,
      cond: 'Brand New',
      featured: true
    },
    {
      title: 'Professional Human Hair Wig 24-inch Bone Straight',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&auto=format&fit=crop',
      desc: '100% Vietnam double drawn bone straight human hair wig with HD frontal closure. Zero tangling.',
      price: 145000,
      cond: 'Brand New',
      featured: false
    },
    {
      title: 'Unisex Eau de Parfum Luxury Perfume Set',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop',
      desc: 'Long-lasting Arabian Oud & Amber 100ml perfume set with 48-hour fragrance projection.',
      price: 28000,
      cond: 'Brand New',
      featured: false
    }
  ],
  'Utility & Energy': [
    {
      title: 'Elepaq Silent Inverter Generator 3.5kVA (Promotional Top Ad)',
      image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&auto=format&fit=crop',
      desc: '⚡ FEATURED POWER: Fuel-efficient low noise copper-coil 3.5kVA generator. Runs refrigerators, TVs, and laptops smoothly.',
      price: 220000,
      cond: 'Brand New',
      featured: true
    },
    {
      title: '200Ah 12V Deep Cycle Gel Solar Battery',
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop',
      desc: 'Maintenance-free 200Ah tubular gel solar battery with 3-year warranty for residential inverters.',
      price: 210000,
      cond: 'Brand New',
      featured: false
    },
    {
      title: 'Heavy Duty Prepaid Electricity Meter Enclosure Box',
      image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&auto=format&fit=crop',
      desc: 'Weatherproof transparent protective meter box for single & three-phase electricity meters.',
      price: 18000,
      cond: 'Brand New',
      featured: false
    }
  ]
};

// Generate 27 listings (3 per category, 1 promotional per category) - ALL OWNED BY ADMIN
export const MOCK_LISTINGS: Listing[] = Object.keys(CATALOG_DATA).flatMap((catKey, catIdx) => {
  const items = CATALOG_DATA[catKey as Category];
  return items.map((item, itemIdx) => ({
    id: `lst_${catKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${itemIdx + 1}`,
    sellerId: 'usr_admin_default',
    sellerName: 'Sealify Official',
    sellerPhone: '+234 813 120 8468',
    sellerAvatar: '/logo.png',
    sellerVerified: true,
    sellerVerificationType: 'premium',
    title: item.title,
    description: item.desc,
    price: item.price,
    category: catKey as Category,
    condition: item.cond,
    location: 'Ogbomoso, Oyo State',
    status: 'active',
    images: [item.image],
    viewsCount: Math.floor(Math.random() * 300) + 50,
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
    location: 'Ogbomoso, Oyo State',
  }
];

export const MOCK_USER = ALL_MOCK_USERS[0];
export const MOCK_MESSAGES: any[] = [];