import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, auditLog } from "../middleware/security";
import { z } from "zod";
import { sendEmailViaSelfHosted, sendSmsViaSelfHosted, sendWhatsAppViaSelfHosted, type Env } from "../lib/selfHostedProviders";

export const buyerRequestsAdminRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql>; user: any } }>();

const notifyRequestSchema = z.object({
  requestId: z.string().uuid(),
  target: z.enum(["all", "buyer", "seller", "individual"]),
  audience: z.enum(["buyer", "seller"]).optional(),
  title: z.string().max(200),
  message: z.string().max(5000),
  channel: z.enum(["in_app", "email", "sms", "whatsapp"]).optional().default("in_app"),
  sendEmail: z.boolean().optional().default(false),
  sendSms: z.boolean().optional().default(false),
  sendWhatsapp: z.boolean().optional().default(false),
  userIds: z.array(z.string().uuid()).optional(),
});

buyerRequestsAdminRoutes.get("/", requireAdmin, async (c) => {
  try {
    const sql = getSql(c.env);
    const { category, status, limit = "100", offset = "0", search } = c.req.query();

    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (category && category !== "All") {
      whereClause += " AND category_id = $1";
      params.push(category);
    }
    if (status) {
      whereClause += ` AND status = ${status}`;
    }
    if (search) {
      whereClause += " AND (title ILIKE $1 OR description ILIKE $1 OR location ILIKE $1)";
      params.push(`%${search}%`);
    }

    const limitNum = Math.min(parseInt(limit) || 100, 500);
    const offsetNum = parseInt(offset) || 0;

    const requests = await sql.unsafe(
      `
      SELECT * FROM buyer_requests
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `,
      [...params, limitNum, offsetNum]
    );

    const countResult = await sql.unsafe(`SELECT COUNT(*) as total FROM buyer_requests ${whereClause}`, params);

    return c.json({
      requests,
      total: parseInt(countResult[0]?.total || "0"),
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error("Get admin buyer requests error:", error);
    return c.json({ error: "Failed to fetch buyer requests" }, 500);
  }
});

buyerRequestsAdminRoutes.post("/:id/notify", requireAdmin, async (c) => {
  try {
    const sql = getSql(c.env);
    const env = c.env as any;
    const sender = c.get("user");
    const requestId = c.req.param("id");
    const body = await c.req.json();
    const validated = notifyRequestSchema.parse(body);

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    const requestRow = await sql`
      SELECT * FROM buyer_requests WHERE id = ${requestId}
    `;

    if (requestRow.length === 0) {
      throw new HTTPException(404, { message: "Buyer request not found" });
    }

    const request = requestRow[0];

    let userList: any[] = [];
    let description = "";

    if (validated.target === "all") {
      const { data } = await supabase.from("profiles").select("id, email, full_name, phone_number, whatsapp_number, role");
      userList = data || [];
      description = `All users (${userList.length})`;
    } else if (validated.target === "individual" && validated.userIds?.length) {
      const { data } = await supabase.from("profiles").select("id, email, full_name, phone_number, whatsapp_number, role").in("id", validated.userIds);
      userList = data || [];
      description = `Selected users (${userList.length})`;
    } else if (validated.target === "buyer" || validated.audience === "buyer") {
      const { data } = await supabase.from("profiles").select("id, email, full_name, phone_number, whatsapp_number, role").eq("role", "buyer");
      userList = data || [];
      description = `Buyers (${userList.length})`;
    } else if (validated.target === "seller" || validated.audience === "seller") {
      const { data } = await supabase.from("profiles").select("id, email, full_name, phone_number, whatsapp_number, role").eq("role", "seller");
      userList = data || [];
      description = `Sellers (${userList.length})`;
    }

    if (userList.length === 0) {
      throw new HTTPException(404, { message: "No users found for the selected target" });
    }

    const requestLink = `${env.APP_URL || env.PUBLIC_SITE_URL || "https://sealify.thesealconsult.com.ng"}/requests#${requestId}`;

    let inAppCount = 0;
    let emailCount = 0;
    let smsCount = 0;
    let whatsappCount = 0;
    const errors: string[] = [];

    const inAppPromises: Promise<any>[] = [];
    const emailPromises: Promise<any>[] = [];
    const smsPromises: Promise<any>[] = [];
    const whatsappPromises: Promise<any>[] = [];

    const emailBody = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Sealify Request Notification</title>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
.content { background: #fff; border: 1px solid #e1e5e9; padding: 30px; border-radius: 0 0 8px 8px; }
.button { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
.footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>🔔 New Item Request</h1>
<p>Sealify Want Board</p>
</div>
<div class="content">
<h2>${validated.title}</h2>
<p>${validated.message}</p>
<h3>Request Details</h3>
<p><strong>Item:</strong> ${request.title}</p>
<p><strong>Category:</strong> ${request.category_id}</p>
<p><strong>Budget:</strong> ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(request.max_budget)}</p>
<p><strong>Location:</strong> ${request.location}</p>
<p><strong>Full Description:</strong></p>
<p>${request.description}</p>
<div style="text-align: center;">
<a href="${requestLink}" class="button">View Request & Offer</a>
</div>
</div>
<div class="footer">
<p>© 2026 Sealify Nigeria. All rights reserved.</p>
<p>This is an automated notification. Please do not reply to this email.</p>
</div>
</div>
</body>
</html>
`;

    const emailText = `
Sealify Request Notification

Title: ${validated.title}

${validated.message}

Request Details:
Item: ${request.title}
Category: ${request.category_id}
Budget: ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(request.max_budget)}
Location: ${request.location}

Full Description:
${request.description}

View Request: ${requestLink}

© 2026 Sealify Nigeria. All rights reserved.
`;

    const defaultMessage = `Hi there! A seller on Sealify just posted a request: "${request.title}". Budget: ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(request.max_budget)}. Location: ${request.location}.`;

    for (const user of userList) {
      const inAppJob = (async () => {
        try {
          if (validated.channel === "in_app" || validated.title) {
            const message = validated.channel === "in_app" ? (validated.title || "New Request Notification") : "Check new requests";
            await sql`
              INSERT INTO notifications (user_id, type, title, description, link_url, created_at)
              VALUES (${user.id}, 'general', ${validated.title || "New Request Notification"}, ${validated.channel === "in_app" ? validated.message : defaultMessage}, ${requestLink}, NOW())
              ON CONFLICT (user_id, description) DO NOTHING
            `;
            inAppCount++;
          }
        } catch (e: any) {
          errors.push(`In-app notification to ${user.email}: ${e.message}`);
        }
      })();
      inAppPromises.push(inAppJob);

      if (validated.sendEmail || validated.channel === "email") {
        const emailJob = (async () => {
          try {
            const response = await sendEmailViaSelfHosted(env, {
              to: user.email,
              from: env.ADMIN_EMAIL_FROM || "admin@sealify.ng",
              subject: validated.title || `Sealify: ${request.title}`,
              html: emailBody,
              text: emailText,
              headers: {
                "X-Admin-Sent": "true",
                "X-Target-User": user.id,
                "X-Request-ID": requestId,
                "X-Audience": validated.target,
              },
            });
            emailCount++;
          } catch (e: any) {
            errors.push(`Email to ${user.email}: ${e.message}`);
          }
        })();
        emailPromises.push(emailJob);
      }

      if (validated.sendSms || validated.channel === "sms") {
        const smsJob = (async () => {
          try {
            if (user.phone_number) {
              const smsBody = `Sealify: ${validated.title || "New Request"} - ${validated.message || "Check out this request on Sealify!"} Link: ${requestLink}`;
              await sendSmsViaSelfHosted(env, { to: user.phone_number, message: smsBody });
              smsCount++;
            }
          } catch (e: any) {
            errors.push(`SMS to ${user.email}: ${e.message}`);
          }
        })();
        smsPromises.push(smsJob);
      }

      if (validated.sendWhatsapp || validated.channel === "whatsapp") {
        const whatsappJob = (async () => {
          try {
            const whatsappNumber = user.whatsapp_number || user.phone_number;
            if (whatsappNumber) {
              const waBody = `Sealify: ${validated.title || "New Request"} - ${validated.message || "Check out this request on Sealify!"} Link: ${requestLink}`;
              await sendWhatsAppViaSelfHosted(env, whatsappNumber, waBody);
              whatsappCount++;
            }
          } catch (e: any) {
            errors.push(`WhatsApp to ${user.email}: ${e.message}`);
          }
        })();
        whatsappPromises.push(whatsappJob);
      }
    }

    await Promise.all([...inAppPromises, ...emailPromises, ...smsPromises, ...whatsappPromises]);

    const successTotal = inAppCount + emailCount + smsCount + whatsappCount;

    await auditLog(sql, sender.id, "Admin Buyer Request Notification", `
      Request ID: ${requestId}
      Request Title: ${request.title}
      Target: ${description}
      In-App: ${inAppCount}
      Email: ${emailCount}
      SMS: ${smsCount}
      WhatsApp: ${whatsappCount}
    `, "broadcast");

    return c.json({
      success: true,
      requestId: requestId,
      target: description,
      total: userList.length,
      triggered: {
        in_app: inAppCount,
        email: emailCount,
        sms: smsCount,
        whatsapp: whatsappCount,
      },
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) throw new HTTPException(400, { message: "Validation failed", cause: error.errors });
    console.error("Admin notify buyer request error:", error);
    throw new HTTPException(500, { message: "Failed to send notification" });
  }
});

export default buyerRequestsAdminRoutes;
