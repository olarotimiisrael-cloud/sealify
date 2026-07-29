import React, { useState, useMemo } from 'react';
import {
  Database, Table, Columns, Key, Link, ChevronDown, ChevronUp,
  Search, Download, Copy, CheckCircle, AlertCircle, Loader2,
  Minimize2, Maximize2, RotateCcw, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
  foreignKeys: ForeignKeySchema[];
  policies: PolicySchema[];
}

interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  default?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  references?: { table: string; column: string };
}

interface IndexSchema {
  name: string;
  columns: string[];
  unique: boolean;
}

interface ForeignKeySchema {
  column: string;
  references: { table: string; column: string };
  onDelete?: string;
}

interface PolicySchema {
  name: string;
  command: string;
  using?: string;
  withCheck?: string;
}

const SCHEMA_DATA: TableSchema[] = [
  {
    name: 'profiles',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'email', type: 'TEXT', unique: true, nullable: false },
      { name: 'full_name', type: 'TEXT' },
      { name: 'phone_number', type: 'TEXT' },
      { name: 'avatar_url', type: 'TEXT' },
      { name: 'cover_url', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' },
      { name: 'role', type: 'TEXT', default: "'buyer'" },
      { name: 'verified', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'verification_type', type: 'TEXT', default: "'none'" },
      { name: 'business_name', type: 'TEXT' },
      { name: 'business_category', type: 'TEXT' },
      { name: 'business_address', type: 'TEXT' },
      { name: 'cac_number', type: 'TEXT' },
      { name: 'business_hours', type: 'TEXT' },
      { name: 'bank_name', type: 'TEXT' },
      { name: 'account_number', type: 'TEXT' },
      { name: 'account_name', type: 'TEXT' },
      { name: 'website_url', type: 'TEXT' },
      { name: 'instagram_handle', type: 'TEXT' },
      { name: 'twitter_handle', type: 'TEXT' },
      { name: 'whatsapp_number', type: 'TEXT' },
      { name: 'email_notifications', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'whatsapp_notifications', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'hide_phone_publicly', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'hide_location_publicly', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'location', type: 'TEXT', default: "'Ogbomoso, Oyo State'" },
      { name: 'member_since', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'status', type: 'TEXT', default: "'active'" },
      { name: 'restriction_reason', type: 'TEXT' },
      { name: 'appeal_status', type: 'TEXT', default: "'none'" },
      { name: 'total_value_traded', type: 'NUMERIC(14,2)', default: '0' },
      { name: 'completed_deals', type: 'INTEGER', default: '0' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_profiles_role', columns: ['role'], unique: false },
      { name: 'idx_profiles_verified', columns: ['verified'], unique: false },
      { name: 'idx_profiles_location', columns: ['location'], unique: false },
      { name: 'idx_profiles_status', columns: ['status'], unique: false },
    ],
    foreignKeys: [],
    policies: [
      { name: 'Public profiles are viewable by everyone', command: 'SELECT', using: 'TRUE' },
      { name: 'Users can insert their own profile', command: 'INSERT', withCheck: 'auth.uid() = id' },
      { name: 'Users can update their own profile', command: 'UPDATE', using: 'auth.uid() = id' },
      { name: 'Admins can manage all profiles', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'ads',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'seller_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'category_id', type: 'TEXT', references: { table: 'categories', column: 'id' } },
      { name: 'subcategory_id', type: 'TEXT', references: { table: 'subcategories', column: 'id' } },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'description', type: 'TEXT', nullable: false },
      { name: 'price', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'original_price', type: 'NUMERIC(14,2)' },
      { name: 'condition', type: 'TEXT', nullable: false },
      { name: 'location', type: 'TEXT', default: "'Ogbomoso, Oyo State'" },
      { name: 'status', type: 'TEXT', default: "'active'" },
      { name: 'images', type: 'TEXT[]', default: "'{}'" },
      { name: 'video_url', type: 'TEXT' },
      { name: 'specifications', type: 'JSONB', default: "'{}'" },
      { name: 'views_count', type: 'INTEGER', default: '1' },
      { name: 'featured', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'promotion_plan_name', type: 'TEXT' },
      { name: 'promotion_duration_months', type: 'INTEGER', default: '0' },
      { name: 'promotion_start_date', type: 'TIMESTAMPTZ' },
      { name: 'promotion_end_date', type: 'TIMESTAMPTZ' },
      { name: 'payment_status', type: 'TEXT', default: "'pending'" },
      { name: 'payment_proof_url', type: 'TEXT' },
      { name: 'amount_paid', type: 'NUMERIC(14,2)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_ads_seller_id', columns: ['seller_id'], unique: false },
      { name: 'idx_ads_category_id', columns: ['category_id'], unique: false },
      { name: 'idx_ads_status', columns: ['status'], unique: false },
      { name: 'idx_ads_featured', columns: ['featured'], unique: false },
      { name: 'idx_ads_created_at', columns: ['created_at'], unique: false },
      { name: 'idx_ads_price', columns: ['price'], unique: false },
      { name: 'idx_ads_location', columns: ['location'], unique: false },
    ],
    foreignKeys: [
      { column: 'seller_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'category_id', references: { table: 'categories', column: 'id' }, onDelete: 'SET NULL' },
      { column: 'subcategory_id', references: { table: 'subcategories', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Active ads are viewable by everyone', command: 'SELECT', using: "status = 'active' OR seller_id = auth.uid()" },
      { name: 'Sellers can create ads', command: 'INSERT', withCheck: 'auth.uid() = seller_id' },
      { name: 'Sellers can update their own ads', command: 'UPDATE', using: 'auth.uid() = seller_id' },
      { name: 'Sellers can delete their own ads', command: 'DELETE', using: 'auth.uid() = seller_id' },
      { name: 'Admins can manage all ads', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'ad_images',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'ad_id', type: 'UUID', references: { table: 'ads', column: 'id' }, nullable: false },
      { name: 'image_url', type: 'TEXT', nullable: false },
      { name: 'storage_path', type: 'TEXT' },
      { name: 'sort_order', type: 'INTEGER', default: '0' },
      { name: 'is_primary', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_ad_images_ad_id', columns: ['ad_id'], unique: false },
    ],
    foreignKeys: [
      { column: 'ad_id', references: { table: 'ads', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Ad images are viewable by everyone', command: 'SELECT', using: 'TRUE' },
      { name: 'Sellers can manage their ad images', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.ads WHERE id = ad_id AND seller_id = auth.uid())" },
    ],
  },
  {
    name: 'categories',
    columns: [
      { name: 'id', type: 'TEXT', primaryKey: true, nullable: false },
      { name: 'name', type: 'TEXT', unique: true, nullable: false },
      { name: 'icon_name', type: 'TEXT', nullable: false },
      { name: 'color', type: 'TEXT', nullable: false },
      { name: 'description', type: 'TEXT' },
      { name: 'parent_id', type: 'TEXT', references: { table: 'categories', column: 'id' } },
      { name: 'sort_order', type: 'INTEGER', default: '0' },
      { name: 'is_active', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [
      { column: 'parent_id', references: { table: 'categories', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Public can view active categories', command: 'SELECT', using: 'is_active = TRUE' },
      { name: 'Admins can manage categories', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'subcategories',
    columns: [
      { name: 'id', type: 'TEXT', primaryKey: true, nullable: false },
      { name: 'category_id', type: 'TEXT', references: { table: 'categories', column: 'id' }, nullable: false },
      { name: 'name', type: 'TEXT', nullable: false },
      { name: 'description', type: 'TEXT' },
      { name: 'icon_name', type: 'TEXT' },
      { name: 'listing_type', type: 'TEXT', default: "'product'" },
      { name: 'spec_fields', type: 'JSONB', default: "'[]'" },
      { name: 'sort_order', type: 'INTEGER', default: '0' },
      { name: 'is_active', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [
      { column: 'category_id', references: { table: 'categories', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Public can view active subcategories', command: 'SELECT', using: 'is_active = TRUE' },
      { name: 'Admins can manage subcategories', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'buyer_requests',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'user_name', type: 'TEXT', nullable: false },
      { name: 'user_avatar', type: 'TEXT' },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'category_id', type: 'TEXT', references: { table: 'categories', column: 'id' } },
      { name: 'max_budget', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'location', type: 'TEXT', nullable: false },
      { name: 'description', type: 'TEXT', nullable: false },
      { name: 'responses_count', type: 'INTEGER', default: '0' },
      { name: 'status', type: 'TEXT', default: "'open'" },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_buyer_requests_user_id', columns: ['user_id'], unique: false },
      { name: 'idx_buyer_requests_category', columns: ['category_id'], unique: false },
      { name: 'idx_buyer_requests_status', columns: ['status'], unique: false },
    ],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'category_id', references: { table: 'categories', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Buyer requests are viewable by everyone', command: 'SELECT', using: 'TRUE' },
      { name: 'Users can create buyer requests', command: 'INSERT', withCheck: 'auth.uid() = user_id' },
      { name: 'Users can update their own requests', command: 'UPDATE', using: 'auth.uid() = user_id' },
    ],
  },
  {
    name: 'buyer_request_responses',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'request_id', type: 'UUID', references: { table: 'buyer_requests', column: 'id' }, nullable: false },
      { name: 'seller_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'seller_name', type: 'TEXT', nullable: false },
      { name: 'seller_avatar', type: 'TEXT' },
      { name: 'proposed_price', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'message', type: 'TEXT' },
      { name: 'status', type: 'TEXT', default: "'pending'" },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_buyer_request_responses_request_id', columns: ['request_id'], unique: false },
      { name: 'idx_buyer_request_responses_seller_id', columns: ['seller_id'], unique: false },
    ],
    foreignKeys: [
      { column: 'request_id', references: { table: 'buyer_requests', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'seller_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Responses viewable by request owner and responder', command: 'SELECT', using: "EXISTS (SELECT 1 FROM public.buyer_requests WHERE id = request_id AND user_id = auth.uid()) OR seller_id = auth.uid()" },
      { name: 'Sellers can respond to requests', command: 'INSERT', withCheck: 'auth.uid() = seller_id' },
      { name: 'Request owners can update response status', command: 'UPDATE', using: "EXISTS (SELECT 1 FROM public.buyer_requests WHERE id = request_id AND user_id = auth.uid())" },
    ],
  },
  {
    name: 'conversations',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'ad_id', type: 'UUID', references: { table: 'ads', column: 'id' }, nullable: false },
      { name: 'participant_1', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'participant_2', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'last_message', type: 'TEXT' },
      { name: 'last_message_time', type: 'TIMESTAMPTZ' },
      { name: 'unread_count_1', type: 'INTEGER', default: '0' },
      { name: 'unread_count_2', type: 'INTEGER', default: '0' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_conversations_participant_1', columns: ['participant_1'], unique: false },
      { name: 'idx_conversations_participant_2', columns: ['participant_2'], unique: false },
      { name: 'idx_conversations_ad_id', columns: ['ad_id'], unique: false },
    ],
    foreignKeys: [
      { column: 'ad_id', references: { table: 'ads', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'participant_1', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'participant_2', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Participants can view their conversations', command: 'SELECT', using: 'auth.uid() = participant_1 OR auth.uid() = participant_2' },
      { name: 'Participants can create conversations', command: 'INSERT', withCheck: 'auth.uid() = participant_1 OR auth.uid() = participant_2' },
      { name: 'Participants can update their conversations', command: 'UPDATE', using: 'auth.uid() = participant_1 OR auth.uid() = participant_2' },
    ],
  },
  {
    name: 'messages',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'conversation_id', type: 'UUID', references: { table: 'conversations', column: 'id' }, nullable: false },
      { name: 'sender_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'receiver_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'ad_id', type: 'UUID', references: { table: 'ads', column: 'id' }, nullable: false },
      { name: 'content', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', default: "'sent'" },
      { name: 'read', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_messages_conversation_id', columns: ['conversation_id'], unique: false },
      { name: 'idx_messages_sender_id', columns: ['sender_id'], unique: false },
      { name: 'idx_messages_receiver_id', columns: ['receiver_id'], unique: false },
      { name: 'idx_messages_created_at', columns: ['created_at'], unique: false },
    ],
    foreignKeys: [
      { column: 'conversation_id', references: { table: 'conversations', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'sender_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'receiver_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'ad_id', references: { table: 'ads', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Participants can view messages', command: 'SELECT', using: "EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid()))" },
      { name: 'Participants can send messages', command: 'INSERT', withCheck: 'auth.uid() = sender_id' },
      { name: 'Receivers can mark messages as read', command: 'UPDATE', using: 'auth.uid() = receiver_id' },
    ],
  },
  {
    name: 'wallets',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, unique: true, nullable: false },
      { name: 'balance', type: 'NUMERIC(14,2)', default: '0' },
      { name: 'pending_balance', type: 'NUMERIC(14,2)', default: '0' },
      { name: 'total_withdrawn', type: 'NUMERIC(14,2)', default: '0' },
      { name: 'currency', type: 'TEXT', default: "'NGN'" },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Users can view their own wallet', command: 'SELECT', using: 'auth.uid() = user_id' },
      { name: 'System can manage wallets', command: 'ALL', using: 'TRUE' },
    ],
  },
  {
    name: 'transactions',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'wallet_id', type: 'UUID', references: { table: 'wallets', column: 'id' }, nullable: false },
      { name: 'type', type: 'TEXT', nullable: false },
      { name: 'amount', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'status', type: 'TEXT', default: "'pending'" },
      { name: 'description', type: 'TEXT', nullable: false },
      { name: 'reference', type: 'TEXT' },
      { name: 'related_ad_id', type: 'UUID', references: { table: 'ads', column: 'id' } },
      { name: 'related_user_id', type: 'UUID', references: { table: 'profiles', column: 'id' } },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_transactions_wallet_id', columns: ['wallet_id'], unique: false },
      { name: 'idx_transactions_type', columns: ['type'], unique: false },
      { name: 'idx_transactions_status', columns: ['status'], unique: false },
      { name: 'idx_transactions_created_at', columns: ['created_at'], unique: false },
    ],
    foreignKeys: [
      { column: 'wallet_id', references: { table: 'wallets', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'related_ad_id', references: { table: 'ads', column: 'id' }, onDelete: 'SET NULL' },
      { column: 'related_user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Users can view their own transactions', command: 'SELECT', using: "EXISTS (SELECT 1 FROM public.wallets WHERE id = wallet_id AND user_id = auth.uid())" },
    ],
  },
  {
    name: 'escrow_orders',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'ad_id', type: 'UUID', references: { table: 'ads', column: 'id' }, nullable: false },
      { name: 'buyer_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'seller_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'amount', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'status', type: 'TEXT', default: "'created'" },
      { name: 'handover_code', type: 'TEXT', unique: true, nullable: false },
      { name: 'qr_code_url', type: 'TEXT' },
      { name: 'inspection_location', type: 'TEXT' },
      { name: 'inspection_completed_at', type: 'TIMESTAMPTZ' },
      { name: 'released_at', type: 'TIMESTAMPTZ' },
      { name: 'disputed_at', type: 'TIMESTAMPTZ' },
      { name: 'refunded_at', type: 'TIMESTAMPTZ' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_escrow_orders_ad_id', columns: ['ad_id'], unique: false },
      { name: 'idx_escrow_orders_buyer_id', columns: ['buyer_id'], unique: false },
      { name: 'idx_escrow_orders_seller_id', columns: ['seller_id'], unique: false },
      { name: 'idx_escrow_orders_status', columns: ['status'], unique: false },
    ],
    foreignKeys: [
      { column: 'ad_id', references: { table: 'ads', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'buyer_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'seller_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Participants can view escrow orders', command: 'SELECT', using: 'auth.uid() = buyer_id OR auth.uid() = seller_id' },
      { name: 'Buyers can create escrow orders', command: 'INSERT', withCheck: 'auth.uid() = buyer_id' },
      { name: 'Participants can update escrow orders', command: 'UPDATE', using: 'auth.uid() = buyer_id OR auth.uid() = seller_id' },
    ],
  },
  {
    name: 'notifications',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'type', type: 'TEXT', nullable: false },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'description', type: 'TEXT' },
      { name: 'link_url', type: 'TEXT' },
      { name: 'read', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_notifications_user_id', columns: ['user_id'], unique: false },
      { name: 'idx_notifications_read', columns: ['read'], unique: false },
      { name: 'idx_notifications_created_at', columns: ['created_at'], unique: false },
    ],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Users can view their own notifications', command: 'SELECT', using: 'auth.uid() = user_id' },
      { name: 'Users can update their own notifications', command: 'UPDATE', using: 'auth.uid() = user_id' },
      { name: 'System can create notifications', command: 'INSERT', withCheck: 'TRUE' },
    ],
  },
  {
    name: 'user_settings',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, unique: true, nullable: false },
      { name: 'email_notifications', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'whatsapp_notifications', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'push_notifications', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'price_drop_alerts', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'new_message_alerts', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'weekly_digest', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'promotion_expiry_reminders', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'biometric_lock', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'two_factor_auth', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'session_timeout_minutes', type: 'INTEGER', default: '30' },
      { name: 'language', type: 'TEXT', default: "'en'" },
      { name: 'theme', type: 'TEXT', default: "'dark'" },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Users can manage their own settings', command: 'ALL', using: 'auth.uid() = user_id' },
    ],
  },
  {
    name: 'verification_requests',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'user_name', type: 'TEXT', nullable: false },
      { name: 'user_email', type: 'TEXT', nullable: false },
      { name: 'type', type: 'TEXT', nullable: false },
      { name: 'doc_type', type: 'TEXT', nullable: false },
      { name: 'doc_number', type: 'TEXT', nullable: false },
      { name: 'doc_url', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', default: "'pending'" },
      { name: 'admin_notes', type: 'TEXT' },
      { name: 'reviewed_by', type: 'UUID', references: { table: 'profiles', column: 'id' } },
      { name: 'reviewed_at', type: 'TIMESTAMPTZ' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_verification_requests_user_id', columns: ['user_id'], unique: false },
      { name: 'idx_verification_requests_status', columns: ['status'], unique: false },
    ],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'reviewed_by', references: { table: 'profiles', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Users can view their own verification requests', command: 'SELECT', using: 'auth.uid() = user_id' },
      { name: 'Users can create verification requests', command: 'INSERT', withCheck: 'auth.uid() = user_id' },
      { name: 'Admins can manage all verification requests', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'password_requests',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'user_email', type: 'TEXT', nullable: false },
      { name: 'user_name', type: 'TEXT', nullable: false },
      { name: 'nin', type: 'TEXT', nullable: false },
      { name: 'id_document_url', type: 'TEXT', nullable: false },
      { name: 'new_password_hash', type: 'TEXT', nullable: false },
      { name: 'reason', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', default: "'pending'" },
      { name: 'admin_notes', type: 'TEXT' },
      { name: 'reviewed_by', type: 'UUID', references: { table: 'profiles', column: 'id' } },
      { name: 'reviewed_at', type: 'TIMESTAMPTZ' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'reviewed_by', references: { table: 'profiles', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Users can view their own password requests', command: 'SELECT', using: 'auth.uid() = user_id' },
      { name: 'Users can create password requests', command: 'INSERT', withCheck: 'auth.uid() = user_id' },
      { name: 'Admins can manage all password requests', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'promotion_payments',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'ad_id', type: 'UUID', references: { table: 'ads', column: 'id' }, nullable: false },
      { name: 'amount', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'payment_method', type: 'TEXT', nullable: false },
      { name: 'payment_proof_url', type: 'TEXT' },
      { name: 'status', type: 'TEXT', default: "'pending'" },
      { name: 'plan_name', type: 'TEXT', nullable: false },
      { name: 'duration_months', type: 'INTEGER', nullable: false },
      { name: 'admin_notes', type: 'TEXT' },
      { name: 'reviewed_by', type: 'UUID', references: { table: 'profiles', column: 'id' } },
      { name: 'reviewed_at', type: 'TIMESTAMPTZ' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_promotion_payments_user_id', columns: ['user_id'], unique: false },
      { name: 'idx_promotion_payments_ad_id', columns: ['ad_id'], unique: false },
      { name: 'idx_promotion_payments_status', columns: ['status'], unique: false },
    ],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'ad_id', references: { table: 'ads', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'reviewed_by', references: { table: 'profiles', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Users can view their own promotion payments', command: 'SELECT', using: 'auth.uid() = user_id' },
      { name: 'Users can create promotion payments', command: 'INSERT', withCheck: 'auth.uid() = user_id' },
      { name: 'Admins can manage all promotion payments', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'reviews',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'seller_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'buyer_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'buyer_name', type: 'TEXT', nullable: false },
      { name: 'buyer_avatar', type: 'TEXT' },
      { name: 'rating', type: 'INTEGER', nullable: false },
      { name: 'comment', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', default: "'approved'" },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_reviews_seller_id', columns: ['seller_id'], unique: false },
      { name: 'idx_reviews_buyer_id', columns: ['buyer_id'], unique: false },
    ],
    foreignKeys: [
      { column: 'seller_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'buyer_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Reviews are viewable by everyone', command: 'SELECT', using: 'TRUE' },
      { name: 'Buyers can create reviews', command: 'INSERT', withCheck: 'auth.uid() = buyer_id' },
      { name: 'Admins can manage all reviews', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'reports',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'ad_id', type: 'UUID', references: { table: 'ads', column: 'id' }, nullable: false },
      { name: 'ad_title', type: 'TEXT', nullable: false },
      { name: 'reporter_id', type: 'UUID', references: { table: 'profiles', column: 'id' } },
      { name: 'reporter_name', type: 'TEXT' },
      { name: 'reason', type: 'TEXT', nullable: false },
      { name: 'details', type: 'TEXT' },
      { name: 'status', type: 'TEXT', default: "'pending'" },
      { name: 'admin_notes', type: 'TEXT' },
      { name: 'reviewed_by', type: 'UUID', references: { table: 'profiles', column: 'id' } },
      { name: 'reviewed_at', type: 'TIMESTAMPTZ' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_reports_ad_id', columns: ['ad_id'], unique: false },
      { name: 'idx_reports_status', columns: ['status'], unique: false },
    ],
    foreignKeys: [
      { column: 'ad_id', references: { table: 'ads', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'reporter_id', references: { table: 'profiles', column: 'id' }, onDelete: 'SET NULL' },
      { column: 'reviewed_by', references: { table: 'profiles', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Reporters can view their own reports', command: 'SELECT', using: 'auth.uid() = reporter_id' },
      { name: 'Anyone can create reports', command: 'INSERT', withCheck: 'TRUE' },
      { name: 'Admins can manage all reports', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'disputes',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'user_email', type: 'TEXT', nullable: false },
      { name: 'receipt_ref', type: 'TEXT' },
      { name: 'item_title', type: 'TEXT', nullable: false },
      { name: 'counterparty', type: 'TEXT', nullable: false },
      { name: 'category', type: 'TEXT', nullable: false },
      { name: 'reason', type: 'TEXT', nullable: false },
      { name: 'details', type: 'TEXT', nullable: false },
      { name: 'evidence_url', type: 'TEXT' },
      { name: 'status', type: 'TEXT', default: "'pending'" },
      { name: 'admin_notes', type: 'TEXT' },
      { name: 'assigned_moderator', type: 'UUID', references: { table: 'profiles', column: 'id' } },
      { name: 'resolved_at', type: 'TIMESTAMPTZ' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_disputes_user_id', columns: ['user_id'], unique: false },
      { name: 'idx_disputes_status', columns: ['status'], unique: false },
    ],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'assigned_moderator', references: { table: 'profiles', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Users can view their own disputes', command: 'SELECT', using: 'auth.uid() = user_id' },
      { name: 'Users can create disputes', command: 'INSERT', withCheck: 'auth.uid() = user_id' },
      { name: 'Admins can manage all disputes', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'audit_logs',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'action', type: 'TEXT', nullable: false },
      { name: 'details', type: 'TEXT' },
      { name: 'type', type: 'TEXT', nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' } },
      { name: 'ip_address', type: 'INET' },
      { name: 'user_agent', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_audit_logs_type', columns: ['type'], unique: false },
      { name: 'idx_audit_logs_created_at', columns: ['created_at'], unique: false },
    ],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Admins can view audit logs', command: 'SELECT', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
      { name: 'System can create audit logs', command: 'INSERT', withCheck: 'TRUE' },
    ],
  },
  {
    name: 'intrusion_logs',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'attempted_email', type: 'TEXT', nullable: false },
      { name: 'device_info', type: 'JSONB' },
      { name: 'media_captured', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'media_status', type: 'TEXT' },
      { name: 'status', type: 'TEXT', default: "'flagged'" },
      { name: 'ip_address', type: 'INET' },
      { name: 'user_agent', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [],
    policies: [
      { name: 'Admins can view intrusion logs', command: 'SELECT', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
      { name: 'System can create intrusion logs', command: 'INSERT', withCheck: 'TRUE' },
    ],
  },
  {
    name: 'system_configs',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'key', type: 'TEXT', unique: true, nullable: false },
      { name: 'value', type: 'BOOLEAN', default: 'FALSE' },
      { name: 'description', type: 'TEXT' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [],
    policies: [
      { name: 'Admins can manage system configs', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
      { name: 'Public can view system configs', command: 'SELECT', using: 'TRUE' },
    ],
  },
  {
    name: 'site_settings',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'logo_url', type: 'TEXT' },
      { name: 'site_name', type: 'TEXT', default: "'Sealify Nigeria'" },
      { name: 'site_description', type: 'TEXT', default: "'Nigeria\\'s Trusted Local Marketplace.'" },
      { name: 'og_image', type: 'TEXT' },
      { name: 'contact_email', type: 'TEXT' },
      { name: 'contact_phone', type: 'TEXT' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [],
    policies: [
      { name: 'Admins can manage site settings', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
      { name: 'Public can view site settings', command: 'SELECT', using: 'TRUE' },
    ],
  },
  {
    name: 'promotion_plans',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'months', type: 'INTEGER', nullable: false },
      { name: 'label', type: 'TEXT', nullable: false },
      { name: 'rate', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'badge', type: 'TEXT' },
      { name: 'is_active', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [],
    policies: [
      { name: 'Public can view active promotion plans', command: 'SELECT', using: 'is_active = TRUE' },
      { name: 'Admins can manage promotion plans', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'safe_spots',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'name', type: 'TEXT', nullable: false },
      { name: 'zone', type: 'TEXT', nullable: false },
      { name: 'category', type: 'TEXT', nullable: false },
      { name: 'address', type: 'TEXT', nullable: false },
      { name: 'distance', type: 'TEXT' },
      { name: 'hours', type: 'TEXT' },
      { name: 'cctv_verified', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'latitude', type: 'NUMERIC(10,8)' },
      { name: 'longitude', type: 'NUMERIC(11,8)' },
      { name: 'is_active', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [],
    policies: [
      { name: 'Public can view active safe spots', command: 'SELECT', using: 'is_active = TRUE' },
      { name: 'Admins can manage safe spots', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'announcements',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'message', type: 'TEXT', nullable: false },
      { name: 'type', type: 'TEXT', default: "'info'" },
      { name: 'active', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'target_roles', type: 'TEXT[]', default: "ARRAY['buyer', 'seller']" },
      { name: 'created_by', type: 'UUID', references: { table: 'profiles', column: 'id' } },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [
      { column: 'created_by', references: { table: 'profiles', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Public can view active announcements', command: 'SELECT', using: 'active = TRUE' },
      { name: 'Admins can manage announcements', command: 'ALL', using: "EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
  {
    name: 'recent_deals',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'item_title', type: 'TEXT', nullable: false },
      { name: 'price', type: 'NUMERIC(14,2)', nullable: false },
      { name: 'location', type: 'TEXT', nullable: false },
      { name: 'time', type: 'TEXT', nullable: false },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [],
    foreignKeys: [],
    policies: [
      { name: 'Public can view recent deals', command: 'SELECT', using: 'TRUE' },
      { name: 'System can create recent deals', command: 'INSERT', withCheck: 'TRUE' },
    ],
  },
  {
    name: 'search_alerts',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'query', type: 'TEXT', nullable: false },
      { name: 'category_id', type: 'TEXT', references: { table: 'categories', column: 'id' } },
      { name: 'max_price', type: 'NUMERIC(14,2)' },
      { name: 'location', type: 'TEXT' },
      { name: 'match_count', type: 'INTEGER', default: '0' },
      { name: 'is_active', type: 'BOOLEAN', default: 'TRUE' },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_search_alerts_user_id', columns: ['user_id'], unique: false },
    ],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'category_id', references: { table: 'categories', column: 'id' }, onDelete: 'SET NULL' },
    ],
    policies: [
      { name: 'Users can manage their own search alerts', command: 'ALL', using: 'auth.uid() = user_id' },
    ],
  },
  {
    name: 'favorites',
    columns: [
      { name: 'id', type: 'UUID', primaryKey: true, nullable: false },
      { name: 'user_id', type: 'UUID', references: { table: 'profiles', column: 'id' }, nullable: false },
      { name: 'ad_id', type: 'UUID', references: { table: 'ads', column: 'id' }, nullable: false },
      { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()' },
    ],
    indexes: [
      { name: 'idx_favorites_user_id', columns: ['user_id'], unique: false },
      { name: 'idx_favorites_ad_id', columns: ['ad_id'], unique: false },
    ],
    foreignKeys: [
      { column: 'user_id', references: { table: 'profiles', column: 'id' }, onDelete: 'CASCADE' },
      { column: 'ad_id', references: { table: 'ads', column: 'id' }, onDelete: 'CASCADE' },
    ],
    policies: [
      { name: 'Users can manage their own favorites', command: 'ALL', using: 'auth.uid() = user_id' },
    ],
  },
];

const STORAGE_BUCKETS = [
  {
    name: 'profile-media',
    description: 'User avatars, cover photos, verification documents (NIN, CAC, Student ID)',
    public: true,
    policies: [
      { name: 'Public avatars are viewable', command: 'SELECT', using: "bucket_id = 'profile-media'" },
      { name: 'Users can upload their own profile media', command: 'INSERT', withCheck: "bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]" },
      { name: 'Users can update their own profile media', command: 'UPDATE', using: "bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]" },
      { name: 'Users can delete their own profile media', command: 'DELETE', using: "bucket_id = 'profile-media' AND auth.uid()::text = (storage.foldername(name))[1]" },
    ],
  },
  {
    name: 'ad-images',
    description: 'Classified ad images and thumbnails (max 10 per ad)',
    public: true,
    policies: [
      { name: 'Public ad images are viewable', command: 'SELECT', using: "bucket_id = 'ad-images'" },
      { name: 'Sellers can upload ad images', command: 'INSERT', withCheck: "bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]" },
      { name: 'Sellers can update their ad images', command: 'UPDATE', using: "bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]" },
      { name: 'Sellers can delete their ad images', command: 'DELETE', using: "bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]" },
    ],
  },
  {
    name: 'documents',
    description: 'Verification docs, payment receipts, dispute evidence, ID documents',
    public: false,
    policies: [
      { name: 'Users can upload their own documents', command: 'INSERT', withCheck: "bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]" },
      { name: 'Users can view their own documents', command: 'SELECT', using: "bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]" },
      { name: 'Admins can view all documents', command: 'SELECT', using: "bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')" },
    ],
  },
];

const DatabaseDiagramViewer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(['profiles', 'ads']));
  const [viewMode, setViewMode] = useState<'er' | 'list'>('er');
  const [copied, setCopied] = useState(false);

  const filteredTables = useMemo(() => {
    if (!searchQuery) return SCHEMA_DATA;
    return SCHEMA_DATA.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.columns.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const stats = useMemo(() => ({
    tables: SCHEMA_DATA.length,
    columns: SCHEMA_DATA.reduce((sum, t) => sum + t.columns.length, 0),
    indexes: SCHEMA_DATA.reduce((sum, t) => sum + t.indexes.length, 0),
    foreignKeys: SCHEMA_DATA.reduce((sum, t) => sum + t.foreignKeys.length, 0),
    policies: SCHEMA_DATA.reduce((sum, t) => sum + t.policies.length, 0),
    storageBuckets: STORAGE_BUCKETS.length,
    storagePolicies: STORAGE_BUCKETS.reduce((sum, b) => sum + b.policies.length, 0),
  }), []);

  const toggleTable = (name: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleCopyMermaid = () => {
    const mermaid = generateMermaidDiagram();
    navigator.clipboard.writeText(mermaid);
    toast.success('Mermaid diagram copied!', { description: 'Paste into Mermaid Live Editor or Notion' });
  };

  const generateMermaidDiagram = () => {
    let diagram = 'erDiagram\n';

    SCHEMA_DATA.forEach(table => {
      diagram += `    ${table.name.toUpperCase()} {\n`;
      table.columns.forEach(col => {
        const pk = col.primaryKey ? ' PK' : '';
        const fk = col.references ? ' FK' : '';
        const nn = col.nullable === false ? ' NOT NULL' : '';
        diagram += `        ${col.type} ${col.name}${pk}${fk}${nn}\n`;
      });
      diagram += '    }\n\n';
    });

    SCHEMA_DATA.forEach(table => {
      table.foreignKeys.forEach(fk => {
        diagram += `    ${table.name.toUpperCase()} ||--o{ ${fk.references.table.toUpperCase()} : "${fk.column}"\n`;
      });
    });

    return diagram;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Interactive Database Diagram</h2>
          <p className="text-sm text-slate-400 mt-1">
            Visualize all 29 tables, relationships, indexes, and RLS policies
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={handleCopyMermaid} className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Copy Mermaid Diagram
          </Button>
          <Button variant="outline" onClick={() => setViewMode(v => v === 'er' ? 'list' : 'er')} className="flex items-center gap-2">
            {viewMode === 'er' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            {viewMode === 'er' ? 'Switch to List' : 'Switch to ER Diagram'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard icon={Database} label="Tables" value={stats.tables} color="text-blue-400" />
        <StatCard icon={Columns} label="Columns" value={stats.columns} color="text-purple-400" />
        <StatCard icon={Key} label="Foreign Keys" value={stats.foreignKeys} color="text-emerald-400" />
        <StatCard icon={Link} label="Indexes" value={stats.indexes} color="text-amber-400" />
        <StatCard icon={Shield} label="RLS Policies" value={stats.policies} color="text-rose-400" />
        <StatCard icon={Database} label="Storage Buckets" value={stats.storageBuckets} color="text-cyan-400" />
        <StatCard icon={Shield} label="Storage Policies" value={stats.storagePolicies} color="text-orange-400" />
        <StatCard icon={CheckCircle} label="Total Objects" value={stats.tables + stats.indexes + stats.foreignKeys + stats.policies + stats.storageBuckets + stats.storagePolicies} color="text-emerald-400" />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search tables, columns..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
        />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 p-1 rounded-xl">
        <button
          onClick={() => setViewMode('er')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'er' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
        >
          ER Diagram
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
        >
          Table List
        </button>
      </div>

      {viewMode === 'er' ? (
        <Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
          <CardHeader className="border-slate-800">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-400" />
              Entity Relationship Diagram (Mermaid)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-slate-950 p-6 font-mono text-xs text-emerald-300 leading-relaxed max-h-[600px] overflow-auto border-t border-slate-800">
              <pre><code>{generateMermaidDiagram()}</code></pre>
            </div>
            <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Copy this diagram and paste into <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Mermaid Live Editor</a> for interactive visualization
              </p>
              <Button onClick={handleCopyMermaid} size="sm" className="flex items-center gap-2">
                <Copy className="h-3.5 w-3.5" />
                Copy Mermaid Code
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTables.map(table => (
            <TableCard
              key={table.name}
              table={table}
              isExpanded={expandedTables.has(table.name)}
              onToggle={() => toggleTable(table.name)}
            />
          ))}
        </div>
      )}

      {/* Storage Buckets */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="border-amber-500/20">
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Database className="h-5 w-5" />
            Supabase Storage Buckets & RLS Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            Run these commands in Supabase Dashboard > Storage to create buckets and apply RLS policies.
          </p>
          <div className="space-y-3">
            {STORAGE_BUCKETS.map(bucket => (
              <div key={bucket.name} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{bucket.name}</h4>
                      <p className="text-xs text-slate-400">{bucket.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                    {bucket.policies.length} RLS Policies
                  </span>
                </div>
                <pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg overflow-x-auto"><code>{bucket.policies.map(p =>
`CREATE POLICY "${p.name}" ON storage.objects FOR ${p.command} ${p.using ? `USING (${p.using})` : ''} ${p.withCheck ? `WITH CHECK (${p.withCheck})` : ''};`
).join('\n\n')}</code></pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.FC<{ className?: string }>; label: string; value: number; color: string }> = ({
  icon: Icon,
  label,
  value,
  color,
}) => (
  <Card className="border-slate-800 bg-slate-900/50">
    <CardContent className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-2xl font-black text-white">{value}</span>
      </div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
    </CardContent>
  </Card>
);

const TableCard: React.FC<{
  table: TableSchema;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ table, isExpanded, onToggle }) => {
  return (
    <Card className="border-slate-800 bg-slate-900/50 overflow-hidden">
      <CardHeader className="border-slate-800 p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-emerald-400" />
            <h4 className="font-bold text-white capitalize">{table.name}</h4>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-slate-700">
              {table.columns.length} columns
            </span>
            {table.foreignKeys.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/30">
                {table.foreignKeys.length} FK
              </span>
            )}
            {table.indexes.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/30">
                {table.indexes.length} idx
              </span>
            )}
            {table.policies.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/30">
                {table.policies.length} RLS
              </span>
            )}
          </div>
          <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0 pb-4">
          <div className="space-y-4 px-4">
            <div className="px-4 pt-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Columns className="h-4 w-4" />
                Columns ({table.columns.length})
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Constraints</th>
                      <th className="text-left p-2">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map(col => (
                      <tr key={col.name} className="border-b border-slate-800/50 hover:bg-slate-950/50">
                        <td className="p-2 font-medium text-white">{col.name}</td>
                        <td className="p-2 text-slate-300">{col.type}</td>
                        <td className="p-2 text-slate-400 flex items-center gap-1">
                          {col.primaryKey && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] rounded border border-amber-500/30">PK</span>}
                          {col.references && <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] rounded border border-blue-500/30">FK \u2192 {col.references.table}.{col.references.column}</span>}
                          {col.unique && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] rounded border border-emerald-500/30">UNIQUE</span>}
                          {col.nullable === false && !col.primaryKey && <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[9px] rounded border border-rose-500/30">NOT NULL</span>}
                        </td>
                        <td className="p-2 text-slate-500">{col.default || '\u2014'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {table.indexes.length > 0 && (
              <div className="px-4 border-t border-slate-800">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Indexes ({table.indexes.length})
                </h5>
                <div className="space-y-1">
                  {table.indexes.map(idx => (
                    <div key={idx.name} className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-2 text-xs">
                      <span className="font-mono text-emerald-400">{idx.name}</span>
                      <span className="text-slate-400">({idx.columns.join(', ')})</span>
                      {idx.unique && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] rounded border border-emerald-500/30">UNIQUE</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {table.foreignKeys.length > 0 && (
              <div className="px-4 border-t border-slate-800">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Foreign Keys ({table.foreignKeys.length})
                </h5>
                <div className="space-y-1">
                  {table.foreignKeys.map((fk, i) => (
                    <div key={i} className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-2 text-xs">
                      <span className="font-mono text-blue-400">{fk.column}</span>
                      <span className="text-slate-500">\u2192</span>
                      <span className="font-mono text-emerald-400">{fk.references.table}.{fk.references.column}</span>
                      {fk.onDelete && <span className="text-[9px] text-slate-500 px-1.5 py-0.5 bg-slate-900 rounded">ON DELETE {fk.onDelete}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {table.policies.length > 0 && (
              <div className="px-4 border-t border-slate-800 pb-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  RLS Policies ({table.policies.length})
                </h5>
                <div className="space-y-2">
                  {table.policies.map((policy, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-white">{policy.name}</span>
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded border border-slate-700">{policy.command}</span>
                      </div>
                      {policy.using && (
                        <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded">
                          USING ({policy.using})
                        </div>
                      )}
                      {policy.withCheck && (
                        <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded">
                          WITH CHECK ({policy.withCheck})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DatabaseDiagramViewer;