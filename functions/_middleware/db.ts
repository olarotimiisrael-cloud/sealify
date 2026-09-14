import postgres from 'postgres';
import type { Env } from './types';

let sqlInstance: ReturnType<typeof postgres> | null = null;

export function getSql(env: Env) {
  const connectionString = env.HYPERDRIVE.connectionString;
  if (!connectionString) {
    throw new Error('HYPERDRIVE connection string not available');
  }

  if (!sqlInstance) {
    sqlInstance = postgres(connectionString, {
      max: 10,
      fetch_types: false,
      prepare: true,
    });
  }

  return sqlInstance;
}

export async function closeDb(): Promise<void> {
  if (sqlInstance) {
    await sqlInstance.end();
    sqlInstance = null;
  }
}
