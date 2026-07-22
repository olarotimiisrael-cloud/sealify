import { Category, Listing, UserProfile, Message } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'vehicles', name: 'Vehicles', iconName: 'Car', count: 120, color: 'bg-blue-500' },
  { id: 'electronics', name: 'Electronics', iconName: 'Smartphone', count: 340, color: 'bg-purple-500' },
  { id: 'real_estate', name: 'Real Estate', iconName: 'Home', count: 85, color: 'bg-teal-500' },
  { id: 'fashion', name: 'Fashion', iconName: 'Shirt', count: 210, color: 'bg-pink-500' },
  { id: 'furniture', name: 'Home & Furniture', iconName: 'Armchair', count: 95, color: 'bg-amber-500' },
  { id: 'services', name: 'Services', iconName: 'Wrench', count: 140, color: 'bg-cyan-500' },
  { id: 'jobs', name: 'Jobs', iconName: 'Briefcase', count: 60, color: 'bg-indigo-500' },
  { id: 'beauty', name: 'Beauty & Health', iconName: 'Dumbbell', count: 110, color: 'bg-rose-500' },
];

export const MOCK_USER: UserProfile = {
  id: 'usr_admin_default',
  email: 'olarotimiisrael@gmail.com',
  full_name: 'Israel Olarotimi',
  phone_number: '0813 120 8468',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  role: 'both',
  verified: true,
  member_since: 'Jan 2023',
  location: 'Ogbomoso, Oyo State',
};

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'lst_101',
    seller_id: 'usr_1',
    seller: {
      id: 'usr_1',
      full_name: 'Adebowale Ogunleye',
      phone_number: '+234 803 123 4567',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      role: 'seller',
      verified: true,
      member_since: 'Mar 2023',
      location: 'Ogbomoso, Oyo State',
    },
    title: 'Toyota Camry 2018 XSE (Unregistered Foreign Used)',
    description: 'Clean foreign used 2018 Toyota Camry XSE with panoramic roof, leather interior, custom alloy wheels, reverse camera, and duty paid.',
    price: 18500000,
    category: 'Vehicles',
    condition: 'Like New',
    location: 'Ogbomoso, Oyo State',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80',
    ],
    views_count: 245,
    created_at: new Date().toISOString(),
    is_featured: true,
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    sender_id: 'usr_2',
    receiver_id: 'usr_admin_default',
    listing_id: 'lst_101',
    listing_title: 'Toyota Camry 2018 XSE',
    listing_image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80',
    content: 'Hi, is this Toyota Camry still available for inspection in Ogbomoso?',
    read: false,
    created_at: new Date().toISOString(),
    sender_name: 'Blessing Okonjo',
  },
];