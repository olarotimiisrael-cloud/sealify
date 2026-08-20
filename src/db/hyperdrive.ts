import postgres, { TransactionSql } from "postgres";

export interface HyperdriveEnv {
  HYPERDRIVE?: {
    connectionString: string;
  };
}

export function getSql(env: HyperdriveEnv) {
  if (!env.HYPERDRIVE?.connectionString) {
    throw new Error("HYPERDRIVE binding is not configured");
  }

  // Pages Functions receive the connection string from the Hyperdrive binding.
  // The postgres client preserves the tagged-template API used by all routes.
  return postgres(env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false,
    prepare: true,
  });
}

// Helper functions
export async function queryDb<T>(env: HyperdriveEnv, query: string, params: any[] = []): Promise<T[]> {
  const sql = getSql(env);
  return await sql.unsafe(query, params) as T[];
}

export async function queryOneDb<T>(env: HyperdriveEnv, query: string, params: any[] = []): Promise<T | null> {
  const results = await queryDb<T>(env, query, params);
  return results.length > 0 ? results[0] : null;
}

export async function executeDb(env: HyperdriveEnv, query: string, params: any[] = []): Promise<any> {
  const sql = getSql(env);
  return await sql.unsafe(query, params);
}

export async function transactionDb<T>(env: HyperdriveEnv, fn: (tx: TransactionSql<any>) => Promise<T>): Promise<T> {
  const sql = getSql(env);
  return await sql.begin(fn) as Promise<T>;
}
