import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";
import { getSql } from "../../db/hyperdrive";

export default defineHandler(async (event) => {
  try {
    const env = event.context.cloudflare?.env;
    if (!env?.HYPERDRIVE) {
      return { success: true };
    }

    const body = await readBody<{ metrics: any[]; sessionId: string }>(event);
    if (!body?.metrics || !Array.isArray(body.metrics)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    const sql = getSql(env);
    const metrics = body.metrics;

    for (const metric of metrics) {
      await sql`
        INSERT INTO performance_metrics (
          session_id, metric_name, value, rating, timestamp
        ) VALUES (
          ${body.sessionId}, ${metric.name}, ${metric.value}, ${metric.rating}, ${metric.timestamp}
        )
      `;
    }

    return { success: true, count: metrics.length };
  } catch (error) {
    console.error('Performance metrics error:', error);
    return { success: true };
  }
});