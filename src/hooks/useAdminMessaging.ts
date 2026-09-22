import { useState, useCallback } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { toast } from 'sonner';
import { AdminMessage, AdminBroadcast } from '@/types/sealify';

export interface SendMessageResult {
  success: boolean;
  target?: string;
  total?: number;
  successful?: number;
  failed?: number;
  broadcastId?: string;
  results?: any[];
  error?: string;
}

export interface BroadcastResult {
  success: boolean;
  broadcastId?: string;
  target?: string;
  total?: number;
  sent?: number;
  delivered?: number;
  failed?: number;
  error?: string;
}

export interface MessagingConfig {
  email: { configured: boolean; host: string | null; from: string | null };
  sms: { configured: boolean; url: string | null };
  otp: { length: number; expiryMs: number };
  broadcastConcurrency: number;
}

export type { AdminMessage, AdminBroadcast };

export interface MessagingConfig {
  email: { configured: boolean; host: string | null; from: string | null };
  sms: { configured: boolean; url: string | null };
  otp: { length: number; expiryMs: number };
  broadcastConcurrency: number;
}

export function useAdminMessaging() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (data: {
    target: 'all' | 'buyer' | 'seller' | 'individual';
    title: string;
    content: string;
    content_type?: 'text' | 'markdown' | 'html';
    channel?: 'in_app' | 'email' | 'sms' | 'whatsapp';
    userIds?: string[];
    sendEmail?: boolean;
    sendSms?: boolean;
  }): Promise<SendMessageResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFetch('/api/admin-messaging/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to send message');
      toast.success(`Message sent to ${result.target}`);
      return result;
    } catch (err: any) {
      setError(err?.message || 'Failed to send message');
      toast.error(err?.message || 'Failed to send message');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const broadcast = useCallback(async (data: {
    target: 'all' | 'buyer' | 'seller';
    title: string;
    content: string;
    content_type?: 'text' | 'markdown' | 'html';
    channel?: 'in_app' | 'email' | 'sms' | 'whatsapp';
    audience?: 'buyer' | 'seller';
    sendEmail?: boolean;
    sendSms?: boolean;
  }): Promise<BroadcastResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFetch('/api/admin-messaging/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to broadcast');
      toast.success(`Broadcast sent to ${result.target}`);
      return result;
    } catch (err: any) {
      setError(err?.message || 'Failed to broadcast');
      toast.error(err?.message || 'Failed to broadcast');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const listMessages = useCallback(async (limit = 50, offset = 0, status?: string): Promise<{ messages: AdminMessage[]; total: number } | null> => {
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (status) params.set('status', status);
      const response = await adminFetch(`/api/admin-messaging/messages?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to list messages');
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to list messages');
      return null;
    }
  }, []);

  const listBroadcasts = useCallback(async (limit = 50, offset = 0): Promise<{ broadcasts: AdminBroadcast[]; total: number } | null> => {
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      const response = await adminFetch(`/api/admin-messaging/broadcasts?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to list broadcasts');
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to list broadcasts');
      return null;
    }
  }, []);

  const getConfig = useCallback(async (): Promise<MessagingConfig | null> => {
    try {
      const response = await adminFetch('/api/admin-messaging/config');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to get config');
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to get config');
      return null;
    }
  }, []);

  return { loading, error, sendMessage, broadcast, listMessages, listBroadcasts, getConfig };
}