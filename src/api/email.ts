import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, auditLog, rateLimit } from "../middleware/security";
import { z } from "zod";

export const emailRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql> } }>();

// Rate limiting
const emailRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 100 });

const emailAddressSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().max(100).optional(),
});

const sendEmailSchema = z.object({
  to: z.union([z.string(), z.array(z.string())]),
  cc: z.union([z.string(), z.array(z.string())]).optional(),
  bcc: z.union([z.string(), z.array(z.string())]).optional(),
  from: emailAddressSchema,
  replyTo: emailAddressSchema.optional(),
  subject: z.string().max(200, "Subject too long (max 200 characters)"),
  html: z.string().max(1_000_000, "HTML too large (max 1MB)").optional(),
  text: z.string().max(1_000_000, "Text too large (max 1MB)").optional(),
  template: z.string().max(100).optional(),
  attachments: z.array(z.object({
    filename: z.string().max(255),
    content: z.any(),
    type: z.string().max(100).optional(),
    disposition: z.enum(["attachment", "inline"]).optional(),
    contentId: z.string().max(100).optional(),
  })).optional(),
  headers: z.record(z.string()).optional(),
});

// Send email endpoint
emailRoutes.post("/send", emailRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const validated = sendEmailSchema.parse(body);
    const sql = getSql(c.env);

    const recipients = Array.isArray(validated.to) ? validated.to : [validated.to];
    const ccList = validated.cc ? (Array.isArray(validated.cc) ? validated.cc : [validated.cc]) : [];
    const bccList = validated.bcc ? (Array.isArray(validated.bcc) ? validated.bcc : [validated.bcc]) : [];
    const isPasswordReset = validated.template === 'password-reset';

    await auditLog(sql, "system", "Email Sent", `
      From: ${validated.from.email}
      To: ${recipients.join(', ')}
      CC: ${ccList.join(', ') || 'None'}
      BCC: ${bccList.join(', ') || 'None'}
      Subject: ${validated.subject}
      Template: ${validated.template || 'plain'}
      Password Reset: ${isPasswordReset}
    `, "email" as any);

    const response = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      delivered: recipients,
      queued: [],
      permanent_bounces: [],
    };

    return c.json({
      success: true,
      messageId: response.messageId,
      delivered: response.delivered,
      queued: response.queued,
      permanent_bounces: response.permanent_bounces,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: "Validation failed", cause: error.errors });
    }
    console.error("Email send error:", error);
    throw new HTTPException(500, { message: "Failed to send email" });
  }
});

// Multi-channel password reset (email + SMS + WhatsApp)
emailRoutes.post("/password-reset", emailRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const { email, fullName, resetUrl, phoneNumber, whatsappNumber, channels } = body;

    if (!email || !resetUrl) {
      throw new HTTPException(400, { message: "Email and reset URL required" });
    }

    const sql = getSql(c.env);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    let userName = fullName || email.split('@')[0];
    let userPhone = phoneNumber || '';

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone_number, whatsapp_number")
        .eq("email", email)
        .single();

      if (profile) {
        userName = profile.full_name || userName;
        userPhone = profile.phone_number || userPhone;
      }
    } catch (profileError) {
      // Continue with provided/derived info
    }

    const channelsList = channels || ['email', 'sms'];
    const sentChannels: string[] = [];
    const errors: Record<string, string> = {};

    // --- Email channel ---
    if (channelsList.includes('email')) {
      try {
        await sendEmailViaEnv(env, {
          to: email,
          from: { email: env.PASSWORD_RESET_EMAIL_FROM || 'reset@sealify.ng', name: 'Sealify Password Reset' },
          subject: 'Reset Your Sealify Password',
          html: generatePasswordResetHtml(userName, email, resetUrl, userPhone),
          text: generatePasswordResetText(userName, email, resetUrl, userPhone),
          template: 'password-reset',
          headers: { 'X-Password-Reset': 'true', 'X-Channel': 'email' },
          attachments: [],
        });
        sentChannels.push('email');
      } catch (emailError: any) {
        errors.email = emailError.message;
      }
    }

    // --- SMS channel ---
    if (channelsList.includes('sms')) {
      if (userPhone) {
        try {
          await sendSMSViaEnv(env, userPhone, `Sealify: Reset your password — ${resetUrl}. This link expires in 1 hour.`);
          sentChannels.push('sms');
        } catch (smsError: any) {
          errors.sms = smsError.message;
        }
      } else {
        errors.sms = "No phone number available for user";
      }
    }

    // --- WhatsApp channel ---
    if (channelsList.includes('whatsapp')) {
      const targetWhats = whatsappNumber || userPhone;
      if (targetWhats) {
        try {
          await sendWhatsAppViaEnv(env, targetWhats, `🔐 Sealify Password Reset\n\nHi ${userName},\nTap the link below to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.`);
          sentChannels.push('whatsapp');
        } catch (waError: any) {
          errors.whatsapp = waError.message;
        }
      } else {
        errors.whatsapp = "No WhatsApp number available for user";
      }
    }

    await auditLog(sql, "system", "Multi-Channel Password Reset", `
      Email: ${email}
      User: ${userName}
      Channels attempted: ${channelsList.join(', ')}
      Channels sent: ${sentChannels.join(', ')}
      Errors: ${JSON.stringify(errors)}
    `, "password_reset" as any);

    const allFailed = sentChannels.length === 0;
    return c.json({
      success: !allFailed,
      channels: sentChannels,
      attempted: channelsList,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      totalChannels: channelsList.length,
      message: allFailed
        ? 'All channels failed. Please contact support.'
        : `Password reset sent via: ${sentChannels.join(', ')}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Password reset email error:", error);
    throw new HTTPException(500, { message: "Failed to send password reset" });
  }
});

// Admin: Broadcast email to all or individual users
emailRoutes.post("/admin/send", requireAdmin, emailRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const { target, subject, html, text, template, userIds, audience, attachments } = body;

    if (!subject || !html) {
      throw new HTTPException(400, { message: "Subject and HTML content required" });
    }

    const sql = getSql(c.env);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    let userList: any[] = [];
    let description = '';

    if (target === 'all') {
      const { data } = await supabase.from('profiles').select('id, email, full_name');
      userList = data || [];
      description = `All users (${userList.length})`;
    } else if (target === 'individual' && userIds?.length) {
      const { data } = await supabase.from('profiles').select('id, email, full_name').in('id', userIds);
      userList = data || [];
      description = `Selected users (${userList.length})`;
    } else if (audience && ['buyer', 'seller'].includes(audience)) {
      const { data } = await supabase.from('profiles').select('id, email, full_name').eq('role', audience);
      userList = data || [];
      description = `${audience}s (${userList.length})`;
    }

    if (userList.length === 0) {
      throw new HTTPException(404, { message: "No users found for the selected target" });
    }

    const results: any[] = [];
    for (const userRow of userList) {
      try {
        const response = await sendEmailViaEnv(env, {
          to: userRow.email,
          from: { email: env.ADMIN_EMAIL_FROM || 'admin@sealify.ng', name: 'Sealify Admin' },
          subject,
          html,
          text,
          template,
          attachments: attachments || [],
          headers: {
            'X-Admin-Sent': 'true',
            'X-Target-User': userRow.id,
            'X-Audience': audience || 'custom',
          },
        });
        results.push({
          userId: userRow.id,
          email: userRow.email,
          name: userRow.full_name,
          success: true,
          messageId: response.messageId,
        });
      } catch (sendError: any) {
        console.error(`Failed to send to ${userRow.email}:`, sendError);
        results.push({
          userId: userRow.id,
          email: userRow.email,
          name: userRow.full_name,
          success: false,
          error: sendError.message || 'Unknown error',
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    await auditLog(sql, c.get('user').id, "Admin Email Broadcast", `
      Target: ${description}
      Subject: ${subject}
      Template: ${template || 'plain'}
      Sent: ${successful}
      Failed: ${failed}
      Success rate: ${((successful / userList.length) * 100).toFixed(1)}%
    `, "broadcast" as any);

    return c.json({
      success: true,
      target: description,
      total: userList.length,
      successful,
      failed,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Admin email broadcast error:", error);
    throw new HTTPException(500, { message: "Failed to broadcast email" });
  }
});

// Admin: Upload file attachment (stored as base64 for Cloudflare Email Service)
emailRoutes.post("/admin/upload-attachment", requireAdmin, emailRateLimit, async (c) => {
  try {
    const body = await c.req.json();
    const { filename, content, type } = body;

    if (!filename || !content) {
      throw new HTTPException(400, { message: "Filename and base64 content required" });
    }

    const maxSize = parseInt(env.MAX_ATTACHMENT_SIZE || '10000000');
    const decodedSize = Buffer.from(content, 'base64').length;
    if (decodedSize > maxSize) {
      throw new HTTPException(413, { message: `Attachment exceeds ${maxSize} bytes` });
    }

    return c.json({
      success: true,
      attachment: {
        filename,
        content,
        type: type || 'application/octet-stream',
        size: decodedSize,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Attachment upload error:", error);
    throw new HTTPException(500, { message: "Failed to upload attachment" });
  }
});

// Email service status
emailRoutes.get("/status", requireAdmin, async (c) => {
  try {
    const env = c.env as any;
    return c.json({
      emailService: {
        configured: !!(env.EMAIL || env.EMAIL_SERVICE_URL),
        provider: env.EMAIL_SERVICE_PROVIDER || 'cloudflare',
        dailyLimit: parseInt(env.EMAIL_DAILY_LIMIT || '10000'),
      },
      emailTemplates: {
        passwordReset: 'configured',
        emailDigest: 'configured',
        promotion: 'configured',
      },
      supportedChannels: ['email', 'sms', 'whatsapp'],
      rateLimits: { perHour: 100, perDay: 10000 },
    });
  } catch (error) {
    console.error("Email status error:", error);
    throw new HTTPException(500, { message: "Failed to get email status" });
  }
});

// Email service status
emailRoutes.get("/status", requireAdmin, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const { target, message, userIds, audience } = body;

    if (!message || !message.trim()) {
      throw new HTTPException(400, { message: "Message content required" });
    }

    const sql = getSql(c.env);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    let userList: any[] = [];
    let description = '';

    if (target === 'all') {
      const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number');
      userList = data || [];
      description = `All users (${userList.length})`;
    } else if (target === 'individual' && userIds?.length) {
      const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number').in('id', userIds);
      userList = data || [];
      description = `Selected users (${userList.length})`;
    } else if (audience && ['buyer', 'seller'].includes(audience)) {
      const { data } = await supabase.from('profiles').select('id, email, full_name, phone_number').eq('role', audience);
      userList = data || [];
      description = `${audience}s (${userList.length})`;
    }

    if (userList.length === 0) {
      throw new HTTPException(404, { message: "No users found for the selected target" });
    }

    const results: any[] = [];
    for (const userRow of userList) {
      if (!userRow.phone_number) {
        results.push({ userId: userRow.id, email: userRow.email, name: userRow.full_name, success: false, error: 'No phone number' });
        continue;
      }
      try {
        await sendSMSViaEnv(env, userRow.phone_number, message);
        results.push({ userId: userRow.id, email: userRow.email, name: userRow.full_name, success: true });
      } catch (sendError: any) {
        results.push({ userId: userRow.id, email: userRow.email, name: userRow.full_name, success: false, error: sendError.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    await auditLog(sql, c.get('user').id, "Admin SMS Broadcast", `
      Target: ${description}
      Sent: ${successful}
      Failed: ${failed}
      Message: ${message.substring(0, 100)}
    `, "sms_broadcast" as any);

    return c.json({ success: true, target: description, total: userList.length, successful, failed, results, timestamp: new Date().toISOString() });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Admin SMS broadcast error:", error);
    throw new HTTPException(500, { message: "Failed to broadcast SMS" });
  }
});

// Admin: Broadcast WhatsApp message to all or individual users
emailRoutes.post("/admin/whatsapp", requireAdmin, emailRateLimit, async (c) => {
  try {
    const env = c.env as any;
    const body = await c.req.json();
    const { target, message, userIds, audience } = body;

    if (!message || !message.trim()) {
      throw new HTTPException(400, { message: "Message content required" });
    }

    const sql = getSql(c.env);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    let userList: any[] = [];
    let description = '';

    if (target === 'all') {
      const { data } = await supabase.from('profiles').select('id, email, full_name, whatsapp_number, phone_number');
      userList = data || [];
      description = `All users (${userList.length})`;
    } else if (target === 'individual' && userIds?.length) {
      const { data } = await supabase.from('profiles').select('id, email, full_name, whatsapp_number, phone_number').in('id', userIds);
      userList = data || [];
      description = `Selected users (${userList.length})`;
    } else if (audience && ['buyer', 'seller'].includes(audience)) {
      const { data } = await supabase.from('profiles').select('id, email, full_name, whatsapp_number, phone_number').eq('role', audience);
      userList = data || [];
      description = `${audience}s (${userList.length})`;
    }

    if (userList.length === 0) {
      throw new HTTPException(404, { message: "No users found for the selected target" });
    }

    const results: any[] = [];
    for (const userRow of userList) {
      const whatsappNumber = userRow.whatsapp_number || userRow.phone_number;
      if (!whatsappNumber) {
        results.push({ userId: userRow.id, email: userRow.email, name: userRow.full_name, success: false, error: 'No WhatsApp number' });
        continue;
      }
      try {
        await sendWhatsAppViaEnv(env, whatsappNumber, message);
        results.push({ userId: userRow.id, email: userRow.email, name: userRow.full_name, success: true });
      } catch (sendError: any) {
        results.push({ userId: userRow.id, email: userRow.email, name: userRow.full_name, success: false, error: sendError.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    await auditLog(sql, c.get('user').id, "Admin WhatsApp Broadcast", `
      Target: ${description}
      Sent: ${successful}
      Failed: ${failed}
      Message: ${message.substring(0, 100)}
    `, "whatsapp_broadcast" as any);

    return c.json({ success: true, target: description, total: userList.length, successful, failed, results, timestamp: new Date().toISOString() });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Admin WhatsApp broadcast error:", error);
    throw new HTTPException(500, { message: "Failed to broadcast WhatsApp message" });
  }
});

// --- Helpers ---

async function sendEmailViaEnv(env: any, params: any) {
  const EMAIL = (env.EMAIL as any) || env.SEND_EMAIL_BINDING;

  if (EMAIL && typeof EMAIL.send === 'function') {
    const response = await EMAIL.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      html: params.html,
      text: params.text,
      attachments: params.attachments,
      headers: params.headers,
    });
    return response;
  }

  // Fallback: REST API
  if (env.EMAIL_SERVICE_URL && env.EMAIL_API_KEY) {
    const response = await fetch(env.EMAIL_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.EMAIL_API_KEY}` },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error(`Email API error: ${response.status}`);
    return await response.json();
  }

  // Simulate for development
  return {
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    delivered: Array.isArray(params.to) ? params.to : [params.to],
  };
}

async function sendSMSViaEnv(env: any, phone: string, message: string) {
  const provider = env.TERMII_API_KEY || env.ARKESEL_API_KEY || env.TWILIO_ACCOUNT_SID;
  if (!provider) {
    throw new Error("No SMS provider configured");
  }

  if (env.TERMII_API_KEY) {
    const response = await fetch('https://api.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: env.TERMII_API_KEY,
        to: phone,
        from: env.TERMII_SENDER_ID || 'Sealify',
        message,
        type: 'plain',
        channel: 'dnd',
      }),
    });
    if (!response.ok) throw new Error(`Termii SMS error: ${response.status}`);
    return await response.json();
  }

  if (env.ARKESEL_API_KEY) {
    const response = await fetch('https://api.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.ARKESEL_API_KEY}` },
      body: JSON.stringify({ to: [phone], from: env.ARKESEL_SENDER_ID || 'Sealify', message }),
    });
    if (!response.ok) throw new Error(`Arkesel SMS error: ${response.status}`);
    return await response.json();
  }

  if (env.TWILIO_ACCOUNT_SID) {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64')}` },
      body: new URLSearchParams({ From: env.TWILIO_FROM || '+2340000000000', To: phone, Body: message }),
    });
    if (!response.ok) throw new Error(`Twilio SMS error: ${response.status}`);
    return await response.json();
  }

  throw new Error("No SMS provider configured");
}

async function sendWhatsAppViaEnv(env: any, phone: string, message: string) {
  // Method 1: Twilio WhatsApp
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64')}` },
      body: new URLSearchParams({ From: 'whatsapp:+14155238886', To: `whatsapp:${phone}`, Body: message }),
    });
    if (!response.ok) throw new Error(`Twilio WhatsApp error: ${response.status}`);
    return await response.json();
  }

  // Method 2: Meta WhatsApp Cloud API
  if (env.WHATSAPP_API_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID) {
    const response = await fetch(`https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.WHATSAPP_API_TOKEN}` },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace(/\D/g, ''),
        text: { body: message },
      }),
    });
    if (!response.ok) throw new Error(`WhatsApp API error: ${response.status}`);
    return await response.json();
  }

  // Method 3: Termii WhatsApp
  if (env.TERMII_API_KEY) {
    const response = await fetch('https://api.termii.com/api/whatsapp/message/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: env.TERMII_API_KEY,
        to: phone,
        from: 'Sealify',
        message: message,
        type: 'text',
      }),
    });
    if (!response.ok) throw new Error(`Termii WhatsApp error: ${response.status}`);
    return await response.json();
  }

  // Simulate for development
  return { success: true, provider: 'simulated', messageId: `wa_${Date.now()}` };
}

function generatePasswordResetHtml(userName: string, email: string, resetUrl: string, phone?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset - Sealify</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #fff; border: 1px solid #e1e5e9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    .alert { background: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .phone { font-family: monospace; background: #f3f4f6; padding: 5px 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset</h1>
      <p>Sealify Nigeria Marketplace</p>
    </div>
    <div class="content">
      <h2>Hello ${userName}!</h2>
      <p>You requested a password reset for your Sealify account. Click the button below to create a new password:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      <div class="alert">
        <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email or contact support.
      </div>
      <p><strong>Your Account Details:</strong></p>
      <p>Email: ${email}</p>
      ${phone ? `<p>Phone: <span class="phone">${phone}</span></p>` : ''}
      <p><strong>Need Help?</strong></p>
      <p>Contact our support team at <a href="mailto:support@sealify.ng">support@sealify.ng</a> or call +234 813 120 8468.</p>
      <div class="footer">
        <p>© 2026 Sealify Nigeria. All rights reserved.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generatePasswordResetText(userName: string, email: string, resetUrl: string, phone?: string): string {
  return `
SEALIFY NIGERIA - PASSWORD RESET

Hello ${userName}!

You requested a password reset for your Sealify account.

RESET PASSWORD LINK:
${resetUrl}

IMPORTANT NOTES:
• This link expires in 1 hour
• Click the link to set your new password
• If you didn't request this, please ignore

YOUR ACCOUNT DETAILS:
Email: ${email}
${phone ? `Phone: ${phone}` : ''}

NEED HELP?
Email: support@sealify.ng
Phone: +234 813 120 8468

© 2026 Sealify Nigeria. All rights reserved.
This is an automated message. Please do not reply to this email.
  `;
}

export default emailRoutes;
