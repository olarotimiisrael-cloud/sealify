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

const generateListings = (category: any, startId: number, count: number): Listing[] => {
  const data: Record<string, { titles: string[], images: string[] }> = {
    'Vehicles': {
      titles: ['Toyota Camry 2022 Hybrid', 'Lexus RX 350 2018', 'Honda Accord 2015', 'Mercedes Benz C300', 'Toyota Corolla 2012'],
      images: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'
      ]
    },
    'Electronics': {
      titles: ['iPhone 15 Pro 256GB', 'MacBook Pro M3 Max', 'Samsung Galaxy S24 Ultra', 'PlayStation 5 Console', 'Sony Noise Cancelling Headphones'],
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
        'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee'
      ]
    },
    'Real Estate': {
      titles: ['Luxury 4 Bedroom Duplex', 'Modern Office Space', 'Standard 2 Bedroom Apartment', 'Commercial Land for Sale', 'Fully Furnished Studio'],
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
      ]
    }
  };

  const list: Listing[] = [];
  for (let i = 0; i < count; i++) {
    const categoryData = data[category] || { titles: ['Item ' + i], images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa'] };
    
    list.push({
      id: `lst_${startId + i}`,
      sellerId: i % 2 === 0 ? 'usr_1' : 'usr_2',
      sellerName: i % 2 === 0 ? 'Adebowale Ogunleye' : 'Blessing Okonjo',
      sellerPhone: '+234 813 120 8468',
      sellerAvatar: SELLER_AVATAR,
      sellerVerified: true,
      sellerVerificationType: i % 3 === 0 ? 'business' : 'individual',
      title: categoryData.titles[i % categoryData.titles.length],
      description: `Premium quality ${category} item. Thoroughly tested and verified. Local pickup available in Ogbomoso.`,
      price: Math.floor(Math.random() * 500000) + 25000,
      category: category as Category,
      condition: 'Like New',
      location: 'Ogbomoso, Oyo State',
      status: 'active',
      images: [categoryData.images[i % categoryData.images.length] + '?w=800&auto=format&fit=crop'],
      viewsCount: Math.floor(Math.random() * 250) + 10,
      createdAt: '2 days ago',
      featured: i % 5 === 0
    });
  }
  return list;
};

export const MOCK_LISTINGS: Listing[] = [
  ...generateListings('Vehicles', 100, 10),
  ...generateListings('Electronics', 200, 10),
  ...generateListings('Real Estate', 300, 10),
];

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