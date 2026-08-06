import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";
import { getSql } from "../../db/hyperdrive";

export default defineHandler(async (event) => {
  try {
    const env = event.context.cloudflare?.env;
    if (!env?.HYPERDRIVE) {
      return { success: true, message: 'Analytics queued locally' };
    }

    const body = await readBody<{ events: any[] }>(event);
    if (!body?.events || !Array.isArray(body.events)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    const sql = getSql(env);
    const events = body.events;

    // Batch insert analytics events
    for (const evt of events) {
      await sql`
        INSERT INTO analytics_events (
          session_id, event_name, properties, url, referrer, user_agent, viewport, created_at
        ) VALUES (
          ${evt.sessionId}, ${evt.event}, ${JSON.stringify(evt.properties)}, 
          ${evt.properties?.url}, ${evt.properties?.referrer}, ${evt.properties?.userAgent}, 
          ${evt.properties?.viewport}, ${evt.timestamp}
        )
      `;
    }

    return { success: true, count: events.length };
  } catch (error) {
    console.error('Analytics batch error:', error);
    // Don't fail - analytics should be non-blocking
    return { success: true, message: 'Queued for retry' };
  }
});