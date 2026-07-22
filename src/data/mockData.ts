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
];

const SELLER_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80";

// Helper to generate listings for a category
const generateListings = (category: any, startId: number, count: number): Listing[] => {
  const titles: Record<string, string[]> = {
    'Vehicles': ['Toyota Camry 2018', 'Lexus ES 350 2015', 'Honda Accord 2012', 'Mercedes Benz C300 2017', 'Toyota Corolla 2010', 'Range Rover Sport 2014', 'Hyundai Elantra 2016', 'Toyota Venza 2013', 'Lexus RX 350 2010', 'Ford Edge 2015', 'Mazda 3 2014'],
    'Electronics': ['iPhone 15 Pro Max', 'Samsung S23 Ultra', 'MacBook Pro M2', 'Sony PlayStation 5', 'HP Elitebook 840 G5', 'Canon EOS R6', 'Hisense 55" Smart TV', 'JBL Boombox 3', 'Dell XPS 13', 'AirPods Pro 2', 'Nintendo Switch OLED'],
    'Real Estate': ['3 Bedroom Bungalow in Sabo', 'Self Contain near LAUTECH', 'Shop Space at Under G', 'Uncompleted Building in Oke-Anu', 'Hostel for Sale at General', 'Office Space in Akala Way', 'Standard 2 Bedroom at Aroje', 'Luxury Mansion in Ilorin Road', 'Prime Land at Takie', 'Warehouse at Ogbomoso-Ibadan Express'],
    'Fashion': ['Gucci Leather Sneakers', 'Native Agbada Wear', 'Designer Handbag', 'Rolex Datejust Watch', 'Nike Air Jordan 1', 'Premium Lace Fabric', 'Corporate Suite Men', 'Italian Leather Shoes', 'Sunglasses Gold Frame', 'Engagement Ring Diamond'],
    'Home & Furniture': ['L-Shaped 7 Seater Sofa', 'Royal King Size Bed', 'Dining Table 6 Chairs', 'Wardrobe 3 Doors', 'Office Swivel Chair', 'Kitchen Cabinet Set', 'Persian Area Rug', 'Luxury Chandelier', 'Modern TV Stand', 'Smart Fridge Freezer'],
    'Services': ['Professional Painting', 'Solar Panel Installation', 'Web Development Services', 'Graphics Design Hub', 'Catering for Events', 'Home Cleaning Service', 'Plumbing & Repairs', 'Auto Mechanic Specialist', 'Makeup & Gele Artistry', 'Photography Studio'],
    'Jobs': ['Sales Representative', 'School Teacher Primary', 'Delivery Rider', 'Customer Care Agent', 'Security Guard Night', 'Farm Manager', 'Software Intern', 'Barista at Cafe', 'Hotel Manager', 'Driver for Haulage'],
    'Beauty & Health': ['Skin Glow Cream Set', 'Organic Hair Growth Oil', 'Dumbbell Set 20kg', 'Electric Massage Chair', 'Premium Perfume Oil', 'Fitness Tracker Watch', 'Yoga Mat Eco-Friendly', 'Blood Pressure Monitor', 'Professional Hair Clipper', 'Facial Steamer Pro']
  };

  const images: Record<string, string[]> = {
    'Vehicles': ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'],
    'Electronics': ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee'],
    'Real Estate': ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'],
    'Fashion': ['https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'https://images.unsplash.com/photo-1548036627-09611f7d7aa4', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
    'Home & Furniture': ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36'],
    'Services': ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e', 'https://images.unsplash.com/photo-1581578731548-c64695ce6958', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'],
    'Jobs': ['https://images.unsplash.com/photo-1521737711867-e3b97375f902', 'https://images.unsplash.com/photo-1531482615713-2afd69097998', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'],
    'Beauty & Health': ['https://images.unsplash.com/photo-1556228720-195a672e8a03', 'https://images.unsplash.com/photo-1512496011931-d21ff46aba33', 'https://images.unsplash.com/photo-1540555700478-4be289fbecee']
  };

  const list: Listing[] = [];
  for (let i = 0; i < count; i++) {
    const titleArr = titles[category] || ['Item ' + i];
    const imgArr = images[category] || ['https://images.unsplash.com/photo-1560518883-ce09059eeffa'];
    
    list.push({
      id: `lst_${startId + i}`,
      sellerId: i % 2 === 0 ? 'usr_1' : 'usr_2',
      sellerName: i % 2 === 0 ? 'Adebowale Ogunleye' : 'Blessing Okonjo',
      sellerPhone: '+234 813 120 8468',
      sellerAvatar: SELLER_AVATAR,
      sellerVerified: true,
      sellerVerificationType: i % 3 === 0 ? 'business' : 'individual',
      title: titleArr[i % titleArr.length],
      description: `Premium ${category} item available for immediate pickup in Ogbomosoland. Clean condition, tested and verified by our team. Price is slightly negotiable.`,
      price: Math.floor(Math.random() * 500000) + 10000,
      category: category as Category,
      condition: i % 4 === 0 ? 'Brand New' : 'Like New',
      location: i % 2 === 0 ? 'Ogbomoso, Oyo State' : 'Ilorin Road, Ogbomoso',
      status: 'active',
      images: [imgArr[i % imgArr.length] + '?w=600&auto=format'],
      viewsCount: Math.floor(Math.random() * 300) + 20,
      createdAt: '2 days ago',
      featured: i % 5 === 0
    });
  }
  return list;
};

export const MOCK_LISTINGS: Listing[] = [
  ...generateListings('Vehicles', 100, 12),
  ...generateListings('Electronics', 200, 15),
  ...generateListings('Real Estate', 300, 11),
  ...generateListings('Fashion', 400, 14),
  ...generateListings('Home & Furniture', 500, 10),
  ...generateListings('Services', 600, 12),
  ...generateListings('Jobs', 700, 10),
  ...generateListings('Beauty & Health', 800, 11),
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
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    role: 'seller',
    verified: true,
    verificationType: 'business',
    businessName: 'Ogunleye Motors Ogbomoso',
    memberSince: 'Mar 2023',
    location: 'Ogbomoso, Oyo State',
  },
  {
    id: 'usr_2',
    email: 'blessing@gmail.com',
    fullName: 'Blessing Okonjo',
    phoneNumber: '+234 814 111 2222',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300',
    role: 'seller',
    verified: true,
    verificationType: 'individual',
    memberSince: 'May 2023',
    location: 'Under G Area, Ogbomoso',
  }
];

// Resolving TypeScript errors for AppContext.tsx
export const MOCK_USER = ALL_MOCK_USERS[1];
export const MOCK_MESSAGES: any[] = [];