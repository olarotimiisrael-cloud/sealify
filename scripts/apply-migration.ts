import * as dns from "dns";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL env var is required");
    process.exit(1);
  }

  const url = new URL(connectionString);
  const host = url.hostname;
  const port = Number(url.port || "5432");
  const user = url.username;
  const pass = url.password;
  const db = url.pathname.replace(/^\//, "");

  const addresses = await new Promise<string[]>((resolve, reject) => {
    dns.resolve(host, "AAAA", (err, addrs) => (err ? reject(err) : resolve(addrs)));
  });

  if (!addresses.length) {
    throw new Error(`No AAAA record for ${host}`);
  }

  const ipv6 = addresses[0];

  // postgres-js reads DATABASE_URL / PG* at module load time. Strip them
  // BEFORE importing the module so our explicit options take precedence.
  delete process.env.DATABASE_URL;
  delete process.env.PGHOST;
  delete process.env.PGPORT;
  delete process.env.PGUSER;
  delete process.env.PGPASSWORD;
  delete process.env.PGDATABASE;

  const { default: postgres } = await import("postgres");

  const sqlClient = postgres({
    host: ipv6,
    port,
    database: db,
    user,
    password: pass,
    max: 1,
  });

  console.log("Resolved IPv6:", ipv6);
  console.log("Port:", port);

  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261006000000_referral_and_welcome_email.sql"
  );
  const sql = fs.readFileSync(migrationPath, "utf8");

  console.log("Applying migration...");
  await sqlClient.unsafe(sql);
  console.log("Migration applied successfully.");
  await sqlClient.end();
}

main().catch((err) => {
  console.error("Migration failed:", err.message ?? err);
  process.exit(1);
});
