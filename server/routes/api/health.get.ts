import { defineHandler } from "nitro";
import { getSql } from "../../db/hyperdrive";

export default defineHandler(async (event) => {
  const startTime = Date.now();
  
  // Check database connection
  let dbStatus = 'healthy';
  let dbLatency = 0;
  
  try {
    const env = event.context.cloudflare?.env;
    if (env?.HYPERDRIVE) {
      const dbStart = Date.now();
      const sql = getSql(env);
      await sql`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } else {
      dbStatus = 'not_configured';
    }
  } catch (error) {
    dbStatus = 'unhealthy';
  }

  const uptime = process.uptime();
  const memory = process.memoryUsage();

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'sealify-api',
    version: '1.0.0',
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    checks: {
      database: {
        status: dbStatus,
        latency_ms: dbLatency
      },
      memory: {
        heap_used_mb: Math.round(memory.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(memory.heapTotal / 1024 / 1024),
        rss_mb: Math.round(memory.rss / 1024 / 1024)
      }
    }
  };
});