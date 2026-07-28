import postgres, { Sql, TransactionSql } from "postgres";

export interface HyperdriveEnv {
  HYPERDRIVE: any;
}

let sql: ReturnType<typeof postgres> | null = null;

export function getSql(env: HyperdriveEnv) {
  if (!sql) {
    const connectionString = env.HYPERDRIVE.connectionString;
    sql = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      onnotice: () => {},
    });
  }
  return sql;
}

export async function closeSql() {
  if (sql) {
    await sql.end();
    sql = null;
  }
}

// Database helper functions - renamed to avoid conflicts
export async function queryDb<T>(env: HyperdriveEnv, query: string, params: any[] = []): Promise<T[]> {
  const sql = getSql(env);
  return await sql.unsafe(query, params) as T[];
}

export async function queryOneDb<T>(env: HyperdriveEnv, query: string, params: any[] = []): Promise<T | null> {
  const results = await queryDb<T>(env, query, params);
  return results[0] || null;
}

export async function executeDb(env: HyperdriveEnv, query: string, params: any[] = []): Promise<any> {
  const sql = getSql(env);
  return await sql.unsafe(query, params);
}

export async function transactionDb<T>(env: HyperdriveEnv, fn: (tx: TransactionSql<any>) => Promise<T>): Promise<T> {
  const sql = getSql(env);
  return await sql.begin(async (tx) => {
    return await fn(tx);
  });
}