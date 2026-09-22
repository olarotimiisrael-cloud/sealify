import { supabase } from '@/integrations/supabase/client';
import { apiUrl } from '@/lib/env';

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const url = typeof input === 'string' && input.startsWith('/api/') ? apiUrl(input) : input;
  return fetch(url, { ...init, headers });
}

// Email API client functions
export async function sendEmail(params: {
  to: string | string[];
  from: { email: string; name?: string };
  subject: string;
  html?: string;
  text?: string;
  template?: string;
}): Promise<{ success: boolean; messageId: string; delivered: string[] }> {
  const response = await adminFetch('/api/email/send', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function sendAdminEmail(params: {
  target: 'all' | 'individual' | 'buyer' | 'seller';
  subject: string;
  html: string;
  text?: string;
  template?: string;
  userIds?: string[];
}): Promise<{ success: boolean; total: number; successful: number; failed: number; results: any[] }> {
  const response = await adminFetch('/api/email/admin/send', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function sendMultiChannelPasswordReset(params: {
  email: string;
  fullName?: string;
  resetUrl: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  channels?: ('email' | 'sms' | 'whatsapp')[];
}): Promise<{ success: boolean; channels: string[]; attempted: string[]; errors?: Record<string, string> }> {
  const response = await adminFetch('/api/email/password-reset', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

// SMS broadcast client function
export async function broadcastSMS(params: {
  target: 'all' | 'individual' | 'buyer' | 'seller';
  message: string;
  userIds?: string[];
}): Promise<{ success: boolean; total: number; successful: number; failed: number; results: any[] }> {
  const response = await adminFetch('/api/email/admin/sms', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

// WhatsApp broadcast client function
export async function broadcastWhatsApp(params: {
  target: 'all' | 'individual' | 'buyer' | 'seller';
  message: string;
  userIds?: string[];
}): Promise<{ success: boolean; total: number; successful: number; failed: number; results: any[] }> {
  const response = await adminFetch('/api/email/admin/whatsapp', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

// File attachment upload client function
export async function uploadAttachment(params: {
  filename: string;
  content: string;
  type?: string;
}): Promise<{ success: boolean; attachment: { filename: string; content: string; type: string; size: number } }> {
  const response = await adminFetch('/api/email/admin/upload-attachment', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

// OTP API client functions
export async function requestOtp(params: {
  identifier: string;
  channel: 'email' | 'phone';
}): Promise<{ success: boolean; otpId: string; channel: string; message: string }> {
  const response = await adminFetch('/api/otp/request', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function verifyOtp(params: {
  identifier: string;
  otp: string;
  otpId?: string;
  channel: 'email' | 'phone';
}): Promise<{ success: boolean; userId: string | null; message: string }> {
  const response = await adminFetch('/api/otp/verify', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function resendOtp(params: {
  identifier: string;
  channel: 'email' | 'phone';
}): Promise<{ success: boolean; otpId: string; channel: string; message: string }> {
  const response = await adminFetch('/api/otp/resend', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

// Admin messaging API client functions
export async function sendMessage(params: {
  target: 'all' | 'buyer' | 'seller' | 'individual';
  title: string;
  content: string;
  content_type?: 'text' | 'markdown' | 'html';
  channel?: 'in_app' | 'email' | 'sms' | 'whatsapp';
  userIds?: string[];
  sendEmail?: boolean;
  sendSms?: boolean;
}): Promise<{ success: boolean; target: string; total: number; successful: number; failed: number; results: any[] }> {
  const response = await adminFetch('/api/admin-messaging/send', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function broadcastMessage(params: {
  target: 'all' | 'buyer' | 'seller';
  title: string;
  content: string;
  content_type?: 'text' | 'markdown' | 'html';
  channel?: 'in_app' | 'email' | 'sms' | 'whatsapp';
  audience?: 'buyer' | 'seller';
  sendEmail?: boolean;
  sendSms?: boolean;
}): Promise<{ success: boolean; broadcastId: string; target: string; total: number; sent: number; delivered: number; failed: number }> {
  const response = await adminFetch('/api/admin-messaging/broadcast', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
}

export async function listAdminMessages(limit = 50, offset = 0, status?: string): Promise<{ messages: any[]; total: number; limit: number; offset: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (status) params.set('status', status);
  const response = await adminFetch(`/api/admin-messaging/messages?${params}`);
  return response.json();
}

export async function listAdminBroadcasts(limit = 50, offset = 0): Promise<{ broadcasts: any[]; total: number; limit: number; offset: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const response = await adminFetch(`/api/admin-messaging/broadcasts?${params}`);
  return response.json();
}

export async function getMessagingConfig(): Promise<any> {
  const response = await adminFetch('/api/admin-messaging/config');
  return response.json();
}
