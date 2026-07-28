import { Hono } from "hono";

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
    const sql = env.HYPERDRIVE ? env.HYPERDRIVE.connectionString : null;
    
    if (!sql) {
      return c.json({ status: "unhealthy", error: "No database connection" }, 503);
    }
    
    // Test connection
    const postgres = (await import("postgres")).default;
    const client = postgres(sql, { max: 1 });
    await client`SELECT 1`;
    await client.end();
    
    return c.json({ status: "healthy", database: "connected" });
  } catch (error) {
    return c.json({ status: "unhealthy", error: String(error) }, 503);
  }
});