import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";
import { getSql } from "../../db/hyperdrive";

export default defineHandler(async (event) => {
  try {
    const env = event.context.cloudflare?.env;
    if (!env?.HYPERDRIVE) {
      throw createError({ statusCode: 500, statusMessage: 'Database not configured' });
    }

    const authHeader = event.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;
    
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: supabaseKey }
    });
    
    if (!userRes.ok) {
      throw createError({ statusCode: 401, statusMessage: "Invalid token" });
    }
    
    const { user } = await userRes.json();
    const sql = getSql(env);
    const body = await readBody(event);

    const { ad_id, receiver_id, content } = body;

    if (!ad_id || !receiver_id || !content) {
      throw createError({ statusCode: 400, statusMessage: "ad_id, receiver_id, and content are required" });
    }

    // Check if conversation exists
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

    // Create message
    const messageResult = await sql`
      INSERT INTO messages (conversation_id, sender_id, receiver_id, ad_id, content, status, read, created_at)
      VALUES (${conversationId}, ${user.id}, ${receiver_id}, ${ad_id}, ${content}, 'sent', false, NOW())
      RETURNING *
    `;

    // Create notification
    await sql`
      INSERT INTO notifications (user_id, type, title, description, link_url, created_at)
      VALUES (${receiver_id}, 'message', 'New Message', 'You have a new message from ' || (SELECT full_name FROM profiles WHERE id = ${user.id}), '/messages', NOW())
    `;

    return { message: messageResult[0], conversationId };
  } catch (error) {
    console.error("Send message error:", error);
    throw error;
  }
});