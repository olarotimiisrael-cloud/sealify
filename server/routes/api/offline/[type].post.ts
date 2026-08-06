import { defineHandler } from "nitro";
import { readBody, getRouterParam } from "nitro/h3";
import { getSql } from "../../../db/hyperdrive";

export default defineHandler(async (event) => {
  try {
    const env = event.context.cloudflare?.env;
    if (!env?.HYPERDRIVE) {
      return { success: false, error: 'Database not configured' };
    }

    const type = getRouterParam(event, 'type');
    const body = await readBody(event);
    const sql = getSql(env);

    switch (type) {
      case 'message': {
        const { conversationId, content, senderId } = body;
        await sql`
          INSERT INTO messages (conversation_id, sender_id, content, status, created_at)
          VALUES (${conversationId}, ${senderId}, ${content}, 'sent', NOW())
        `;
        break;
      }
      case 'favorite': {
        const { listingId, userId, action } = body;
        if (action === 'add') {
          await sql`
            INSERT INTO favorites (user_id, ad_id) VALUES (${userId}, ${listingId})
            ON CONFLICT (user_id, ad_id) DO NOTHING
          `;
        } else {
          await sql`DELETE FROM favorites WHERE user_id = ${userId} AND ad_id = ${listingId}`;
        }
        break;
      }
      case 'view': {
        const { listingId } = body;
        await sql`UPDATE ads SET views_count = views_count + 1 WHERE id = ${listingId}`;
        break;
      }
      case 'offer': {
        const { listingId, amount, message, senderId, receiverId } = body;
        await sql`
          INSERT INTO messages (conversation_id, sender_id, receiver_id, ad_id, content, created_at)
          SELECT id, ${senderId}, ${receiverId}, ${listingId}, 
                 '💰 OFFER: ₦' || ${amount} || ' - ' || ${message}, NOW()
          FROM conversations WHERE ad_id = ${listingId} AND (participant_1 = ${senderId} OR participant_2 = ${senderId})
          LIMIT 1
        `;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Unknown action type' }), { status: 400 });
    }

    return { success: true };
  } catch (error) {
    console.error(`Offline ${type} error:`, error);
    return new Response(JSON.stringify({ error: 'Failed to process' }), { status: 500 });
  }
});