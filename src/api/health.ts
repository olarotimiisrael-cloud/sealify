import { Hono } from "hono";
import { getSql } from "../db/hyperdrive";

export const healthRoutes = new Hono();

healthRoutes.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "sealify-api",
    version: "1.0.0"
  });
});

healthRoutes.get("/health/db", async (c) => {
  try {
    const env = c.env as any;
    const sql = env.HYPERDRIVE ? getSql(env) : null;
    
    if (!sql) {
      return c.json({ status: "unhealthy", error: "No database connection" }, 503);
    }
    
    await sql`SELECT 1`;
    
    return c.json({ status: "healthy", database: "connected" });
  } catch (error) {
    return c.json({ status: "unhealthy", error: String(error) }, 503);
  }
});