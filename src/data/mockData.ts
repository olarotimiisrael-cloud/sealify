import { Category, Listing, UserProfile, Message } from '@/types/sealify';

export const CATEGORIES = [
  { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 120, color: 'bg-blue-500' },
  { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 340, color: 'bg-purple-500' },
  { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 85, color: 'bg-teal-500' },
  { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 210, color: 'bg-pink-500' },
  { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 95, color: 'bg-amber-500' },
  { id: 'services', name: 'Services', iconName: 'Wrench', count: 140, color: 'bg-cyan-500' },
  { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 60, color: 'bg-indigo-500' },
  { id: 'beauty', name: 'Beauty & Health', iconName: 'Sparkles', count: 110, color: 'bg-rose-500' },
  { id: 'utility', name: 'Utility & Energy', iconName: 'Zap', count: 15, color: 'bg-yellow-500' },
];

const SELLER_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80";

// Detailed catalog items where titles strictly match images
const DETAILED_PRODUCTS: Record<string, { title: string; image: string; desc: string; price: number; cond: 'Brand New' | 'Like New' | 'Used - Good' }[]> = {
  'Vehicles': [
    {
      title: 'Toyota Camry 2022 Hybrid LE',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop',
      desc: 'Extremely clean Toyota Camry Hybrid 2022 model. Smooth engine, factory leather interior, active reverse camera and alloy wheels. Located in Takie Square, Ogbomoso.',
      price: 18500000,
      cond: 'Like New'
    },
    {
      title: 'Mercedes Benz C300 Luxury Sedan',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop',
      desc: 'Full option Mercedes Benz C300 with panoramic sunroof, ambient lighting, keyless entry, and original duty papers fully verified.',
      price: 14200000,
      cond: 'Like New'
    },
    {
      title: 'Lexus RX 350 AWD SUV',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop',
      desc: 'Tokunbo standard Lexus RX 350 SUV. Clean interior, powerful V6 engine, first body paint, ice-cold AC.',
      price: 16800000,
      cond: 'Used - Good'
    },
    {
      title: 'Honda Accord 2018 EX-L Sedan',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
      desc: 'Honda Accord 2018 with turbo engine, lane departure alert, touch screen infotainment, and leather seats.',
      price: 11500000,
      cond: 'Like New'
    }
  ],
  'Electronics': [
    {
      title: 'Apple iPhone 15 Pro Max 256GB',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop',
      desc: 'Brand new factory unlocked iPhone 15 Pro Max in Natural Titanium. 100% battery health, original box and Type-C cable included.',
      price: 1350000,
      cond: 'Brand New'
    },
    {
      title: 'Apple MacBook Pro M3 14-inch',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop',
      desc: 'Space Black MacBook Pro M3 chip with 18GB RAM and 512GB SSD. Perfect for software development and 4K video editing. Available in LAUTECH Under G.',
      price: 1950000,
      cond: 'Like New'
    },
    {
      title: 'Sony PlayStation 5 Gaming Console',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop',
      desc: 'PS5 Disc Edition console in mint condition. Comes with 2 DualSense controllers, HDMI 2.1 cable, and FC24 game pre-installed.',
      price: 680000,
      cond: 'Like New'
    },
    {
      title: 'Samsung Galaxy S24 Ultra 5G',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop',
      desc: 'Titanium Black Galaxy S24 Ultra with S-Pen, 512GB storage, 200MP camera setup. Screen protector applied from day one.',
      price: 1280000,
      cond: 'Brand New'
    }
  ],
  'Real Estate': [
    {
      title: 'Luxury 4 Bedroom Detached Duplex',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop',
      desc: 'Newly built 4-bedroom fully detached duplex with modern fitted kitchen, pop ceiling, spacious parking for 5 cars, and 24/7 security. Located in Aroje, Ogbomoso.',
      price: 65000000,
      cond: 'Brand New'
    },
    {
      title: 'Modern 2 Bedroom Apartment Rental',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
      desc: 'Clean 2-bedroom flat with running borehole water, separate prepaid electricity meter, fully tiled rooms in LAUTECH Main Gate area.',
      price: 450000,
      cond: 'Like New'
    },
    {
      title: 'Commercial Store & Office Space',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
      desc: 'Prime location commercial shop suitable for supermarket, pharmacy, or tech hub located right at Takie Roundabout, Ogbomoso.',
      price: 1200000,
      cond: 'Brand New'
    }
  ],
  'Fashion': [
    {
      title: 'Nike Air Jordan 1 Retro Sneakers',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop',
      desc: 'Original Nike Air Jordan 1 high-top sneakers in classic colorway. Available sizes EU 41-45. Perfect for casual wear.',
      price: 65000,
      cond: 'Brand New'
    },
    {
      title: 'Men Luxury Designer Wristwatch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
      desc: 'Waterproof stainless steel chronograph wristwatch with date display. Comes with luxury gift presentation box.',
      price: 48000,
      cond: 'Brand New'
    }
  ],
  'Home & Furniture': [
    {
      title: 'Modern L-Shaped Leather Sofa Set',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop',
      desc: 'High-density foam 7-seater sectional leather sofa set with throw pillows. Stylish dark grey shade for modern living rooms.',
      price: 380000,
      cond: 'Like New'
    },
    {
      title: 'Solid Wood 6-Seater Dining Set',
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop',
      desc: 'Handcrafted mahogany wood dining table with 6 comfortable cushioned chairs. Sturdy build for long-lasting dining.',
      price: 260000,
      cond: 'Like New'
    }
  ],
  'Services': [
    {
      title: 'Solar Inverter System Installation',
      image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop',
      desc: 'Professional installation of 3.5kVA to 10kVA solar hybrid inverters and lithium batteries across Ogbomoso and Oyo State.',
      price: 150000,
      cond: 'Brand New'
    }
  ],
  'Beauty & Health': [
    {
      title: 'Organic Skincare & Glowing Serum Set',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop',
      desc: 'Dermatologist tested organic vitamin C facial serum and moisturising body lotion set. Suitable for all skin types.',
      price: 25000,
      cond: 'Brand New'
    }
  ],
  'Utility & Energy': [
    {
      title: 'Elepaq Silent Inverter Generator 3.5kVA',
      image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&auto=format&fit=crop',
      desc: 'Fuel-efficient low noise copper-coil generator capable of running refrigerators, TVs, and computers smoothly.',
      price: 195000,
      cond: 'Brand New'
    }
  ]
};

export const MOCK_LISTINGS: Listing[] = Object.keys(DETAILED_PRODUCTS).flatMap((category, catIdx) => {
  const items = DETAILED_PRODUCTS[category];
  return items.map((prod, itemIdx) => ({
    id: `lst_${catIdx * 10 + itemIdx + 1}`,
    sellerId: itemIdx % 2 === 0 ? 'usr_1' : 'usr_2',
    sellerName: itemIdx % 2 === 0 ? 'Adebowale Ogunleye' : 'Blessing Okonjo',
    sellerPhone: '+234 813 120 8468',
    sellerAvatar: SELLER_AVATAR,
    sellerVerified: true,
    sellerVerificationType: itemIdx % 3 === 0 ? 'business' : 'individual',
    title: prod.title,
    description: prod.desc,
    price: prod.price,
    category: category as Category,
    condition: prod.cond,
    location: 'Ogbomoso, Oyo State',
    status: 'active',
    images: [prod.image],
    viewsCount: Math.floor(Math.random() * 250) + 25,
    createdAt: '2 days ago',
    featured: itemIdx % 2 === 0
  }));
});

export const ALL_MOCK_USERS: UserProfile[] = [
  {
    id: 'usr_admin_default',
    email: 'olarotimiisrael@gmail.com',
    fullName: 'Israel Olarotimi',
    phoneNumber: '0813 120 8468',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    role: 'admin',
    verified: true,
    verificationType: 'premium',
    memberSince: 'Jan 2023',
    location: 'Ogbomoso, Oyo State',
  },
  {
    id: 'usr_1',
    email: 'adebowale@gmail.com',
    fullName: 'Adebowale Ogunleye',
    phoneNumber: '+234 803 000 0000',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop',
    role: 'seller',
    verified: true,
    verificationType: 'business',
    businessName: 'Ogunleye Motors Ogbomoso',
    memberSince: 'Mar 2023',
    location: 'Ogbomoso, Oyo State',
  }
];

export const MOCK_USER = ALL_MOCK_USERS[1];
export const MOCK_MESSAGES: any[] = [];