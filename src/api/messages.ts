import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";
import { createClient } from "@supabase/supabase-js";

export const messagesRoutes = new Hono();

messagesRoutes.get("/conversations", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const sql = getSql(env);

    const conversations = await sql`
      SELECT 
        c.*,
        a.title as listing_title,
        a.images as listing_images,
        a.price as listing_price,
        p.full_name as other_user_name,
        p.avatar_url as other_user_avatar
      FROM conversations c
      LEFT JOIN ads a ON c.ad_id = a.id
      LEFT JOIN profiles p ON (
        CASE 
          WHEN c.participant_1 = ${user.id} THEN c.participant_2 = p.id
          ELSE c.participant_1 = p.id
        END
      )
      WHERE c.participant_1 = ${user.id} OR c.participant_2 = ${user.id}
      ORDER BY c.updated_at DESC
    `;

    return c.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    return c.json({ error: "Failed to fetch conversations" }, 500);
  }
});

messagesRoutes.get("/conversations/:id/messages", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const conversationId = c.req.param("id");
    const sql = getSql(env);

    const conv = await sql`
      SELECT * FROM conversations 
      WHERE id = ${conversationId} 
      AND (participant_1 = ${user.id} OR participant_2 = ${user.id})
    `;

    if (conv.length === 0) {
      return c.json({ error: "Conversation not found" }, 404);
    }

    const messages = await sql`
      SELECT m.*, p.full_name as sender_name, p.avatar_url as sender_avatar
      FROM messages m
      LEFT JOIN profiles p ON m.sender_id = p.id
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at ASC
    `;

    await sql`
      UPDATE messages SET read = true 
      WHERE conversation_id = ${conversationId} AND receiver_id = ${user.id}
    `;

    return c.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

messagesRoutes.post("/conversations", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const body = await c.req.json();
    const { ad_id, receiver_id, content } = body;

    if (!ad_id || !receiver_id || !content) {
      return c.json({ error: "ad_id, receiver_id, and content are required" }, 400);
    }

    const sql = getSql(env);

    let conversation = await sql`
      SELECT * FROM conversations 
      WHERE ad_id = ${ad_id} 
      AND ((participant_1 = ${user.id} AND participant_2 = ${receiver_id})
      OR (participant_1 = ${receiver_id} AND participant_2 = ${user.id}))
    `;

    let conversationId: string;

    if (conversation.length === 0) {
      const result = await sql`
        INSERT INTO conversations (ad_id, participant_1, participant_2, last_message, last_message_time, created_at, updated_at)
        VALUES (${ad_id}, ${user.id}, ${receiver_id}, ${content}, NOW(), NOW(), NOW())
        RETURNING id
      `;
      conversationId = result[0].id;
    } else {
      conversationId = conversation[0].id;
      await sql`
        UPDATE conversations 
        SET last_message = ${content}, last_message_time = NOW(), updated_at = NOW()
        WHERE id = ${conversationId}
      `;
    }

    const messageResult = await sql`
      INSERT INTO messages (conversation_id, sender_id, receiver_id, ad_id, content, status, read, created_at)
      VALUES (${conversationId}, ${user.id}, ${receiver_id}, ${ad_id}, ${content}, 'sent', false, NOW())
      RETURNING *
    `;

    await sql`
      INSERT INTO notifications (user_id, type, title, description, link_url, created_at)
      VALUES (${receiver_id}, 'message', 'New Message', 'You have a new message', '/messages', NOW())
    `;

    return c.json({ message: messageResult[0], conversationId }, 201);
  } catch (error) {
    console.error("Send message error:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

messagesRoutes.put("/conversations/:id/read", async (c) => {
  try {
    const env = c.env as any;
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const conversationId = c.req.param("id");
    const sql = getSql(env);

    await sql`
      UPDATE messages SET read = true 
      WHERE conversation_id = ${conversationId} AND receiver_id = ${user.id}
    `;

    return c.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    return c.json({ error: "Failed to mark as read" }, 500);
  }
});