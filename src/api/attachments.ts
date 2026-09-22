import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";
import { requireAuth, auditLog } from "../middleware/security";
import { z } from "zod";

export const attachmentsRoutes = new Hono<{ Bindings: any; Variables: { sql: ReturnType<typeof getSql> } }>();

const uploadSchema = z.object({
  message_id: z.string().uuid(),
  filename: z.string().max(255),
  mime_type: z.string().optional(),
  size: z.number().int().positive(),
  storage_bucket: z.string().max(50),
  storage_path: z.string().max(500),
  public_url: z.string().url().optional(),
});

attachmentsRoutes.post("/messages/:messageId/attachments", requireAuth, async (c) => {
  try {
    const env = c.env as any;
    const messageId = c.req.param("messageId");
    const body = await c.req.json();
    const validated = uploadSchema.parse(body);
    const sql = getSql(c.env);
    const user = c.get("user");

    const message = await sql`
      SELECT * FROM messages WHERE id = ${messageId}
    `;

    if (message.length === 0) {
      throw new HTTPException(404, { message: "Message not found" });
    }

    const attachment = await sql`
      INSERT INTO message_attachments (
        message_id, uploaded_by, filename, mime_type, size,
        storage_bucket, storage_path, public_url
      ) VALUES (
        ${messageId}, ${user.id}, ${validated.filename},
        ${validated.mime_type || null}, ${validated.size},
        ${validated.storage_bucket}, ${validated.storage_path},
        ${validated.public_url || null}
      ) RETURNING *
    `;

    await auditLog(sql, user.id, "Attachment Uploaded",
      `Message: ${messageId}, File: ${validated.filename}, Size: ${validated.size}`, "attachment");

    return c.json({ attachment: attachment[0] }, 201);
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: "Validation failed", cause: error.errors });
    }
    console.error("Attachment upload error:", error);
    throw new HTTPException(500, { message: "Failed to upload attachment" });
  }
});

attachmentsRoutes.get("/messages/:messageId/attachments", requireAuth, async (c) => {
  try {
    const env = c.env as any;
    const messageId = c.req.param("messageId");
    const sql = getSql(c.env);
    const user = c.get("user");

    const message = await sql`
      SELECT * FROM messages WHERE id = ${messageId}
    `;

    if (message.length === 0) {
      throw new HTTPException(404, { message: "Message not found" });
    }

    const isParticipant = message[0].sender_id === user.id || message[0].receiver_id === user.id;
    if (!isParticipant) {
      throw new HTTPException(403, { message: "Not authorized to view attachments" });
    }

    const attachments = await sql`
      SELECT * FROM message_attachments WHERE message_id = ${messageId}
      ORDER BY created_at ASC
    `;

    return c.json({ attachments });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Attachment fetch error:", error);
    throw new HTTPException(500, { message: "Failed to fetch attachments" });
  }
});

attachmentsRoutes.get("/attachments/:attachmentId/download", requireAuth, async (c) => {
  try {
    const env = c.env as any;
    const attachmentId = c.req.param("attachmentId");
    const sql = getSql(c.env);
    const user = c.get("user");

    const attachment = await sql`
      SELECT * FROM message_attachments WHERE id = ${attachmentId}
    `;

    if (attachment.length === 0) {
      throw new HTTPException(404, { message: "Attachment not found" });
    }

    const message = await sql`
      SELECT * FROM messages WHERE id = ${attachment[0].message_id}
    `;

    if (message.length === 0) {
      throw new HTTPException(404, { message: "Parent message not found" });
    }

    const isParticipant = message[0].sender_id === user.id || message[0].receiver_id === user.id;
    if (!isParticipant) {
      throw new HTTPException(403, { message: "Not authorized to download attachment" });
    }

    await auditLog(sql, user.id, "Attachment Downloaded",
      `Attachment: ${attachmentId}, File: ${attachment[0].filename}`, "attachment");

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data } = await supabase.storage
      .from(attachment[0].storage_bucket)
      .createSignedUrl(attachment[0].storage_path, 300);

    if (!data?.signedUrl) {
      throw new HTTPException(500, { message: "Failed to generate signed URL" });
    }

    return c.json({ download_url: data.signedUrl, expires_in: 300 });
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Attachment download error:", error);
    throw new HTTPException(500, { message: "Failed to download attachment" });
  }
});

export default attachmentsRoutes;
