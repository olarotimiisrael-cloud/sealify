import nodemailer from 'nodemailer';
import type { Env } from '../middleware/types';

export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}

export interface SmsMessage {
  to: string;
  message: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId: string;
  error?: string;
}

export interface SmsDeliveryResult {
  success: boolean;
  messageId: string;
  error?: string;
}

const OTP_LENGTH = 6;

function getEnv(env: Env): any {
  return env as any;
}

export async function sendEmailViaSelfHosted(env: Env, message: EmailMessage): Promise<EmailDeliveryResult> {
  const smtpHost = env.SMTP_HOST;
  const smtpPort = env.SMTP_PORT || '587';
  const smtpUser = env.SMTP_USER;
  const smtpPass = env.SMTP_PASS;

  if (!smtpHost) {
    return { success: false, messageId: '', error: 'SMTP host not configured' };
  }

  try {
    const transport = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10) || 587,
      secure: parseInt(smtpPort, 10) === 465,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
      requireTLS: parseInt(smtpPort, 10) === 587,
      tls: { minVersion: 'TLSv1.2' },
    });

    const info = await transport.sendMail({
      from: message.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      headers: message.headers,
    });

    await transport.close();
    return { success: true, messageId: info.messageId || `msg_${Date.now()}` };
  } catch (error: any) {
    return { success: false, messageId: '', error: error?.message || 'Email delivery failed' };
  }
}

export async function sendSmsViaSelfHosted(env: Env, message: SmsMessage): Promise<SmsDeliveryResult> {
  const gatewayUrl = env.SMS_GATEWAY_URL;
  const gatewayUsername = env.SMS_GATEWAY_USERNAME;
  const gatewayPassword = env.SMS_GATEWAY_PASSWORD;

  if (!gatewayUrl) {
    return { success: false, messageId: '', error: 'SMS gateway URL not configured' };
  }

  try {
    const url = new URL(gatewayUrl);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const body: Record<string, any> = {
      to: message.to,
      message: message.message,
    };

    if (gatewayUsername || gatewayPassword) {
      headers.Authorization = `Basic ${Buffer.from(`${gatewayUsername || ''}:${gatewayPassword || ''}`).toString('base64')}`;
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { success: false, messageId: '', error: `SMS gateway error: ${response.status}` };
    }

    const data = await response.json().catch(() => ({}));
    return {
      success: true,
      messageId: data.id || data.message_id || data.reference || `sms_${Date.now()}`,
    };
  } catch (error: any) {
    return { success: false, messageId: '', error: error?.message || 'SMS delivery failed' };
  }
}

export async function generateOtp(length: number = OTP_LENGTH): Promise<string> {
  const digits = '0123456789';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (value) => digits[value % digits.length]).join('');
}

export async function hashOtp(otp: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
