import postgres from 'postgres';
import { config } from '../config.js';

let sqlInstance: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!sqlInstance) {
    sqlInstance = postgres(config.databaseUrl, {
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
