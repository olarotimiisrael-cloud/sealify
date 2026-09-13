import { HTTPException } from 'hono/http-exception';
import type { Context, Next } from 'hono';
import { z } from 'zod';
import { rateLimit } from './rate-limit';

export const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 });
export const listingsRateLimit = rateLimit({ windowMs: 60000, maxRequests: 60 });
export const copilotRateLimit = rateLimit({ windowMs: 60000, maxRequests: 20 });

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  fullName: z.string().min(2, 'Name too short').max(100).regex(/^[a-zA-Z\s'-]+$/, 'Invalid name format'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required'),
  accessKey: z.string().trim().min(1, 'Access key required').optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  businessName: z.string().max(100).optional().nullable(),
  businessCategory: z.string().max(50).optional().nullable(),
  businessAddress: z.string().max(200).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  accountNumber: z.string().max(20).optional().nullable(),
  accountName: z.string().max(100).optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  instagramHandle: z.string().max(50).optional().nullable(),
  twitterHandle: z.string().max(50).optional().nullable(),
  whatsappNumber: z.string().max(20).optional().nullable(),
  emailNotifications: z.boolean().optional(),
  whatsappNotifications: z.boolean().optional(),
  hidePhonePublicly: z.boolean().optional(),
  hideLocationPublicly: z.boolean().optional(),
});

export const createListingSchema = z.object({
  title: z.string().min(5, 'Title too short').max(100, 'Title too long'),
  description: z.string().min(20, 'Description too short').max(5000, 'Description too long'),
  price: z.number().positive('Price must be positive').max(100000000, 'Price too high'),
  category_id: z.string().min(1, 'Category required'),
  subcategory_id: z.string().optional().nullable(),
  condition: z.enum(['Brand New', 'Like New', 'Used - Good', 'Used - Fair']),
  location: z.string().min(2, 'Location required').max(100),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image required').max(10, 'Max 10 images'),
  video_url: z.string().url().optional().nullable(),
  specifications: z.record(z.string()).optional(),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.literal('sold').optional(),
});

export const querySchema = z.object({
  category: z.string().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  searchQuery: z.string().optional(),
  sortBy: z.enum(['newest', 'price-asc', 'price-desc', 'popular']).optional(),
  status: z.enum(['active', 'sold', 'draft', 'pending_review']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  featured: z.coerce.boolean().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  condition: z.string().optional(),
  sortBy: z.enum(['newest', 'price-asc', 'price-desc', 'popular']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});