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
    'Beauty & Health': ['Skin Glow Cream Set', 'Organic Hair Growth Oil', 'Dumbbell Set 20kg', 'Electric Massage Chair', 'Premium Perfume Oil', 'Fitness Tracker Watch', 'Yoga Mat Eco-Friendly', 'Blood Pressure Monitor', 'Professional Hair Clipper', 'Facial Steamer Pro'],
    'Utility & Energy': [
      'Solar Panel System 300W',
      'Portable Generator 5kVA',
      'Inverter 2kVA Pure Sine Wave',
      'High Capacity Power Bank 30000mAh',
      'Digital Electric Meter (Single Phase)',
      'Submersible Water Pump 1HP',
      'LED Floodlight 50W with Motion Sensor',
      'Heavy Duty Extension Cord 20m',
      'Circuit Breaker Box 8-way',
      'Step-down Transformer 5kVA',
      'Voltage Stabilizer 2kVA',
      'Uninterruptible Power Supply (UPS) 1000VA',
      'Smart Battery Charger 12V/24V',
      'Underground Electrical Cable Armored 10mm',
      'Gas Cooker with Electric Ignition'
    ],
  };

  const images: Record<string, string[]> = {
    'Vehicles': ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'],
    'Electronics': ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee'],
    'Real Estate': ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'],
    'Fashion': ['https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'https://images.unsplash.com/photo-1548036627-09611f7d7aa4', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
    'Home & Furniture': ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36'],
    'Services': ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e', 'https://images.unsplash.com/photo-1581578731548-c64695ce6958', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'],
    'Jobs': ['https://images.unsplash.com/photo-1521737711867-e3b97375f902', 'https://images.unsplash.com/photo-1531482615713-2afd69097998', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'],
    'Beauty & Health': ['https://images.unsplash.com/photo-1556228720-195a672e8a03', 'https://images.unsplash.com/photo-1512496011931-d21ff46aba33', 'https://images.unsplash.com/photo-1540555700478-4be289fbecee'],
    'Utility & Energy': [
      'https://images.unsplash.com/photo-1581091868860-13248a483651', // solar panel
      'https://images.unsplash.com/photo-1594735127488-d203a5590c02', // generator
      'https://images.unsplash.com/photo-1593642532444-31172ea8f411', // inverter
      'https://images.unsplash.com/photo-1592750475328-580916778d5c', // power bank
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // electric meter (reuse)
      'https://images.unsplash.com/photo-1601555879447-21c363bcd7ee', // water pump
      'https://images.unsplash.com/photo-1593642632823-3f7dd0fd3b6b', // LED floodlight
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // extension cord (reuse)
      'https://images.unsplash.com/photo-1581091868860-13248a483651', // circuit breaker (reuse)
      'https://images.unsplash.com/photo-1593642532444-31172ea8f411', // transformer (reuse)
      'https://images.unsplash.com/photo-1592750475328-580916778d5c', // stabilizer (reuse)
      'https://images.unsplash.com/photo-1594735127488-d203a5590c02', // UPS (reuse)
      'https://images.unsplash.com/photo-1593642632823-3f7dd0fd3b6b', // charger (reuse)
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // cable (reuse)
      'https://images.unsplash.com/photo-1594735127488-d203a5590c02' // gas cooker (reuse)
    ],
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
  ...generateListings('Utility & Energy', 900, 15),
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
</dyad-file><dyad-problem-report summary="245 problems">
<problem file="src/data/mockData.ts" line="159" column="2" code="1110">Type expected.</problem>
<problem file="src/data/mockData.ts" line="161" column="1" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="161" column="5" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="161" column="8" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="161" column="13" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="161" column="16" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="161" column="23" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="161" column="27" code="1005">'export' expected.</problem>
<problem file="src/data/mockData.ts" line="161" column="35" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="161" column="74" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="161" column="77" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="161" column="85" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="163" column="4" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="163" column="29" code="1002">Unterminated string literal.</problem>
<problem file="src/data/mockData.ts" line="165" column="57" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="165" column="72" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="165" column="96" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="165" column="105" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="165" column="108" code="1005">'export' expected.</problem>
<problem file="src/data/mockData.ts" line="165" column="116" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="165" column="127" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="165" column="134" code="1002">Unterminated string literal.</problem>
<problem file="src/data/mockData.ts" line="625" column="30" code="1005">'>' expected.</problem>
<problem file="src/data/mockData.ts" line="625" column="35" code="1005">')' expected.</problem>
<problem file="src/data/mockData.ts" line="625" column="37" code="1136">Property assignment expected.</problem>
<problem file="src/data/mockData.ts" line="626" column="37" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="626" column="54" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="628" column="30" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="629" column="21" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="630" column="21" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="634" column="40" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="635" column="21" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="636" column="24" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="637" column="59" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="637" column="113" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="643" column="7" code="1005">',' expected.</problem>
<problem file="src/data/mockData.ts" line="645" column="6" code="1161">Unterminated regular expression literal.</problem>
<problem file="src/data/mockData.ts" line="646" column="3" code="1128">Declaration or statement expected.</problem>
<problem file="src/data/mockData.ts" line="647" column="1" code="1128">Declaration or statement expected.</problem>
<problem file="src/data/mockData.ts" line="654" column="2" code="1110">Type expected.</problem>
<problem file="src/data/mockData.ts" line="656" column="1" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="5" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="8" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="13" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="19" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="23" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="32" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="39" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="656" column="49" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="656" column="56" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="61" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="68" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="73" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="77" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="101" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="656" column="114" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="118" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="141" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="656" column="152" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="156" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="160" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="171" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="177" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="194" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="656" column="199" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="204" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="212" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="656" column="229" code="1003">Identifier expected.</problem>
<problem file="src/data/mockData.ts" line="658" column="1" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="658" column="5" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="658" column="8" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="658" column="13" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="658" column="16" code="1435">Unknown keyword or identifier. Did you mean 'out put'?</problem>
<problem file="src/data/mockData.ts" line="658" column="23" code="1434">Unexpected keyword or identifier.</problem>
<problem file="src/data/mockData.ts" line="660" column="4" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="660" column="35" code="1002">Unterminated string literal.</problem>
<problem file="src/data/mockData.ts" line="662" column="277" code="1005">';' expected.</problem>
<problem file="src/data/mockData.ts" line="662" column="279" code="1002">Unterminated string literal.</problem>
<problem file="src/data/mockData.ts" line="1" column="20" code="2300">Duplicate identifier 'Listing'.</problem>
<problem file="src/data/mockData.ts" line="167" column="10" code="2300">Duplicate identifier 'Listing'.</problem>
<problem file="src/data/mockData.ts" line="1" column="29" code="2300">Duplicate identifier 'UserProfile'.</problem>
<problem file="src/data/mockData.ts" line="167" column="19" code="2300">Duplicate identifier 'UserProfile'.</problem>
<problem file="src/data/mockData.ts" line="1" column="10" code="2300">Duplicate identifier 'Category'.</problem>
<problem file="src/data/mockData.ts" line="167" column="45" code="2300">Duplicate identifier 'Category'.</problem>
<problem file="src/data/mockData.ts" line="1" column="42" code="2300">Duplicate identifier 'Message'.</problem>
<problem file="src/data/mockData.ts" line="167" column="69" code="2300">Duplicate identifier 'Message'.</problem>
<problem file="src/data/mockData.ts" line="1" column="10" code="2300">Duplicate identifier 'Category'.</problem>
<problem file="src/data/mockData.ts" line="663" column="10" code="2300">Duplicate identifier 'Category'.</problem>
<problem file="src/data/mockData.ts" line="1" column="20" code="2300">Duplicate identifier 'Listing'.</problem>
<problem file="src/data/mockData.ts" line="663" column="20" code="2300">Duplicate identifier 'Listing'.</problem>
<problem file="src/data/mockData.ts" line="1" column="29" code="2300">Duplicate identifier 'UserProfile'.</problem>
<problem file="src/data/mockData.ts" line="663" column="29" code="2300">Duplicate identifier 'UserProfile'.</problem>
<problem file="src/data/mockData.ts" line="1" column="42" code="2300">Duplicate identifier 'Message'.</problem>
<problem file="src/data/mockData.ts" line="663" column="42" code="2300">Duplicate identifier 'Message'.</problem>
<problem file="src/data/mockData.ts" line="3" column="14" code="2451">Cannot redeclare block-scoped variable 'CATEGORIES'.</problem>
<problem file="src/data/mockData.ts" line="665" column="14" code="2451">Cannot redeclare block-scoped variable 'CATEGORIES'.</problem>
<problem file="src/data/mockData.ts" line="15" column="7" code="2451">Cannot redeclare block-scoped variable 'SELLER_AVATAR'.</problem>
<problem file="src/data/mockData.ts" line="677" column="7" code="2451">Cannot redeclare block-scoped variable 'SELLER_AVATAR'.</problem>
<problem file="src/data/mockData.ts" line="18" column="7" code="2451">Cannot redeclare block-scoped variable 'generateListings'.</problem>
<problem file="src/data/mockData.ts" line="680" column="7" code="2451">Cannot redeclare block-scoped variable 'generateListings'.</problem>
<problem file="src/data/mockData.ts" line="104" column="14" code="2451">Cannot redeclare block-scoped variable 'MOCK_LISTINGS'.</problem>
<problem file="src/data/mockData.ts" line="750" column="14" code="2451">Cannot redeclare block-scoped variable 'MOCK_LISTINGS'.</problem>
<problem file="src/data/mockData.ts" line="116" column="14" code="2451">Cannot redeclare block-scoped variable 'ALL_MOCK_USERS'.</problem>
<problem file="src/data/mockData.ts" line="762" column="14" code="2451">Cannot redeclare block-scoped variable 'ALL_MOCK_USERS'.</problem>
<problem file="src/data/mockData.ts" line="157" column="14" code="2451">Cannot redeclare block-scoped variable 'MOCK_USER'.</problem>
<problem file="src/data/mockData.ts" line="803" column="14" code="2451">Cannot redeclare block-scoped variable 'MOCK_USER'.</problem>
<problem file="src/data/mockData.ts" line="158" column="14" code="2451">Cannot redeclare block-scoped variable 'MOCK_MESSAGES'.</problem>
<problem file="src/data/mockData.ts" line="804" column="14" code="2451">Cannot redeclare block-scoped variable 'MOCK_MESSAGES'.</problem>
<problem file="src/data/mockData.ts" line="104" column="14" code="2395">Individual declarations in merged declaration 'MOCK_LISTINGS' must be all exported or all local.</problem>
<problem file="src/data/mockData.ts" line="116" column="14" code="2395">Individual declarations in merged declaration 'ALL_MOCK_USERS' must be all exported or all local.</problem>
<problem file="src/data/mockData.ts" line="157" column="26" code="2448">Block-scoped variable 'ALL_MOCK_USERS' used before its declaration.</problem>
<problem file="src/data/mockData.ts" line="161" column="1" code="2304">Cannot find name 'Now'.</problem>
<problem file="src/data/mockData.ts" line="161" column="5" code="2304">Cannot find name 'we'.</problem>
<problem file="src/data/mockData.ts" line="161" column="8" code="2304">Cannot find name 'need'.</problem>
<problem file="src/data/mockData.ts" line="161" column="13" code="2304">Cannot find name 'to'.</problem>
<problem file="src/data/mockData.ts" line="161" column="16" code="2552">Cannot find name 'update'. Did you mean 'Date'?</problem>
<problem file="src/data/mockData.ts" line="161" column="23" code="2304">Cannot find name 'the'.</problem>
<problem file="src/data/mockData.ts" line="161" column="35" code="2552">Cannot find name 'categories'. Did you mean 'CATEGORIES'?</problem>
<problem file="src/data/mockData.ts" line="161" column="46" code="2552">Cannot find name 'array'. Did you mean 'Array'?</problem>
<problem file="src/data/mockData.ts" line="161" column="55" code="2448">Block-scoped variable 'SealifyContext' used before its declaration.</problem>
<problem file="src/data/mockData.ts" line="161" column="70" code="2339">Property 'tsx' does not exist on type 'Context<SealifyContextType>'.</problem>
<problem file="src/data/mockData.ts" line="161" column="74" code="2304">Cannot find name 'to'.</problem>
<problem file="src/data/mockData.ts" line="161" column="77" code="2304">Cannot find name 'include'.</problem>
<problem file="src/data/mockData.ts" line="161" column="85" code="2304">Cannot find name 'the'.</problem>
<problem file="src/data/mockData.ts" line="161" column="93" code="2304">Cannot find name 'category'.</problem>
<problem file="src/data/mockData.ts" line="163" column="4" code="2365">Operator '<' cannot be applied to types 'string' and 'number'.</problem>
<problem file="src/data/mockData.ts" line="165" column="2" code="2362">The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.</problem>
<problem file="src/data/mockData.ts" line="165" column="39" code="2448">Block-scoped variable 'SealifyContext' used before its declaration.</problem>
<problem file="src/data/mockData.ts" line="165" column="54" code="2339">Property 'tsx' does not exist on type 'Context<SealifyContextType>'.</problem>
<problem file="src/data/mockData.ts" line="165" column="72" code="2304">Cannot find name 'Adding'.</problem>
<problem file="src/data/mockData.ts" line="165" column="79" code="2304">Cannot find name 'Utility'.</problem>
<problem file="src/data/mockData.ts" line="165" column="89" code="2304">Cannot find name 'Energy'.</problem>
<problem file="src/data/mockData.ts" line="165" column="96" code="2304">Cannot find name 'category'.</problem>
<problem file="src/data/mockData.ts" line="165" column="105" code="2304">Cannot find name 'to'.</problem>
<problem file="src/data/mockData.ts" line="165" column="116" code="2304">Cannot find name 'categories'.</problem>
<problem file="src/data/mockData.ts" line="165" column="127" code="2304">Cannot find name 'state'.</problem>
<problem file="src/data/mockData.ts" line="169" column="10" code="2395">Individual declarations in merged declaration 'MOCK_LISTINGS' must be all exported or all local.</problem>
<problem file="src/data/mockData.ts" line="169" column="10" code="2440">Import declaration conflicts with local declaration of 'MOCK_LISTINGS'.</problem>
<problem file="src/data/mockData.ts" line="169" column="25" code="2395">Individual declarations in merged declaration 'ALL_MOCK_USERS' must be all exported or all local.</problem>
<problem file="src/data/mockData.ts" line="169" column="25" code="2440">Import declaration conflicts with local declaration of 'ALL_MOCK_USERS'.</problem>
<problem file="src/data/mockData.ts" line="326" column="14" code="2322">Type '({ children }: { children: ReactNode; }) => {}' is not assignable to type 'FC<{ children: ReactNode; }>'.
  Type '{}' is not assignable to type 'ReactNode | Promise<ReactNode>'.</problem>
<problem file="src/data/mockData.ts" line="625" column="6" code="2503">Cannot find namespace 'SealifyContext'.</problem>
<problem file="src/data/mockData.ts" line="625" column="30" code="2304">Cannot find name 'value'.</problem>
<problem file="src/data/mockData.ts" line="626" column="7" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="626" column="7" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="626" column="22" code="2304">Cannot find name 'isAuthenticated'.</problem>
<problem file="src/data/mockData.ts" line="626" column="39" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="626" column="47" code="2304">Cannot find name 'isAdmin'.</problem>
<problem file="src/data/mockData.ts" line="628" column="19" code="2304">Cannot find name 'addCategory'.</problem>
<problem file="src/data/mockData.ts" line="628" column="32" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="629" column="7" code="2304">Cannot find name 'deleteCategory'.</problem>
<problem file="src/data/mockData.ts" line="629" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="7" code="2304">Cannot find name 'updateCategory'.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="630" column="23" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="634" column="28" code="2304">Cannot find name 'resetFilters'.</problem>
<problem file="src/data/mockData.ts" line="634" column="42" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="635" column="7" code="2304">Cannot find name 'activeCategory'.</problem>
<problem file="src/data/mockData.ts" line="636" column="7" code="2304">Cannot find name 'setActiveCategory'.</problem>
<problem file="src/data/mockData.ts" line="636" column="26" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="636" column="26" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="636" column="26" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="48" code="2304">Cannot find name 'isInCompare'.</problem>
<problem file="src/data/mockData.ts" line="637" column="61" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="101" code="2304">Cannot find name 'clearCompare'.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="637" column="115" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="643" column="7" code="2365">Operator '<' cannot be applied to types 'boolean' and 'RegExp'.</problem>
<problem file="src/data/mockData.ts" line="644" column="8" code="18004">No value exists in scope for the shorthand property 'children'. Either declare one or provide an initializer.</problem>
<problem file="src/data/mockData.ts" line="656" column="1" code="2304">Cannot find name 'Now'.</problem>
<problem file="src/data/mockData.ts" line="656" column="5" code="2304">Cannot find name 'we'.</problem>
<problem file="src/data/mockData.ts" line="656" column="8" code="2304">Cannot find name 'have'.</problem>
<problem file="src/data/mockData.ts" line="656" column="13" code="2304">Cannot find name 'added'.</problem>
<problem file="src/data/mockData.ts" line="656" column="19" code="2304">Cannot find name 'the'.</problem>
<problem file="src/data/mockData.ts" line="656" column="23" code="2304">Cannot find name 'category'.</problem>
<problem file="src/data/mockData.ts" line="656" column="32" code="2304">Cannot find name 'and'.</problem>
<problem file="src/data/mockData.ts" line="656" column="39" code="2304">Cannot find name 'items'.</problem>
<problem file="src/data/mockData.ts" line="656" column="49" code="2304">Cannot find name 'should'.</problem>
<problem file="src/data/mockData.ts" line="656" column="56" code="2304">Cannot find name 'also'.</problem>
<problem file="src/data/mockData.ts" line="656" column="61" code="2304">Cannot find name 'ensure'.</problem>
<problem file="src/data/mockData.ts" line="656" column="68" code="2304">Cannot find name 'that'.</problem>
<problem file="src/data/mockData.ts" line="656" column="73" code="2304">Cannot find name 'the'.</problem>
<problem file="src/data/mockData.ts" line="656" column="77" code="2304">Cannot find name 'category'.</problem>
<problem file="src/data/mockData.ts" line="656" column="86" code="2304">Cannot find name 'appears'.</problem>
<problem file="src/data/mockData.ts" line="656" column="97" code="2304">Cannot find name 'the'.</problem>
<problem file="src/data/mockData.ts" line="656" column="101" code="2304">Cannot find name 'CategoryGrid'.</problem>
<problem file="src/data/mockData.ts" line="656" column="114" code="2304">Cannot find name 'and'.</problem>
<problem file="src/data/mockData.ts" line="656" column="118" code="2304">Cannot find name 'CategoryBar'.</problem>
<problem file="src/data/mockData.ts" line="656" column="130" code="2304">Cannot find name 'etc'.</problem>
<problem file="src/data/mockData.ts" line="656" column="141" code="2304">Cannot find name 'components'.</problem>
<problem file="src/data/mockData.ts" line="656" column="152" code="2304">Cannot find name 'use'.</problem>
<problem file="src/data/mockData.ts" line="656" column="156" code="2304">Cannot find name 'the'.</problem>
<problem file="src/data/mockData.ts" line="656" column="160" code="2304">Cannot find name 'categories'.</problem>
<problem file="src/data/mockData.ts" line="656" column="171" code="2304">Cannot find name 'state'.</problem>
<problem file="src/data/mockData.ts" line="656" column="177" code="2304">Cannot find name 'from'.</problem>
<problem file="src/data/mockData.ts" line="656" column="182" code="2304">Cannot find name 'context'.</problem>
<problem file="src/data/mockData.ts" line="656" column="182" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/data/mockData.ts" line="656" column="191" code="2304">Cannot find name 'so'.</problem>
<problem file="src/data/mockData.ts" line="656" column="194" code="2304">Cannot find name 'they'.</problem>
<problem file="src/data/mockData.ts" line="656" column="199" code="2304">Cannot find name 'will'.</problem>
<problem file="src/data/mockData.ts" line="656" column="204" code="2304">Cannot find name 'reflect'.</problem>
<problem file="src/data/mockData.ts" line="656" column="212" code="2304">Cannot find name 'the'.</problem>
<problem file="src/data/mockData.ts" line="656" column="220" code="2304">Cannot find name 'category'.</problem>
<problem file="src/data/mockData.ts" line="658" column="1" code="2304">Cannot find name 'Now'.</problem>
<problem file="src/data/mockData.ts" line="658" column="5" code="2304">Cannot find name 'we'.</problem>
<problem file="src/data/mockData.ts" line="658" column="8" code="2304">Cannot find name 'need'.</problem>
<problem file="src/data/mockData.ts" line="658" column="13" code="2304">Cannot find name 'to'.</problem>
<problem file="src/data/mockData.ts" line="658" column="16" code="2304">Cannot find name 'output'.</problem>
<problem file="src/data/mockData.ts" line="658" column="23" code="2304">Cannot find name 'a'.</problem>
<problem file="src/data/mockData.ts" line="658" column="25" code="2304">Cannot find name 'summary'.</problem>
<problem file="src/data/mockData.ts" line="660" column="4" code="2365">Operator '<' cannot be applied to types 'string' and 'number'.</problem>
<problem file="src/data/mockData.ts" line="662" column="2" code="2362">The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.</problem>
<problem file="src/data/mockData.ts" line="662" column="266" code="2304">Cannot find name 'mockData'.</problem>
<problem file="src/data/mockData.ts" line="750" column="14" code="2395">Individual declarations in merged declaration 'MOCK_LISTINGS' must be all exported or all local.</problem>
<problem file="src/data/mockData.ts" line="762" column="14" code="2395">Individual declarations in merged declaration 'ALL_MOCK_USERS' must be all exported or all local.</problem>
</dyad-problem-report><think>The user is asking me to fix 245 TypeScript compile-time errors. Looking at the errors, they seem to be related to a file called `src/data/mockData.ts` that has been corrupted or contains syntax errors. The errors include:

1. Duplicate identifiers (Listing, UserProfile, Category, Message, CATEGORIES, SELLER_AVATAR, generateListings, MOCK_LISTINGS, ALL_MOCK_USERS, MOCK_USER, MOCK_MESSAGES)
2. Unterminated string literals
3. Unexpected keywords or identifiers
4. Missing names like 'Now', 'we', 'need', etc.
5. Block-scoped variable used before declaration
6. Operator '<' cannot be applied to types 'string' and 'number'
7. Various syntax errors

The file appears to have been corrupted with a lot of random text mixed in. I need to fix this file by:
1. Removing duplicate declarations
2. Fixing syntax errors
3. Ensuring proper TypeScript syntax
4. Removing the corrupted text that appears to be comments or explanations mixed in with the code

Let me look at the file structure and fix the issues. The file should contain:
- CATEGORIES array
- SELLER_AVATAR constant
- generateListings function
- MOCK_LISTINGS array
- ALL_MOCK_USERS array
- MOCK_USER constant
- MOCK_MESSAGES array

I need to clean up this file and make it syntactically correct.</think>I can see the file has been corrupted with syntax errors and duplicate declarations. Let me fix the `src/data/mockData.ts` file to resolve all TypeScript errors:

<dyad-write path="src/data/mockData.ts">
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
    'Beauty & Health': ['Skin Glow Cream Set', 'Organic Hair Growth Oil', 'Dumbbell Set 20kg', 'Electric Massage Chair', 'Premium Perfume Oil', 'Fitness Tracker Watch', 'Yoga Mat Eco-Friendly', 'Blood Pressure Monitor', 'Professional Hair Clipper', 'Facial Steamer Pro'],
    'Utility & Energy': [
      'Solar Panel System 300W',
      'Portable Generator 5kVA',
      'Inverter 2kVA Pure Sine Wave',
      'High Capacity Power Bank 30000mAh',
      'Digital Electric Meter (Single Phase)',
      'Submersible Water Pump 1HP',
      'LED Floodlight 50W with Motion Sensor',
      'Heavy Duty Extension Cord 20m',
      'Circuit Breaker Box 8-way',
      'Step-down Transformer 5kVA',
      'Voltage Stabilizer 2kVA',
      'Uninterruptible Power Supply (UPS) 1000VA',
      'Smart Battery Charger 12V/24V',
      'Underground Electrical Cable Armored 10mm',
      'Gas Cooker with Electric Ignition'
    ],
  };

  const images: Record<string, string[]> = {
    'Vehicles': ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d'],
    'Electronics': ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee'],
    'Real Estate': ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'],
    'Fashion': ['https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'https://images.unsplash.com/photo-1548036627-09611f7d7aa4', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
    'Home & Furniture': ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36'],
    'Services': ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e', 'https://images.unsplash.com/photo-1581578731548-c64695ce6958', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f'],
    'Jobs': ['https://images.unsplash.com/photo-1521737711867-e3b97375f902', 'https://images.unsplash.com/photo-1531482615713-2afd69097998', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'],
    'Beauty & Health': ['https://images.unsplash.com/photo-1556228720-195a672e8a03', 'https://images.unsplash.com/photo-1512496011931-d21ff46aba33', 'https://images.unsplash.com/photo-1540555700478-4be289fbecee'],
    'Utility & Energy': [
      'https://images.unsplash.com/photo-1581091868860-13248a483651', // solar panel
      'https://images.unsplash.com/photo-1594735127488-d203a5590c02', // generator
      'https://images.unsplash.com/photo-1593642532444-31172ea8f411', // inverter
      'https://images.unsplash.com/photo-1592750475328-580916778d5c', // power bank
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // electric meter (reuse)
      'https://images.unsplash.com/photo-1601555879447-21c363bcd7ee', // water pump
      'https://images.unsplash.com/photo-1593642632823-3f7dd0fd3b6b', // LED floodlight
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // extension cord (reuse)
      'https://images.unsplash.com/photo-1581091868860-13248a483651', // circuit breaker (reuse)
      'https://images.unsplash.com/photo-1593642532444-31172ea8f411', // transformer (reuse)
      'https://images.unsplash.com/photo-1592750475328-580916778d5c', // stabilizer (reuse)
      'https://images.unsplash.com/photo-1594735127488-d203a5590c02', // UPS (reuse)
      'https://images.unsplash.com/photo-1593642632823-3f7dd0fd3b6b', // charger (reuse)
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // cable (reuse)
      'https://images.unsplash.com/photo-1594735127488-d203a5590c02' // gas cooker (reuse)
    ],
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
  ...generateListings('Utility & Energy', 900, 15),
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